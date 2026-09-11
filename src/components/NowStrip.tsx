'use client';

import { useEffect, useState } from 'react';
import type { NowData } from '@/lib/now';

/**
 * One line: the most recent thing that actually happened. A track playing
 * right now beats everything else; otherwise whichever of the commit, the
 * lift or the episode carries the newest timestamp takes the line.
 */

const POLL_MS = 45_000;

function relativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (seconds < 45) return rtf.format(-seconds, 'second');
  const minutes = Math.round(seconds / 60);
  if (minutes < 45) return rtf.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 22) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (days < 26) return rtf.format(-days, 'day');
  const months = Math.round(days / 30);
  if (months < 11) return rtf.format(-months, 'month');
  return rtf.format(-Math.round(days / 365), 'year');
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

interface CurrentTrack {
  isPlaying?: boolean;
  track?: { name?: string; artists?: string; spotifyUrl?: string } | null;
}

export default function NowStrip({ data }: { data: NowData }) {
  const { commit, lift, watching } = data;

  const [, setTick] = useState(0);
  const [track, setTrack] = useState<CurrentTrack | null>(null);

  // Re-render once a minute so the relative timestamp stays honest.
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/spotify/currently-playing', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as CurrentTrack;
        if (!cancelled) setTrack(payload);
      } catch {
        /* a dead feed just loses its turn */
      }
    };

    void load();
    const id = window.setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const playing = track?.isPlaying && track.track?.name ? track.track : null;

  const className = 'mb-10 text-sm leading-relaxed text-zinc-500 dark:text-neutral-400';
  const linkClass =
    'text-zinc-700 transition-colors hover:text-zinc-900 dark:text-neutral-300 dark:hover:text-paper';

  // Something is playing, which beats anything that merely already happened.
  if (playing) {
    const name = clip(playing.name!, 44);
    const artist = playing.artists ? clip(playing.artists.split(',')[0].trim(), 28) : null;
    return (
      <p className={className}>
        Listening to{' '}
        {playing.spotifyUrl ? (
          <a
            href={playing.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {name}
          </a>
        ) : (
          <span className={linkClass}>{name}</span>
        )}
        {artist ? ` by ${artist}` : ''}.
      </p>
    );
  }

  const events = [
    commit && { at: commit.date, kind: 'commit' as const },
    lift && { at: lift.date, kind: 'lift' as const },
    watching && { at: watching.date, kind: 'watching' as const },
  ].filter((event): event is { at: string; kind: 'commit' | 'lift' | 'watching' } => Boolean(event));

  if (events.length === 0) return null;

  const latest = events.reduce((newest, event) =>
    new Date(event.at).getTime() > new Date(newest.at).getTime() ? event : newest
  );
  const when = <span suppressHydrationWarning>{relativeTime(latest.at)}</span>;

  if (latest.kind === 'commit' && commit) {
    return (
      <p className={className}>
        Pushed{' '}
        <a href={commit.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {commit.shortSha}
        </a>{' '}
        to {commit.repo} {when}.
      </p>
    );
  }

  if (latest.kind === 'lift' && lift) {
    return (
      <p className={className}>
        Lifted {lift.volumeKg.toLocaleString()} kg in a {clip(lift.title, 28)} session {when}.
      </p>
    );
  }

  if (latest.kind === 'watching' && watching) {
    return (
      <p className={className}>
        Watched episode {watching.episodes} of {clip(watching.title, 40)} {when}.
      </p>
    );
  }

  return null;
}
