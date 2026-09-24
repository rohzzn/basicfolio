'use client';

import React from 'react';
import type { ActivitiesPayload, StatsPeriod } from '@/lib/activities-types';
import { periodStart } from '@/lib/activities-utils';
import {
  defaultPeriod,
  fmtLb,
  inWindow,
  muscleStats,
  notebook,
  prLifts,
  summarise,
} from '@/lib/move-model';
import BodyMap from './BodyMap';
import StampCalendar from './StampCalendar';
import Notebook from './Notebook';
import PrWall from './PrWall';
import './move.css';

// The gym, from Hevy, drawn rather than charted: what has been trained (a body map), when (a
// stamped calendar), what each session was (a notebook, a page a session), and the best lifts (a
// wall of ribbons). The calendar and the notebook are one: a stamp opens its page, and flipping
// the pages turns the calendar.

const PERIODS: { id: StatsPeriod; label: string; phrase: string }[] = [
  { id: 'week', label: 'Week', phrase: 'this week' },
  { id: 'month', label: 'Month', phrase: 'this month' },
  { id: 'all', label: 'All time', phrase: 'all time' },
];

function pillClass(active: boolean): string {
  return active
    ? 'bg-zinc-900 text-white dark:bg-paper dark:text-neutral-900'
    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-paper';
}

function fmtMinutes(min: number) {
  const h = Math.floor(min / 60);
  return h ? `${h}h ${String(min % 60).padStart(2, '0')}m` : `${min}m`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-neutral-400">{title}</h3>
      {children}
    </section>
  );
}

export default function MovePage() {
  const [payload, setPayload] = React.useState<ActivitiesPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState<StatsPeriod | null>(null);
  const [pageId, setPageId] = React.useState<string | null>(null);
  const [dir, setDir] = React.useState(1);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      let delayMs = 2000;
      while (!cancelled) {
        try {
          const response = await fetch('/api/activities');
          const data = (await response.json()) as ActivitiesPayload & { error?: string };
          if (!cancelled) {
            setPayload(data);
            setLoading(false);
          }
          return;
        } catch {
          if (cancelled) return;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs = Math.min(Math.round(delayMs * 1.5), 30_000);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const workouts = React.useMemo(() => payload?.hevy ?? [], [payload]);
  const activePeriod = period ?? defaultPeriod(workouts);
  const phrase = PERIODS.find((p) => p.id === activePeriod)!.phrase;
  const summary = React.useMemo(
    () => summarise(workouts.filter((w) => inWindow(w, periodStart(activePeriod), null))),
    [workouts, activePeriod]
  );
  const muscles = React.useMemo(() => muscleStats(workouts, activePeriod), [workouts, activePeriod]);
  const pages = React.useMemo(() => notebook(workouts), [workouts]);
  const lifts = React.useMemo(() => prLifts(workouts), [workouts]);

  const index = Math.max(0, pageId ? pages.findIndex((p) => p.id === pageId) : pages.length - 1);
  const page = pages[index];
  const open = (id: string) => {
    const next = pages.findIndex((p) => p.id === id);
    setDir(next >= index ? 1 : -1);
    setPageId(id);
  };
  const flip = (step: number) => {
    const next = Math.min(pages.length - 1, Math.max(0, index + step));
    setDir(step);
    setPageId(pages[next]?.id ?? null);
  };

  const hevyError = payload?.errors.hevy;

  return (
    <div className="move" style={{ maxWidth: '75ch' }}>
      <div className="mb-6">
        <h2 className="text-lg font-medium dark:text-paper">Move</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-neutral-400">Gym workouts from Hevy, in pounds</p>
      </div>

      {hevyError && !loading && (
        <div className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          Gym data unavailable.
        </div>
      )}

      {loading ? (
        <div className="space-y-6" aria-busy>
          <div className="h-6 w-64 animate-pulse rounded bg-zinc-200 dark:bg-neutral-800" />
          <div className="h-72 animate-pulse rounded-lg bg-zinc-100 dark:bg-neutral-900" />
          <div className="h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-neutral-900" />
        </div>
      ) : workouts.length === 0 ? (
        <p className="py-6 text-sm text-zinc-500 dark:text-neutral-400">No workouts logged yet.</p>
      ) : (
        <div className="space-y-14">
          <div>
            <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex gap-1.5">
                {PERIODS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriod(p.id)}
                    aria-pressed={activePeriod === p.id}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${pillClass(activePeriod === p.id)}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-sm tabular-nums text-zinc-600 dark:text-neutral-400">
                {summary.sessions ? (
                  <>
                    {summary.sessions} sessions · {summary.sets.toLocaleString()} sets · {fmtLb(Math.round(summary.volumeLb))} lb moved ·{' '}
                    {fmtMinutes(summary.minutes)}
                  </>
                ) : (
                  <>Nothing logged {phrase}.</>
                )}
              </p>
            </div>
            <Section title={`What I've trained, ${phrase}`}>
              <BodyMap stats={muscles} periodLabel={phrase} />
            </Section>
          </div>

          <Section title="The log">
            <div className="grid items-stretch gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              <StampCalendar pages={pages} selectedId={page?.id ?? null} onSelect={open} />
              {page ? <Notebook page={page} index={index} total={pages.length} dir={dir} onFlip={flip} /> : null}
            </div>
          </Section>

          {lifts.length ? (
            <Section title="Personal records">
              <PrWall lifts={lifts} />
            </Section>
          ) : null}
        </div>
      )}
    </div>
  );
}
