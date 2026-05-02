'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

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

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: '2k', label: '2K' },
  { id: '3k', label: '3K' },
  { id: '4k', label: '4K' },
  { id: '5k', label: 'Ace' },
  { id: 'other', label: 'Other' },
];

function matchesFilter(clip: MedalClip, id: string): boolean {
  if (id === 'all') return true;
  const t = clip.contentTitle.toLowerCase();
  switch (id) {
    case '2k': return t.includes('2k') || t.includes(' 2 ') || t.includes('double') || t.includes('2 kill');
    case '3k': return t.includes('3k') || t.includes(' 3 ') || t.includes('triple') || t.includes('3 kill');
    case '4k': return t.includes('4k') || t.includes(' 4 ') || t.includes('quad') || t.includes('4 kill');
    case '5k': return t.includes('5k') || t.includes(' 5 ') || t.includes('penta') || t.includes('ace') || t.includes('5 kill') || t.includes('pentakill');
    case 'other': return !/\b[1-5]k\b|\b[1-5] kill|\b[1-5]\b|single|double|triple|quad|penta|ace/.test(t);
    default: return true;
  }
}

function fmtDur(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export default function ClipsPage() {
  const [clips, setClips] = useState<MedalClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetch('/api/medal')
      .then(r => r.json())
      .then(data => setClips(data.clips ?? []))
      .catch(() => setError('Failed to load clips.'))
      .finally(() => setLoading(false));
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
      ) : error ? (
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
              key={clip.contentId}
              onClick={() => {
                const url = clip.directClipUrl || clip.embedIframeUrl;
                if (url) window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 mb-2.5">
                <Image
                  src={clip.contentThumbnail}
                  alt={clip.contentTitle}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <span className="text-zinc-900 text-sm ml-0.5">▶</span>
                  </div>
                </div>
                {clip.videoLengthSeconds > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded tabular-nums">
                    {fmtDur(clip.videoLengthSeconds)}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors line-clamp-1">
                {clip.contentTitle}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {new Date(clip.createdTimestamp).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
                {clip.contentViews > 0 && ` · ${clip.contentViews.toLocaleString()} views`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
