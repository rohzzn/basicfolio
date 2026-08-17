'use client';

import React from 'react';

// Shared chrome so every "app window" / "terminal" / "browser" style preview
// reads as one family, matching the border/radius/color language used across
// the rest of the site (zinc/neutral scale, rounded-lg, hairline borders).

export function Frame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={`absolute inset-2.5 flex flex-col overflow-hidden rounded-lg border ${
        dark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white dark:border-neutral-800 dark:bg-neutral-950'
      }`}
    >
      {children}
    </div>
  );
}

export function TrafficLights() {
  return (
    <div className="flex gap-1">
      {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => (
        <div key={c} className={`h-1.5 w-1.5 rounded-full ${c} opacity-70`} />
      ))}
    </div>
  );
}

export function WindowBar({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-between border-b px-2 py-1 ${
        dark
          ? 'border-zinc-800 bg-zinc-900'
          : 'border-zinc-100 bg-zinc-50 dark:border-neutral-800 dark:bg-neutral-900'
      }`}
    >
      <TrafficLights />
      <span
        className={`font-mono text-[8px] ${dark ? 'text-zinc-500' : 'text-zinc-400 dark:text-neutral-500'}`}
      >
        {label}
      </span>
    </div>
  );
}

export const dot = (color: string, pulse = false) => (
  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${color}`}>
    {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`} />}
  </span>
);

export const num = (n: number, digits = 0) =>
  n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
