import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.HEVY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Hevy API Key not configured' }, { status: 500 });
  }

  try {
    const PAGE_SIZE = 10;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allWorkouts: any[] = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://api.hevyapp.com/v1/workouts?page=${page}&pageSize=${PAGE_SIZE}`,
        { headers: { 'api-key': apiKey }, cache: 'no-store' }
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const data = await response.json();
      const workouts = data.workouts ?? [];

      // Only keep workouts within 30-day window
      const recent = workouts.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (w: any) => new Date(w.start_time).getTime() >= cutoff
      );
      allWorkouts.push(...recent);

      // If we got fewer workouts than the cutoff filtered, or no more pages, stop
      if (recent.length < workouts.length || page >= (data.page_count ?? 1)) break;
      page++;
    }

    return NextResponse.json({ page: 1, page_count: 1, workouts: allWorkouts });
  } catch (error) {
    console.error('Error fetching Hevy workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}
