"use client";
import React, { useState } from 'react';

const CATEGORIES = [
  {
    label: 'Applications',
    count: 15,
    color: 'bg-violet-500',
    light: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
    examples: ['Keel', 'ShutTab', 'CS Stats', 'Tanoshi', 'Pages'],
  },
  {
    label: 'Web',
    count: 14,
    color: 'bg-blue-500',
    light: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    examples: ['Contests', 'DSA Roadmap', 'Margin', 'API Clinic', 'Dekho Car'],
  },
  {
    label: 'Games',
    count: 7,
    color: 'bg-emerald-500',
    light: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    examples: ['Catan Online', 'Dock Poker', 'Pokemon Platformer', 'Wordle', 'Pokedex'],
  },
  {
    label: 'Other',
    count: 10,
    color: 'bg-amber-500',
    light: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    examples: ['NIDS', 'Smart Agriculture', 'Automobile Analytics', 'OverTheWire', 'Discord Mirror'],
  },
];

const NOTABLE = [
  { name: 'Tanoshi',        metric: '1,700 downloads', type: 'VS Code theme', url: 'https://marketplace.visualstudio.com/items?itemName=RohanSanjeev.tanoshi' },
  { name: 'DSA Roadmap',   metric: '12,305 visits',    type: 'Web app', url: 'https://dsa.gay' },
  { name: 'Portfolio V2',  metric: '7,000 visits',     type: 'Portfolio site', url: 'https://rohzzn.github.io/portfolio_v2/' },
  { name: 'Pages',         metric: '800 users',        type: 'Figma plugin', url: 'https://www.figma.com/community/plugin/1106104074775818911' },
  { name: 'Pokemon',       metric: '6,800 visits',     type: '2D platformer', url: 'https://rohzzn.github.io/pokemon/' },
  { name: 'Contests',      metric: '200 active users', type: 'Web app', url: 'http://contests.dev/' },
];

const total = CATEGORIES.reduce((s, c) => s + c.count, 0);

export default function ProjectStats() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">The {total} Projects</p>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden mb-4">
        <div className="p-4">
          <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-0.5">
            {CATEGORIES.map(c => (
              <div key={c.label} className={`${c.color} transition-all`}
                   style={{ width: `${(c.count / total) * 100}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.label} onClick={() => setActive(active === c.label ? null : c.label)}
                className={`text-left p-3 rounded-md border transition-colors ${active === c.label ? 'border-zinc-300 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-800/50' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-2 h-2 rounded-full ${c.color}`} />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{c.label}</span>
                </div>
                <p className="text-xl font-bold dark:text-white">{c.count}</p>
              </button>
            ))}
          </div>
          {active && (
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">Examples</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.find(c => c.label === active)?.examples.map(e => (
                  <span key={e} className={`text-xs px-2 py-0.5 rounded ${CATEGORIES.find(c => c.label === active)!.light}`}>{e}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Projects that got traction</p>
      <div className="space-y-1.5">
        {NOTABLE.map(n => (
          <a key={n.name} href={n.url} target="_blank" rel="noopener noreferrer"
            className="group flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{n.name}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{n.type}</span>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">{n.metric}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
