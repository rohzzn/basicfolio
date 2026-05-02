"use client";
import React, { useState, useEffect } from 'react';

function genCode(seed: number): string {
  const n = ((seed * 1234567 + 987654) % 900000) + 100000;
  return String(n);
}

export default function TOTPDemo() {
  const [now, setNow] = useState(() => Date.now());
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const windowIndex = Math.floor(now / 30000);
  const elapsed = (now % 30000) / 1000;
  const remaining = 30 - elapsed;
  const pct = (elapsed / 30) * 100;

  const windows = mode === 'secure'
    ? [windowIndex - 1, windowIndex, windowIndex + 1]
    : [windowIndex];

  const codes = windows.map(w => genCode(w));

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Live TOTP Simulation</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['vulnerable', 'secure'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${mode === m ? (m === 'vulnerable' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white') : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
              {m === 'vulnerable' ? 'Vulnerable (1 window)' : 'Secure (3 windows)'}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Current window</span>
              <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{remaining.toFixed(1)}s remaining</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-none ${remaining < 5 ? 'bg-red-500' : 'bg-zinc-500 dark:bg-zinc-400'}`}
                style={{ width: `${100 - pct}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {windows.map((w, i) => {
              const isCurrent = w === windowIndex;
              return (
                <div key={w} className={`flex items-center justify-between px-3 py-2 rounded-md ${isCurrent ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700' : 'opacity-50'}`}>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {i === 0 && mode === 'secure' ? 'prev window' : i === 2 && mode === 'secure' ? 'next window' : 'current window'}
                  </span>
                  <code className={`font-mono text-sm font-bold tracking-widest ${isCurrent ? 'dark:text-white' : 'text-zinc-400'}`}>
                    {codes[i]}
                  </code>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            {mode === 'vulnerable'
              ? 'Only the current 30-second window is accepted. Clock drift of even a few seconds breaks auth.'
              : 'One window on either side accommodates clock drift. The verification window becomes 90 seconds.'}
          </p>
        </div>
      </div>
    </div>
  );
}
