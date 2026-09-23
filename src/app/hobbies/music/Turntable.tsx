'use client';

import React from 'react';
import Image from '@/components/SiteImage';
import { Pause, Play } from 'lucide-react';

// The deck: a wooden turntable with the record on it, its album cover for a label. It spins while
// something plays and the tonearm swings over onto the groove; stopped, the arm goes back to its
// rest. Beside it, what is on and how far through it is.

export interface DeckTrack {
  id: string;
  name: string;
  artists: string;
  album?: string;
  imageUrl: string | null;
  spotifyUrl?: string;
  durationMs?: number;
}

const time = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function Turntable({
  track,
  spinning,
  playing,
  status,
  progressMs,
  durationMs,
  canPlay,
  onToggle,
}: {
  track: DeckTrack | null;
  spinning: boolean;
  playing: boolean; // a preview of it is playing here, as against me playing it on Spotify
  status: string;
  progressMs: number | null;
  durationMs: number | null;
  canPlay: boolean;
  onToggle: () => void;
}) {
  const share = progressMs !== null && durationMs ? Math.min(1, progressMs / durationMs) : null;

  return (
    <section className={`tt ${spinning ? 'tt-spinning' : ''}`} aria-label="Turntable">
      <div className="tt-plinth">
        <button
          type="button"
          className="tt-platter"
          onClick={onToggle}
          disabled={!track || !canPlay}
          aria-label={playing ? 'Stop the preview' : 'Play a preview of the record'}
        >
          <span className="tt-record">
            <span className="tt-label">
              {track?.imageUrl ? <Image src={track.imageUrl} alt="" fill unoptimized className="object-cover" /> : null}
            </span>
          </span>
          <span className="tt-sheen" />
          <span className="tt-spindle" />
        </button>

        <svg className="tt-arm-svg" viewBox="0 0 130 100" aria-hidden>
          <rect x="107" y="3" width="8" height="7" rx="1.5" className="tt-metal" />
          <circle cx="111" cy="16" r="7" className="tt-metal" />
          <g className="tt-arm">
            <path d="M111 16 L111 70 L104 80" className="tt-arm-line" />
            <rect x="99" y="78" width="10" height="6" rx="1.2" transform="rotate(-36 104 81)" className="tt-metal" />
          </g>
          <circle cx="111" cy="16" r="2.4" className="tt-pin" />
        </svg>

        <button
          type="button"
          className="tt-start"
          onClick={onToggle}
          disabled={!track || !canPlay}
          aria-label={playing ? 'Stop' : 'Start'}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
        </button>
        <span className="tt-light" aria-hidden />
        <span className="tt-pitch" aria-hidden>
          <span />
        </span>
      </div>

      <div className="min-w-0">
        <p className="music-hand mb-1 text-lg text-[color:var(--mu-muted)]">{status}</p>
        {track ? (
          <>
            <p className="truncate text-base font-medium text-zinc-900 dark:text-paper">{track.name}</p>
            <p className="truncate text-sm text-zinc-600 dark:text-neutral-300">{track.artists}</p>
            {track.album ? <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-neutral-400">{track.album}</p> : null}
            {share !== null ? (
              <div className="mt-4 max-w-xs">
                <div className="tt-progress">
                  <span style={{ width: `${share * 100}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[11px] tabular-nums text-zinc-400 dark:text-neutral-400">
                  <span>{time(progressMs ?? 0)}</span>
                  <span>{time(durationMs ?? 0)}</span>
                </div>
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {canPlay ? (
                <button
                  type="button"
                  onClick={onToggle}
                  className="text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-900 dark:text-neutral-300 dark:decoration-neutral-600 dark:hover:text-paper"
                >
                  {playing ? 'Stop the preview' : 'Play a 30s preview'}
                </button>
              ) : null}
              {track.spotifyUrl ? (
                <a
                  href={track.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 transition-colors hover:text-zinc-800 dark:text-neutral-400 dark:hover:text-paper"
                >
                  Open in Spotify ↗
                </a>
              ) : null}
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-neutral-400">Nothing on the deck.</p>
        )}
      </div>
    </section>
  );
}
