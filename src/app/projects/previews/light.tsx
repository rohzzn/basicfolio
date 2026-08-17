'use client';

import React from 'react';

// Grid-card-only chrome: the SAME light/dark treatment for every card, so
// the grid reads as one consistent system in both themes regardless of
// which project it represents — no card gets its own one-off color mood.

export function LightFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-2.5 flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {children}
    </div>
  );
}

export function LightWindowBar({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-zinc-50 px-2 py-1 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex gap-1">
        {['bg-red-300', 'bg-yellow-300', 'bg-green-300'].map((c) => (
          <div key={c} className={`h-1.5 w-1.5 rounded-full ${c} dark:opacity-70`} />
        ))}
      </div>
      <span className="font-mono text-[8px] text-zinc-400 dark:text-neutral-500">{label}</span>
    </div>
  );
}

export const lightDot = (color: string, pulse = false) => (
  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${color}`}>
    {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`} />}
  </span>
);
