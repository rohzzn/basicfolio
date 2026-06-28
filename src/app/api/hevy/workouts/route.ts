import { NextResponse } from 'next/server';
import { fetchAllHevyWorkouts } from '@/lib/hevy-workouts';

export async function GET() {
  const apiKey = process.env.HEVY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Hevy API Key not configured' }, { status: 500 });
  }

  try {
    const workouts = await fetchAllHevyWorkouts();
    return NextResponse.json({ page: 1, page_count: 1, workouts });
  } catch (error) {
    console.error('Error fetching Hevy workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}
