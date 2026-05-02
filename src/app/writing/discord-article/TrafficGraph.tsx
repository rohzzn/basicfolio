"use client";
import React, { useState } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function normalDay(h: number) {
  const base = 20 + 15 * Math.sin((h - 6) * Math.PI / 12);
  return Math.max(5, Math.round(base + (h % 3) * 2));
}

function launchDay(h: number) {
  if (h < 8) return normalDay(h) * 0.7;
  if (h === 10) return 98;
  if (h === 11) return 100;
  if (h === 12) return 95;
  if (h >= 9 && h <= 15) return 70 + (h - 9) * 5;
  return normalDay(h) * 1.8;
}

const NORMAL = HOURS.map(normalDay);
const LAUNCH = HOURS.map(launchDay);

export default function TrafficGraph() {
  const [view, setView] = useState<'normal' | 'launch'>('normal');
  const data = view === 'normal' ? NORMAL : LAUNCH;
  const peak = Math.max(...data);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Concurrent Users (millions)</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['normal', 'launch'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${view === v ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
              {v === 'normal' ? 'Normal day' : 'Starfield launch day'}
            </button>
          ))}
        </div>
        <div className="p-4">
          <div className="flex items-end gap-0.5 h-32 mb-2">
            {data.map((v, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ease-out ${view === 'launch' && (i === 10 || i === 11) ? 'bg-red-500' : view === 'launch' && i >= 9 && i <= 15 ? 'bg-amber-500 dark:bg-amber-400' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                  style={{ height: `${(v / 100) * 120}px` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  {(v / 10).toFixed(1)}M
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-zinc-400 dark:text-zinc-600">
            <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>12am</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Peak: <span className="font-medium dark:text-white">{(peak / 10).toFixed(1)}M users</span>
            </p>
            {view === 'launch' && (
              <span className="text-xs text-red-500">Peak at game launch (10–11am)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
