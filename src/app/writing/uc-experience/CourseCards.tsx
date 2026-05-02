"use client";
import React, { useState } from 'react';

const COURSES = [
  { name: 'Advanced Algorithms I',     credit: 3, note: 'Complexity, optimization, and hard problem solving' },
  { name: 'Distributed Operating Systems', credit: 3, note: 'Concurrency, distributed state, and cloud infra fundamentals' },
  { name: 'Cloud Computing',           credit: 3, note: 'Hands-on with AWS, Azure deployments and architectures' },
  { name: 'Innovation Design Thinking',credit: 3, note: 'User-centered problem solving beyond pure engineering' },
];

const HIGHLIGHTS = [
  { icon: '🏛️', label: '1819 Innovation Hub',   detail: 'State of the art esports arena and collaborative spaces' },
  { icon: '📚', label: 'Langsam Library',        detail: 'Deep study sessions for algorithms and distributed systems' },
  { icon: '🎮', label: 'Campus Esports Lab',     detail: 'Found my people here the first week' },
  { icon: '📦', label: 'Bearcats Package Center',detail: 'Part-time work that paid for ramen' },
];

export default function CourseCards() {
  const [tab, setTab] = useState<'courses' | 'campus'>('courses');
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="my-8 not-prose">
      <div className="flex gap-1 mb-4">
        {(['courses', 'campus'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors capitalize ${tab === t ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
            {t === 'courses' ? 'Fall 2024 Courses' : 'Campus Highlights'}
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <div className="space-y-2">
          {COURSES.map(c => (
            <div key={c.name}
              className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setExpanded(expanded === c.name ? null : c.name)}>
              <div className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{c.name}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{c.credit} cr</span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-600 text-xs">{expanded === c.name ? '▲' : '▼'}</span>
              </div>
              {expanded === c.name && (
                <div className="px-4 pb-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2">{c.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'campus' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HIGHLIGHTS.map(h => (
            <div key={h.label} className="flex gap-3 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
              <span className="text-xl flex-shrink-0">{h.icon}</span>
              <div>
                <p className="text-xs font-medium dark:text-white mb-0.5">{h.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{h.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
