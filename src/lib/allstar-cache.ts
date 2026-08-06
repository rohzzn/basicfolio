import { getRedis } from '@/lib/redis';

export type AllstarClipItem = {
  id: string;
  title: string;
  thumbnail: string;
  clipUrl: string;
  videoUrl: string;
  createdTimestamp: number;
  views: number;
  duration: number;
  source: 'allstar';
  categoryName: string;
};

export type AllstarCachePayload = {
  clips: AllstarClipItem[];
  fetchedAt: string;
  /** True when the last live fetch stopped early (timeout / incomplete). */
  partial?: boolean;
};

interface AllstarClipRaw {
  _id: string;
  clipTitle: string;
  clipImageThumb: string;
  clipImageSource: string;
  clipLink: string;
  createdDate: string;
  views: number;
  clipLength: number;
}

interface AllstarGraphQLResponse {
  data?: {
    videos?: {
      data: AllstarClipRaw[];
    };
  };
  errors?: { message: string }[];
}

const CACHE_KEY = 'allstar:clips:v3';
/** Keep a warm Redis copy for a day — cold live fetches are expensive. */
const CACHE_TTL_SECONDS = 60 * 60 * 24;
/** Serve stale Redis while refreshing after this age. */
const FRESH_SECONDS = 60 * 60 * 6;
/** Soft ceiling for a request-path live fetch (Vercel hobby ~10s). */
const LIVE_BUDGET_MS = 7500;
/** Longer budget for after() background continuation. */
const FULL_BUDGET_MS = 25_000;
const PAGE_SIZE = 10;
const MAX_PAGES = 200;
/** Keep modest — Allstar returns empty pages under parallel hammering. */
const PARALLEL = 4;

const CLIPS_QUERY = `query ($page: Int!, $user: String!) {
  videos: clips(search: createdDate, page: $page, user: $user, mobile: false) {
    data {
      _id
      clipImageSource
      clipImageThumb
      clipLink
      clipTitle
      createdDate
      shareId
      views
      clipLength
    }
  }
}`;

let memoryCache: { payload: AllstarCachePayload; expiresAt: number } | null = null;
let refreshInFlight: Promise<AllstarCachePayload> | null = null;

function b2ToHttps(b2Url: string): string {
  if (!b2Url) return '';
  const match = b2Url.match(/^b2:\/\/([^/]+)\/(.+)$/);
  if (match) return `https://f005.backblazeb2.com/file/${match[1]}/${match[2]}`;
  if (b2Url.startsWith('http')) return b2Url;
  return '';
}

function mapClip(clip: AllstarClipRaw): AllstarClipItem {
  return {
    id: clip._id,
    title: clip.clipTitle || 'Untitled Clip',
    thumbnail: b2ToHttps(clip.clipImageThumb) || b2ToHttps(clip.clipImageSource),
    clipUrl: `https://allstar.gg/clip?clip=${clip._id}`,
    videoUrl: b2ToHttps(clip.clipLink),
    createdTimestamp: parseInt(clip.createdDate, 10),
    views: clip.views ?? 0,
    duration: clip.clipLength ?? 0,
    source: 'allstar',
    categoryName: 'CS2',
  };
}

function readMemoryCache(): AllstarCachePayload | null {
  if (!memoryCache || memoryCache.expiresAt <= Date.now()) return null;
  return memoryCache.payload;
}

function writeMemoryCache(payload: AllstarCachePayload): void {
  memoryCache = {
    payload,
    expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
  };
}

function isFresh(payload: AllstarCachePayload): boolean {
  if (payload.partial) return false;
  return Date.now() - new Date(payload.fetchedAt).getTime() < FRESH_SECONDS * 1000;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

async function fetchPageOnce(
  userId: string,
  page: number,
  signal?: AbortSignal
): Promise<AllstarClipRaw[] | null> {
  try {
    const res = await fetch('https://a1.allstar.gg/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: CLIPS_QUERY, variables: { user: userId, page } }),
      cache: 'no-store',
      signal,
    });
    if (!res.ok) return null;
    const json: AllstarGraphQLResponse = await res.json();
    if (json.errors?.length) return null;
    return json.data?.videos?.data ?? [];
  } catch {
    return null;
  }
}

/** Retry once on null/empty — parallel bursts sometimes get blank pages that aren't real EOF. */
async function fetchPage(
  userId: string,
  page: number,
  signal?: AbortSignal
): Promise<AllstarClipRaw[] | null> {
  const first = await fetchPageOnce(userId, page, signal);
  if (first && first.length > 0) return first;
  if (signal?.aborted) return null;
  try {
    await sleep(120, signal);
  } catch {
    return null;
  }
  return fetchPageOnce(userId, page, signal);
}

function toPayload(allRaw: AllstarClipRaw[], partial: boolean): AllstarCachePayload {
  const seen = new Set<string>();
  const clips = allRaw
    .map(mapClip)
    .filter((clip) => {
      if (!clip.id || seen.has(clip.id)) return false;
      seen.add(clip.id);
      return true;
    })
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp);

  return {
    clips,
    fetchedAt: new Date().toISOString(),
    partial,
  };
}

/**
 * Walk Allstar pages in small parallel batches until empty, page cap, or time budget.
 * Partial results beat a hard timeout / empty 500 on Vercel.
 */
async function fetchAllstarClipsLive(
  budgetMs = LIVE_BUDGET_MS
): Promise<AllstarCachePayload> {
  const userId = process.env.ALLSTAR_USER_ID;
  if (!userId) throw new Error('ALLSTAR_USER_ID not configured');

  const started = Date.now();
  const allRaw: AllstarClipRaw[] = [];
  let page = 1;
  let hitEnd = false;
  let timedOut = false;
  let flakyEmpty = false;

  while (page <= MAX_PAGES && !hitEnd) {
    const remaining = budgetMs - (Date.now() - started);
    if (remaining < 500) {
      timedOut = true;
      break;
    }

    const batchPages = Array.from(
      { length: Math.min(PARALLEL, MAX_PAGES - page + 1) },
      (_, i) => page + i
    );

    const controller = new AbortController();
    const batchTimeout = setTimeout(() => controller.abort(), Math.max(0, remaining));

    let batchResults: (AllstarClipRaw[] | null)[];
    try {
      batchResults = await Promise.all(
        batchPages.map((p) => fetchPage(userId, p, controller.signal))
      );
    } catch {
      timedOut = true;
      clearTimeout(batchTimeout);
      break;
    }
    clearTimeout(batchTimeout);

    let advanced = 0;
    for (const pageClips of batchResults) {
      // null = request failure / abort — stop and treat as partial, don't claim EOF
      if (pageClips === null) {
        flakyEmpty = true;
        break;
      }
      if (pageClips.length === 0) {
        hitEnd = true;
        break;
      }
      allRaw.push(...pageClips);
      advanced += 1;
      if (pageClips.length < PAGE_SIZE) {
        hitEnd = true;
        break;
      }
    }

    if (flakyEmpty) {
      timedOut = true;
      break;
    }

    page += advanced > 0 ? advanced : batchPages.length;
    if (advanced === 0) break;
  }

  return toPayload(allRaw, timedOut || flakyEmpty || !hitEnd);
}

async function readRedisCache(): Promise<AllstarCachePayload | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const cached = await redis.get<AllstarCachePayload>(CACHE_KEY);
    if (cached?.clips?.length) {
      writeMemoryCache(cached);
      return cached;
    }
  } catch {
    // fall through
  }
  return null;
}

/**
 * Persist only if the new payload is a meaningful upgrade.
 * Never shrink a larger warm cache with a flaky smaller fetch.
 */
async function persistCache(payload: AllstarCachePayload): Promise<void> {
  const existing = readMemoryCache();
  if (
    existing &&
    payload.clips.length < existing.clips.length &&
    (payload.partial || payload.clips.length < existing.clips.length * 0.9)
  ) {
    writeMemoryCache({ ...existing, partial: true });
    return;
  }

  writeMemoryCache(payload);
  const redis = getRedis();
  if (!redis) return;
  try {
    const remote = await redis.get<AllstarCachePayload>(CACHE_KEY);
    if (
      remote?.clips?.length &&
      payload.clips.length < remote.clips.length &&
      (payload.partial || payload.clips.length < remote.clips.length * 0.9)
    ) {
      return;
    }
    await redis.set(CACHE_KEY, payload, { ex: CACHE_TTL_SECONDS });
  } catch {
    // non-fatal
  }
}

async function runLiveFetchAndPersist(budgetMs?: number): Promise<AllstarCachePayload> {
  const payload = await fetchAllstarClipsLive(budgetMs);
  const existing = readMemoryCache() ?? (await readRedisCache());

  if (
    existing &&
    payload.clips.length < existing.clips.length &&
    (payload.partial || payload.clips.length < existing.clips.length * 0.9)
  ) {
    // Keep serving the richer set; mark stale so a later pass can finish.
    writeMemoryCache({ ...existing, partial: true });
    return existing;
  }

  await persistCache(payload);
  return payload;
}

function startRefresh(budgetMs?: number): Promise<AllstarCachePayload> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = runLiveFetchAndPersist(budgetMs).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export async function loadAllstarClips(forceRefresh = false): Promise<AllstarCachePayload> {
  let stale: AllstarCachePayload | null = readMemoryCache();

  if (!stale && !forceRefresh) {
    stale = await readRedisCache();
  }

  if (stale && isFresh(stale) && !forceRefresh) {
    return stale;
  }

  // Stale-but-usable: return immediately and refresh in the background.
  if (stale?.clips.length && !forceRefresh) {
    void startRefresh(FULL_BUDGET_MS);
    return stale;
  }

  // Cold path — wait for a budgeted live fetch so the client gets something.
  return startRefresh(LIVE_BUDGET_MS);
}

/** Longer budget for background / after() continuation. */
export async function refreshAllstarClipsFull(): Promise<AllstarCachePayload> {
  return startRefresh(FULL_BUDGET_MS);
}

export { CACHE_TTL_SECONDS, FRESH_SECONDS };
