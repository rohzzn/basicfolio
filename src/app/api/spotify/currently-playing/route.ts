import { NextResponse } from 'next/server';
import { getSpotifyCurrentlyPlaying } from '@/lib/spotify-track';

export async function GET() {
  try {
    const data = await getSpotifyCurrentlyPlaying();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Spotify currently playing error:', error);
    return NextResponse.json({ error: 'Failed to fetch currently playing' }, { status: 502 });
  }
}
