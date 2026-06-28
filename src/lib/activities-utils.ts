import type { ActivitiesPayload, CombinedActivity, HevyWorkout, StatsPeriod, StravaActivity, ActivityFilter } from '@/lib/activities-types';
import { getMatchedStravaIds } from '@/lib/activities-match';

export function collectStravaPhotoIds(payload: ActivitiesPayload): number[] {
  const ids = new Set<number>();

  for (const workout of payload.hevy) {
    if (workout.matchedStrava?.id) ids.add(workout.matchedStrava.id);
  }

  for (const activity of payload.strava) {
    if ((activity.total_photo_count ?? 0) > 0) ids.add(activity.id);
  }

  return [...ids];
}

export const ACTIVITY_LABEL: Record<string, string> = {
  Run: 'run',
  VirtualRun: 'run',
  Ride: 'ride',
  VirtualRide: 'ride',
  Swim: 'swim',
  Walk: 'walk',
  Hike: 'hike',
  WeightTraining: 'gym',
  Workout: 'gym',
};

export function combineActivities(
  strava: StravaActivity[],
  hevy: HevyWorkout[]
): CombinedActivity[] {
  const matchedStravaIds = getMatchedStravaIds(hevy);

  const combined: CombinedActivity[] = [
    ...strava
      .filter(a => !matchedStravaIds.has(a.id))
      .map(a => ({
        id: `strava-${a.id}`,
        type: 'cardio' as const,
        date: a.start_date,
        stravaActivity: a,
      })),
    ...hevy.map(w => ({
      id: `gym-${w.id}`,
      type: 'gym' as const,
      date: w.start_time,
      gymWorkout: w,
    })),
  ];

  return combined.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function periodStart(period: StatsPeriod): Date | null {
  const now = new Date();
  if (period === 'all') return null;
  const start = new Date(now);
  if (period === 'week') {
    start.setDate(now.getDate() - 7);
  } else {
    start.setDate(now.getDate() - 30);
  }
  start.setHours(0, 0, 0, 0);
  return start;
}

export function inPeriod(date: string, period: StatsPeriod): boolean {
  const start = periodStart(period);
  if (!start) return true;
  return new Date(date).getTime() >= start.getTime();
}

export function matchesFilter(item: CombinedActivity, filter: ActivityFilter): boolean {
  if (filter === 'all') return true;
  if (item.type === 'gym') return filter === 'gym';
  const type = item.stravaActivity?.type ?? '';
  if (filter === 'run') return type === 'Run' || type === 'VirtualRun';
  if (filter === 'ride') return type === 'Ride' || type === 'VirtualRide';
  if (filter === 'walk') return type === 'Walk' || type === 'Hike' || type === 'Swim';
  return false;
}

export function calcWorkoutVolume(w: HevyWorkout): number {
  return w.exercises.reduce(
    (total, ex) =>
      total +
      ex.sets.reduce((s, set) => s + (set.weight_kg ?? 0) * (set.reps ?? 0), 0),
    0
  );
}

export function topExerciseByVolume(w: HevyWorkout): { title: string; volume: number } | null {
  let best: { title: string; volume: number } | null = null;
  for (const ex of w.exercises) {
    const volume = ex.sets.reduce(
      (s, set) => s + (set.weight_kg ?? 0) * (set.reps ?? 0),
      0
    );
    if (!best || volume > best.volume) {
      best = { title: ex.title, volume };
    }
  }
  return best?.volume ? best : null;
}

export function calculateCalories(activity: StravaActivity): number {
  if (activity.calories) return activity.calories;
  const hours = activity.moving_time / 3600;
  switch (activity.type) {
    case 'Run':
      return Math.round(hours * 600);
    case 'Ride':
      return Math.round(hours * 500);
    case 'Swim':
      return Math.round(hours * 550);
    case 'Walk':
      return Math.round(hours * 300);
    case 'Hike':
      return Math.round(hours * 400);
    case 'Workout':
      return Math.round(hours * 450);
    default:
      return Math.round(hours * 350);
  }
}

export function computeStats(
  activities: CombinedActivity[],
  period: StatsPeriod
) {
  const scoped = activities.filter(a => inPeriod(a.date, period));

  let runDistance = 0;
  let runCount = 0;
  let cardioTime = 0;
  let gymSessions = 0;
  let gymSets = 0;
  let gymVolume = 0;
  let gymDurationMin = 0;

  for (const item of scoped) {
    if (item.type === 'cardio' && item.stravaActivity) {
      const a = item.stravaActivity;
      cardioTime += a.moving_time;
      if (a.type === 'Run' || a.type === 'VirtualRun') {
        runDistance += a.distance;
        runCount += 1;
      }
    }
    if (item.type === 'gym' && item.gymWorkout) {
      const w = item.gymWorkout;
      gymSessions += 1;
      gymDurationMin += Math.ceil(
        (new Date(w.end_time).getTime() - new Date(w.start_time).getTime()) / 60000
      );
      for (const ex of w.exercises) {
        gymSets += ex.sets.length;
        for (const set of ex.sets) {
          gymVolume += (set.weight_kg ?? 0) * (set.reps ?? 0);
        }
      }
    }
  }

  return {
    runDistance,
    runCount,
    cardioTime,
    gymSessions,
    gymSets,
    gymVolume,
    activeTimeSec: cardioTime + gymDurationMin * 60,
  };
}

export function computeStreak(activities: CombinedActivity[]): number {
  if (activities.length === 0) return 0;

  const dayKeys = new Set(
    activities.map(a => localDayKey(a.date))
  );

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Allow streak to start today or yesterday
  if (!dayKeys.has(formatDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dayKeys.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function computeMostActiveWeekday(activities: CombinedActivity[]): string | null {
  if (activities.length === 0) return null;
  const counts = new Array(7).fill(0);
  for (const item of activities) {
    counts[new Date(item.date).getDay()] += 1;
  }
  const max = Math.max(...counts);
  if (max === 0) return null;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[counts.indexOf(max)];
}

export function computeRecords(activities: CombinedActivity[]) {
  let longestRunM = 0;
  let highestGymVolume = 0;
  let mostSets = 0;

  for (const item of activities) {
    if (item.type === 'cardio' && item.stravaActivity) {
      const a = item.stravaActivity;
      if ((a.type === 'Run' || a.type === 'VirtualRun') && a.distance > longestRunM) {
        longestRunM = a.distance;
      }
    }
    if (item.type === 'gym' && item.gymWorkout) {
      const vol = calcWorkoutVolume(item.gymWorkout);
      if (vol > highestGymVolume) highestGymVolume = vol;
      const sets = item.gymWorkout.exercises.reduce((s, ex) => s + ex.sets.length, 0);
      if (sets > mostSets) mostSets = sets;
    }
  }

  return { longestRunM, highestGymVolume, mostSets };
}

export function localDayKey(dateStr: string): string {
  return formatDateKey(new Date(dateStr));
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function monthGroupLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export interface HeatmapDay {
  key: string;
  count: number;
  label: string;
}

export function buildHeatmapWeeks(
  activities: CombinedActivity[],
  weeks = 52
): HeatmapDay[][] {
  const counts = new Map<string, number>();
  for (const item of activities) {
    const key = localDayKey(item.date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  // Align to Sunday start of current week
  end.setDate(end.getDate() - end.getDay());

  const start = new Date(end);
  start.setDate(start.getDate() - weeks * 7 + 7);

  const result: HeatmapDay[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: HeatmapDay[] = [];
    for (let d = 0; d < 7; d += 1) {
      const key = formatDateKey(cursor);
      const count = counts.get(key) ?? 0;
      week.push({
        key,
        count,
        label: cursor.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    result.push(week);
  }

  return result;
}

export function heatmapLevel(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

export const fmtDist = (m: number) => {
  const km = m / 1000;
  return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`;
};

export const fmtPace = (mps: number) => {
  const mpk = 1000 / mps / 60;
  const min = Math.floor(mpk);
  const sec = Math.round((mpk - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
};

export const fmtSpeed = (mps: number) => `${(mps * 3.6).toFixed(1)} km/h`;

export const fmtTime = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
};

export const fmtDur = (start: string, end: string) => {
  const min = Math.ceil(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
  const h = Math.floor(min / 60);
  return h > 0 ? `${h}h ${min % 60}m` : `${min}m`;
};

export const fmtVolume = (kg: number) => `${Math.round(kg).toLocaleString()} kg`;

export const shortDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
