import { fetchLastCommit, type LastCommit } from '@/lib/github-last-commit';

/**
 * The "now" line: the single most recent thing Rohan actually did.
 *
 * Each source returns its event with a timestamp so the page can pick a winner,
 * and every one of them fails soft — a dead upstream drops itself from the
 * running and the next most recent event takes the line.
 *
 * What is playing is deliberately not here: it is fetched on the client,
 * because it is the only value that must never be cached.
 */

export interface NowLift {
  title: string;
  /** Total volume moved, in kilograms. */
  volumeKg: number;
  date: string;
}

export interface NowWatching {
  title: string;
  episodes: number;
  /** When the list entry last moved — the thing that makes this an event. */
  date: string;
}

export interface NowData {
  commit: LastCommit | null;
  lift: NowLift | null;
  watching: NowWatching | null;
}

interface HevySet {
  weight_kg?: number;
  reps?: number;
}

interface HevyExercise {
  sets?: HevySet[];
}

interface HevyWorkoutLite {
  title?: string;
  start_time?: string;
  exercises?: HevyExercise[];
}

async function fetchLastLift(): Promise<NowLift | null> {
  const apiKey = process.env.HEVY_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    // Page one is enough — the API already returns newest first.
    const response = await fetch('https://api.hevyapp.com/v1/workouts?page=1&pageSize=1', {
      headers: { 'api-key': apiKey },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { workouts?: HevyWorkoutLite[] };
    const workout = data.workouts?.[0];
    if (!workout?.start_time) return null;

    const volumeKg = (workout.exercises ?? []).reduce(
      (total, exercise) =>
        total +
        (exercise.sets ?? []).reduce(
          (sum, set) => sum + (set.weight_kg ?? 0) * (set.reps ?? 0),
          0
        ),
      0
    );

    return {
      title: workout.title?.trim() || 'Workout',
      volumeKg: Math.round(volumeKg),
      date: workout.start_time,
    };
  } catch {
    return null;
  }
}

interface MalEntry {
  node?: { title?: string };
  list_status?: { num_episodes_watched?: number; updated_at?: string };
}

async function fetchWatching(): Promise<NowWatching | null> {
  const clientId = process.env.MAL_CLIENT_ID?.trim() || '09381abb5bcf8797360fdf79e9fef791';
  const username = process.env.MAL_DEFAULT_USERNAME?.trim() || 'rohzzn';

  try {
    const response = await fetch(
      `https://api.myanimelist.net/v2/users/${username}/animelist` +
        '?status=watching&fields=list_status,title&limit=5&sort=list_updated_at',
      {
        headers: { 'X-MAL-CLIENT-ID': clientId },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { data?: MalEntry[] };
    const entry = data.data?.[0];
    const title = entry?.node?.title?.trim();
    const date = entry?.list_status?.updated_at;
    if (!title || !date) return null;

    return { title, episodes: entry?.list_status?.num_episodes_watched ?? 0, date };
  } catch {
    return null;
  }
}

export async function fetchNow(): Promise<NowData> {
  const [commit, lift, watching] = await Promise.all([
    fetchLastCommit(),
    fetchLastLift(),
    fetchWatching(),
  ]);

  return { commit, lift, watching };
}
