import type { CombinedActivity, HevyWorkout, StatsPeriod } from '@/lib/activities-types';

export function combineActivities(hevy: HevyWorkout[]): CombinedActivity[] {
  return hevy
    .map((workout) => ({
      id: `gym-${workout.id}`,
      type: 'gym' as const,
      date: workout.start_time,
      gymWorkout: workout,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

export function computeStats(activities: CombinedActivity[], period: StatsPeriod) {
  const scoped = activities.filter((a) => inPeriod(a.date, period));

  let gymSessions = 0;
  let gymSets = 0;
  let gymVolume = 0;
  let gymDurationMin = 0;

  for (const item of scoped) {
    if (item.type !== 'gym' || !item.gymWorkout) continue;
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

  return {
    gymSessions,
    gymSets,
    gymVolume,
    activeTimeSec: gymDurationMin * 60,
  };
}

export function computeStreak(activities: CombinedActivity[]): number {
  if (activities.length === 0) return 0;

  const dayKeys = new Set(activities.map((a) => localDayKey(a.date)));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

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
  let highestGymVolume = 0;
  let mostSets = 0;

  for (const item of activities) {
    if (item.type !== 'gym' || !item.gymWorkout) continue;
    const vol = calcWorkoutVolume(item.gymWorkout);
    if (vol > highestGymVolume) highestGymVolume = vol;
    const sets = item.gymWorkout.exercises.reduce((s, ex) => s + ex.sets.length, 0);
    if (sets > mostSets) mostSets = sets;
  }

  return { highestGymVolume, mostSets };
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
