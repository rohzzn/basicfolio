import { NextRequest, NextResponse } from 'next/server';
import { getTweetsProfileUrl } from '@/lib/tweets-rss';

export const revalidate = 86400;

function normalizePicPath(src: string): string {
  try {
    return decodeURIComponent(src);
  } catch {
    return src;
  }
}

export async function GET(request: NextRequest) {
  const rawSrc = request.nextUrl.searchParams.get('src');
  const src = rawSrc ? normalizePicPath(rawSrc) : null;

  if (!src || !src.startsWith('/pic/') || src.includes('..')) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const origin = new URL(getTweetsProfileUrl()).origin;
  const imageUrl = `${origin}${src}`;

  try {
    const response = await fetch(imageUrl, { next: { revalidate: 86400 } });

    if (!response.ok) {
      return new NextResponse('Not found', { status: 404 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'image/jpeg',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Failed to proxy tweet media:', error);
    return new NextResponse('Failed to load media', { status: 502 });
  }
}
