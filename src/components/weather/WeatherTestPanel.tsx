"use client";

// TEMP: dev-only panel for previewing every weather effect by hand.
// Remove this file (and its usage in multi-page-portfolio.tsx) after testing.

import React, { useState } from 'react';
import WeatherEffects from './WeatherEffects';
import type { WeatherKind } from './useWeather';

const KINDS: WeatherKind[] = [
  'rain',
  'drizzle',
  'snow',
  'thunder',
  'clouds',
  'fog',
  'clear-day',
  'clear-night',
  'wind',
];

const WeatherTestPanel = () => {
  const [kind, setKind] = useState<WeatherKind | null>(null);

  return (
    <>
      <div className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex-wrap items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-100/90 dark:bg-neutral-800/90 backdrop-blur-sm shadow-sm border border-zinc-200 dark:border-neutral-700">
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-neutral-500">
          test
        </span>
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`text-[11px] transition-colors ${
              kind === k
                ? 'text-zinc-900 dark:text-neutral-100 underline underline-offset-2'
                : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-700 dark:hover:text-neutral-200'
            }`}
          >
            {k.replace('clear-', '')}
          </button>
        ))}
        <button
          onClick={() => setKind(null)}
          className={`text-[11px] transition-colors ${
            kind === null
              ? 'text-zinc-900 dark:text-neutral-100 underline underline-offset-2'
              : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-700 dark:hover:text-neutral-200'
          }`}
        >
          off
        </button>
      </div>
      {kind && <WeatherEffects kind={kind} />}
    </>
  );
};

export default WeatherTestPanel;
