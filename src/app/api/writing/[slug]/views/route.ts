import { NextRequest, NextResponse } from 'next/server';
import {
  getReadCount,
  incrementReadCount,
  isLikelyBot,
  isReadsStorageAvailable,
  isValidPostSlug,
  readCookieName,
} from '@/lib/post-reads';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  if (!isValidPostSlug(slug)) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const count = await getReadCount(slug);
  return NextResponse.json({ slug, count });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  if (!isValidPostSlug(slug)) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (!isReadsStorageAvailable()) {
    return NextResponse.json({ slug, count: 0, recorded: false, available: false });
  }

  const count = await getReadCount(slug);
  const cookieName = readCookieName(slug);
  const alreadyRecorded = request.cookies.has(cookieName);
  const userAgent = request.headers.get('user-agent');

  if (alreadyRecorded || isLikelyBot(userAgent)) {
    return NextResponse.json({ slug, count, recorded: false });
  }

  const nextCount = await incrementReadCount(slug);
  if (nextCount === null) {
    return NextResponse.json({ slug, count, recorded: false, available: false });
  }

  const response = NextResponse.json({ slug, count: nextCount, recorded: true });

  response.cookies.set(cookieName, '1', {
    maxAge: 60 * 60 * 24,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  return response;
}
