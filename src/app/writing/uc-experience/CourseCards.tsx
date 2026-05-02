"use client";
import React, { useState } from 'react';

const COURSES = [
  { name: 'Advanced Algorithms I',        credit: 3, grade: 'A+', note: 'Complexity, optimization, and algorithmic problem solving. The hardest course I had taken in years.' },
  { name: 'Distributed Operating Systems',credit: 3, grade: 'A+', note: 'Concurrency, distributed state, and the fundamentals of how large systems stay consistent.' },
  { name: 'Cloud Computing',              credit: 3, grade: 'A+', note: 'Hands-on with AWS and Azure. Deployments, IAM, container orchestration.' },
  { name: 'Innovation Design Thinking',   credit: 3, grade: 'A+', note: 'User-centered problem framing. A useful change of pace from pure engineering courses.' },
];


export default function CourseCards() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Fall 2024 Courses</p>
      <div className="space-y-2">
        {COURSES.map(c => (
          <div key={c.name}
            className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setExpanded(expanded === c.name ? null : c.name)}>
            <div className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium truncate">{c.name}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">{c.credit} cr</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">{c.grade}</span>
                <span className="text-zinc-300 dark:text-zinc-600 text-xs">{expanded === c.name ? '▲' : '▼'}</span>
              </div>
            </div>
            {expanded === c.name && (
              <div className="px-4 pb-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2">{c.note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">4.0 GPA · all A+ across every course.</p>
    </div>
  );
}
