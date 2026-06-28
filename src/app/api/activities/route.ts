import { NextRequest, NextResponse } from 'next/server';
import { loadActivities } from '@/lib/activities-cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const refresh =
    request.nextUrl.searchParams.get('refresh') === '1' &&
    request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;

  try {
    const payload = await loadActivities(refresh);
    const hasData = payload.strava.length > 0 || payload.hevy.length > 0;
    const allFailed = payload.errors.strava && payload.errors.hevy && !hasData;

    if (allFailed) {
      return NextResponse.json(
        { error: 'Failed to fetch activities', ...payload },
        { status: 500 }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
