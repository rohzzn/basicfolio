import type { Exercise, HevyWorkout, StatsPeriod } from '@/lib/activities-types';
import { periodStart } from '@/lib/activities-utils';

// Everything the Move page draws, worked out from the Hevy workouts: which muscles have been
// trained and how much, what kind of day each session was, each session as a notebook page, and
// the best lifts with their history.
//
// Hevy stores every weight in kilograms, but these were logged in pounds (60 lb comes back as
// 27.2155 kg), so weights are shown in pounds, to the half pound.

const KG_PER_LB = 0.45359237;
export const toLb = (kg: number) => Math.round((kg / KG_PER_LB) * 2) / 2;
export const fmtLb = (lb: number) => (Number.isInteger(lb) ? lb.toLocaleString() : lb.toFixed(1));

export type Muscle =
  | 'chest'
  | 'shoulders'
  | 'rearDelts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'traps'
  | 'lats'
  | 'back'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves';

export const MUSCLE_LABEL: Record<Muscle, string> = {
  chest: 'Chest',
  shoulders: 'Shoulders',
  rearDelts: 'Rear delts',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  traps: 'Traps',
  lats: 'Lats',
  back: 'Mid back',
  glutes: 'Glutes',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
};

// Most specific first: "Seated Leg Curl" is hamstrings before it is a curl, "Rear Delt Reverse
// Fly" is shoulders before it is a fly.
const RULES: [RegExp, Muscle][] = [
  [/leg curl|hamstring|\brdl\b|romanian|stiff.?leg|good morning/i, 'hamstrings'],
  [/wrist curl|forearm|reverse curl|farmer/i, 'forearms'],
  [/rear delt|reverse fly|face pull/i, 'rearDelts'],
  [/tricep|pushdown|skull|\bdips?\b/i, 'triceps'],
  [/curl/i, 'biceps'],
  [/lateral raise|shoulder press|overhead press|military|arnold|front raise|upright row/i, 'shoulders'],
  [/shrug/i, 'traps'],
  [/pulldown|pull.?ups?\b|chin.?ups?\b/i, 'lats'],
  [/\brows?\b|back extension|deadlift|hyperextension/i, 'back'],
  [/bench|chest|\bpec|\bfly|flye|push.?ups?\b/i, 'chest'],
  [/squat|leg press|leg extension|lunge|hack|step.?up/i, 'quads'],
  [/hip thrust|glute|kickback|abduct/i, 'glutes'],
  [/calf|calves/i, 'calves'],
  [/crunch|\babs?\b|abdominal|plank|\bcore\b|sit.?up|leg raise|hanging|russian twist/i, 'abs'],
];

export function muscleOf(title: string): Muscle | null {
  for (const [re, m] of RULES) if (re.test(title)) return m;
  return null;
}

export type DayKind = 'push' | 'pull' | 'legs' | 'other';
export const KIND_LABEL: Record<DayKind, string> = { push: 'Push', pull: 'Pull', legs: 'Legs', other: 'Other' };
const KIND_OF: Record<Muscle, DayKind> = {
  chest: 'push',
  shoulders: 'push',
  triceps: 'push',
  lats: 'pull',
  back: 'pull',
  traps: 'pull',
  biceps: 'pull',
  rearDelts: 'pull',
  forearms: 'pull',
  quads: 'legs',
  hamstrings: 'legs',
  glutes: 'legs',
  calves: 'legs',
  abs: 'other',
};

const isWorking = (s: Exercise['sets'][number]) => (s.reps ?? 0) > 0 || (s.weight_kg ?? 0) > 0;
const keyOf = (ex: Exercise) => ex.exercise_template_id || ex.title.trim().toLowerCase();
export const shortName = (title: string) => title.split(' (')[0].split(' - ')[0].trim();
const maxLb = (ex: Exercise) => Math.max(0, ...ex.sets.map((s) => toLb(s.weight_kg ?? 0)));

// The kind of day a session was, by where most of its sets went.
export function kindOf(w: HevyWorkout): DayKind {
  const count: Record<DayKind, number> = { push: 0, pull: 0, legs: 0, other: 0 };
  for (const ex of w.exercises) {
    const m = muscleOf(ex.title);
    if (m) count[KIND_OF[m]] += ex.sets.filter(isWorking).length;
  }
  const best = (['push', 'pull', 'legs'] as DayKind[]).sort((a, b) => count[b] - count[a])[0];
  return count[best] > 0 && count[best] >= count.other ? best : 'other';
}

export const chronological = (ws: HevyWorkout[]) =>
  [...ws].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

export function inWindow(w: HevyWorkout, from: Date | null, to: Date | null) {
  const t = new Date(w.start_time).getTime();
  return (!from || t >= from.getTime()) && (!to || t < to.getTime());
}

// The shortest period that has anything in it, so the page never opens on an empty week.
export function defaultPeriod(ws: HevyWorkout[]): StatsPeriod {
  for (const p of ['week', 'month'] as StatsPeriod[]) if (ws.some((w) => inWindow(w, periodStart(p), null))) return p;
  return 'all';
}

export type Summary = { sessions: number; sets: number; volumeLb: number; minutes: number };

export function summarise(ws: HevyWorkout[]): Summary {
  let sets = 0;
  let volumeLb = 0;
  let minutes = 0;
  for (const w of ws) {
    minutes += Math.max(0, Math.round((new Date(w.end_time).getTime() - new Date(w.start_time).getTime()) / 60000));
    for (const ex of w.exercises)
      for (const s of ex.sets) {
        if (!isWorking(s)) continue;
        sets += 1;
        volumeLb += toLb(s.weight_kg ?? 0) * (s.reps ?? 0);
      }
  }
  return { sessions: ws.length, sets, volumeLb, minutes };
}

export type MuscleStat = { muscle: Muscle; sets: number; top: string | null; change: number | null };

// Working sets per muscle in the period, the exercise that did most of it, and the change against
// the period before (none for all time).
export function muscleStats(ws: HevyWorkout[], period: StatsPeriod): MuscleStat[] {
  const from = periodStart(period);
  const prevFrom = from ? new Date(from.getTime() - (Date.now() - from.getTime())) : null;
  const tally = (list: HevyWorkout[]) => {
    const sets = new Map<Muscle, number>();
    const byEx = new Map<Muscle, Map<string, number>>();
    for (const w of list)
      for (const ex of w.exercises) {
        const m = muscleOf(ex.title);
        if (!m) continue;
        const n = ex.sets.filter(isWorking).length;
        sets.set(m, (sets.get(m) ?? 0) + n);
        const inner = byEx.get(m) ?? new Map<string, number>();
        inner.set(shortName(ex.title), (inner.get(shortName(ex.title)) ?? 0) + n);
        byEx.set(m, inner);
      }
    return { sets, byEx };
  };
  const now = tally(ws.filter((w) => inWindow(w, from, null)));
  const before = from ? tally(ws.filter((w) => inWindow(w, prevFrom, from))) : null;
  return (Object.keys(MUSCLE_LABEL) as Muscle[])
    .map((muscle) => {
      const sets = now.sets.get(muscle) ?? 0;
      const top = [...(now.byEx.get(muscle) ?? new Map()).entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      const prev = before?.sets.get(muscle) ?? 0;
      const change = before && prev > 0 ? Math.round(((sets - prev) / prev) * 100) : null;
      return { muscle, sets, top, change };
    })
    .sort((a, b) => b.sets - a.sets);
}

// ---- the notebook ----

export type NoteSet = { text: string; count: number; pr: boolean };
export type NoteExercise = { id: string; title: string; sets: NoteSet[]; note: string | null };
export type NotePage = {
  id: string;
  date: Date;
  title: string;
  minutes: number;
  kind: DayKind;
  exercises: NoteExercise[];
  prs: number;
};

// Every session as a page, oldest first. Identical sets in a row are written once with a tally;
// a set heavier than anything lifted on that exercise before is circled as a PR.
export function notebook(ws: HevyWorkout[]): NotePage[] {
  const best = new Map<string, number>();
  return chronological(ws).map((w) => {
    let prs = 0;
    const exercises = w.exercises.map((ex, i) => {
      const key = keyOf(ex);
      const sessionMax = maxLb(ex);
      const before = best.get(key) ?? 0;
      const isPr = before > 0 && sessionMax > before;
      if (sessionMax > before) best.set(key, sessionMax);
      const groups: NoteSet[] = [];
      let marked = false;
      for (const s of ex.sets) {
        const lb = toLb(s.weight_kg ?? 0);
        const reps = s.reps ?? 0;
        let text: string;
        if (lb > 0 && reps > 0) text = `${fmtLb(lb)} × ${reps}`;
        else if (reps > 0) text = `× ${reps}`;
        else if ((s.duration_seconds ?? 0) > 0) text = `${Math.round((s.duration_seconds ?? 0) / 60)} min`;
        else if ((s.distance_meters ?? 0) > 0) text = `${((s.distance_meters ?? 0) / 1000).toFixed(1)} km`;
        else continue;
        const last = groups[groups.length - 1];
        if (last && last.text === text) last.count += 1;
        else {
          const pr = isPr && !marked && lb === sessionMax;
          if (pr) marked = true;
          groups.push({ text, count: 1, pr });
        }
      }
      if (marked) prs += 1;
      return { id: `${w.id}-${i}`, title: shortName(ex.title), sets: groups, note: ex.notes?.trim() || null };
    });
    return {
      id: w.id,
      date: new Date(w.start_time),
      title: w.title,
      minutes: Math.max(0, Math.round((new Date(w.end_time).getTime() - new Date(w.start_time).getTime()) / 60000)),
      kind: kindOf(w),
      exercises: exercises.filter((e) => e.sets.length > 0),
      prs,
    };
  });
}

// ---- the wall of records ----

export type LiftPoint = { date: Date; lb: number; pr: boolean };
export type PrLift = { key: string; name: string; best: number; bestDate: Date; sessions: number; history: LiftPoint[] };

// The lifts done most often, each with its heaviest set and the heaviest set of every session.
export function prLifts(ws: HevyWorkout[], count = 6): PrLift[] {
  const byKey = new Map<string, { name: string; history: LiftPoint[] }>();
  for (const w of chronological(ws))
    for (const ex of w.exercises) {
      if (!muscleOf(ex.title)) continue;
      const lb = maxLb(ex);
      if (lb <= 0) continue;
      const key = keyOf(ex);
      const entry = byKey.get(key) ?? { name: shortName(ex.title), history: [] };
      const runningBest = Math.max(0, ...entry.history.map((p) => p.lb));
      entry.history.push({ date: new Date(w.start_time), lb, pr: entry.history.length > 0 && lb > runningBest });
      byKey.set(key, entry);
    }
  return [...byKey.entries()]
    .map(([key, { name, history }]) => {
      const top = history.reduce((a, b) => (b.lb >= a.lb ? b : a));
      return { key, name, best: top.lb, bestDate: top.date, sessions: history.length, history };
    })
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, count);
}
