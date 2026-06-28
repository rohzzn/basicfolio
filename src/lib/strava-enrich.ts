import type { StravaActivity } from '@/lib/activities-types';
import { getRedis } from '@/lib/redis';
import { getStravaAccessToken } from '@/lib/strava';

export type StravaActivityDetail = Pick<
  StravaActivity,
  'photos' | 'total_photo_count' | 'map'
>;

export type StravaPhotoResult = {
  urls: string[];
  map?: StravaActivity['map'];
};

const PHOTOS_CACHE_PREFIX = 'activities:strava-photos:v1:';
const PHOTOS_CACHE_TTL = 7 * 24 * 60 * 60;
const FETCH_DELAY_MS = 650;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function extractStravaPhotoUrl(
  activity: Pick<StravaActivity, 'photos'>
): string | null {
  return (
    activity.photos?.primary?.urls?.['600'] ??
    activity.photos?.primary?.urls?.['100'] ??
    null
  );
}

function parsePhotoUrls(photos: unknown[]): string[] {
  const urls: string[] = [];

  for (const entry of photos) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const url =
      (record.urls as Record<string, string> | undefined)?.['600'] ??
      (record.urls as Record<string, string> | undefined)?.['100'] ??
      (typeof record.url === 'string' ? record.url : null);

    if (url && !urls.includes(url)) urls.push(url);
  }

  return urls;
}

async function readPhotosCache(
  activityId: number
): Promise<StravaPhotoResult | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const cached = await redis.get<StravaPhotoResult>(
      `${PHOTOS_CACHE_PREFIX}${activityId}`
    );
    if (cached?.urls) return cached;
    return null;
  } catch {
    return null;
  }
}

async function writePhotosCache(
  activityId: number,
  payload: StravaPhotoResult
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(`${PHOTOS_CACHE_PREFIX}${activityId}`, payload, {
      ex: PHOTOS_CACHE_TTL,
    });
  } catch {
    // non-fatal
  }
}

async function fetchStravaDetailLive(
  activityId: number,
  accessToken: string
): Promise<StravaActivityDetail | null> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=false`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );

    if (response.status === 429) {
      await sleep(4000 * (attempt + 1));
      continue;
    }

    if (!response.ok) return null;

    const detail = await response.json();
    return {
      photos: detail.photos,
      total_photo_count: detail.total_photo_count,
      map: detail.map,
    };
  }

  return null;
}

async function fetchAllActivityPhotosLive(
  activityId: number,
  accessToken: string
): Promise<StravaPhotoResult> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/photos?photo_sources=true&size=600`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );

    if (response.status === 429) {
      await sleep(4000 * (attempt + 1));
      continue;
    }

    if (response.ok) {
      const data = await response.json();
      const urls = Array.isArray(data) ? parsePhotoUrls(data) : [];
      if (urls.length > 0) return { urls };
      break;
    }

    if (response.status !== 404) break;
  }

  const detail = await fetchStravaDetailLive(activityId, accessToken);
  const primary = detail ? extractStravaPhotoUrl(detail) : null;

  return {
    urls: primary ? [primary] : [],
    map: detail?.map,
  };
}

/** Fetch all photo URLs for a batch of activity IDs (cached, throttled). */
export async function fetchStravaPhotoBatch(
  activityIds: number[]
): Promise<Map<number, StravaPhotoResult>> {
  const uniqueIds = [...new Set(activityIds)];
  const results = new Map<number, StravaPhotoResult>();

  const uncached: number[] = [];
  for (const id of uniqueIds) {
    const cached = await readPhotosCache(id);
    if (cached) {
      results.set(id, cached);
    } else {
      uncached.push(id);
    }
  }

  if (uncached.length === 0) return results;

  const accessToken = await getStravaAccessToken();
  if (!accessToken) return results;

  for (const id of uncached) {
    const payload = await fetchAllActivityPhotosLive(id, accessToken);
    if (payload.urls.length > 0 || payload.map) {
      await writePhotosCache(id, payload);
      results.set(id, payload);
    }
    await sleep(FETCH_DELAY_MS);
  }

  return results;
}

export async function getStravaActivityDetailCached(
  activityId: number
): Promise<StravaPhotoResult | null> {
  const cached = await readPhotosCache(activityId);
  if (cached) return cached;

  const accessToken = await getStravaAccessToken();
  if (!accessToken) return null;

  const payload = await fetchAllActivityPhotosLive(activityId, accessToken);
  if (payload.urls.length > 0 || payload.map) {
    await writePhotosCache(activityId, payload);
    return payload;
  }

  return null;
}
