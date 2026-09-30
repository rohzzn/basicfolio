"use client";

import Image from '@/components/SiteImage';
import React, { useState } from 'react';
import type { PeakClip } from '@/data/peak';

const embedUrl = (clip: PeakClip): string => {
  const params = new URLSearchParams({ autoplay: '1', rel: '0', start: String(clip.start) });

  if (clip.end !== undefined) {
    params.set('end', String(clip.end));
  }

  return `https://www.youtube.com/embed/${clip.youtubeId}?${params}`;
};

// Thumbnail until clicked, so the page doesn't load a player per clip
const PeakCard: React.FC<{ clip: PeakClip }> = ({ clip }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-sm bg-zinc-200 dark:bg-neutral-800">
        {isPlaying ? (
          <iframe
            src={embedUrl(clip)}
            title={clip.moment}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play: ${clip.moment}`}
            className="group absolute inset-0"
          >
            {/* 4:3 images with letterbox bars; object-cover crops them off */}
            <Image
              src={`https://i.ytimg.com/vi/${clip.youtubeId}/${clip.frame ? `hq${clip.frame}` : 'hqdefault'}.jpg`}
              alt=""
              fill
              className="object-cover transition-opacity group-hover:opacity-90"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="mt-2">
        <p className="text-xs font-medium text-zinc-700 dark:text-neutral-300">{clip.moment}</p>
        <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-neutral-400">
          {clip.from} · {clip.kind}
        </p>
      </div>
    </div>
  );
};

const PeakGrid: React.FC<{ clips: PeakClip[] }> = ({ clips }) => {
  if (clips.length === 0) {
    return <p className="pt-6 text-sm text-zinc-500 dark:text-neutral-400">No clips match that search.</p>;
  }

  return (
    <section className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2">
      {clips.map((clip) => (
        <PeakCard key={`${clip.youtubeId}-${clip.start}`} clip={clip} />
      ))}
    </section>
  );
};

export default PeakGrid;
