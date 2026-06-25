import { NextResponse } from 'next/server';
import { getSpotifyPreviewUrl } from '@/lib/spotify-preview';

export async function GET(request: Request) {
  const trackId = new URL(request.url).searchParams.get('trackId');

  if (!trackId || !/^[a-zA-Z0-9]+$/.test(trackId)) {
    return NextResponse.json({ error: 'Invalid trackId' }, { status: 400 });
  }

  const previewUrl = await getSpotifyPreviewUrl(trackId);

  if (!previewUrl) {
    return NextResponse.json({ previewUrl: null }, { status: 404 });
  }

  return NextResponse.json(
    { previewUrl },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
