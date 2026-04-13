import { NextResponse } from 'next/server';
import {
  TMDB_ACCESS_TOKEN_COOKIE,
  TMDB_ACCOUNT_ID_COOKIE,
  TMDB_RETURN_TO_COOKIE,
  TMDB_SESSION_ID_COOKIE,
  clearStoredTmdbOwnerAuth,
} from '@/lib/tmdb';

export const runtime = 'nodejs';

export async function POST() {
  await clearStoredTmdbOwnerAuth();

  const response = NextResponse.json({ success: true });

  response.cookies.delete(TMDB_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(TMDB_SESSION_ID_COOKIE);
  response.cookies.delete(TMDB_ACCOUNT_ID_COOKIE);
  response.cookies.delete(TMDB_RETURN_TO_COOKIE);

  return response;
}
