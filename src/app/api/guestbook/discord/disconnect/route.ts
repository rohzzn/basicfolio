import { NextResponse } from 'next/server';
import { GUESTBOOK_DISCORD_USER_COOKIE } from '@/lib/discord-guestbook';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(GUESTBOOK_DISCORD_USER_COOKIE);
  return response;
}
