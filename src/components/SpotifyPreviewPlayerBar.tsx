'use client';

import React from 'react';
import Image from '@/components/SiteImage';
import { Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useSpotifyPreview } from '@/contexts/SpotifyPreviewContext';
import { useDesktopPreviewEnabled } from '@/hooks/use-desktop-preview';

/** Spotify mark, inlined so the whole react-icons package stays out of the bundle. */
function SpotifyMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

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
    <div className="fixed bottom-0 right-0 left-0 z-50 hidden border-t border-zinc-200 bg-zinc-50/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/95 lg:left-64 lg:block xl:right-[var(--stream-w)]">
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
              <div className="h-full w-full animate-pulse rounded-md bg-zinc-200 dark:bg-neutral-700" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-800 dark:text-neutral-200">
              {track?.name ?? 'Loading preview...'}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-neutral-400">
              {track?.artists ?? 'Spotify preview'}
            </p>
          </div>

          {track?.spotifyUrl && (
            <a
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Open in Spotify"
            >
              <SpotifyMark className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="flex min-w-[280px] flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => (isPlaying ? pause() : resume())}
            disabled={isLoading || !track}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-200 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-zinc-500 dark:text-neutral-400">
            {formatTime(progressMs)}
          </span>

          <input
            type="range"
            min={0}
            max={durationMs || 30000}
            value={Math.min(progressMs, durationMs || 30000)}
            onChange={(event) => seek(Number(event.target.value))}
            disabled={!track || durationMs <= 0}
            className="spotify-preview-progress h-1 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-emerald-500 dark:bg-neutral-700"
            aria-label="Preview progress"
          />

          <span className="w-9 shrink-0 text-[11px] tabular-nums text-zinc-500 dark:text-neutral-400">
            {formatTime(durationMs || 30000)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setVolume(volume > 0 ? 0 : 0.5)}
            className="text-zinc-500 transition-colors hover:text-zinc-800 dark:text-neutral-400 dark:hover:text-neutral-200"
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
            className="spotify-preview-volume h-1 w-24 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-emerald-500 dark:bg-neutral-700"
            aria-label="Preview volume"
          />

          <button
            type="button"
            onClick={stop}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close preview player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
