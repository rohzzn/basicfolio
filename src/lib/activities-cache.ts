import type { ActivitiesPayload } from '@/lib/activities-types';
import { fetchAllHevyWorkouts } from '@/lib/hevy-workouts';
import { getRedis } from '@/lib/redis';

const CACHE_KEY = 'activities:hevy:v1';
/** Serve cached data for 1 hour; stale copy kept for fallback. */
const CACHE_TTL_SECONDS = 60 * 60;

let memoryCache: { payload: ActivitiesPayload; expiresAt: number } | null = null;

function readMemoryCache(): ActivitiesPayload | null {
  if (!memoryCache || memoryCache.expiresAt <= Date.now()) return null;
  return memoryCache.payload;
}

function writeMemoryCache(payload: ActivitiesPayload): void {
  memoryCache = {
    payload,
    expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
  };
}

function cacheAgeMs(payload: ActivitiesPayload): number {
  return Date.now() - new Date(payload.fetchedAt).getTime();
}

function isFresh(payload: ActivitiesPayload): boolean {
  return cacheAgeMs(payload) < CACHE_TTL_SECONDS * 1000;
}

export async function loadActivities(
  forceRefresh = false
): Promise<ActivitiesPayload> {
  const redis = getRedis();
  let stale: ActivitiesPayload | null = readMemoryCache();

  if (redis && !forceRefresh) {
    try {
      const cached = await redis.get<ActivitiesPayload>(CACHE_KEY);
      if (cached?.fetchedAt) {
        stale = cached;
        if (isFresh(cached)) return cached;
      }
    } catch {
      // fall through to live fetch
    }
  } else if (stale && isFresh(stale) && !forceRefresh) {
    return stale;
  }

  try {
    const payload = await fetchActivitiesLive();
    writeMemoryCache(payload);

    if (redis) {
      try {
        await redis.set(CACHE_KEY, payload, { ex: CACHE_TTL_SECONDS });
      } catch {
        // cache write failure is non-fatal
      }
    }

    return payload;
  } catch (error) {
    if (stale && stale.hevy.length > 0) {
      return stale;
    }
    throw error;
  }
}

async function fetchActivitiesLive(): Promise<ActivitiesPayload> {
  try {
    const hevy = await fetchAllHevyWorkouts();
    return {
      hevy,
      fetchedAt: new Date().toISOString(),
      errors: {},
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch Hevy data';
    return {
      hevy: [],
      fetchedAt: new Date().toISOString(),
      errors: { hevy: message },
    };
  }
}
