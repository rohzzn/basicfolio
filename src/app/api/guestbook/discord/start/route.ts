import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  GUESTBOOK_DISCORD_RETURN_COOKIE,
  GUESTBOOK_DISCORD_REDIRECT_COOKIE,
  GUESTBOOK_DISCORD_STATE_COOKIE,
  buildDiscordAuthUrl,
  getCookieOptions,
  getDiscordCallbackUrl,
  getDiscordConfig,
  getRequestHost,
  getShortLivedCookieOptions,
  isAllowedDiscordHost,
} from '@/lib/discord-guestbook';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { configured } = getDiscordConfig();
  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/guestbook';

  if (!configured) {
    return NextResponse.redirect(new URL(`${returnTo}?discordAuth=config`, request.url));
  }

  if (process.env.NODE_ENV === 'production' && !isAllowedDiscordHost(getRequestHost(request))) {
    return NextResponse.redirect(new URL(`${returnTo}?discordAuth=config`, request.url));
  }

  const state = randomBytes(16).toString('hex');
  const callbackUrl = getDiscordCallbackUrl(request);
  const authUrl = buildDiscordAuthUrl(callbackUrl, state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(GUESTBOOK_DISCORD_RETURN_COOKIE, returnTo, getCookieOptions());
  response.cookies.set(GUESTBOOK_DISCORD_STATE_COOKIE, state, getShortLivedCookieOptions());
  response.cookies.set(GUESTBOOK_DISCORD_REDIRECT_COOKIE, callbackUrl, getShortLivedCookieOptions());
  return response;
}
