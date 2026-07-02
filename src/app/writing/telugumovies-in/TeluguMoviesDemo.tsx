'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Search, X } from 'lucide-react';
import SiteImage from '@/components/SiteImage';

type Movie = {
  title: string;
  year: number;
  poster: string;
  hero?: string;
};

const TMDB = (path: string) => `https://image.tmdb.org/t/p/w342${path}`;

const HEROES = [
  'Chiranjeevi',
  'Prabhas',
  'Allu Arjun',
  'Mahesh Babu',
  'Jr NTR',
  'Ram Charan',
  'Nani',
  'Pawan Kalyan',
];

const NOW_PLAYING: Movie[] = [
  { title: 'Devara Part 1', year: 2024, poster: TMDB('/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg') },
  { title: 'Pushpa 2', year: 2024, poster: TMDB('/bhxZj3y59cK7JtGdV285dhDRaMe.jpg') },
  { title: 'Kalki 2898 AD', year: 2024, poster: TMDB('/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg') },
  { title: 'Game Changer', year: 2025, poster: TMDB('/qtOGsZoLW7QceqKmsOy5nSM6Aik.jpg') },
  { title: 'Robinhood', year: 2025, poster: TMDB('/zeH5oAM1A3zgXbvQ3L9GiDs3ldQ.jpg') },
];

const YEAR_ROWS: { label: string; movies: Movie[] }[] = [
  {
    label: '2020s',
    movies: [
      { title: 'RRR', year: 2022, poster: TMDB('/u0XUBNQWlOvrh0Gd97ARGpIkL0.jpg'), hero: 'Jr NTR' },
      { title: 'Baahubali 2', year: 2017, poster: TMDB('/21sC2assImQIYCEDA84Qh9d1RsK.jpg'), hero: 'Prabhas' },
      { title: 'Pushpa', year: 2021, poster: TMDB('/4DpNRjV7ITZ1GzCvrvCk86th0w.jpg'), hero: 'Allu Arjun' },
      { title: 'Salaar', year: 2023, poster: TMDB('/nlu9WbcetNFRGXXPWITr30ob7W6.jpg'), hero: 'Prabhas' },
      { title: 'Jersey', year: 2019, poster: TMDB('/bU9q9yVtxeBiC0Do27CekHXNE6D.jpg'), hero: 'Nani' },
      { title: 'Maharshi', year: 2019, poster: TMDB('/pV6xLQh54ga8oaQqJtUqLp12LwQ.jpg'), hero: 'Mahesh Babu' },
    ],
  },
  {
    label: '2010s',
    movies: [
      { title: 'Baahubali', year: 2015, poster: TMDB('/9BAjt8nSSms62uOVYn1t3C3dVto.jpg'), hero: 'Prabhas' },
      { title: 'Magadheera', year: 2009, poster: TMDB('/xK7MEV56GF291VG0U5XnVJuvNv3.jpg'), hero: 'Ram Charan' },
      { title: 'Eega', year: 2012, poster: TMDB('/pX7fn4EZrg2YFlV4GNMIfHDOQZ6.jpg'), hero: 'Nani' },
      { title: 'Gabbar Singh', year: 2012, poster: TMDB('/tFDhzLPhWnjDNda7YHcbeB4gcGi.jpg'), hero: 'Pawan Kalyan' },
      { title: 'Srimanthudu', year: 2015, poster: TMDB('/qHSgSMZUiIqKCe76PBs6QuA6MRM.jpg'), hero: 'Mahesh Babu' },
    ],
  },
  {
    label: '2000s',
    movies: [
      { title: 'Indra', year: 2002, poster: TMDB('/2PPCIPNzSRqRjyNf3ZU1NN8yXv.jpg'), hero: 'Chiranjeevi' },
      { title: 'Athadu', year: 2005, poster: TMDB('/AlopJ5sUgsf0pFn8FfXqdhyfL2Z.jpg'), hero: 'Mahesh Babu' },
      { title: 'Bommarillu', year: 2006, poster: TMDB('/oYN5XJzV9dYGwzq4fmp41xcIaDS.jpg') },
      { title: 'Arjun Reddy', year: 2017, poster: TMDB('/kHubDgL59I5hCn7ccBYvU7bKY1r.jpg') },
    ],
  },
];

const TV_MOVIES: Movie[] = [
  { title: 'Annamayya', year: 1997, poster: TMDB('/jmgzq8MWSMthVYE08H9bAKVTpu8.jpg'), hero: 'Nagarjuna' },
  { title: 'Shiva', year: 1989, poster: TMDB('/glgO02tTO5B4GAmybuzEsCMQK5O.jpg'), hero: 'Nagarjuna' },
  { title: 'Geethanjali', year: 1989, poster: TMDB('/qZVWloCwvgP5JtaqBWoFY6YspzT.jpg'), hero: 'Nagarjuna' },
  { title: 'Mayabazar', year: 1957, poster: TMDB('/hLtcUnDZZuBNSONZbRTiS67bnyz.jpg') },
  { title: 'Sankarabharanam', year: 1980, poster: TMDB('/9LDbi3KsrpBQL48uXIPWTYsdjyF.jpg') },
  { title: 'Sagara Sangamam', year: 1983, poster: TMDB('/hdg47CcaBfLf0DttUoav45boYtL.jpg') },
  { title: 'Swathi Muthyam', year: 1986, poster: TMDB('/zz7cTgtNabBRPRdyw45A3vbsAoN.jpg') },
  { title: 'Mutyala Muggu', year: 1975, poster: TMDB('/vQ4TOaeFyU3NrJCfM6IPdB2PTpN.jpg') },
];

const OLDER_YEARS = Array.from({ length: 14 }, (_, i) => 2019 - i);

type View = 'browse' | 'cinemas' | 'tv';

function Poster({ movie, onClick }: { movie: Movie; onClick?: () => void }) {
  const [failed, setFailed] = useState(false);
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="group relative w-[7.5rem] shrink-0 text-left sm:w-[9.5rem] lg:w-[10.5rem]"
    >
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-lg transition-transform duration-200 group-hover:scale-[1.04] group-hover:z-10"
        style={{
          background: '#1f1f1f',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        {!failed && (
          <SiteImage
            src={movie.poster}
            alt={`${movie.title} poster`}
            fill
            className="object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-8">
          <p className="text-[11px] font-bold leading-tight text-white">{movie.title}</p>
          <p className="mt-0.5 text-[9px] font-medium text-white/60">{movie.year}</p>
        </div>
        {onClick && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg">
              <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
            </span>
          </div>
        )}
      </div>
    </Tag>
  );
}

function MovieRow({ title, movies, playable }: { title: string; movies: Movie[]; playable?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<Movie | null>(null);

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  }

  return (
    <>
      <section className="relative mb-6">
        <div className="mb-2.5 flex items-center justify-between px-4 sm:px-5">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{title}</h3>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition hover:bg-white/10 hover:text-white/80"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 transition hover:bg-white/10 hover:text-white/80"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto px-4 pb-1 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {movies.map((m) => (
            <Poster key={m.title} movie={m} onClick={playable ? () => setPlaying(m) : undefined} />
          ))}
        </div>
      </section>

      {playing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setPlaying(null)}
          role="dialog"
          aria-modal
          aria-label={`Playing ${playing.title}`}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1f] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black">
              <SiteImage
                src={playing.poster.replace('/w342', '/w780')}
                alt=""
                fill
                className="object-cover opacity-40 blur-sm scale-105"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e50914] text-white shadow-xl">
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </span>
                <p className="text-sm font-medium text-white/70">YouTube embed · demo only</p>
              </div>
              <button
                type="button"
                onClick={() => setPlaying(null)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                aria-label="Close player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-bold text-white">{playing.title}</p>
              <p className="mt-0.5 text-xs text-white/45">
                Verified YouTube match · opens official or licensed upload
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TeluguMoviesDemo() {
  const [view, setView] = useState<View>('browse');
  const [hero, setHero] = useState<string | null>(null);

  const filteredTv = hero
    ? TV_MOVIES.filter((m) => m.hero === hero)
    : TV_MOVIES;

  return (
    <div
      className="telugu-movies-demo my-8 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 [&_img]:![transition:none]"
      style={{ background: '#141414', fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <header
        className="flex items-center gap-2 border-b px-4 py-2.5 sm:px-5"
        style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(20,20,20,0.92)' }}
      >
        <span className="mr-auto text-sm font-black tracking-tight text-[#e5e5e5]">
          Telugu<span className="text-[#e50914]">Movies</span>
        </span>
        <span className="hidden text-[10px] text-white/30 sm:inline">telugumovies.in</span>
        <button type="button" className="flex h-7 w-7 items-center justify-center rounded-md text-white/40" aria-hidden>
          <Search className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setView('tv')}
          className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[10px] font-black uppercase tracking-wider text-white transition hover:opacity-80"
          style={{ background: '#e50914' }}
        >
          <Play className="h-2.5 w-2.5 fill-current" />
          TV
        </button>
      </header>

      <div
        className="flex gap-1 border-b px-4 py-2 sm:px-5"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {(
          [
            ['browse', 'Browse catalog'],
            ['cinemas', 'In cinemas now'],
            ['tv', 'Watch free (500+)'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className="rounded-md px-2.5 py-1 text-[11px] font-semibold transition"
            style={{
              background: view === id ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: view === id ? '#e5e5e5' : 'rgba(229,229,229,0.45)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="flex flex-wrap gap-x-4 gap-y-1 border-b px-4 py-2 text-[10px] font-medium sm:px-5"
        style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(229,229,229,0.35)' }}
      >
        <span>1980 to 2026 catalog</span>
        <span>·</span>
        <span>TMDb metadata</span>
        <span>·</span>
        <span>500+ verified YouTube links</span>
        <span>·</span>
        <span>No files hosted</span>
      </div>

      <div className="py-4">
        {view === 'browse' && (
          <>
            <div className="mb-5 px-4 sm:px-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Browse by star</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setHero(null)}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                  style={{
                    background: !hero ? 'rgba(229,57,20,0.25)' : 'rgba(255,255,255,0.07)',
                    color: !hero ? '#ff6b4a' : 'rgba(229,229,229,0.55)',
                  }}
                >
                  All
                </button>
                {HEROES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHero(h === hero ? null : h)}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-80"
                    style={{
                      background: hero === h ? 'rgba(229,57,20,0.25)' : 'rgba(255,255,255,0.07)',
                      color: hero === h ? '#ff6b4a' : 'rgba(229,229,229,0.55)',
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <MovieRow title="In Cinemas Now" movies={NOW_PLAYING} />
            {YEAR_ROWS.map((row) => (
              <MovieRow key={row.label} title={row.label} movies={row.movies} />
            ))}

            <div className="mt-2 border-t px-4 pt-5 sm:px-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Browse by year</p>
              <div className="flex flex-wrap gap-1.5">
                {OLDER_YEARS.map((y) => (
                  <span
                    key={y}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(229,229,229,0.45)' }}
                  >
                    {y}
                  </span>
                ))}
                <span
                  className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(229,229,229,0.45)' }}
                >
                  …1980
                </span>
              </div>
            </div>
          </>
        )}

        {view === 'cinemas' && (
          <div className="px-4 sm:px-5">
            <p className="mb-4 text-xs leading-relaxed text-white/45">
              Live Tollywood listings from TMDb, filtered to Telugu-original films currently playing in Indian
              cinemas. Refreshes every six hours.
            </p>
            <MovieRow title="In Cinemas Now" movies={NOW_PLAYING} />
          </div>
        )}

        {view === 'tv' && (
          <div className="px-4 sm:px-5">
            <p className="mb-4 text-xs leading-relaxed text-white/45">
              Movies with a verified YouTube match: official uploads, licensed channels, or long-form embeddable
              videos scored by an admin-reviewed matcher. Click a poster to preview the player.
            </p>
            <MovieRow title={`Watch Free · ${filteredTv.length}+ titles`} movies={filteredTv} playable />
          </div>
        )}
      </div>

      <p className="border-t px-4 py-2.5 text-center text-[10px] text-white/25 sm:px-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        Interactive preview · not the live site
      </p>
    </div>
  );
}
