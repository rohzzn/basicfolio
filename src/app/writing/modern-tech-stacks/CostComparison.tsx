"use client";
import React, { useState } from 'react';

const ROWS = [
  { label: 'Monthly infra cost',  modern: '$2,000+',  boring: '$50',     winner: 'boring' },
  { label: 'Time to first deploy',modern: '6 weeks',  boring: '4 hours', winner: 'boring' },
  { label: 'Deployment time',     modern: '45 min',   boring: '30 sec',  winner: 'boring' },
  { label: 'Team size needed',    modern: '4 people', boring: '2 people',winner: 'boring' },
  { label: 'Avg response time',   modern: '180 ms',   boring: '80 ms',   winner: 'boring' },
  { label: 'Uptime (6 months)',   modern: '99.4%',    boring: '99.99%',  winner: 'boring' },
  { label: 'Lines of code',       modern: '50k+',     boring: '15k',     winner: 'boring' },
] as const;

export default function CostComparison() {
  const [highlight, setHighlight] = useState<string | null>(null);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Modern vs Simple Stack</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="py-2.5 px-3 text-xs text-zinc-400 dark:text-zinc-500">Metric</div>
          <div className="py-2.5 px-3 text-xs text-center text-zinc-500 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-800">Modern stack</div>
          <div className="py-2.5 px-3 text-xs text-center font-medium text-emerald-600 dark:text-emerald-400 border-l border-zinc-200 dark:border-zinc-800">Simple stack</div>
        </div>
        {ROWS.map(row => (
          <div key={row.label}
            className={`grid grid-cols-3 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 cursor-default transition-colors ${highlight === row.label ? 'bg-zinc-50 dark:bg-zinc-800/30' : ''}`}
            onMouseEnter={() => setHighlight(row.label)} onMouseLeave={() => setHighlight(null)}>
            <div className="py-2.5 px-3 text-xs text-zinc-600 dark:text-zinc-400">{row.label}</div>
            <div className="py-2.5 px-3 text-xs text-center text-red-500 dark:text-red-400 border-l border-zinc-100 dark:border-zinc-800/60">{row.modern}</div>
            <div className="py-2.5 px-3 text-xs text-center font-medium text-emerald-600 dark:text-emerald-400 border-l border-zinc-100 dark:border-zinc-800/60">{row.boring}</div>
          </div>
        ))}
        <div className="px-3 py-3 bg-zinc-50 dark:bg-zinc-800/30">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Numbers from a real product that served 500k users on a $50/month DigitalOcean droplet.</p>
        </div>
      </div>
    </div>
  );
}
