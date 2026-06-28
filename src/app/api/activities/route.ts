import { NextRequest, NextResponse } from 'next/server';
import { loadActivities } from '@/lib/activities-cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const refresh =
    request.nextUrl.searchParams.get('refresh') === '1' &&
    request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;

  try {
    const payload = await loadActivities(refresh);
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      {
        strava: [],
        hevy: [],
        fetchedAt: new Date().toISOString(),
        errors: {
          strava: 'Failed to fetch Strava data',
          hevy: 'Failed to fetch Hevy data',
        },
      },
      { status: 200 }
    );
  }
}
