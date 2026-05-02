"use client";
import React, { useState, useEffect, useRef } from 'react';

const METRICS = [
  { label: 'Bundle Size',      before: '2.1 MB',  after: '1.1 MB',  improvement: 47, unit: '%' },
  { label: 'Memory Usage',     before: '180 MB',  after: '117 MB',  improvement: 35, unit: '%' },
  { label: 'Time to Interactive', before: '4.2 s', after: '1.8 s', improvement: 57, unit: '%' },
  { label: 'User Retention',   before: '68%',     after: '82%',     improvement: 14, unit: 'pts' },
];

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const [width, setWidth] = useState(0);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      requestAnimationFrame(() => setTimeout(() => setWidth(pct), 50));
    }
  }, [pct]);
  return (
    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
           style={{ width: `${width}%` }} />
    </div>
  );
}

export default function PerfMetrics() {
  const [view, setView] = useState<'before' | 'after'>('before');

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Performance Results</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['before', 'after'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${view === v ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
              {v}
            </button>
          ))}
        </div>
        <div className="p-4 space-y-4">
          {METRICS.map(m => (
            <div key={m.label}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{m.label}</span>
                <div className="flex items-baseline gap-2">
                  {view === 'after' && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {m.improvement > 0 ? '+' : ''}{m.improvement}{m.unit} better
                    </span>
                  )}
                  <span className={`text-sm font-bold ${view === 'after' ? 'text-emerald-600 dark:text-emerald-400' : 'dark:text-white'}`}>
                    {view === 'after' ? m.after : m.before}
                  </span>
                </div>
              </div>
              <AnimatedBar
                key={view + m.label}
                pct={view === 'after' ? 100 - m.improvement : 100}
                color={view === 'after' ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-500'}
              />
            </div>
          ))}
        </div>
        {view === 'after' && (
          <div className="px-4 pb-4">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Average improvement: {Math.round(METRICS.reduce((s, m) => s + m.improvement, 0) / METRICS.length)}% across all metrics</p>
          </div>
        )}
      </div>
    </div>
  );
}
