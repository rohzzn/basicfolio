"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSpotifyPreview } from '@/contexts/SpotifyPreviewContext';
import { useDesktopPreviewEnabled } from '@/hooks/use-desktop-preview';
import { decodeSpotifyText } from '@/lib/spotify-text';
import Turntable, { type DeckTrack } from './Turntable';
import Crate, { type CrateItem } from './Crate';
import PictureDiscs from './PictureDiscs';
import './music.css';

// The music page as a corner of a record shop. A turntable up top plays whatever is on the deck:
// what I am listening to, or last listened to, until you pick something yourself. Under it the
// records sit in a crate behind divider cards (recent, top tracks and playlists) to flip through
// with an index card beside it, and the top artists are pressed onto picture discs.

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: SpotifyImage[] };
  duration_ms: number;
  external_urls: { spotify: string };
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  genres: string[];
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[] | null;
  tracks: { total: number };
  external_urls: { spotify: string };
}

interface NowPlaying {
  isPlaying: boolean;
  track: SpotifyTrack;
  progressMs: number;
  at: number; // when the progress was read
}

type Tab = 'recent' | 'tracks' | 'playlists' | 'artists';
type TimeRange = 'short_term' | 'medium_term' | 'long_term';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'recent', label: 'Recent' },
  { id: 'tracks', label: 'Top tracks' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'artists', label: 'Artists' },
];

const RANGES: Array<{ id: TimeRange; label: string; long: string }> = [
  { id: 'short_term', label: '1M', long: 'last month' },
  { id: 'medium_term', label: '6M', long: 'last six months' },
  { id: 'long_term', label: 'All', long: 'all time' },
];

const time = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const artistsOf = (t: SpotifyTrack) => t.artists.map((a) => a.name).join(', ');
const coverOf = (images: SpotifyImage[] | null | undefined) => images?.[0]?.url ?? null;

const deckOf = (t: SpotifyTrack): DeckTrack => ({
  id: t.id,
  name: t.name,
  artists: artistsOf(t),
  album: t.album?.name,
  imageUrl: coverOf(t.album?.images),
  spotifyUrl: t.external_urls.spotify,
  durationMs: t.duration_ms,
});

const trackItem = (t: SpotifyTrack): CrateItem => ({
  id: t.id,
  image: coverOf(t.album?.images),
  title: t.name,
  subtitle: artistsOf(t),
});

// One token for the visit, fetched once and shared.
let tokenPromise: Promise<string | null> | null = null;
function token(): Promise<string | null> {
  tokenPromise ??= fetch('/api/spotify/token')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => (d?.access_token as string) ?? null)
    .catch(() => null);
  return tokenPromise;
}

async function spotify<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  const t = await token();
  if (!t) return null;
  try {
    const q = new URLSearchParams(params).toString();
    const url = endpoint.startsWith('https://') ? endpoint : `https://api.spotify.com/v1${endpoint}${q ? `?${q}` : ''}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${t}` } });
    if (!r.ok) return null;
    const text = await r.text();
    return text.trim() ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

function IndexCard({
  rows,
  at,
  onPick,
  height,
  header,
}: {
  rows: Array<{ id: string; title: string; subtitle: string; aside?: string }>;
  at: number | null;
  onPick: (i: number) => void;
  height: string;
  header?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // keep the current row in view inside the card, without scrolling the page
  useEffect(() => {
    const card = ref.current;
    if (!card || at === null) return;
    const row = card.querySelector<HTMLElement>(`[data-row="${at}"]`);
    if (!row) return;
    const top = row.offsetTop;
    if (top < card.scrollTop + 36) card.scrollTop = Math.max(0, top - 72);
    else if (top + row.offsetHeight > card.scrollTop + card.clientHeight - 36) card.scrollTop = top - card.clientHeight + 108;
  }, [at]);

  return (
    <div ref={ref} className="index-card min-w-0" style={{ maxHeight: height }}>
      {header}
      {rows.map((r, i) => (
        <button
          key={`${r.id}-${i}`}
          type="button"
          data-row={i}
          className="index-row"
          aria-current={i === at ? 'true' : undefined}
          onClick={() => onPick(i)}
        >
          <span className="music-hand text-center text-sm">{i + 1}</span>
          <span className="min-w-0 truncate text-sm">
            <span className={i === at ? 'font-medium' : ''}>{r.title}</span>
            <span className="text-xs opacity-70"> · {r.subtitle}</span>
          </span>
          {r.aside ? <span className="text-[11px] tabular-nums opacity-70">{r.aside}</span> : <span />}
        </button>
      ))}
    </div>
  );
}

export default function MusicPage() {
  const preview = useSpotifyPreview();
  const desktop = useDesktopPreviewEnabled();

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState<NowPlaying | null>(null);
  const [recent, setRecent] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [range, setRange] = useState<TimeRange>('medium_term');
  const [rangeLoading, setRangeLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('recent');
  const [atByTab, setAtByTab] = useState<Record<Tab, number>>({ recent: 0, tracks: 0, playlists: 0, artists: 0 });
  const [chosen, setChosen] = useState<DeckTrack | null>(null);
  const [listTracks, setListTracks] = useState<Record<string, SpotifyTrack[] | 'loading' | 'failed'>>({});
  const [clock, setClock] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      const [r, tt, ta, pl, cp] = await Promise.all([
        spotify<{ items: Array<{ track: SpotifyTrack }> }>('/me/player/recently-played', { limit: '50' }),
        spotify<{ items: SpotifyTrack[] }>('/me/top/tracks', { limit: '50', time_range: 'medium_term' }),
        spotify<{ items: SpotifyArtist[] }>('/me/top/artists', { limit: '50', time_range: 'medium_term' }),
        spotify<{ items: SpotifyPlaylist[] }>('/me/playlists', { limit: '20' }),
        spotify<{ is_playing: boolean; item: SpotifyTrack | null; progress_ms: number }>('/me/player/currently-playing'),
      ]);
      if (!live) return;
      // the same song played twice in a row is one record in the crate
      const seen = new Set<string>();
      const dedup = (r?.items ?? []).map((x) => x.track).filter((t) => t?.id && !seen.has(t.id) && seen.add(t.id));
      setRecent(dedup);
      setTopTracks(tt?.items ?? []);
      setTopArtists(ta?.items ?? []);
      setPlaylists((pl?.items ?? []).filter(Boolean));
      if (cp?.item) setNow({ isPlaying: cp.is_playing, track: cp.item, progressMs: cp.progress_ms, at: Date.now() });
      else if (dedup[0]) setNow({ isPlaying: false, track: dedup[0], progressMs: 0, at: Date.now() });
      setFailed(!r && !tt && !ta && !pl && !cp);
      setLoading(false);
    })();
    return () => {
      live = false;
    };
  }, []);

  const changeRange = async (next: TimeRange) => {
    setRange(next);
    setRangeLoading(true);
    const [tt, ta] = await Promise.all([
      spotify<{ items: SpotifyTrack[] }>('/me/top/tracks', { limit: '50', time_range: next }),
      spotify<{ items: SpotifyArtist[] }>('/me/top/artists', { limit: '50', time_range: next }),
    ]);
    if (tt) setTopTracks(tt.items);
    if (ta) setTopArtists(ta.items);
    setAtByTab((a) => ({ ...a, tracks: 0 }));
    setRangeLoading(false);
  };

  const at = atByTab[tab];
  const setAt = useCallback((i: number) => setAtByTab((a) => (a[tab] === i ? a : { ...a, [tab]: i })), [tab]);

  // ── the deck ──
  const live = !preview.currentTrack && !chosen && now;
  const deck: DeckTrack | null = preview.currentTrack
    ? chosen?.id === preview.currentTrack.id
      ? chosen
      : { ...preview.currentTrack, imageUrl: preview.currentTrack.imageUrl ?? null }
    : chosen ?? (now ? deckOf(now.track) : null);
  const spinning = preview.currentTrack ? preview.isPlaying : !chosen && !!now?.isPlaying;
  const status = preview.currentTrack
    ? preview.isPlaying
      ? 'Playing a preview'
      : 'Paused'
    : chosen
      ? 'On the deck'
      : now?.isPlaying
        ? 'Now playing'
        : 'Last played';

  // while I am listening, the progress keeps moving between reads
  useEffect(() => {
    if (!live || !now?.isPlaying) return;
    const t = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [live, now?.isPlaying]);

  let progressMs: number | null = null;
  let durationMs: number | null = null;
  if (preview.currentTrack) {
    progressMs = preview.progressMs;
    durationMs = preview.durationMs;
  } else if (live && now) {
    durationMs = now.track.duration_ms;
    progressMs = now.isPlaying ? Math.min(durationMs, now.progressMs + Math.max(0, clock - now.at)) : now.progressMs;
    if (!now.isPlaying && !now.progressMs) progressMs = null;
  }

  const putOn = useCallback(
    (t: SpotifyTrack) => {
      const d = deckOf(t);
      setChosen(d);
      if (desktop) {
        void preview.toggleTrack(t.id, {
          id: d.id,
          name: d.name,
          artists: d.artists,
          imageUrl: d.imageUrl ?? '',
          spotifyUrl: d.spotifyUrl,
          durationMs: d.durationMs,
        });
      }
    },
    [desktop, preview]
  );

  const toggleDeck = () => {
    if (!deck || !desktop) return;
    void preview.toggleTrack(deck.id, {
      id: deck.id,
      name: deck.name,
      artists: deck.artists,
      imageUrl: deck.imageUrl ?? '',
      spotifyUrl: deck.spotifyUrl,
      durationMs: deck.durationMs,
    });
  };

  // ── the playlist at the front of the crate has its tracks read out on the card ──
  const frontList = tab === 'playlists' ? playlists[at] : undefined;
  useEffect(() => {
    if (!frontList || listTracks[frontList.id]) return;
    const id = frontList.id;
    // wait until the flipping stops before fetching
    const t = window.setTimeout(async () => {
      setListTracks((m) => ({ ...m, [id]: 'loading' }));
      const all: SpotifyTrack[] = [];
      let next: string | null = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`;
      let ok = true;
      while (next) {
        const page: { items: Array<{ track: SpotifyTrack | null }>; next: string | null } | null = await spotify(next);
        if (!page) {
          ok = false;
          break;
        }
        for (const it of page.items) if (it.track?.id) all.push(it.track);
        next = page.next;
      }
      setListTracks((m) => ({ ...m, [id]: ok ? all : 'failed' }));
    }, 350);
    return () => window.clearTimeout(t);
  }, [frontList, listTracks]);

  const crateTracks = tab === 'recent' ? recent : topTracks;
  const items: CrateItem[] = useMemo(
    () =>
      tab === 'playlists'
        ? playlists.map((p) => ({ id: p.id, image: coverOf(p.images), title: p.name, subtitle: `${p.tracks?.total ?? 0} tracks` }))
        : crateTracks.map(trackItem),
    [tab, playlists, crateTracks]
  );

  const rangeLong = RANGES.find((r) => r.id === range)?.long ?? '';
  const crateLabel = tab === 'recent' ? 'Recent' : tab === 'tracks' ? `Top ${topTracks.length}` : 'Playlists';
  const cardHeight = 'calc(var(--s, 236px) + 8 * 13px + 30px + 42px)';

  let card: React.ReactNode = null;
  if (tab === 'playlists' && frontList) {
    const tracks = listTracks[frontList.id];
    const description = decodeSpotifyText(frontList.description);
    card = (
      <IndexCard
        height={cardHeight}
        at={null}
        header={
          <div className="border-b-[1.5px] border-[color:var(--mu-ink)] bg-[color:var(--mu-paper)] px-4 py-3">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-paper">{frontList.name}</p>
            <p className="text-xs text-zinc-500 dark:text-neutral-400">
              {frontList.tracks?.total ?? 0} tracks{desktop ? ' · click one to play it' : ''}
            </p>
            {description ? <p className="mt-1 line-clamp-2 text-xs text-zinc-400 dark:text-neutral-400">{description}</p> : null}
          </div>
        }
        rows={
          Array.isArray(tracks)
            ? tracks.map((t) => ({ id: t.id, title: t.name, subtitle: artistsOf(t), aside: time(t.duration_ms) }))
            : []
        }
        onPick={(i) => {
          const list = listTracks[frontList.id];
          if (Array.isArray(list) && list[i]) putOn(list[i]);
        }}
      />
    );
    if (!Array.isArray(tracks)) {
      card = (
        <div className="index-card min-w-0 p-4 text-sm text-zinc-500 dark:text-neutral-400" style={{ maxHeight: cardHeight }}>
          <p className="font-medium text-zinc-900 dark:text-paper">{frontList.name}</p>
          <p className="mt-2">{tracks === 'failed' ? 'Could not read this one’s tracklist.' : 'Reading the tracklist…'}</p>
        </div>
      );
    }
  } else if (tab === 'recent' || tab === 'tracks') {
    card = (
      <IndexCard
        height={cardHeight}
        at={at}
        onPick={setAt}
        rows={crateTracks.map((t) => ({ id: t.id, title: t.name, subtitle: artistsOf(t), aside: time(t.duration_ms) }))}
      />
    );
  }

  return (
    <div className="music w-full min-w-0 max-w-5xl">
      <h2 className="mb-8 text-lg font-medium dark:text-paper">Music</h2>

      {failed ? (
        <div className="space-y-3 py-8">
          <p className="text-sm text-zinc-500 dark:text-neutral-400">Spotify isn&apos;t answering right now.</p>
          <a
            href="https://open.spotify.com/user/rohansanjeev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-700 transition-colors hover:text-zinc-900 dark:text-neutral-300 dark:hover:text-paper"
          >
            Open my Spotify profile ↗
          </a>
        </div>
      ) : (
        <>
          <Turntable
            track={deck}
            spinning={spinning}
            playing={!!preview.currentTrack && preview.isPlaying}
            status={loading ? 'Warming up…' : status}
            progressMs={progressMs}
            durationMs={durationMs}
            canPlay={desktop && !!deck}
            onToggle={toggleDeck}
          />

          <div className="mt-12 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="dividers flex-1" role="tablist" aria-label="Music">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className="divider music-hand"
                >
                  {t.label}
                </button>
              ))}
            </div>
            {tab === 'tracks' || tab === 'artists' ? (
              <div className="flex gap-3 pb-1.5" aria-label="Time range">
                {RANGES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => void changeRange(r.id)}
                    className={`text-xs transition-colors ${
                      range === r.id
                        ? 'font-medium text-zinc-900 dark:text-paper'
                        : 'text-zinc-400 hover:text-zinc-600 dark:text-neutral-400 dark:hover:text-neutral-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className={`mt-8 transition-opacity ${rangeLoading ? 'opacity-50' : ''}`}>
            {loading ? (
              <p className="py-10 text-sm text-zinc-500 dark:text-neutral-400">Pulling the records out…</p>
            ) : tab === 'artists' ? (
              topArtists.length ? (
                <>
                  <p className="music-hand mb-6 text-base text-[color:var(--mu-muted)]">Most played, {rangeLong}</p>
                  <PictureDiscs
                    discs={topArtists.map((a) => ({
                      id: a.id,
                      name: a.name,
                      image: coverOf(a.images),
                      genres: a.genres ?? [],
                      href: a.external_urls.spotify,
                    }))}
                  />
                </>
              ) : (
                <p className="py-6 text-sm text-zinc-500 dark:text-neutral-400">No artists to show right now.</p>
              )
            ) : items.length ? (
              <div className="grid items-start gap-8 sm:grid-cols-[auto_minmax(0,1fr)]">
                <Crate
                  items={items}
                  at={Math.min(at, items.length - 1)}
                  onAt={setAt}
                  onOpen={(i) => {
                    if (tab === 'playlists') {
                      const p = playlists[i];
                      if (p) window.open(p.external_urls.spotify, '_blank', 'noopener,noreferrer');
                      return;
                    }
                    const t = crateTracks[i];
                    if (t) putOn(t);
                  }}
                  label={crateLabel}
                  deckId={deck?.id ?? null}
                  openLabel={tab === 'playlists' ? 'Open in Spotify' : 'Put it on the deck'}
                />
                {card}
              </div>
            ) : (
              <p className="py-6 text-sm text-zinc-500 dark:text-neutral-400">Nothing in this crate right now.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
