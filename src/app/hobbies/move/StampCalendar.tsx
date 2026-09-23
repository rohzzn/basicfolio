'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { KIND_LABEL, type DayKind, type NotePage } from '@/lib/move-model';

// A paper wall calendar, one month at a time, with an ink stamp on every day there was a session,
// coloured by the kind of day it was. Clicking a stamp opens that session in the notebook beside
// it; flipping the notebook to another month turns the calendar with it.

export const KIND_COLOR: Record<DayKind, string> = {
  push: '#c8473f',
  pull: '#2b5fb8',
  legs: '#e8c84a',
  other: '#91906a',
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

function hashOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

function Stamp({ kind, seed }: { kind: DayKind; seed: string }) {
  const turn = (hashOf(seed) - 0.5) * 24;
  return (
    <svg viewBox="0 0 32 32" className="move-stamp absolute inset-0 m-auto h-[78%] w-[78%]" aria-hidden>
      <g transform={`rotate(${turn} 16 16)`}>
        <circle cx={16} cy={16} r={13} fill={KIND_COLOR[kind]} stroke="var(--move-ink)" strokeWidth={1.3} opacity={0.9} />
        <circle cx={16} cy={16} r={9} fill="none" stroke="var(--move-paper)" strokeWidth={1} strokeDasharray="2 2" />
      </g>
    </svg>
  );
}

export default function StampCalendar({
  pages,
  selectedId,
  onSelect,
}: {
  pages: NotePage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const byDay = useMemo(() => {
    const m = new Map<string, NotePage[]>();
    for (const p of pages) m.set(dayKey(p.date), [...(m.get(dayKey(p.date)) ?? []), p]);
    return m;
  }, [pages]);
  const selected = pages.find((p) => p.id === selectedId) ?? pages[pages.length - 1];
  const first = pages[0] ? monthIndex(pages[0].date) : monthIndex(new Date());
  const last = pages.length ? monthIndex(pages[pages.length - 1].date) : first;
  const [month, setMonth] = useState(() => (selected ? monthIndex(selected.date) : last));

  // the notebook turned to another month: follow it
  useEffect(() => {
    if (selected) setMonth(monthIndex(selected.date));
  }, [selected]);

  const year = Math.floor(month / 12);
  const m = month % 12;
  const start = new Date(year, m, 1);
  const days = new Date(year, m + 1, 0).getDate();
  const lead = (start.getDay() + 6) % 7; // Monday first
  const today = dayKey(new Date());
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const kinds = new Map<DayKind, number>();
  for (let d = 1; d <= days; d++)
    for (const p of byDay.get(dayKey(new Date(year, m, d))) ?? []) kinds.set(p.kind, (kinds.get(p.kind) ?? 0) + 1);

  return (
    <div className="move-sheet overflow-hidden">
      <div className="move-sheet-head flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={() => setMonth((v) => Math.max(first, v - 1))}
          disabled={month <= first}
          aria-label="Previous month"
          className="rounded p-0.5 text-[#fffdf7] transition-opacity disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-[#fffdf7]">
          {start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={() => setMonth((v) => Math.min(last, v + 1))}
          disabled={month >= last}
          aria-label="Next month"
          className="rounded p-0.5 text-[#fffdf7] transition-opacity disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 px-2 pb-1 pt-2 text-center text-[11px] text-zinc-500 dark:text-neutral-400">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-2">
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const key = dayKey(new Date(year, m, d));
          const here = byDay.get(key);
          const isSel = !!here?.some((p) => p.id === selected?.id);
          const label = `${new Date(year, m, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
          const inner = (
            <>
              {here ? <Stamp kind={here[0].kind} seed={key} /> : null}
              <span
                className={`absolute left-1 top-0.5 text-[11px] leading-none ${
                  here ? 'text-[#24232e] mix-blend-multiply dark:text-[#fffdf7] dark:mix-blend-normal' : 'text-zinc-400 dark:text-neutral-500'
                }`}
              >
                {d}
              </span>
            </>
          );
          const ring = isSel ? 'move-cal-selected' : key === today ? 'move-cal-today' : '';
          return here ? (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(here[0].id)}
              aria-label={`${label}, ${here.map((p) => p.title).join(' and ')}`}
              aria-pressed={isSel}
              className={`relative aspect-square rounded-md transition-transform hover:-rotate-3 hover:scale-105 ${ring}`}
            >
              {inner}
            </button>
          ) : (
            <span key={i} className={`relative aspect-square rounded-md ${ring}`}>
              {inner}
            </span>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-dashed border-[color:var(--move-rule)] px-3 py-2 text-xs text-zinc-600 dark:text-neutral-400">
        {(['push', 'pull', 'legs', 'other'] as DayKind[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-[color:var(--move-ink)]" style={{ background: KIND_COLOR[k] }} />
            {KIND_LABEL[k]}
            <span className="tabular-nums text-zinc-400 dark:text-neutral-500">{kinds.get(k) ?? 0}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
