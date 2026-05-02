"use client";
import React, { useState } from 'react';

const MILESTONES = [
  {
    date: 'Nov 2023',
    emoji: '📝',
    title: 'Started applications',
    detail: 'Submitted to 3 universities. GRE, IELTS, LORs, SOP — the full stack of grad school paperwork.',
  },
  {
    date: 'Jan 2024',
    emoji: '📬',
    title: 'UC acceptance',
    detail: 'Got into University of Cincinnati Master of Engineering in Computer Science. Decided to go.',
  },
  {
    date: 'Apr 2024',
    emoji: '🛂',
    title: 'F-1 visa approved',
    detail: 'US consulate interview in Hyderabad. The interview lasts 90 seconds. The wait outside lasts 4 hours.',
  },
  {
    date: 'Jun 2024',
    emoji: '🎓',
    title: 'Graduated from MREC',
    detail: 'Bachelor of Technology in Computer Science. Four years in Hell, done.',
  },
  {
    date: 'Jul 2024',
    emoji: '🧳',
    title: 'The packing problem',
    detail: 'Two checked bags, 23kg each. Deciding what to leave behind after 23 years of accumulation.',
  },
  {
    date: 'Aug 1, 2024',
    emoji: '✈️',
    title: 'Hyderabad → Cincinnati',
    detail: 'HYD → DOH → PHI → CVG. 26 hours of travel. Landed at midnight in the wrong time zone.',
  },
  {
    date: 'Aug 2024',
    emoji: '🏠',
    title: 'Finding housing',
    detail: 'Spent the first week at a hostel while hunting for an apartment in Clifton. Learned what a security deposit is the hard way.',
  },
  {
    date: 'Aug 2024',
    emoji: '🏛️',
    title: 'First day at UC',
    detail: 'Orientation, ID card, library card, bus pass. Everyone asks where you are from.',
  },
];

export default function MoveTimeline() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const dist = Math.round(8748); // HYD to CVG approx km

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">The Journey</p>
      <div className="flex gap-4 mb-5 flex-wrap">
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-3 flex-1 min-w-28">
          <p className="text-lg font-bold dark:text-white">{dist.toLocaleString()}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">km from Hyderabad</p>
        </div>
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-3 flex-1 min-w-28">
          <p className="text-lg font-bold dark:text-white">+10:30</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">hrs time zone change</p>
        </div>
        <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg px-4 py-3 flex-1 min-w-28">
          <p className="text-lg font-bold dark:text-white">26</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">hrs of travel</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[22px] top-3 bottom-3 w-px bg-zinc-100 dark:bg-zinc-800" />
        <div className="space-y-2">
          {MILESTONES.map((m, i) => (
            <div key={i} className="flex gap-4 relative"
              onClick={() => setExpanded(expanded === m.title ? null : m.title)}>
              <div className="w-10 flex-shrink-0 flex flex-col items-center pt-3 z-10">
                <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-base">
                  {m.emoji}
                </div>
              </div>
              <div className={`flex-1 border rounded-lg overflow-hidden cursor-pointer transition-colors ${expanded === m.title ? 'border-zinc-200 dark:border-zinc-600' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'}`}>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">{m.date}</span>
                    <span className="text-xs font-medium dark:text-white">{m.title}</span>
                  </div>
                  <span className="text-zinc-300 dark:text-zinc-600 text-[10px]">{expanded === m.title ? '▲' : '▼'}</span>
                </div>
                {expanded === m.title && (
                  <div className="px-3 pb-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 leading-relaxed">{m.detail}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
