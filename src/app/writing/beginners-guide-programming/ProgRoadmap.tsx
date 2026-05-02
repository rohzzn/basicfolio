"use client";
import React, { useState } from 'react';

const STEPS = [
  { phase: 'Foundation',  items: ['Pick one language (Python or JavaScript)', 'Understand variables, loops, and functions', 'Solve 20 small problems on a judge site', 'Build something tiny that you actually use'] },
  { phase: 'Structure',   items: ['Learn data structures (arrays, maps, stacks)', 'Understand how the web works (HTTP, APIs)', 'Use Git for every project from now on', 'Read other people\'s code on GitHub'] },
  { phase: 'Building',    items: ['Build a full CRUD project (frontend + backend)', 'Deploy something publicly accessible', 'Write a README that explains what you made', 'Learn SQL basics'] },
  { phase: 'Growing',     items: ['Contribute to an open-source project', 'Study one computer science topic deeply', 'Build something with a real user', 'Start talking publicly about what you are learning'] },
];

export default function ProgRoadmap() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string>('Foundation');

  const toggle = (id: string) =>
    setDone(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const total = STEPS.reduce((s, p) => s + p.items.length, 0);
  const completed = done.size;

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Learning Roadmap</p>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
          <span>Progress</span>
          <span>{completed} / {total}</span>
        </div>
        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full transition-all duration-300" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      </div>
      <div className="space-y-1">
        {STEPS.map((phase, pi) => {
          const pDone = phase.items.filter(item => done.has(`${pi}-${item}`)).length;
          const isOpen = open === phase.phase;
          return (
            <div key={phase.phase} className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                onClick={() => setOpen(isOpen ? '' : phase.phase)}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${pDone === phase.items.length ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600 text-zinc-400'}`}>
                    {pDone === phase.items.length ? '✓' : pi + 1}
                  </div>
                  <span className="text-sm font-medium dark:text-white">{phase.phase}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{pDone}/{phase.items.length}</span>
                  <span className="text-zinc-300 dark:text-zinc-600 text-xs">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 px-4 py-3 space-y-2">
                  {phase.items.map(item => {
                    const id = `${pi}-${item}`;
                    const checked = done.has(id);
                    return (
                      <label key={item} className="flex items-start gap-3 cursor-pointer group">
                        <div onClick={() => toggle(id)}
                          className={`w-4 h-4 rounded border mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100' : 'border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-500'}`}>
                          {checked && <span className="text-white dark:text-zinc-900 text-[8px] font-bold">✓</span>}
                        </div>
                        <span className={`text-xs leading-relaxed ${checked ? 'text-zinc-400 dark:text-zinc-600 line-through' : 'text-zinc-600 dark:text-zinc-400'}`}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
