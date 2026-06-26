'use client';

import React, { useEffect, useState } from 'react';
import Image from '@/components/SiteImage';

interface UnifiedClip {
  id: string;
  title: string;
  thumbnail: string;
  clipUrl: string;
  createdTimestamp: number;
  views: number;
  duration: number;
  source: 'medal' | 'allstar';
  categoryName: string;
}

interface MedalClip {
  contentId: string;
  contentTitle: string;
  contentViews: number;
  contentThumbnail: string;
  embedIframeUrl: string;
  createdTimestamp: number;
  categoryId: number;
  categoryName: string;
  directClipUrl: string;
  videoLengthSeconds: number;
}

interface AllstarClip {
  id: string;
  title: string;
  thumbnail: string;
  clipUrl: string;
  createdTimestamp: number;
  views: number;
  duration: number;
  source: 'allstar';
  categoryName: string;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: '2k', label: '2K' },
  { id: '3k', label: '3K' },
  { id: '4k', label: '4K' },
  { id: '5k', label: 'Ace' },
  { id: 'other', label: 'Other' },
];

function matchesFilter(clip: UnifiedClip, id: string): boolean {
  if (id === 'all') return true;
  const t = clip.title.toLowerCase();
  switch (id) {
    case '2k': return t.includes('2k') || /\b2 kill/.test(t) || t.includes('double');
    case '3k': return t.includes('3k') || /\b3 kill/.test(t) || t.includes('triple');
    case '4k': return t.includes('4k') || /\b4 kill/.test(t) || t.includes('quad');
    case '5k': return t.includes('5k') || /\b5 kill/.test(t) || t.includes('penta') || t.includes('ace') || t.includes('pentakill');
    case 'other': return !/\b[1-5]k\b|\b[1-5] kill|single|double|triple|quad|penta|ace/.test(t);
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
    createdTimestamp: clip.createdTimestamp,
    views: clip.contentViews,
    duration: clip.videoLengthSeconds,
    source: 'medal',
    categoryName: clip.categoryName,
  };
}

export default function ClipsPage() {
  const [clips, setClips] = useState<UnifiedClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/medal').then(r => r.json()).catch(() => ({ clips: [] })),
      fetch('/api/allstar').then(r => r.json()).catch(() => ({ clips: [] })),
    ]).then(([medalData, allstarData]) => {
      const medalClips: UnifiedClip[] = (medalData.clips ?? []).map(medalToUnified);
      const allstarClips: AllstarClip[] = allstarData.clips ?? [];

      // Merge and sort newest first
      const merged: UnifiedClip[] = [...medalClips, ...allstarClips];
      merged.sort((a, b) => b.createdTimestamp - a.createdTimestamp);

      setClips(merged);

      if (merged.length === 0 && (medalData.error || allstarData.error)) {
        setError('Failed to load clips.');
      }
    }).catch(() => setError('Failed to load clips.')).finally(() => setLoading(false));
  }, []);

  const filtered = clips.filter(c => matchesFilter(c, activeFilter));

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Gaming Clips</h2>
        <div className="flex gap-4">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={`text-sm transition-colors ${
                activeFilter === id
                  ? 'text-zinc-900 dark:text-white font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-2.5" />
              <div className="w-3/4 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
              <div className="w-1/2 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : error && clips.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 py-8">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No clips{activeFilter !== 'all' ? ' matching this filter' : ''}.
          </p>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors mt-2 block"
            >
              Show all clips
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(clip => (
            <div
              key={`${clip.source}-${clip.id}`}
              onClick={() => {
                if (clip.clipUrl) window.open(clip.clipUrl, '_blank', 'noopener,noreferrer');
              }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-2.5">
                {clip.thumbnail ? (
                  <Image
                    src={clip.thumbnail}
                    alt={clip.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-300 dark:bg-zinc-700" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <span className="text-zinc-900 text-sm ml-0.5">▶</span>
                  </div>
                </div>
                {clip.duration > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded tabular-nums">
                    {fmtDur(clip.duration)}
                  </div>
                )}
                <div className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded font-medium ${
                  clip.source === 'allstar'
                    ? 'bg-violet-500/90 text-white'
                    : 'bg-yellow-500/90 text-black'
                }`}>
                  {clip.source === 'allstar' ? 'Allstar' : 'Medal'}
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors line-clamp-1">
                {clip.title}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {new Date(clip.createdTimestamp).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
                {clip.views > 0 && ` · ${clip.views.toLocaleString()} views`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
