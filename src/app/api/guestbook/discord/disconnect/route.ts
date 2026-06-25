import { NextRequest, NextResponse } from 'next/server';
import {
  GUESTBOOK_DISCORD_USER_COOKIE,
  getCookieOptions,
} from '@/lib/discord-guestbook';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(GUESTBOOK_DISCORD_USER_COOKIE, '', {
    ...getCookieOptions(request),
    maxAge: 0,
  });
  return response;
}
