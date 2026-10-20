"use client";

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface HeartReading {
  bpm: number | null;
  at: string | null;
  resting: number | null;
}

const POLL_MS = 120_000;

const ago = (iso: string): string => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
};

// Latest heart rate from the Fitbit Air, beside the Discord status. Falls back
// to the day's resting rate when nothing has synced recently, and renders
// nothing at all when neither is known.
const Heartbeat: React.FC = () => {
  const [reading, setReading] = useState<HeartReading | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReading = async () => {
      try {
        const response = await fetch('/api/heart');
        if (!response.ok) return;
        const data: HeartReading = await response.json();
        if (isMounted) setReading(data);
      } catch {
        // Leave the last reading in place
      }
    };

    fetchReading();
    const interval = setInterval(fetchReading, POLL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const bpm = reading?.bpm ?? reading?.resting ?? null;
  if (!reading || !bpm) return null;

  const isLatest = reading.bpm !== null && reading.at !== null;
  const label = isLatest
    ? `Heart rate ${bpm} bpm, ${ago(reading.at as string)}, from my Fitbit Air`
    : `Resting heart rate ${bpm} bpm, from my Fitbit Air`;

  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5" title={label} aria-label={label} role="img">
      <Heart
        aria-hidden="true"
        className="heartbeat h-3 w-3 fill-rose-500 text-rose-500"
        style={{ '--beat': `${(60 / bpm).toFixed(3)}s` } as React.CSSProperties}
      />
      <span className="text-xs tabular-nums text-zinc-600 dark:text-neutral-400">
        {bpm}
        <span className="ml-0.5 text-zinc-400 dark:text-neutral-500">{isLatest ? 'bpm' : 'resting'}</span>
      </span>
    </span>
  );
};

export default Heartbeat;
