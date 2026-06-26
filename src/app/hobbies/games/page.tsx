'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Profile from './Profile';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cs2Items, valorantItems, type CS2Item, type ValorantItem } from '@/data/inventory';

// ── Inventory section ─────────────────────────────────────────────────────────

const RARITY_ORDER: Record<string, number> = {
  Extraordinary: 0, Covert: 1, Classified: 2, Restricted: 3,
  'Mil-Spec': 4, Industrial: 5, Consumer: 6, Superior: 2,
};

function InventoryCard({ item }: { item: CS2Item }) {
  if (!item.image) return null;
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-default group">
      <div className="relative w-full aspect-[4/3]">
        {item.condition && (
          <div className="absolute top-1.5 right-1.5 z-10 text-[9px] tabular-nums px-1 py-0.5 rounded font-medium text-zinc-400 dark:text-zinc-500">
            {item.condition}
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={`${item.name} | ${item.skin}`}
          className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      <div className="h-[2px] w-full" style={{ background: item.rarityColor }} />
      <div className="px-2 py-1.5">
        <p className="text-[10px] font-medium leading-tight line-clamp-1" style={{ color: item.rarityColor }}>
          {item.skin}
        </p>
        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
          {item.name}
        </p>
      </div>
    </div>
  );
}

function ValorantInventoryCard({ item }: { item: ValorantItem }) {
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 cursor-default group">
      <div className="relative w-full aspect-[4/3]">
        {item.isAlt && (
          <div className="absolute top-1.5 right-1.5 z-10 text-[9px] tabular-nums px-1 py-0.5 rounded font-medium text-zinc-400 dark:text-zinc-600">
            ✦
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={`${item.name} ${item.weapon}`}
          className="absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      <div className="h-[2px] w-full" style={{ background: item.tierColor }} />
      <div className="px-2 py-1.5">
        <p className="text-[10px] font-medium leading-tight line-clamp-1" style={{ color: item.tierColor }}>
          {item.name}
        </p>
        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
          {item.weapon}
        </p>
      </div>
    </div>
  );
}

function InventoryRow() {
  const [game, setGame] = useState<'cs2' | 'valorant'>('cs2');
  const sortedCS2 = [...cs2Items]
    .filter(i => i.image)
    .sort((a, b) => (RARITY_ORDER[a.rarityName] ?? 9) - (RARITY_ORDER[b.rarityName] ?? 9));

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Inventory</h3>
        <div className="flex gap-3">
          {(['cs2', 'valorant'] as const).map(g => (
            <button key={g} onClick={() => setGame(g)}
              className={`text-xs uppercase tracking-wide transition-colors ${game === g
                ? 'text-zinc-900 dark:text-white font-medium'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
              {g === 'cs2' ? 'CS2' : 'Valorant'}
            </button>
          ))}
        </div>
      </div>
      {game === 'cs2' ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {sortedCS2.map(item => <InventoryCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {valorantItems.map(item => <ValorantInventoryCard key={item.id} item={item} />)}
        </div>
      )}
    </section>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface SteamProfile {
  personaname: string;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
}

interface SteamGame {
  appid: number;
  name: string;
  playtime_2weeks?: number;
  playtime_forever: number;
  img_icon_url: string;
}

interface UnifiedClip {
  id: string;
  title: string;
  thumbnail: string;
  clipUrl: string;
  videoUrl: string;
  embedUrl: string;
  duration: number;
  source: 'medal' | 'allstar';
  createdTimestamp: number;
}

interface MedalClip {
  contentId: string;
  contentTitle: string;
  contentViews: number;
  contentThumbnail: string;
  embedIframeUrl: string;
  createdTimestamp: number;
  directClipUrl: string;
  videoLengthSeconds: number;
}

interface AllstarClipRaw {
  id: string;
  title: string;
  thumbnail: string;
  clipUrl: string;
  videoUrl?: string;
  createdTimestamp: number;
  views: number;
  duration: number;
  source: 'allstar';
}

// ── Manual games (non-Steam, shown alongside Steam library) ───────────────────

interface ManualGame {
  id: string;
  name: string;
  playtime_forever: number; // minutes
  logoUrl: string;
  storeUrl: string;
}

const MANUAL_GAMES: ManualGame[] = [
  {
    id: 'valorant',
    name: 'Valorant',
    playtime_forever: 2430 * 60,
    logoUrl: '/images/games/valorantlogo.png',
    storeUrl: 'https://playvalorant.com',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    playtime_forever: 1839 * 60,
    logoUrl: '/images/games/fortnitelogo.png',
    storeUrl: 'https://www.epicgames.com/fortnite',
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    playtime_forever: 439 * 60,
    logoUrl: '/images/games/minecraftlogo.png',
    storeUrl: 'https://www.minecraft.net',
  },
];

// ── Static data ────────────────────────────────────────────────────────────────

const achievements = [
  { tournament: 'Comic Con x The Arena', year: '2024', result: '3rd' },
  { tournament: 'Trinity Gaming TAGVALO', year: '2020', result: '1st' },
  { tournament: 'ACT X CSGO 1v1', year: '2020', result: '1st' },
  { tournament: 'AMD Gameon - Fortnite', year: '2019', result: '3rd' },
  { tournament: 'AMD Gameon - PUBG', year: '2019', result: '3rd' },
  { tournament: 'AMD Gameon x Playmax', year: '2019', result: '2nd' },
  { tournament: 'Comic-Con Hyderabad', year: '2018', result: '2nd' },
  { tournament: "Gamer's Connect Hyd", year: '2017', result: '3rd' },
  { tournament: 'AMD Gameon Hyderabad', year: '2017', result: '3rd' },
];

// ── Clip helpers ───────────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: '2k', label: '2K' },
  { id: '3k', label: '3K' },
  { id: '4k', label: '4K' },
  { id: '5k', label: 'Ace' },
];

function matchesFilter(clip: UnifiedClip, id: string): boolean {
  if (id === 'all') return true;
  const t = clip.title.toLowerCase();
  switch (id) {
    case '2k': return t.includes('2k') || /\b2 kill/.test(t);
    case '3k': return t.includes('3k') || /\b3 kill/.test(t) || t.includes('triple');
    case '4k': return t.includes('4k') || /\b4 kill/.test(t) || t.includes('quad');
    case '5k': return t.includes('5k') || /\b5 kill/.test(t) || t.includes('penta') || t.includes('ace');
    default: return true;
  }
}

function fmtDur(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

function medalToUnified(clip: MedalClip): UnifiedClip {
  return {
    id: clip.contentId,
    title: clip.contentTitle,
    thumbnail: clip.contentThumbnail,
    clipUrl: clip.directClipUrl || clip.embedIframeUrl,
    videoUrl: clip.directClipUrl || '',
    embedUrl: clip.embedIframeUrl || '',
    duration: clip.videoLengthSeconds,
    source: 'medal',
    createdTimestamp: clip.createdTimestamp,
  };
}

function allstarToUnified(clip: AllstarClipRaw): UnifiedClip {
  return {
    id: clip.id,
    title: clip.title,
    thumbnail: clip.thumbnail,
    clipUrl: clip.clipUrl,
    videoUrl: clip.videoUrl || '',
    embedUrl: '',
    duration: clip.duration,
    source: 'allstar',
    createdTimestamp: clip.createdTimestamp,
  };
}

// ── Game list item ─────────────────────────────────────────────────────────────

function GameRow({ name, iconSrc, href, label }: { name: string; iconSrc: string; href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group"
    >
      <div className="w-5 h-5 flex-shrink-0 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-700/50 flex items-center justify-center">
        <Image
          src={iconSrc}
          alt={name}
          width={20}
          height={20}
          unoptimized
          className="w-full h-full object-contain"
        />
      </div>
      <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors line-clamp-1 flex-1 min-w-0">
        {name}
      </span>
      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex-shrink-0 tabular-nums">
        {label}
      </span>
    </a>
  );
}

// ── Clip modal ─────────────────────────────────────────────────────────────────

function ClipModal({ clip, onClose }: { clip: UnifiedClip; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const canPlayInline =
    (clip.source === 'medal' && !!clip.embedUrl) ||
    (clip.source === 'allstar' && !!clip.videoUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-9 right-0 text-white/60 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
        >
          <X className="w-4 h-4" /> close
        </button>

        <div className="aspect-video rounded-xl overflow-hidden bg-zinc-950">
          {clip.source === 'medal' && clip.embedUrl ? (
            <iframe
              src={clip.embedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen"
              title={clip.title}
            />
          ) : clip.source === 'allstar' && clip.videoUrl ? (
            <video
              src={clip.videoUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-white/50 text-sm">Playback unavailable here</p>
              <a
                href={clip.clipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-white underline"
              >
                Open on {clip.source === 'allstar' ? 'Allstar' : 'Medal'} ↗
              </a>
            </div>
          )}
        </div>

        {!canPlayInline && null}

        <div className="mt-2.5 flex items-center justify-between">
          <p className="text-sm text-white/70 line-clamp-1">{clip.title}</p>
          <a
            href={clip.clipUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 transition-colors flex-shrink-0 ml-3"
          >
            {clip.source === 'allstar' ? 'allstar ↗' : 'medal ↗'}
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Games() {
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [ownedGames, setOwnedGames] = useState<SteamGame[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  const [clips, setClips] = useState<UnifiedClip[]>([]);
  const [clipsLoading, setClipsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeClip, setActiveClip] = useState<UnifiedClip | null>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | null>(null);

  // Fetch Steam
  useEffect(() => {
    Promise.all([
      fetch('/api/steam/profile').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/steam/games').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([pd, gd]) => {
      if (pd?.response?.players?.[0]) setProfile(pd.response.players[0]);
      if (gd?.response?.games) setOwnedGames(gd.response.games);
    }).finally(() => setGamesLoading(false));
  }, []);

  // Fetch clips
  useEffect(() => {
    Promise.all([
      fetch('/api/medal').then(r => r.json()).catch(() => ({ clips: [] })),
      fetch('/api/allstar').then(r => r.json()).catch(() => ({ clips: [] })),
    ]).then(([md, ad]) => {
      const medal = (md.clips ?? []).map(medalToUnified);
      const allstar = (ad.clips ?? []).map(allstarToUnified);
      const merged = [...medal, ...allstar].sort((a, b) => b.createdTimestamp - a.createdTimestamp);
      setClips(merged);
    }).finally(() => setClipsLoading(false));
  }, []);

  const byRecent = [...ownedGames]
    .sort((a, b) => {
      if (a.playtime_2weeks && b.playtime_2weeks) return b.playtime_2weeks - a.playtime_2weeks;
      if (a.playtime_2weeks) return -1;
      if (b.playtime_2weeks) return 1;
      return 0;
    })
    .filter(g => g.playtime_2weeks && g.playtime_2weeks > 0)
    .slice(0, 3);

  // Merge Steam games with manual games, sort by total playtime, show all
  type AnyGame =
    | { kind: 'steam'; game: SteamGame }
    | { kind: 'manual'; game: ManualGame };

  const allGamesMerged: AnyGame[] = [
    ...ownedGames.map(g => ({ kind: 'steam' as const, game: g })),
    ...MANUAL_GAMES.map(g => ({ kind: 'manual' as const, game: g })),
  ]
    .filter(entry => entry.game.playtime_forever >= 120) // at least 2 hours
    .sort((a, b) => b.game.playtime_forever - a.game.playtime_forever);

  const filteredClips = clips.filter(c => matchesFilter(c, activeFilter));

  const openClip = useCallback((clip: UnifiedClip) => setActiveClip(clip), []);
  const closeClip = useCallback(() => setActiveClip(null), []);

  // Keep clips column height synced to left column
  useEffect(() => {
    const el = leftColRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLeftHeight(el.offsetHeight));
    ro.observe(el);
    setLeftHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [gamesLoading]);

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Gaming</h2>

      {/* Steam Profile */}
      {!gamesLoading && profile && (
        <section className="mb-6">
          <Profile profile={profile} />
        </section>
      )}

      {/* Inventory row */}
      <InventoryRow />

      {/* 50/50 split: Left = games + tournaments, Right = clips */}
      <div className="grid grid-cols-2 gap-10 items-start">

        {/* ── LEFT ── */}
        <div ref={leftColRef} className="space-y-8 min-w-0">

          {/* Recently played */}
          {(gamesLoading || byRecent.length > 0) && (
            <div>
              <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Recently Played
              </h3>
              {gamesLoading ? (
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {byRecent.map(g => (
                    <GameRow
                      key={g.appid}
                      name={g.name}
                      iconSrc={`https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`}
                      href={`https://store.steampowered.com/app/${g.appid}`}
                      label={`${Math.floor((g.playtime_2weeks ?? 0) / 60)}h recently`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Top games — all Steam + manual merged */}
          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Top Games
            </h3>
            {gamesLoading ? (
              <div className="space-y-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {allGamesMerged.map(entry =>
                  entry.kind === 'steam' ? (
                    <GameRow
                      key={`steam-${entry.game.appid}`}
                      name={entry.game.name}
                      iconSrc={`https://media.steampowered.com/steamcommunity/public/images/apps/${entry.game.appid}/${entry.game.img_icon_url}.jpg`}
                      href={`https://store.steampowered.com/app/${entry.game.appid}`}
                      label={`${Math.floor(entry.game.playtime_forever / 60)}h`}
                    />
                  ) : (
                    <GameRow
                      key={`manual-${entry.game.id}`}
                      name={entry.game.name}
                      iconSrc={entry.game.logoUrl}
                      href={entry.game.storeUrl}
                      label={`${Math.floor(entry.game.playtime_forever / 60)}h`}
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* Tournaments */}
          <div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Tournaments
            </h3>
            <div>
              {achievements.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
                >
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 mr-2">{a.tournament}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{a.year}</span>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{a.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: clips ── */}
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium dark:text-white">Clips</h3>
            <div className="flex gap-3">
              {FILTERS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`text-xs transition-colors ${
                    activeFilter === id
                      ? 'text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {clipsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-2" />
                  <div className="w-3/4 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          ) : filteredClips.length === 0 ? (
            <div className="py-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No clips matching this filter.</p>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors mt-1"
                >
                  Show all
                </button>
              )}
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-3 content-start scrollbar-hide"
              style={
                activeFilter === 'all' && leftHeight
                  ? { maxHeight: leftHeight, overflowY: 'auto' }
                  : undefined
              }
            >
              {filteredClips.map(clip => (
                <div
                  key={`${clip.source}-${clip.id}`}
                  onClick={() => openClip(clip)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-1.5">
                    {clip.thumbnail ? (
                      <Image
                        src={clip.thumbnail}
                        alt={clip.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-zinc-300 dark:bg-zinc-700" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                        <span className="text-zinc-900 text-xs ml-0.5">▶</span>
                      </div>
                    </div>
                    {clip.duration > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[10px] px-1 py-0.5 rounded tabular-nums">
                        {fmtDur(clip.duration)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors line-clamp-1">
                    {clip.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {activeClip && <ClipModal clip={activeClip} onClose={closeClip} />}
    </div>
  );
}
