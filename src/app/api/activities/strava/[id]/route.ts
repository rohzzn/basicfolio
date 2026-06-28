import { NextRequest, NextResponse } from 'next/server';
import { getStravaActivityDetailCached } from '@/lib/strava-enrich';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const activityId = Number(id);

  if (!Number.isFinite(activityId)) {
    return NextResponse.json({ error: 'Invalid activity id' }, { status: 400 });
  }

  try {
    const detail = await getStravaActivityDetailCached(activityId);
    if (!detail) {
      return NextResponse.json(
        { error: 'Activity detail unavailable' },
        { status: 503 }
      );
    }
    return NextResponse.json(detail);
  } catch (error) {
    console.error('Error fetching Strava activity detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity detail' },
      { status: 503 }
    );
  }
}
