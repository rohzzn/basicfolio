'use client';

import React from 'react';
import Image from 'next/image';
import { Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { SiSpotify } from 'react-icons/si';
import { useSpotifyPreview } from '@/contexts/SpotifyPreviewContext';
import { useDesktopPreviewEnabled } from '@/hooks/use-desktop-preview';

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function SpotifyPreviewPlayerBar() {
  const isDesktopEnabled = useDesktopPreviewEnabled();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progressMs,
    durationMs,
    volume,
    setVolume,
    pause,
    resume,
    stop,
    seek,
  } = useSpotifyPreview();

  if (!isDesktopEnabled || (!currentTrack && !isLoading)) {
    return null;
  }

  const track = currentTrack;

  return (
    <div className="fixed bottom-0 right-0 left-0 z-50 hidden border-t border-zinc-200 bg-zinc-50/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 lg:left-64 lg:block">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0">
            {track?.imageUrl ? (
              <Image
                src={track.imageUrl}
                alt={track.name}
                fill
                className="rounded-md object-cover"
                sizes="48px"
                unoptimized
              />
            ) : (
              <div className="h-full w-full animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {track?.name ?? 'Loading preview...'}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {track?.artists ?? 'Spotify preview'}
            </p>
          </div>

          {track?.spotifyUrl && (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              aria-label="Open in Spotify"
            >
              <SiSpotify className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="flex min-w-[280px] flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => (isPlaying ? pause() : resume())}
            disabled={isLoading || !track}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
            {formatTime(progressMs)}
          </span>

          <input
            type="range"
            min={0}
            max={durationMs || 30000}
            value={Math.min(progressMs, durationMs || 30000)}
            onChange={(event) => seek(Number(event.target.value))}
            disabled={!track || durationMs <= 0}
            className="spotify-preview-progress h-1 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-emerald-500 dark:bg-zinc-700"
            aria-label="Preview progress"
          />

          <span className="w-9 shrink-0 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
            {formatTime(durationMs || 30000)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setVolume(volume > 0 ? 0 : 0.5)}
            className="text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            aria-label={volume > 0 ? 'Mute preview' : 'Unmute preview'}
          >
            {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="spotify-preview-volume h-1 w-24 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-emerald-500 dark:bg-zinc-700"
            aria-label="Preview volume"
          />

          <button
            type="button"
            onClick={stop}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close preview player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
