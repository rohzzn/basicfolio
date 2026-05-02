"use client";
import React, { useState } from 'react';

const COURSES = [
  { name: 'Advanced Algorithms II',          credit: 3, grade: 'A+', note: 'Deep dive into optimization and complexity' },
  { name: 'Network Security',                credit: 3, grade: 'A+', note: 'Hands-on protocols and security concepts' },
  { name: 'Software Testing & QA',           credit: 3, grade: 'A+', note: 'Systematic reliability and test methodology' },
  { name: 'Large Scale Software Engineering',credit: 3, grade: 'A+', note: 'Led a team of 13 through full project lifecycle' },
];

export default function CourseCards() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Spring 2025 Courses</p>
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
              <div className="flex items-center gap-2">
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
