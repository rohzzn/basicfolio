"use client";
import React, { useState, useEffect } from 'react';

// ── Page-load resources ──────────────────────────────────────────────────────

interface Resource {
  name: string;
  type: 'document' | 'css' | 'font' | 'script' | 'api';
  size: number;
  start: number;
  duration: number;
  url: string;
  note: string;
}

const TOTAL_MS = 750;

const RESOURCES: Resource[] = [
  {
    name: 'HTML document',
    type: 'document',
    size: 7.4,
    start: 0,
    duration: 78,
    url: 'rohan.run/',
    note: 'Server-rendered by Next.js. The browser gets a fully-formed HTML document with readable content before any JavaScript executes. This is why server rendering matters.',
  },
  {
    name: 'app/layout.css',
    type: 'css',
    size: 3.2,
    start: 78,
    duration: 12,
    url: '_next/static/css/app/layout.css',
    note: 'Tailwind output. Only the utility classes actually referenced in the build are included — no unused styles, no global cascade drift. This file has barely grown despite adding dozens of pages.',
  },
  {
    name: 'Satoshi (variable)',
    type: 'font',
    size: 34.8,
    start: 90,
    duration: 195,
    url: 'api.fontshare.com/v2/css?f[]=at.cb.satoshi@700,500…',
    note: 'Variable-weight woff2 loaded from Fontshare CDN. One file covers every weight used on the site. The cross-origin DNS lookup is the price for not self-hosting it — something I should fix.',
  },
  {
    name: 'webpack runtime',
    type: 'script',
    size: 1.8,
    start: 78,
    duration: 8,
    url: '_next/static/chunks/webpack-*.js',
    note: 'The Next.js module loader. Tiny but blocks execution of the larger chunks.',
  },
  {
    name: 'framework chunk',
    type: 'script',
    size: 45.5,
    start: 86,
    duration: 98,
    url: '_next/static/chunks/1255-*.js',
    note: 'React, React DOM, and the Next.js client runtime. Cached after first visit — returning visitors load this from disk in milliseconds.',
  },
  {
    name: 'vendor chunk',
    type: 'script',
    size: 54.2,
    start: 86,
    duration: 115,
    url: '_next/static/chunks/4bd1b696-*.js',
    note: 'Third-party libraries shared across all pages: react-github-calendar, lucide-react, and others. The largest single file in the bundle — auditing it with a bundle analyzer would probably surface something worth lazy-loading.',
  },
  {
    name: 'page bundle',
    type: 'script',
    size: 2.3,
    start: 86,
    duration: 11,
    url: '_next/static/chunks/app/page.js',
    note: 'The home page component itself. Small because most of the logic lives in the shared chunks above.',
  },
  {
    name: 'GitHub contributions',
    type: 'api',
    size: 41.2,
    start: 285,
    duration: 310,
    url: 'github-contributions-api.jogruber.de/v4/rohzzn',
    note: 'Called client-side by react-github-calendar after hydration. Returns JSON of all contribution activity for the past year. The last thing to arrive — and the most fragile point in the whole load. If this API goes down, the calendar disappears.',
  },
];

// ── API inventory ────────────────────────────────────────────────────────────

type Category = 'gaming' | 'activity' | 'entertainment' | 'social' | 'infra';

interface ApiEntry {
  service: string;
  category: Category;
  internalRoute: string;
  upstream: string;
  usedOn: string;
  cache: string;
  note: string;
}

const APIS: ApiEntry[] = [
  {
    service: 'Steam',
    category: 'gaming',
    internalRoute: '/api/steam/profile · /api/steam/games',
    upstream: 'api.steampowered.com',
    usedOn: 'Games',
    cache: 'live',
    note: 'Two routes: profile summary (player name, avatar, status) and game library with playtime. The games endpoint fetches owned games and recent playtime separately then merges them — Steam requires two API calls to get both.',
  },
  {
    service: 'Valorant via HenrikDev',
    category: 'gaming',
    internalRoute: '/api/valorant/mmr',
    upstream: 'api.henrikdev.xyz/valorant/v3/mmr',
    usedOn: 'Games',
    cache: '1 hour',
    note: 'Unofficial Valorant API by HenrikDev — Riot does not offer a public ranked API. Returns current MMR, rank tier, and recent rank history. Cached for an hour since my rank typically does not move during a single session.',
  },
  {
    service: 'Leetify',
    category: 'gaming',
    internalRoute: '/api/leetify/profile · /matches · /match-details',
    upstream: 'api-public.cs-prod.leetify.com/v3',
    usedOn: 'Games',
    cache: 'live',
    note: 'CS2 analytics platform. Three proxied routes: overall profile stats and skill ratings, match history list, and per-match detail breakdowns. All require a Bearer token that lives only on the server.',
  },
  {
    service: 'Medal.tv',
    category: 'gaming',
    internalRoute: '/api/medal',
    upstream: 'developers.medal.tv/v1',
    usedOn: 'Gaming Clips',
    cache: 'live',
    note: 'Calls three Medal endpoints in parallel (latest by user ID, search by username, search by tag) to maximize coverage, then deduplicates by contentId and sorts by timestamp. Medal\'s API is inconsistent about which endpoint returns what.',
  },
  {
    service: 'Hevy',
    category: 'activity',
    internalRoute: '/api/hevy/workouts',
    upstream: 'api.hevyapp.com/v1/workouts',
    usedOn: 'Activities',
    cache: 'live',
    note: 'Workout log from Hevy, the app I use to track gym sessions. Returns paginated workout history with exercises, sets, reps, and weights per entry.',
  },
  {
    service: 'TMDB',
    category: 'entertainment',
    internalRoute: '/api/tmdb/ratings · /api/letterboxd',
    upstream: 'api.themoviedb.org/3/account',
    usedOn: 'Watchlist',
    cache: 'live',
    note: 'My rated movies and TV shows from The Movie Database. Uses an OAuth session — I connect my TMDB account and the site reads my personal ratings. /api/letterboxd is an alias for the same route, kept for backward compatibility.',
  },
  {
    service: 'MyAnimeList',
    category: 'entertainment',
    internalRoute: '/api/myanimelist',
    upstream: 'api.myanimelist.net/v2/users/rohzzn/animelist',
    usedOn: 'Anime',
    cache: 'live',
    note: 'Full anime list with watch status, personal scores, and genre tags. Handles pagination by recursively fetching the next page until there is none — MAL limits to 100 entries per request.',
  },
  {
    service: 'YouTube Data API',
    category: 'entertainment',
    internalRoute: '/api/youtube',
    upstream: 'www.googleapis.com/youtube/v3',
    usedOn: 'Content',
    cache: 'live',
    note: 'Three chained API calls: channel info to get the uploads playlist ID, then playlist items to get video metadata, then video statistics for view/like counts. Also separates live stream recordings from regular uploads.',
  },
  {
    service: 'LeetCode',
    category: 'social',
    internalRoute: '/api/leetcode',
    upstream: 'leetcode-stats-api.herokuapp.com/rohzzn',
    usedOn: 'Games',
    cache: '1 hour',
    note: 'Unofficial LeetCode stats via a third-party scraping API. Returns solved problem counts by difficulty. LeetCode does not offer an official public API for personal stats, so this is the best available option.',
  },
  {
    service: 'GitHub Issues',
    category: 'social',
    internalRoute: '/api/guestbook',
    upstream: 'api.github.com/repos/rohzzn/basicfolio/issues/2',
    usedOn: 'Guestbook',
    cache: '10 seconds',
    note: 'Guestbook entries are stored as comments on a GitHub issue in this repo. GET fetches and paginates comments. POST runs server-side rate limiting, content moderation, and name extraction before writing to GitHub.',
  },
  {
    service: 'GitHub Contributions',
    category: 'social',
    internalRoute: '(client-side, no proxy)',
    upstream: 'github-contributions-api.jogruber.de/v4/rohzzn',
    usedOn: 'Home',
    cache: 'browser',
    note: 'The only external API called directly from the browser rather than a server proxy. Used by react-github-calendar. It is the last and largest item in the waterfall — and the one most likely to cause issues if the upstream goes down.',
  },
  {
    service: 'Upstash Redis',
    category: 'infra',
    internalRoute: '/api/playground/likes',
    upstream: 'upstash.io (serverless KV)',
    usedOn: 'Art',
    cache: 'real-time KV',
    note: 'Photo like counts stored in Upstash Redis via their HTTP API. Persists across sessions without a full database. Currently the only server-side persistent state on the site.',
  },
  {
    service: 'Fontshare CDN',
    category: 'infra',
    internalRoute: '(direct, no proxy)',
    upstream: 'api.fontshare.com',
    usedOn: 'All pages',
    cache: 'browser cache',
    note: 'Satoshi loaded directly from Fontshare on every page. The third-party DNS lookup adds latency on first load. The fix is to self-host via next/font/local — it is a one-hour job I have been putting off.',
  },
];

// ── Style maps ───────────────────────────────────────────────────────────────

const R_COLORS: Record<Resource['type'], { bar: string; dot: string; badge: string }> = {
  document: { bar: 'bg-blue-400 dark:bg-blue-500',   dot: 'bg-blue-400',   badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
  css:      { bar: 'bg-violet-400 dark:bg-violet-500',dot: 'bg-violet-400', badge: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' },
  font:     { bar: 'bg-amber-400 dark:bg-amber-500',  dot: 'bg-amber-400',  badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
  script:   { bar: 'bg-yellow-400 dark:bg-yellow-500',dot: 'bg-yellow-400', badge: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-600' },
  api:      { bar: 'bg-green-400 dark:bg-green-500',  dot: 'bg-green-400',  badge: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
};

const C_COLORS: Record<Category, { dot: string; badge: string }> = {
  gaming:        { dot: 'bg-violet-400',  badge: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' },
  activity:      { dot: 'bg-green-400',   badge: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
  entertainment: { dot: 'bg-amber-400',   badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
  social:        { dot: 'bg-blue-400',    badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
  infra:         { dot: 'bg-zinc-400',    badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
};

type Tab = 'waterfall' | 'apis';
type CatFilter = 'all' | Category;

// ── Component ────────────────────────────────────────────────────────────────

export default function NetworkWaterfall() {
  const [tab, setTab]                     = useState<Tab>('waterfall');
  const [animated, setAnimated]           = useState(false);
  const [activeRes, setActiveRes]         = useState<string | null>(null);
  const [activeApi, setActiveApi]         = useState<string | null>(null);
  const [catFilter, setCatFilter]         = useState<CatFilter>('all');

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t);
    if (t === 'waterfall') {
      setAnimated(false);
      setTimeout(() => setAnimated(true), 60);
    }
  };

  const totalSize       = RESOURCES.reduce((s, r) => s + r.size, 0);
  const totalTime       = Math.max(...RESOURCES.map(r => r.start + r.duration));
  const activeResItem   = RESOURCES.find(r => r.name === activeRes);
  const filteredApis    = catFilter === 'all' ? APIS : APIS.filter(a => a.category === catFilter);
  const catCounts       = (['gaming','activity','entertainment','social','infra'] as Category[])
    .reduce<Record<string, number>>((acc, c) => { acc[c] = APIS.filter(a => a.category === c).length; return acc; }, {});

  return (
    <div className="my-8 not-prose">

      {/* Tab bar */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800 mb-6">
        {([['waterfall', 'Page Load'], ['apis', `API Integrations (${APIS.length})`]] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`text-xs px-4 py-2.5 -mb-px border-b-2 transition-colors ${
              tab === t
                ? 'border-zinc-800 dark:border-zinc-200 text-zinc-900 dark:text-white font-medium'
                : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Waterfall ─────────────────────────────────────────────────────── */}
      {tab === 'waterfall' && (
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5">
            {(Object.entries(R_COLORS) as [Resource['type'], typeof R_COLORS[Resource['type']]][]).map(([type, c]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{type}</span>
              </div>
            ))}
          </div>

          <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
            {/* Time axis */}
            <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-4 py-2 bg-zinc-50/60 dark:bg-zinc-800/20">
              <div className="w-36 sm:w-44 flex-shrink-0" />
              <div className="flex-1 flex justify-between text-xs font-mono text-zinc-400 dark:text-zinc-600">
                <span>0</span>
                <span>{Math.round(TOTAL_MS / 3)}ms</span>
                <span>{Math.round((TOTAL_MS / 3) * 2)}ms</span>
                <span>{TOTAL_MS}ms</span>
              </div>
              <div className="w-16 flex-shrink-0" />
            </div>

            {RESOURCES.map((r, i) => {
              const left  = (r.start / TOTAL_MS) * 100;
              const width = (r.duration / TOTAL_MS) * 100;
              const c     = R_COLORS[r.type];
              const isAct = activeRes === r.name;
              return (
                <button
                  key={r.name}
                  className={`w-full flex items-center px-4 py-2.5 gap-3 text-left transition-colors ${
                    isAct
                      ? 'bg-zinc-50 dark:bg-zinc-800/60'
                      : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'
                  } ${i < RESOURCES.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}
                  onClick={() => setActiveRes(isAct ? null : r.name)}
                >
                  <div className="w-36 sm:w-44 flex-shrink-0 flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                    <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate">{r.name}</span>
                  </div>
                  <div className="flex-1 relative h-4">
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 h-3 rounded-sm ${c.bar} ease-out`}
                      style={{
                        left: `${left}%`,
                        width: animated ? `${width}%` : '0%',
                        transition: 'width 500ms ease-out',
                        transitionDelay: `${i * 55}ms`,
                        minWidth: animated ? '3px' : '0',
                      }}
                    />
                  </div>
                  <div className="w-16 flex-shrink-0 text-right">
                    <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{r.size.toFixed(1)}KB</span>
                  </div>
                </button>
              );
            })}

            <div className="flex items-center px-4 py-2.5 gap-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
              <div className="w-36 sm:w-44 flex-shrink-0">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Total</span>
              </div>
              <div className="flex-1">
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                  {RESOURCES.length} requests · {totalTime}ms finish
                </span>
              </div>
              <div className="w-16 flex-shrink-0 text-right">
                <span className="text-xs font-medium font-mono text-zinc-700 dark:text-zinc-300">
                  {totalSize.toFixed(1)}KB
                </span>
              </div>
            </div>
          </div>

          {activeResItem && (
            <div className="mt-3 border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{activeResItem.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${R_COLORS[activeResItem.type].badge}`}>
                  {activeResItem.type}
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mb-3 break-all">{activeResItem.url}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{activeResItem.note}</p>
              <div className="flex gap-6 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                {[['Start', `${activeResItem.start}ms`], ['Duration', `${activeResItem.duration}ms`], ['Size', `${activeResItem.size.toFixed(1)}KB`]].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">{label}</p>
                    <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">
            Click any row for details · sizes are compressed transfer size · timings from fast broadband
          </p>
        </>
      )}

      {/* ─── API Integrations ──────────────────────────────────────────────── */}
      {tab === 'apis' && (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {(['all', 'gaming', 'activity', 'entertainment', 'social', 'infra'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  catFilter === c
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {c === 'all' ? `all (${APIS.length})` : `${c} (${catCounts[c]})`}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            {filteredApis.map(api => {
              const isAct = activeApi === api.service;
              const cc    = C_COLORS[api.category];
              return (
                <div
                  key={api.service}
                  className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden"
                >
                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      isAct
                        ? 'bg-zinc-50 dark:bg-zinc-800/60'
                        : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30'
                    }`}
                    onClick={() => setActiveApi(isAct ? null : api.service)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cc.dot}`} />
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex-shrink-0">
                        {api.service}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 hidden sm:inline ${cc.badge}`}>
                        {api.category}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 truncate hidden md:block">
                        {api.internalRoute.split(' · ')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:block">
                        {api.usedOn}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {api.cache}
                      </span>
                    </div>
                  </button>

                  {isAct && (
                    <div className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex flex-wrap gap-x-6 gap-y-3 mb-3">
                        <div>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Route</p>
                          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{api.internalRoute}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Upstream</p>
                          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{api.upstream}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Cache</p>
                          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{api.cache}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Used on</p>
                          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{api.usedOn}</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{api.note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
            {filteredApis.length} of {APIS.length} integrations · click any row to expand
          </p>
        </>
      )}
    </div>
  );
}
