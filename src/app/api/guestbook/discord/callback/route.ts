import { NextRequest, NextResponse } from 'next/server';
import {
  GUESTBOOK_DISCORD_RETURN_COOKIE,
  GUESTBOOK_DISCORD_REDIRECT_COOKIE,
  GUESTBOOK_DISCORD_STATE_COOKIE,
  GUESTBOOK_DISCORD_USER_COOKIE,
  exchangeDiscordCode,
  fetchDiscordUser,
  getCookieOptions,
  getDiscordCallbackUrl,
  getDiscordConfig,
  serializeDiscordUser,
} from '@/lib/discord-guestbook';

export const runtime = 'nodejs';

const appendStatus = (path: string, status: string): string => {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set('discordAuth', status);
  return `${url.pathname}${url.search}`;
};

export async function GET(request: NextRequest) {
  const returnTo = request.cookies.get(GUESTBOOK_DISCORD_RETURN_COOKIE)?.value || '/guestbook';
  const storedState = request.cookies.get(GUESTBOOK_DISCORD_STATE_COOKIE)?.value;
  const { configured } = getDiscordConfig();

  const clearOAuthCookies = (response: NextResponse) => {
    response.cookies.delete(GUESTBOOK_DISCORD_RETURN_COOKIE);
    response.cookies.delete(GUESTBOOK_DISCORD_STATE_COOKIE);
    response.cookies.delete(GUESTBOOK_DISCORD_REDIRECT_COOKIE);
    return response;
  };

  if (!configured) {
    return clearOAuthCookies(
      NextResponse.redirect(new URL(appendStatus(returnTo, 'config'), request.url))
    );
  }

  const error = request.nextUrl.searchParams.get('error');
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (error || !code || !state || !storedState || state !== storedState) {
    return clearOAuthCookies(
      NextResponse.redirect(new URL(appendStatus(returnTo, 'denied'), request.url))
    );
  }

  try {
    const callbackUrl =
      request.cookies.get(GUESTBOOK_DISCORD_REDIRECT_COOKIE)?.value ||
      getDiscordCallbackUrl(request);
    const accessToken = await exchangeDiscordCode(code, callbackUrl);
    const discordUser = await fetchDiscordUser(accessToken);

    const response = NextResponse.redirect(new URL(appendStatus(returnTo, 'connected'), request.url));
    response.cookies.set(
      GUESTBOOK_DISCORD_USER_COOKIE,
      serializeDiscordUser(discordUser),
      getCookieOptions()
    );
    return clearOAuthCookies(response);
  } catch (callbackError) {
    console.error('Discord guestbook auth callback failed', callbackError);
    return clearOAuthCookies(
      NextResponse.redirect(new URL(appendStatus(returnTo, 'error'), request.url))
    );
  }
}
