'use client';

import React from 'react';
import type { ActivitiesPayload, StatsPeriod } from '@/lib/activities-types';
import {
  combineActivities,
  computeStats,
  fmtTime,
  fmtVolume,
  monthGroupLabel,
} from '@/lib/activities-utils';
import ActivityHeatmap from './ActivityHeatmap';
import GymCard from './GymCard';

const PERIODS: { id: StatsPeriod; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All time' },
];

function pillClass(active: boolean): string {
  return active
    ? 'bg-zinc-900 text-white dark:bg-paper dark:text-neutral-900'
    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-paper';
}

export default function MovePage() {
  const [payload, setPayload] = React.useState<ActivitiesPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState<StatsPeriod>('month');

  React.useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
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
    }

    void loadActivities();

    return () => {
      cancelled = true;
    };
  }, []);

  const allActivities = React.useMemo(() => {
    if (!payload) return [];
    return combineActivities(payload.hevy);
  }, [payload]);

  const groupedActivities = React.useMemo(() => {
    const groups: { label: string; items: typeof allActivities }[] = [];
    let currentLabel = '';

    for (const item of allActivities) {
      const label = monthGroupLabel(item.date);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    }

    return groups;
  }, [allActivities]);

  const stats = React.useMemo(
    () => computeStats(allActivities, period),
    [allActivities, period]
  );

  const hevyError = payload?.errors.hevy;
  const showEmpty = !loading && allActivities.length === 0;

  const statCards = [
    {
      label: 'Sessions',
      value: stats.gymSessions > 0 ? stats.gymSessions.toLocaleString() : '—',
    },
    {
      label: 'Volume',
      value: stats.gymVolume > 0 ? fmtVolume(stats.gymVolume) : '—',
    },
    {
      label: 'Sets',
      value: stats.gymSets > 0 ? stats.gymSets.toLocaleString() : '—',
    },
    {
      label: 'Active time',
      value: stats.activeTimeSec > 0 ? fmtTime(stats.activeTimeSec) : '—',
    },
  ];

  return (
    <div style={{ maxWidth: '75ch' }}>
      <div className="mb-6">
        <h2 className="text-lg font-medium dark:text-paper">Move</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-neutral-400">
          Gym workouts from Hevy
        </p>
      </div>

      {hevyError && !loading && (
        <div className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          Gym data unavailable.
        </div>
      )}

      {!loading && allActivities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${pillClass(period === p.id)}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {!loading && (
        <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-zinc-100 dark:border-neutral-800 sm:grid-cols-4">
          {statCards.map(({ label, value }) => (
            <div key={label} className="bg-zinc-50 p-3 dark:bg-neutral-900/50">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-400 dark:text-neutral-400">
                {label}
              </p>
              <p className="text-sm font-medium tabular-nums leading-snug dark:text-paper sm:text-base">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && allActivities.length > 0 && (
        <ActivityHeatmap activities={allActivities} />
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-w-0 animate-pulse overflow-hidden rounded-lg border border-zinc-100 p-3 dark:border-neutral-800"
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <div className="h-4 w-8 rounded bg-zinc-200 dark:bg-neutral-700" />
                    <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-neutral-700" />
                  </div>
                  <div className="h-3 w-10 rounded bg-zinc-200 dark:bg-neutral-700" />
                </div>
                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-neutral-700" />
              </div>
            </div>
          ))}
        </div>
      ) : showEmpty ? (
        <p className="py-6 text-sm text-zinc-500 dark:text-neutral-400">
          No workouts logged yet.
        </p>
      ) : (
        <div className="space-y-10">
          {groupedActivities.map((group) => (
            <section key={group.label}>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-neutral-400">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.items.map((item) => {
                  if (!item.gymWorkout) return null;
                  return <GymCard key={item.id} workout={item.gymWorkout} />;
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
