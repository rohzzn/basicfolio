import { NextRequest, NextResponse } from 'next/server';
import { fetchStravaPhotoBatch } from '@/lib/strava-enrich';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_IDS_PER_REQUEST = 6;

export async function POST(request: NextRequest) {
  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.ids)) {
    return NextResponse.json({ error: 'ids array required' }, { status: 400 });
  }

  const ids = body.ids
    .map(n => Number(n))
    .filter(n => Number.isFinite(n))
    .slice(0, MAX_IDS_PER_REQUEST);

  if (ids.length === 0) {
    return NextResponse.json({ photos: {} });
  }

  try {
    const batch = await fetchStravaPhotoBatch(ids);
    const photos: Record<
      number,
      { urls: string[]; map?: { summary_polyline: string } }
    > = {};

    for (const [id, result] of batch) {
      photos[id] = result;
    }

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching activity photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}
