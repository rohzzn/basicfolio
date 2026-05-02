"use client";
import React, { useState } from 'react';

const PRINCIPLES = [
  {
    name: 'Contrast',
    description: 'Make things that are different look different. Hierarchy comes from contrast in size, weight, and color.',
    demo: (
      <div className="flex flex-col gap-2">
        <p className="text-base font-bold dark:text-white">Main heading</p>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subheading</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Body text that supports the heading above it.</p>
      </div>
    ),
  },
  {
    name: 'White Space',
    description: 'Empty space is not wasted space. It separates elements, improves readability, and makes content feel intentional.',
    demo: (
      <div className="flex gap-2">
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded p-1 text-[9px] text-zinc-400 text-center leading-tight">Cramped<br/>no space<br/>everything<br/>together</div>
        <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded p-4 flex items-center justify-center">
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Breathing room</span>
        </div>
      </div>
    ),
  },
  {
    name: 'Alignment',
    description: 'Every element should be visually connected to something else. Random placement creates visual noise.',
    demo: (
      <div className="space-y-1.5">
        {['Name', 'Email', 'Message'].map(label => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 w-14 text-right">{label}</span>
            <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    ),
  },
  {
    name: 'Repetition',
    description: 'Repeating visual elements creates consistency. A design system is just documented repetition.',
    demo: (
      <div className="flex gap-2 flex-wrap">
        {['Primary', 'Secondary', 'Danger'].map((label, i) => (
          <div key={label} className={`px-3 py-1.5 rounded text-xs font-medium ${i === 0 ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : i === 1 ? 'border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400' : 'bg-red-500 text-white'}`}>
            {label}
          </div>
        ))}
      </div>
    ),
  },
];

const TOOLS = [
  { name: 'Figma',        use: 'UI design, prototyping, and design systems',       level: 'Start here' },
  { name: 'Coolors',      use: 'Colour palette generation',                        level: 'Immediately useful' },
  { name: 'Google Fonts', use: 'Free typefaces for every project',                 level: 'Use always' },
  { name: 'Mobbin',       use: 'Real-world UI pattern library for reference',      level: 'For inspiration' },
  { name: 'Stark',        use: 'Accessibility checker built into Figma',           level: 'Before shipping' },
];

export default function DesignShowcase() {
  const [tab, setTab] = useState<'principles' | 'tools'>('principles');
  const [active, setActive] = useState(0);

  return (
    <div className="my-8 not-prose">
      <div className="flex gap-1 mb-4">
        {(['principles', 'tools'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors capitalize ${tab === t ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
            {t === 'principles' ? 'Core Principles' : 'Essential Tools'}
          </button>
        ))}
      </div>

      {tab === 'principles' && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            {PRINCIPLES.map((p, i) => (
              <button key={p.name} onClick={() => setActive(i)}
                className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium border-r border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors ${active === i ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="p-4">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">{PRINCIPLES[active].description}</p>
            <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
              {PRINCIPLES[active].demo}
            </div>
          </div>
        </div>
      )}

      {tab === 'tools' && (
        <div className="space-y-2">
          {TOOLS.map(t => (
            <div key={t.name} className="flex items-start justify-between p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
              <div>
                <p className="text-xs font-medium dark:text-white">{t.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{t.use}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex-shrink-0 ml-3">
                {t.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
