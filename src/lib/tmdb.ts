import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

const TMDB_APP_ACCESS_TOKEN =
  process.env.TMDB_API_READ_ACCESS_TOKEN ||
  process.env.TMDB_READ_ACCESS_TOKEN ||
  process.env.TMDB_V4_READ_ACCESS_TOKEN ||
  '';

const TMDB_OWNER_SESSION_ID =
  process.env.TMDB_OWNER_SESSION_ID || process.env.TMDB_SESSION_ID || '';
const TMDB_OWNER_ACCOUNT_ID =
  process.env.TMDB_OWNER_ACCOUNT_ID || process.env.TMDB_ACCOUNT_ID || '';

const TMDB_OWNER_AUTH_FILE = path.join(process.cwd(), 'data', 'tmdb-owner-auth.json');
const TMDB_API_BASE_URL = 'https://api.themoviedb.org';

export const TMDB_ACCESS_TOKEN_COOKIE = 'tmdb_user_access_token';
export const TMDB_SESSION_ID_COOKIE = 'tmdb_session_id';
export const TMDB_ACCOUNT_ID_COOKIE = 'tmdb_account_id';
export const TMDB_RETURN_TO_COOKIE = 'tmdb_return_to';
export const TMDB_REQUEST_TOKEN_COOKIE = 'tmdb_request_token';

export interface TmdbRatedMovieResult {
  id: number;
  title: string;
  release_date: string | null;
  poster_path: string | null;
  rating: number;
}

export interface TmdbRatedTvResult {
  id: number;
  name: string;
  first_air_date: string | null;
  poster_path: string | null;
  rating: number;
}

interface TmdbPagedResponse<T> {
  page: number;
  total_pages: number;
  results: T[];
}

interface TmdbRequestTokenResponse {
  success: boolean;
  request_token: string;
}

interface TmdbAccessTokenResponse {
  success: boolean;
  access_token: string;
  account_id?: string;
}

interface TmdbSessionResponse {
  success: boolean;
  session_id: string;
}

interface TmdbAccountDetails {
  id: number;
  username: string;
}

interface StoredTmdbOwnerAuth {
  accessToken?: string;
  accountId: string;
  sessionId: string;
  updatedAt: string;
}

export interface TmdbResolvedAccountAuth {
  accountId: string;
  sessionId: string;
}

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `TMDb request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getTmdbAppAccessToken = (): string => {
  if (!TMDB_APP_ACCESS_TOKEN) {
    throw new Error('TMDB_API_READ_ACCESS_TOKEN is not configured');
  }

  return TMDB_APP_ACCESS_TOKEN;
};

export const getBaseUrl = (request: NextRequest): string => {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (forwardedProto && host) {
    return `${forwardedProto}://${host}`;
  }

  return new URL(request.url).origin;
};

export const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
});

export const getShortLivedCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 30,
});

export const createTmdbRequestToken = async (redirectTo: string): Promise<string> => {
  const response = await fetch(`${TMDB_API_BASE_URL}/4/auth/request_token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getTmdbAppAccessToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      redirect_to: redirectTo,
    }),
    cache: 'no-store',
  });

  const data = await parseJsonResponse<TmdbRequestTokenResponse>(response);
  return data.request_token;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const createTmdbUserAccessToken = async (
  requestToken: string
): Promise<{ accessToken: string; accountObjectId: string }> => {
  const response = await fetch(`${TMDB_API_BASE_URL}/4/auth/access_token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getTmdbAppAccessToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_token: requestToken,
    }),
    cache: 'no-store',
  });

  const data = await parseJsonResponse<TmdbAccessTokenResponse>(response);
  const decodedPayload = decodeJwtPayload(data.access_token);
  const accountId =
    data.account_id ||
    (typeof decodedPayload?.sub === 'string' ? decodedPayload.sub : '');

  if (!accountId) {
    throw new Error('TMDb did not return an account object id');
  }

  return {
    accessToken: data.access_token,
    accountObjectId: accountId,
  };
};

export const createTmdbSessionIdFromV4AccessToken = async (
  userAccessToken: string
): Promise<string> => {
  const response = await fetch(`${TMDB_API_BASE_URL}/3/authentication/session/convert/4`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getTmdbAppAccessToken()}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      access_token: userAccessToken,
    }),
    cache: 'no-store',
  });

  const data = await parseJsonResponse<TmdbSessionResponse>(response);
  return data.session_id;
};

export const fetchTmdbPublicAccountDetails = async (
  accountObjectId: string
): Promise<TmdbAccountDetails> => {
  const response = await fetch(`${TMDB_API_BASE_URL}/3/account/${accountObjectId}`, {
    headers: {
      Authorization: `Bearer ${getTmdbAppAccessToken()}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  return parseJsonResponse<TmdbAccountDetails>(response);
};

export const writeStoredTmdbOwnerAuth = async (
  auth: TmdbResolvedAccountAuth & { accessToken?: string }
): Promise<void> => {
  await fs.mkdir(path.dirname(TMDB_OWNER_AUTH_FILE), { recursive: true });
  await fs.writeFile(
    TMDB_OWNER_AUTH_FILE,
    JSON.stringify(
      {
        accountId: auth.accountId,
        sessionId: auth.sessionId,
        accessToken: auth.accessToken,
        updatedAt: new Date().toISOString(),
      } satisfies StoredTmdbOwnerAuth,
      null,
      2
    ),
    'utf8'
  );
};

export const readStoredTmdbOwnerAuth = async (): Promise<TmdbResolvedAccountAuth | null> => {
  try {
    const fileContents = await fs.readFile(TMDB_OWNER_AUTH_FILE, 'utf8');
    const parsed = JSON.parse(fileContents) as Partial<StoredTmdbOwnerAuth>;

    if (typeof parsed.accountId !== 'string' || typeof parsed.sessionId !== 'string') {
      return null;
    }

    return {
      accountId: parsed.accountId,
      sessionId: parsed.sessionId,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

export const clearStoredTmdbOwnerAuth = async (): Promise<void> => {
  try {
    await fs.unlink(TMDB_OWNER_AUTH_FILE);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
};

export const resolveTmdbAccountAuth = async (
  request?: NextRequest
): Promise<TmdbResolvedAccountAuth> => {
  if (TMDB_OWNER_SESSION_ID && TMDB_OWNER_ACCOUNT_ID) {
    return {
      accountId: TMDB_OWNER_ACCOUNT_ID,
      sessionId: TMDB_OWNER_SESSION_ID,
    };
  }

  const storedOwnerAuth = await readStoredTmdbOwnerAuth();

  if (storedOwnerAuth) {
    return storedOwnerAuth;
  }

  const sessionId = request?.cookies.get(TMDB_SESSION_ID_COOKIE)?.value;
  const accountId = request?.cookies.get(TMDB_ACCOUNT_ID_COOKIE)?.value;

  if (sessionId && accountId) {
    return {
      accountId,
      sessionId,
    };
  }

  throw new Error('TMDb owner session is not configured');
};

const fetchAllRatedAccountMedia = async <T>(
  mediaPath: 'movies' | 'tv',
  accountId: string,
  sessionId: string
): Promise<T[]> => {
  const results: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `${TMDB_API_BASE_URL}/3/account/${accountId}/rated/${mediaPath}?page=${page}&language=en-US&session_id=${encodeURIComponent(
        sessionId
      )}`,
      {
        headers: {
          Authorization: `Bearer ${getTmdbAppAccessToken()}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (response.status === 401 || response.status === 403) {
      throw new Error('TMDb authentication expired');
    }

    const data = await parseJsonResponse<TmdbPagedResponse<T>>(response);

    results.push(...data.results);
    totalPages = data.total_pages;
    page += 1;
  }

  return results;
};

export const fetchAllRatedMovies = async (
  accountId: string,
  sessionId: string
): Promise<TmdbRatedMovieResult[]> =>
  fetchAllRatedAccountMedia<TmdbRatedMovieResult>('movies', accountId, sessionId);

export const fetchAllRatedTvShows = async (
  accountId: string,
  sessionId: string
): Promise<TmdbRatedTvResult[]> =>
  fetchAllRatedAccountMedia<TmdbRatedTvResult>('tv', accountId, sessionId);

export const buildTmdbPosterUrl = (posterPath: string | null): string | null =>
  posterPath ? `https://media.themoviedb.org/t/p/w440_and_h660_face${posterPath}` : null;
