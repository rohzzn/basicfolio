import { NextRequest, NextResponse } from 'next/server';
import {
  TMDB_REQUEST_TOKEN_COOKIE,
  TMDB_RETURN_TO_COOKIE,
  createTmdbRequestToken,
  getBaseUrl,
  getCookieOptions,
  getShortLivedCookieOptions,
} from '@/lib/tmdb';

export const runtime = 'nodejs';

const appendStatus = (path: string, status: string): string => {
  const url = new URL(path, 'http://localhost');
  url.searchParams.set('tmdbAuth', status);
  return `${url.pathname}${url.search}`;
};

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/hobbies/watchlist';

  try {
    const callbackUrl = `${getBaseUrl(request)}/api/tmdb/auth/callback`;
    const requestToken = await createTmdbRequestToken(callbackUrl);

    const response = NextResponse.redirect(
      `https://www.themoviedb.org/auth/access?request_token=${encodeURIComponent(requestToken)}`
    );

    response.cookies.set(TMDB_RETURN_TO_COOKIE, returnTo, getCookieOptions());
    response.cookies.set(TMDB_REQUEST_TOKEN_COOKIE, requestToken, getShortLivedCookieOptions());
    return response;
  } catch (error) {
    const status =
      error instanceof Error && error.message.includes('TMDB_API_READ_ACCESS_TOKEN')
        ? 'config'
        : 'error';

    return NextResponse.redirect(new URL(appendStatus(returnTo, status), request.url));
  }
}
