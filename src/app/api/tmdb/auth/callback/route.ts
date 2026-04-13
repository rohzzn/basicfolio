import { NextRequest, NextResponse } from 'next/server';
import {
  TMDB_ACCESS_TOKEN_COOKIE,
  TMDB_ACCOUNT_ID_COOKIE,
  TMDB_REQUEST_TOKEN_COOKIE,
  TMDB_RETURN_TO_COOKIE,
  TMDB_SESSION_ID_COOKIE,
  createTmdbSessionIdFromV4AccessToken,
  fetchTmdbPublicAccountDetails,
  createTmdbUserAccessToken,
  getCookieOptions,
  writeStoredTmdbOwnerAuth,
} from '@/lib/tmdb';

export const runtime = 'nodejs';

const appendStatus = (path: string, status: string): string => {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set('tmdbAuth', status);
  return `${url.pathname}${url.search}`;
};

export async function GET(request: NextRequest) {
  const returnTo = request.cookies.get(TMDB_RETURN_TO_COOKIE)?.value || '/hobbies/watchlist';
  const requestToken =
    request.nextUrl.searchParams.get('request_token') ||
    request.cookies.get(TMDB_REQUEST_TOKEN_COOKIE)?.value;
  const approved = request.nextUrl.searchParams.get('approved');
  const denied = request.nextUrl.searchParams.get('denied');

  if (denied === 'true' || approved === 'false' || !requestToken) {
    const response = NextResponse.redirect(new URL(appendStatus(returnTo, 'denied'), request.url));
    response.cookies.delete(TMDB_RETURN_TO_COOKIE);
    response.cookies.delete(TMDB_REQUEST_TOKEN_COOKIE);
    return response;
  }

  try {
    const { accessToken, accountObjectId } = await createTmdbUserAccessToken(requestToken);
    const [sessionId, accountDetails] = await Promise.all([
      createTmdbSessionIdFromV4AccessToken(accessToken),
      fetchTmdbPublicAccountDetails(accountObjectId),
    ]);
    const response = NextResponse.redirect(new URL(appendStatus(returnTo, 'connected'), request.url));
    const accountId = String(accountDetails.id);

    await writeStoredTmdbOwnerAuth({
      accessToken,
      accountId,
      sessionId,
    });

    response.cookies.set(TMDB_ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions());
    response.cookies.set(TMDB_SESSION_ID_COOKIE, sessionId, getCookieOptions());
    response.cookies.set(TMDB_ACCOUNT_ID_COOKIE, accountId, getCookieOptions());
    response.cookies.delete(TMDB_RETURN_TO_COOKIE);
    response.cookies.delete(TMDB_REQUEST_TOKEN_COOKIE);

    return response;
  } catch (error) {
    console.error('TMDb auth callback failed', error);
    const response = NextResponse.redirect(new URL(appendStatus(returnTo, 'error'), request.url));
    response.cookies.delete(TMDB_RETURN_TO_COOKIE);
    response.cookies.delete(TMDB_REQUEST_TOKEN_COOKIE);
    response.cookies.delete(TMDB_ACCESS_TOKEN_COOKIE);
    response.cookies.delete(TMDB_SESSION_ID_COOKIE);
    response.cookies.delete(TMDB_ACCOUNT_ID_COOKIE);

    return response;
  }
}
