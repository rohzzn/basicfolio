import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 86400;

const ALLOWED_HOSTS = new Set(['video.twimg.com', 'pbs.twimg.com']);

export async function GET(request: NextRequest) {
  const rawSrc = request.nextUrl.searchParams.get('src');
  if (!rawSrc) {
    return new NextResponse('Bad request', { status: 400 });
  }

  let videoUrl: URL;
  try {
    videoUrl = new URL(rawSrc);
  } catch {
    return new NextResponse('Bad request', { status: 400 });
  }

  if (videoUrl.protocol !== 'https:' || !ALLOWED_HOSTS.has(videoUrl.hostname)) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const range = request.headers.get('range');
  const upstreamHeaders: HeadersInit = range ? { Range: range } : {};

  try {
    const response = await fetch(videoUrl.toString(), {
      headers: upstreamHeaders,
      next: { revalidate: 86400 },
    });

    if (!response.ok && response.status !== 206) {
      return new NextResponse('Not found', { status: response.status });
    }

    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') ?? 'video/mp4');
    headers.set('Accept-Ranges', response.headers.get('Accept-Ranges') ?? 'bytes');
    headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

    const contentRange = response.headers.get('Content-Range');
    const contentLength = response.headers.get('Content-Length');
    if (contentRange) headers.set('Content-Range', contentRange);
    if (contentLength) headers.set('Content-Length', contentLength);

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Failed to proxy tweet video:', error);
    return new NextResponse('Failed to load video', { status: 502 });
  }
}
