import { NextRequest, NextResponse } from 'next/server';
import {
  TMDB_ACCOUNT_ID_COOKIE,
  TMDB_SESSION_ID_COOKIE,
  buildTmdbPosterUrl,
  fetchAllRatedMovies,
  fetchAllRatedTvShows,
  resolveTmdbAccountAuth,
} from '@/lib/tmdb';

export const runtime = 'nodejs';

interface MediaEntry {
  posterImageUrl: string | null;
  ratingValue: number | null;
  releaseDate: string | null;
  title: string;
  tmdbUrl: string;
  year: number | null;
}

const sortByLatestRelease = (left: MediaEntry, right: MediaEntry): number => {
  const leftDate = left.releaseDate ?? '';
  const rightDate = right.releaseDate ?? '';

  if (leftDate !== rightDate) {
    return rightDate.localeCompare(leftDate);
  }

  return left.title.localeCompare(right.title);
};

export async function GET(request: NextRequest) {
  try {
    const { accountId, sessionId } = await resolveTmdbAccountAuth(request);
    const [ratedMovies, ratedShows] = await Promise.all([
      fetchAllRatedMovies(accountId, sessionId),
      fetchAllRatedTvShows(accountId, sessionId),
    ]);

    const movies: MediaEntry[] = ratedMovies
      .map((movie) => ({
        title: movie.title || 'Untitled',
        year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
        releaseDate: movie.release_date,
        tmdbUrl: `https://www.themoviedb.org/movie/${movie.id}`,
        posterImageUrl: buildTmdbPosterUrl(movie.poster_path),
        ratingValue: Number.isFinite(movie.rating) ? movie.rating / 2 : null,
      }))
      .sort(sortByLatestRelease);

    const shows: MediaEntry[] = ratedShows
      .map((show) => ({
        title: show.name || 'Untitled',
        year: show.first_air_date ? Number(show.first_air_date.slice(0, 4)) : null,
        releaseDate: show.first_air_date,
        tmdbUrl: `https://www.themoviedb.org/tv/${show.id}`,
        posterImageUrl: buildTmdbPosterUrl(show.poster_path),
        ratingValue: Number.isFinite(show.rating) ? show.rating / 2 : null,
      }))
      .sort(sortByLatestRelease);

    return NextResponse.json(
      {
        movies,
        shows,
        source: 'tmdb',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load rated movies and shows from TMDb';
    const requiresAuth = /auth/i.test(message) || /owner session/i.test(message);
    const response = NextResponse.json(
      {
        error: message,
        requiresAuth,
      },
      {
        status: requiresAuth ? 401 : 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );

    if (requiresAuth) {
      response.cookies.delete(TMDB_SESSION_ID_COOKIE);
      response.cookies.delete(TMDB_ACCOUNT_ID_COOKIE);
    }

    return response;
  }
}
