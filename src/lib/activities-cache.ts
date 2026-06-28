import type { ActivitiesPayload } from '@/lib/activities-types';
import { matchGymSessions } from '@/lib/activities-match';
import { fetchAllHevyWorkouts } from '@/lib/hevy-workouts';
import { fetchAllStravaActivities } from '@/lib/strava';
import { getRedis } from '@/lib/redis';

const CACHE_KEY = 'activities:combined:v4';
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
    if (stale && (stale.strava.length > 0 || stale.hevy.length > 0)) {
      return stale;
    }
    throw error;
  }
}

async function fetchActivitiesLive(): Promise<ActivitiesPayload> {
  const [stravaResult, hevyResult] = await Promise.allSettled([
    fetchAllStravaActivities(),
    fetchAllHevyWorkouts(),
  ]);

  const strava =
    stravaResult.status === 'fulfilled' ? stravaResult.value : [];
  const hevyRaw = hevyResult.status === 'fulfilled' ? hevyResult.value : [];

  const gymMatches = matchGymSessions(hevyRaw, strava);
  const matchedStravaIds = new Set(
    [...gymMatches.values()].map(a => a.id)
  );

  const hevy = hevyRaw.map(workout => {
    const matched = gymMatches.get(workout.id);
    if (!matched) return workout;
    return {
      ...workout,
      matchedStrava: { id: matched.id },
    };
  });

  const stravaCardio = strava.filter(a => !matchedStravaIds.has(a.id));

  const payload: ActivitiesPayload = {
    strava: stravaCardio,
    hevy,
    fetchedAt: new Date().toISOString(),
    errors: {
      strava:
        stravaResult.status === 'rejected'
          ? stravaResult.reason instanceof Error
            ? stravaResult.reason.message
            : 'Failed to fetch Strava data'
          : undefined,
      hevy:
        hevyResult.status === 'rejected'
          ? hevyResult.reason instanceof Error
            ? hevyResult.reason.message
            : 'Failed to fetch Hevy data'
          : undefined,
    },
  };

  const hasData = payload.strava.length > 0 || payload.hevy.length > 0;
  const allFailed = payload.errors.strava && payload.errors.hevy && !hasData;

  if (allFailed) {
    throw new Error('Failed to fetch activities');
  }

  return payload;
}
