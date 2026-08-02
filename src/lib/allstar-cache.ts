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

type AllstarCachePayload = {
  clips: AllstarClipItem[];
  fetchedAt: string;
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
}

const CACHE_KEY = 'allstar:clips:v1';
const CACHE_TTL_SECONDS = 60 * 60;

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
  return Date.now() - new Date(payload.fetchedAt).getTime() < CACHE_TTL_SECONDS * 1000;
}

async function fetchAllstarClipsLive(): Promise<AllstarCachePayload> {
  const userId = process.env.ALLSTAR_USER_ID;
  if (!userId) throw new Error('ALLSTAR_USER_ID not configured');

  const allClips: AllstarClipRaw[] = [];
  let page = 1;
  const PAGE_SIZE = 10;
  const MAX_PAGES = 200;

  while (page <= MAX_PAGES) {
    const res = await fetch('https://a1.allstar.gg/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: CLIPS_QUERY, variables: { user: userId, page } }),
      cache: 'no-store',
    });

    if (!res.ok) break;

    const json: AllstarGraphQLResponse = await res.json();
    const pageClips = json.data?.videos?.data ?? [];

    if (pageClips.length === 0) break;

    allClips.push(...pageClips);

    if (pageClips.length < PAGE_SIZE) break;
    page++;
  }

  const clips = allClips
    .map(clip => ({
      id: clip._id,
      title: clip.clipTitle || 'Untitled Clip',
      thumbnail: b2ToHttps(clip.clipImageThumb) || b2ToHttps(clip.clipImageSource),
      clipUrl: `https://allstar.gg/clip?clip=${clip._id}`,
      videoUrl: b2ToHttps(clip.clipLink),
      createdTimestamp: parseInt(clip.createdDate, 10),
      views: clip.views ?? 0,
      duration: clip.clipLength ?? 0,
      source: 'allstar' as const,
      categoryName: 'CS2',
    }))
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp);

  return {
    clips,
    fetchedAt: new Date().toISOString(),
  };
}

async function persistCache(payload: AllstarCachePayload): Promise<void> {
  writeMemoryCache(payload);
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(CACHE_KEY, payload, { ex: CACHE_TTL_SECONDS });
  } catch {
    // non-fatal
  }
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

function refreshInBackground(): void {
  if (refreshInFlight) return;
  refreshInFlight = fetchAllstarClipsLive()
    .then(async payload => {
      await persistCache(payload);
      return payload;
    })
    .finally(() => {
      refreshInFlight = null;
    });
}

export async function loadAllstarClips(forceRefresh = false): Promise<AllstarCachePayload> {
  let stale: AllstarCachePayload | null = readMemoryCache();

  if (!stale && !forceRefresh) {
    stale = await readRedisCache();
  }

  if (stale && isFresh(stale) && !forceRefresh) {
    return stale;
  }

  if (stale?.clips.length && !forceRefresh) {
    refreshInBackground();
    return stale;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = fetchAllstarClipsLive()
    .then(async payload => {
      await persistCache(payload);
      return payload;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export { CACHE_TTL_SECONDS };
