import type { ActivitiesPayload } from '@/lib/activities-types';
import { matchGymSessions } from '@/lib/activities-match';
import { fetchAllHevyWorkouts } from '@/lib/hevy-workouts';
import { fetchAllStravaActivities } from '@/lib/strava';
import { getRedis } from '@/lib/redis';

const CACHE_KEY = 'activities:combined:v4';
const CACHE_TTL_SECONDS = 30 * 60;

export async function loadActivities(
  forceRefresh = false
): Promise<ActivitiesPayload> {
  const redis = getRedis();

  if (redis && !forceRefresh) {
    try {
      const cached = await redis.get<ActivitiesPayload>(CACHE_KEY);
      if (cached?.fetchedAt) return cached;
    } catch {
      // fall through to live fetch
    }
  }

  const payload = await fetchActivitiesLive();

  if (redis) {
    try {
      await redis.set(CACHE_KEY, payload, { ex: CACHE_TTL_SECONDS });
    } catch {
      // cache write failure is non-fatal
    }
  }

  return payload;
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

  return {
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
}
