import type { HevyWorkout } from '@/lib/activities-types';

export async function fetchAllHevyWorkouts(): Promise<HevyWorkout[]> {
  const apiKey = process.env.HEVY_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Hevy API key not configured');
  }

  const PAGE_SIZE = 10;
  const all: HevyWorkout[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.hevyapp.com/v1/workouts?page=${page}&pageSize=${PAGE_SIZE}`,
      { headers: { 'api-key': apiKey }, cache: 'no-store' }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        detail
          ? `Hevy HTTP ${response.status}: ${detail.slice(0, 200)}`
          : `Hevy HTTP ${response.status}`
      );
    }

    const data = await response.json();
    const workouts: HevyWorkout[] = data.workouts ?? [];
    all.push(...workouts);

    const pageCount = data.page_count ?? 1;
    if (page >= pageCount || workouts.length === 0) break;
    page += 1;
  }

  return all.sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );
}
