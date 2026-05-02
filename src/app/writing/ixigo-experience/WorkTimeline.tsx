"use client";
import React, { useState } from 'react';

type Tag = 'backend' | 'frontend' | 'devops' | 'bug';

const PROJECTS: { name: string; detail: string; tags: Tag[] }[] = [
  { name: 'KSRTC Tourist Packages Report',    detail: 'Improved report presentation for better user readability',                            tags: ['frontend'] },
  { name: 'HRTC Feedback Alignment',          detail: 'Dynamic data fetching for always up-to-date feedback data',                          tags: ['backend'] },
  { name: 'Gender & Senior Concession Fix',   detail: 'Resolved critical fare calculation errors in SoapUI flows',                          tags: ['bug', 'backend'] },
  { name: 'Banner Updates Across RTCs',       detail: 'Rolled out visual updates across all regional transport portals',                     tags: ['frontend'] },
  { name: 'KSRTC Ant to Maven Migration',     detail: 'Modernised the build system for improved dependency management',                     tags: ['devops'] },
  { name: 'Solr Debug Fix (KSRTC)',           detail: 'Enhanced full-text search capabilities and debug logging',                           tags: ['backend', 'bug'] },
  { name: 'GST Details in Final Ticket',      detail: 'Ensured tax compliance was reflected correctly in printed tickets',                   tags: ['backend'] },
  { name: 'Service Feedback Hyperlink Fix',   detail: 'Repaired broken links in the user feedback collection flow',                         tags: ['bug', 'frontend'] },
  { name: 'PM2 Process Management (KSRTC React)', detail: 'Implemented robust process management for the KSRTC React frontend',            tags: ['devops', 'frontend'] },
  { name: 'Sleeper API Layout Fix',           detail: 'Fixed berth visualization UI for sleeper bus bookings',                              tags: ['frontend', 'bug'] },
  { name: 'User Session Management',          detail: 'Rebuilt session handling in the KSRTC React app for stability',                      tags: ['frontend', 'backend'] },
];

const TAG_COLORS: Record<Tag, string> = {
  backend:  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  frontend: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  devops:   'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  bug:      'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
};

const ALL_TAGS: Tag[] = ['backend', 'frontend', 'devops', 'bug'];

export default function WorkTimeline() {
  const [filter, setFilter] = useState<Tag | 'all'>('all');
  const visible = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.tags.includes(filter));

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Projects at Abhibus</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', ...ALL_TAGS] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors capitalize ${filter === t ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400'}`}>
            {t === 'all' ? `All (${PROJECTS.length})` : `${t} (${PROJECTS.filter(p => p.tags.includes(t)).length})`}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {visible.map((p, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium dark:text-white mb-1">{p.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{p.detail}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
              {p.tags.map(t => (
                <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${TAG_COLORS[t]}`}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
