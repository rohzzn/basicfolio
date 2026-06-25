import { NextResponse } from 'next/server';
import { getSpotifyAccessToken } from '@/lib/spotify-token';

const DEFAULT_COVER =
  'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large';

export async function GET(request: Request) {
  const trackId = new URL(request.url).searchParams.get('trackId');

  if (!trackId || !/^[a-zA-Z0-9]+$/.test(trackId)) {
    return NextResponse.json({ error: 'Invalid trackId' }, { status: 400 });
  }

  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Spotify not configured' }, { status: 500 });
  }

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Track not found' }, { status: response.status });
  }

  const track = await response.json();

  return NextResponse.json({
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist: { name: string }) => artist.name).join(', '),
    imageUrl: track.album?.images?.[0]?.url ?? DEFAULT_COVER,
    spotifyUrl: track.external_urls?.spotify ?? `https://open.spotify.com/track/${trackId}`,
    durationMs: track.duration_ms ?? 30000,
  });
}
