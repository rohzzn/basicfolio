import { NextResponse } from 'next/server';
import { getSpotifyAccessToken } from '@/lib/spotify-token';

export async function GET() {
  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: 'Spotify not configured' }, { status: 500 });
  }

  return NextResponse.json({ access_token: accessToken });
}
