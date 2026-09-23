'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KIND_LABEL, type NotePage } from '@/lib/move-model';
import { KIND_COLOR } from './StampCalendar';

// One session as a page from a lifting notebook: the day at the top, each exercise in
// handwriting, identical sets written once with a tally beside them, and a set heavier than
// anything before it circled in red. The arrows flip the pages.

function Tally({ n }: { n: number }) {
  if (n <= 1) return null;
  if (n > 5) return <span className="ml-1 text-zinc-500 dark:text-neutral-400">×{n}</span>;
  return (
    <svg viewBox={`0 0 ${n * 5 + 4} 14`} height={13} className="ml-1.5 inline-block align-[-1px]" aria-label={`${n} sets`}>
      {Array.from({ length: Math.min(n, 4) }).map((_, i) => (
        <path key={i} d={`M${3 + i * 5} 2 L${2.5 + i * 5} 12`} stroke="var(--move-ink)" strokeWidth={1.3} strokeLinecap="round" />
      ))}
      {n === 5 ? <path d="M0.5 10 L20 3" stroke="var(--move-ink)" strokeWidth={1.3} strokeLinecap="round" /> : null}
    </svg>
  );
}

export default function Notebook({
  page,
  index,
  total,
  dir,
  onFlip,
}: {
  page: NotePage;
  index: number;
  total: number;
  dir: number;
  onFlip: (step: number) => void;
}) {
  const date = page.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <div className="move-sheet move-ruled relative flex min-h-full flex-col overflow-hidden">
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={page.id}
          custom={dir}
          initial={{ opacity: 0, x: dir * 18, rotate: dir * 0.6 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: dir * -18, rotate: dir * -0.6 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="move-hand flex-1 pb-2 pl-9 pr-4 pt-[14px]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="whitespace-nowrap text-[17px] leading-6 text-zinc-900 dark:text-paper">{date}</p>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] leading-6 text-zinc-500 dark:text-neutral-400">
              <span className="h-2.5 w-2.5 rounded-full border border-[color:var(--move-ink)]" style={{ background: KIND_COLOR[page.kind] }} />
              {page.title || KIND_LABEL[page.kind]} · {page.minutes} min
            </span>
          </div>
          <div className="mt-6">
            {page.exercises.map((ex) => (
              <div key={ex.id}>
                <p className="text-[15px] font-medium leading-6 text-zinc-900 dark:text-paper">{ex.title}</p>
                <p className="flex flex-wrap items-center gap-x-4 pl-3 text-[14px] leading-6 text-zinc-700 dark:text-neutral-300">
                  {ex.sets.map((s, i) => (
                    <span key={i} className="inline-flex items-center whitespace-nowrap">
                      <span className={s.pr ? 'move-pr' : ''}>{s.text}</span>
                      <Tally n={s.count} />
                      {s.pr ? <span className="ml-1.5 text-[12px] font-medium text-[#c8473f]">PR</span> : null}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between border-t border-dashed border-[color:var(--move-rule)] px-3 py-1.5 text-xs text-zinc-500 dark:text-neutral-400">
        <button
          type="button"
          onClick={() => onFlip(-1)}
          disabled={index === 0}
          aria-label="Earlier session"
          className="rounded p-1 transition-colors hover:text-zinc-900 disabled:opacity-30 dark:hover:text-paper"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="tabular-nums">
          page {index + 1} of {total}
          {page.prs > 0 ? <span className="text-[#c8473f]"> · {page.prs} PR{page.prs > 1 ? 's' : ''}</span> : null}
        </span>
        <button
          type="button"
          onClick={() => onFlip(1)}
          disabled={index === total - 1}
          aria-label="Later session"
          className="rounded p-1 transition-colors hover:text-zinc-900 disabled:opacity-30 dark:hover:text-paper"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
