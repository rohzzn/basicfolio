import type { Exercise, HevyWorkout } from '@/lib/activities-types';
import { calcWorkoutVolume } from '@/lib/activities-utils';

export type DeltaDirection = 'up' | 'down' | 'flat';

export type VolumeDelta = {
  pct: number | null;
  direction: DeltaDirection;
  text: string;
};

export type MuscleTag = {
  label: string;
  primary: boolean;
};

export type ExerciseRowModel = {
  id: string;
  title: string;
  volume: number;
  barPct: number;
  delta: VolumeDelta;
};

export type WorkoutCardModel = {
  volume: number;
  sessionDelta: VolumeDelta;
  muscleTags: MuscleTag[];
  prLabel: string | null;
  exercises: ExerciseRowModel[];
};

const MUSCLE_RULES: [RegExp, string][] = [
  [/bench|chest|pec|fly/i, 'CHEST'],
  [/triceps|tricep|pushdown|skull|extension.*tricep/i, 'TRICEPS'],
  [/biceps|bicep|curl|preacher|hammer curl/i, 'BICEPS'],
  [/shoulder|lateral raise|overhead|military|deltoid|arnold/i, 'SHOULDERS'],
  [/lat pulldown|pulldown|pull-up|pull up|chin/i, 'LATS'],
  [/row|shrug|trap|upper back|back extension/i, 'BACK'],
  [/squat|leg press|quad|leg extension|lunge|hack squat/i, 'QUADS'],
  [/hamstring|leg curl|rdl|romanian|deadlift/i, 'HAMSTRINGS'],
  [/glute|hip thrust|kickback/i, 'GLUTES'],
  [/calf|calves/i, 'CALVES'],
  [/forearm|wrist curl/i, 'FOREARMS'],
  [/ab|core|crunch|plank|sit-up/i, 'CORE'],
];

function exerciseKey(ex: Exercise): string {
  return ex.exercise_template_id || ex.title.trim().toLowerCase();
}

export function calcExerciseVolume(ex: Exercise): number {
  return ex.sets.reduce((s, set) => s + (set.weight_kg ?? 0) * (set.reps ?? 0), 0);
}

function maxSetWeight(ex: Exercise): number {
  let max = 0;
  for (const set of ex.sets) {
    const w = set.weight_kg ?? 0;
    if (w > max) max = w;
  }
  return max;
}

function inferMuscleGroup(title: string): string {
  for (const [pattern, group] of MUSCLE_RULES) {
    if (pattern.test(title)) return group;
  }
  return 'OTHER';
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase();
}

function computeDelta(
  current: number,
  prior: number | undefined,
  vsLabel: string,
  compact = false
): VolumeDelta {
  if (prior === undefined || prior <= 0 || current <= 0) {
    return { pct: null, direction: 'flat', text: '' };
  }

  const pct = ((current - prior) / prior) * 100;
  if (Math.abs(pct) <= 1) {
    return {
      pct,
      direction: 'flat',
      text: compact ? '→' : `→ vs ${vsLabel}`,
    };
  }
  if (pct > 0) {
    const arrow = `↑${Math.round(pct)}%`;
    return {
      pct,
      direction: 'up',
      text: compact ? arrow : `${arrow} vs ${vsLabel}`,
    };
  }
  const arrow = `↓${Math.abs(Math.round(pct))}%`;
  return {
    pct,
    direction: 'down',
    text: compact ? arrow : `${arrow} vs ${vsLabel}`,
  };
}

function prAbbrev(title: string): string {
  const base = title.split('(')[0]?.trim() ?? title;
  const word = base.split(/\s+/)[0] ?? base;
  return word.toUpperCase();
}

function buildMuscleTags(workout: HevyWorkout): MuscleTag[] {
  const volumes = new Map<string, number>();

  for (const ex of workout.exercises) {
    const group = inferMuscleGroup(ex.title);
    volumes.set(group, (volumes.get(group) ?? 0) + calcExerciseVolume(ex));
  }

  const sorted = [...volumes.entries()]
    .filter(([, vol]) => vol > 0)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return [];

  const topVol = sorted[0][1];
  return sorted.map(([label, vol]) => ({
    label,
    primary: vol === topVol,
  }));
}

function findPriorSameNameWorkout(
  workout: HevyWorkout,
  chronological: HevyWorkout[]
): HevyWorkout | undefined {
  const name = normalizeTitle(workout.title);
  const t = new Date(workout.start_time).getTime();

  for (let i = chronological.length - 1; i >= 0; i -= 1) {
    const w = chronological[i];
    if (new Date(w.start_time).getTime() >= t) continue;
    if (normalizeTitle(w.title) === name) return w;
  }
  return undefined;
}

function findPriorExerciseVolume(
  key: string,
  beforeTime: number,
  chronological: HevyWorkout[]
): number | undefined {
  for (let i = chronological.length - 1; i >= 0; i -= 1) {
    const w = chronological[i];
    if (new Date(w.start_time).getTime() >= beforeTime) continue;
    const match = w.exercises.find((ex) => exerciseKey(ex) === key);
    if (match) return calcExerciseVolume(match);
  }
  return undefined;
}

function findHistoricalMaxWeight(
  key: string,
  beforeTime: number,
  chronological: HevyWorkout[]
): number {
  let max = 0;
  for (const w of chronological) {
    if (new Date(w.start_time).getTime() >= beforeTime) break;
    const match = w.exercises.find((ex) => exerciseKey(ex) === key);
    if (match) max = Math.max(max, maxSetWeight(match));
  }
  return max;
}

function detectPrLabel(workout: HevyWorkout, chronological: HevyWorkout[]): string | null {
  const t = new Date(workout.start_time).getTime();
  let bestPr: { abbrev: string; weight: number } | null = null;

  for (const ex of workout.exercises) {
    const currentMax = maxSetWeight(ex);
    if (currentMax <= 0) continue;

    const key = exerciseKey(ex);
    const historical = findHistoricalMaxWeight(key, t, chronological);
    if (currentMax > historical) {
      if (!bestPr || currentMax > bestPr.weight) {
        bestPr = { abbrev: prAbbrev(ex.title), weight: currentMax };
      }
    }
  }

  return bestPr ? `PR · ${bestPr.abbrev}` : null;
}

export function buildWorkoutCardModel(
  workout: HevyWorkout,
  chronological: HevyWorkout[]
): WorkoutCardModel {
  const volume = calcWorkoutVolume(workout);
  const priorSession = findPriorSameNameWorkout(workout, chronological);
  const priorVol = priorSession ? calcWorkoutVolume(priorSession) : undefined;
  const sessionDelta = computeDelta(volume, priorVol, `last ${workout.title}`);

  const t = new Date(workout.start_time).getTime();
  const exerciseVolumes = workout.exercises.map((ex) => ({
    ex,
    volume: calcExerciseVolume(ex),
  }));
  const maxExVol = Math.max(...exerciseVolumes.map((e) => e.volume), 1);

  const exercises: ExerciseRowModel[] = exerciseVolumes.map(({ ex, volume: exVol }) => {
    const key = exerciseKey(ex);
    const priorExVol = findPriorExerciseVolume(key, t, chronological);
    const shortName = ex.title.split('(')[0]?.trim() ?? ex.title;
    return {
      id: ex.id,
      title: ex.title,
      volume: exVol,
      barPct: exVol > 0 ? (exVol / maxExVol) * 100 : 0,
      delta: computeDelta(exVol, priorExVol, `last ${shortName}`, true),
    };
  });

  return {
    volume,
    sessionDelta,
    muscleTags: buildMuscleTags(workout),
    prLabel: detectPrLabel(workout, chronological),
    exercises,
  };
}

export function buildWorkoutCardModels(workouts: HevyWorkout[]): Map<string, WorkoutCardModel> {
  const chronological = [...workouts].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  const map = new Map<string, WorkoutCardModel>();

  for (const workout of workouts) {
    map.set(workout.id, buildWorkoutCardModel(workout, chronological));
  }

  return map;
}

export function deltaColorClass(direction: DeltaDirection): string {
  if (direction === 'up') return 'text-emerald-600 dark:text-emerald-500';
  if (direction === 'down') return 'text-red-600 dark:text-red-500';
  return 'text-zinc-400 dark:text-neutral-500';
}
