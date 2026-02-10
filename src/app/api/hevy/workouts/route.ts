import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.HEVY_API_KEY || '5aaf5e59-bb67-42b1-bd1b-e35635f49f87';

  if (!apiKey) {
    return NextResponse.json({ error: 'Hevy API Key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      'https://api.hevyapp.com/v1/workouts',
      {
        headers: {
          'api-key': apiKey,
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Hevy workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}
