import type { HevyWorkout, StravaActivity } from '@/lib/activities-types';
import { localDayKey } from '@/lib/activities-utils';

/** Strava sport types that represent a gym / lift session. */
const STRAVA_GYM_TYPES = new Set([
  'WeightTraining',
  'Workout',
  'Crossfit',
  'HighIntensityIntervalTraining',
  'Pilates',
  'Yoga',
  'StairStepper',
]);

const DAY_PAD_MS = 2 * 60 * 60 * 1000;
const DEFAULT_HEVY_DURATION_MS = 45 * 60 * 1000;
const MIN_STRAVA_DURATION_MS = 15 * 60 * 1000;

export function isStravaGymActivity(type: string): boolean {
  return STRAVA_GYM_TYPES.has(type);
}

function utcDayKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function hevyWindow(workout: HevyWorkout): { start: number; end: number } {
  const start = new Date(workout.start_time).getTime();
  let end = new Date(workout.end_time).getTime();
  if (!Number.isFinite(end) || end <= start) {
    end = start + DEFAULT_HEVY_DURATION_MS;
  }
  return { start, end };
}

function stravaWindow(activity: StravaActivity): { start: number; end: number } {
  const start = new Date(activity.start_date).getTime();
  const durationMs = Math.max(
    (activity.elapsed_time || 0) * 1000,
    (activity.moving_time || 0) * 1000,
    MIN_STRAVA_DURATION_MS
  );
  return { start, end: start + durationMs };
}

function sameCalendarDay(hevyTime: string, stravaTime: string): boolean {
  return (
    utcDayKey(hevyTime) === utcDayKey(stravaTime) ||
    localDayKey(hevyTime) === localDayKey(stravaTime)
  );
}

/** Lower score = better match. Null = no match. */
function matchScore(hevy: HevyWorkout, strava: StravaActivity): number | null {
  const h = hevyWindow(hevy);
  const s = stravaWindow(strava);
  const startDiff = Math.abs(h.start - s.start);
  const overlaps =
    s.start <= h.end + DAY_PAD_MS && s.end >= h.start - DAY_PAD_MS;
  const sameDay = sameCalendarDay(hevy.start_time, strava.start_date);

  if (startDiff <= 2 * 60 * 60 * 1000) return startDiff;
  if (overlaps) return startDiff + 500;
  if (sameDay && startDiff <= 8 * 60 * 60 * 1000) return startDiff + 1_000;
  if (sameDay && startDiff <= 14 * 60 * 60 * 1000) return startDiff + 3_000;

  return null;
}

function pairSingletonsOnDay(
  unmatchedHevy: HevyWorkout[],
  unmatchedStrava: StravaActivity[],
  matches: Map<string, StravaActivity>,
  usedStravaIds: Set<number>,
  dayKeyFn: (d: string) => string
): void {
  const hevyByDay = new Map<string, HevyWorkout[]>();
  const stravaByDay = new Map<string, StravaActivity[]>();

  for (const w of unmatchedHevy) {
    const key = dayKeyFn(w.start_time);
    if (!hevyByDay.has(key)) hevyByDay.set(key, []);
    hevyByDay.get(key)!.push(w);
  }

  for (const a of unmatchedStrava) {
    if (usedStravaIds.has(a.id)) continue;
    const key = dayKeyFn(a.start_date);
    if (!stravaByDay.has(key)) stravaByDay.set(key, []);
    stravaByDay.get(key)!.push(a);
  }

  for (const [day, hevyList] of hevyByDay) {
    const stravaList = stravaByDay.get(day);
    if (!stravaList || hevyList.length !== 1 || stravaList.length !== 1) continue;
    const workout = hevyList[0];
    const activity = stravaList[0];
    if (matches.has(workout.id) || usedStravaIds.has(activity.id)) continue;
    matches.set(workout.id, activity);
    usedStravaIds.add(activity.id);
  }
}

/** Pair each Hevy workout with the Strava gym post from the same session. */
export function matchGymSessions(
  hevyWorkouts: HevyWorkout[],
  stravaActivities: StravaActivity[]
): Map<string, StravaActivity> {
  const gymStrava = stravaActivities.filter(a => isStravaGymActivity(a.type));
  const usedStravaIds = new Set<number>();
  const matches = new Map<string, StravaActivity>();

  const sortedHevy = [...hevyWorkouts].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  for (const workout of sortedHevy) {
    let best: StravaActivity | null = null;
    let bestScore = Infinity;

    for (const activity of gymStrava) {
      if (usedStravaIds.has(activity.id)) continue;
      const score = matchScore(workout, activity);
      if (score === null || score >= bestScore) continue;
      bestScore = score;
      best = activity;
    }

    if (best) {
      usedStravaIds.add(best.id);
      matches.set(workout.id, best);
    }
  }

  const unmatchedHevy = sortedHevy.filter(w => !matches.has(w.id));
  const unmatchedStrava = gymStrava.filter(a => !usedStravaIds.has(a.id));

  pairSingletonsOnDay(unmatchedHevy, unmatchedStrava, matches, usedStravaIds, utcDayKey);
  pairSingletonsOnDay(
    unmatchedHevy.filter(w => !matches.has(w.id)),
    unmatchedStrava,
    matches,
    usedStravaIds,
    localDayKey
  );

  return matches;
}

export function getMatchedStravaIds(hevyWorkouts: HevyWorkout[]): Set<number> {
  return new Set(
    hevyWorkouts
      .map(w => w.matchedStrava?.id)
      .filter((id): id is number => id !== undefined)
  );
}
