import { NextResponse } from 'next/server';
import { getSpotifyTrackMeta } from '@/lib/spotify-track';

export async function GET(request: Request) {
  const trackId = new URL(request.url).searchParams.get('trackId');

  if (!trackId || !/^[a-zA-Z0-9]+$/.test(trackId)) {
    return NextResponse.json({ error: 'Invalid trackId' }, { status: 400 });
  }

  const track = await getSpotifyTrackMeta(trackId);

  if (!track) {
    return NextResponse.json({ error: 'Track not found' }, { status: 404 });
  }

  return NextResponse.json(track, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
