"use client";

import Image from 'next/image';
import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';

interface MediaEntry {
  posterImageUrl: string | null;
  ratingValue: number | null;
  title: string;
  url: string;
  year: number | null;
}

interface TmdbCatalog {
  movies: Array<{
    posterImageUrl: string | null;
    ratingValue: number | null;
    title: string;
    tmdbUrl: string;
    year: number | null;
  }>;
  shows: Array<{
    posterImageUrl: string | null;
    ratingValue: number | null;
    title: string;
    tmdbUrl: string;
    year: number | null;
  }>;
}

interface MalAnime {
  id: number;
  image: string | null;
  score: number | null;
  title: string;
  year: number | null;
}

interface MalCatalog {
  animeList: MalAnime[];
}

interface WatchlistCatalog {
  anime: MediaEntry[];
  movies: MediaEntry[];
  shows: MediaEntry[];
}

interface MediaYearGroup {
  entries: MediaEntry[];
  key: string;
  yearLabel: string | null;
  yearValue: number | null;
}

type MediaTypeId = 'movies' | 'shows' | 'anime';
type SortOptionId = 'newest' | 'oldest' | 'highest-rated' | 'lowest-rated';

const MAL_USERNAME = 'rohzzn';

const sortByLatestYear = (left: MediaEntry, right: MediaEntry): number => {
  const leftYear = left.year ?? Number.MIN_SAFE_INTEGER;
  const rightYear = right.year ?? Number.MIN_SAFE_INTEGER;

  if (leftYear !== rightYear) {
    return rightYear - leftYear;
  }

  return left.title.localeCompare(right.title);
};

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Failed to fetch ${url} (${response.status})`);
  }

  return response.json();
};

const fetchWatchlistCatalog = async (): Promise<WatchlistCatalog> => {
  const [tmdbCatalog, malCatalog] = await Promise.all([
    fetchJson<TmdbCatalog>('/api/tmdb/ratings'),
    fetchJson<MalCatalog>(`/api/myanimelist?username=${encodeURIComponent(MAL_USERNAME)}`),
  ]);

  return {
    movies: tmdbCatalog.movies.map((movie) => ({
      posterImageUrl: movie.posterImageUrl,
      ratingValue: movie.ratingValue,
      title: movie.title,
      url: movie.tmdbUrl,
      year: movie.year,
    })),
    shows: tmdbCatalog.shows.map((show) => ({
      posterImageUrl: show.posterImageUrl,
      ratingValue: show.ratingValue,
      title: show.title,
      url: show.tmdbUrl,
      year: show.year,
    })),
    anime: malCatalog.animeList
      .map((anime) => ({
        posterImageUrl: anime.image,
        ratingValue: anime.score !== null ? anime.score / 2 : null,
        title: anime.title,
        url: `https://myanimelist.net/anime/${anime.id}`,
        year: anime.year,
      }))
      .sort(sortByLatestYear),
  };
};


const PosterSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] rounded-sm bg-zinc-200 dark:bg-zinc-800" />
    <div className="mt-3 h-3.5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
    <div className="mt-2 h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
  </div>
);

const mediaTypeFilters: Array<{ id: MediaTypeId; label: string }> = [
  { id: 'movies', label: 'Movies' },
  { id: 'shows', label: 'TV Shows' },
  { id: 'anime', label: 'Anime' },
];

const mediaLabels: Record<MediaTypeId, string> = {
  movies: 'Movies',
  shows: 'TV Shows',
  anime: 'Anime',
};


const filterMediaEntries = (
  entries: MediaEntry[],
  normalizedSearch: string
): MediaEntry[] =>
  entries.filter((entry) => {
    return !normalizedSearch || entry.title.toLowerCase().includes(normalizedSearch);
  });

const compareNullableNumbers = (
  left: number | null,
  right: number | null,
  direction: 'asc' | 'desc'
): number => {
  if (left === null && right !== null) {
    return 1;
  }

  if (left !== null && right === null) {
    return -1;
  }

  if (left !== null && right !== null && left !== right) {
    return direction === 'desc' ? right - left : left - right;
  }

  return 0;
};

const sortMediaEntries = (entries: MediaEntry[], sortOption: SortOptionId): MediaEntry[] =>
  [...entries].sort((left, right) => {
    if (sortOption === 'highest-rated' || sortOption === 'lowest-rated') {
      const ratingComparison = compareNullableNumbers(
        left.ratingValue,
        right.ratingValue,
        sortOption === 'highest-rated' ? 'desc' : 'asc'
      );

      if (ratingComparison !== 0) {
        return ratingComparison;
      }

      const yearComparison = compareNullableNumbers(left.year, right.year, 'desc');

      if (yearComparison !== 0) {
        return yearComparison;
      }

      return left.title.localeCompare(right.title);
    }

    const yearComparison = compareNullableNumbers(
      left.year,
      right.year,
      sortOption === 'newest' ? 'desc' : 'asc'
    );

    if (yearComparison !== 0) {
      return yearComparison;
    }

    return left.title.localeCompare(right.title);
  });

const usesYearGrouping = (sortOption: SortOptionId): boolean =>
  sortOption === 'newest' || sortOption === 'oldest';

const groupMediaEntriesByYear = (
  entries: MediaEntry[],
  sortOption: SortOptionId
): MediaYearGroup[] => {
  const groupedEntries = new Map<string, MediaYearGroup>();

  for (const entry of entries) {
    const yearLabel = entry.year ? String(entry.year) : null;
    const groupKey = yearLabel ?? 'unknown';
    const existingGroup = groupedEntries.get(groupKey);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      continue;
    }

    groupedEntries.set(groupKey, {
      entries: [entry],
      key: groupKey,
      yearLabel,
      yearValue: entry.year,
    });
  }

  const yearDirection = sortOption === 'oldest' ? 'asc' : 'desc';

  return Array.from(groupedEntries.values()).sort((left, right) => {
    const yearComparison = compareNullableNumbers(left.yearValue, right.yearValue, yearDirection);

    if (yearComparison !== 0) {
      return yearComparison;
    }

    return left.key.localeCompare(right.key);
  });
};

interface MediaGridProps {
  groups: MediaYearGroup[];
  emptyLabel: string;
  isLoading: boolean;
}

const MediaGrid: React.FC<MediaGridProps> = ({ groups, emptyLabel, isLoading }) => {
  const gridClassName =
    'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6';

  if (isLoading) {
    return (
      <section>
        <div className={gridClassName}>
          {Array.from({ length: 12 }, (_, index) => (
            <PosterSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  const hasEntries = groups.some((group) => group.entries.length > 0);

  if (!hasEntries) {
    return <p className="pt-6 text-sm text-zinc-500 dark:text-zinc-400">{emptyLabel}</p>;
  }

  return (
    <section className="space-y-10">
      {groups.map((group) => (
        <section key={group.key}>
          {group.yearLabel ? (
            <div className="mb-4 text-xs text-zinc-400 dark:text-zinc-500">
              {group.yearLabel}
            </div>
          ) : null}

          <div className={gridClassName}>
            {group.entries.map((entry) => (
              <article key={entry.url} className="min-w-0">
                <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-zinc-200 dark:bg-zinc-800">
                  {entry.posterImageUrl ? (
                    <Image
                      src={entry.posterImageUrl}
                      alt={entry.title}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 18vw, 15vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      No cover
                    </div>
                  )}
                </div>

                <div className="mt-2.5">
                  <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    {entry.title}
                  </p>
                  {entry.ratingValue !== null ? (
                    <div className="mt-1 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const full = i < Math.floor(entry.ratingValue!);
                        const half = !full && i < entry.ratingValue!;
                        return (
                          <span
                            key={i}
                            className={`text-[10px] ${full || half ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                          >
                            {half ? '½' : '★'}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-600">Unrated</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
};

const WatchlistPage: React.FC = () => {
  const [catalog, setCatalog] = useState<WatchlistCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMediaType, setActiveMediaType] = useState<MediaTypeId>('movies');
  const [sortOption, setSortOption] = useState<SortOptionId>('newest');

  useEffect(() => {
    let isActive = true;

    const loadCatalog = async () => {
      try {
        setError(null);
        const data = await fetchWatchlistCatalog();

        if (!isActive) {
          return;
        }

        setCatalog(data);
      } catch {
        if (!isActive) {
          return;
        }

        setError('Unable to load movies, TV shows, and anime right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      isActive = false;
    };
  }, []);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
  const movies = useMemo(() => catalog?.movies ?? [], [catalog]);
  const shows = useMemo(() => catalog?.shows ?? [], [catalog]);
  const anime = useMemo(() => catalog?.anime ?? [], [catalog]);

  const filteredMovies = useMemo(
    () => filterMediaEntries(movies, normalizedSearch),
    [movies, normalizedSearch]
  );
  const filteredShows = useMemo(
    () => filterMediaEntries(shows, normalizedSearch),
    [normalizedSearch, shows]
  );
  const filteredAnime = useMemo(
    () => filterMediaEntries(anime, normalizedSearch),
    [anime, normalizedSearch]
  );

  const activeEntries =
    activeMediaType === 'movies'
      ? filteredMovies
      : activeMediaType === 'shows'
        ? filteredShows
        : filteredAnime;
  const sortedActiveEntries = useMemo(
    () => sortMediaEntries(activeEntries, sortOption),
    [activeEntries, sortOption]
  );
  const activeGroups = useMemo(
    () =>
      usesYearGrouping(sortOption)
        ? groupMediaEntriesByYear(sortedActiveEntries, sortOption)
        : [
            {
              entries: sortedActiveEntries,
              key: 'all',
              yearLabel: null,
              yearValue: null,
            },
          ],
    [sortedActiveEntries, sortOption]
  );

  const counts = {
    movies: (catalog?.movies ?? []).length,
    shows: (catalog?.shows ?? []).length,
    anime: (catalog?.anime ?? []).length,
  };

  return (
    <div className="max-w-7xl">
      {/* Header row: title + search */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-lg font-medium dark:text-white">Watchlist</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search…"
          className="w-32 sm:w-44 bg-transparent text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-b border-zinc-200 dark:border-zinc-700 pb-0.5 transition focus:border-zinc-500 dark:focus:border-zinc-400"
        />
      </div>

      {/* Tab row */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 mb-4">
        <div className="flex gap-5 overflow-x-auto no-scrollbar">
          {mediaTypeFilters.map((filter) => {
            const isActive = activeMediaType === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => { setActiveMediaType(filter.id); setSearchTerm(''); }}
                className={`relative pb-2.5 text-sm font-medium transition-colors flex-shrink-0 ${
                  isActive
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {filter.label}
                {!isLoading && counts[filter.id] > 0 && (
                  <span className="ml-1.5 text-xs tabular-nums opacity-50">{counts[filter.id]}</span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-4 pb-2.5 flex-shrink-0 ml-4">
          <button
            type="button"
            onClick={() => setSortOption(sortOption === 'newest' ? 'oldest' : 'newest')}
            className={`text-sm transition-colors ${
              sortOption === 'newest' || sortOption === 'oldest'
                ? 'font-medium text-zinc-900 dark:text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Year {sortOption === 'newest' ? '↓' : sortOption === 'oldest' ? '↑' : ''}
          </button>
          <button
            type="button"
            onClick={() =>
              setSortOption(sortOption === 'highest-rated' ? 'lowest-rated' : 'highest-rated')
            }
            className={`text-sm transition-colors ${
              sortOption === 'highest-rated' || sortOption === 'lowest-rated'
                ? 'font-medium text-zinc-900 dark:text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Rating {sortOption === 'highest-rated' ? '↓' : sortOption === 'lowest-rated' ? '↑' : ''}
          </button>
        </div>
      </div>

      {error ? (
        <p className="py-16 text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
      ) : (
        <MediaGrid
          groups={activeGroups}
          isLoading={isLoading}
          emptyLabel={`No ${mediaLabels[activeMediaType].toLowerCase()} match those filters.`}
        />
      )}
    </div>
  );
};

export default WatchlistPage;
