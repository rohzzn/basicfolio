'use client';

import React from 'react';
import type {
  ActivitiesPayload,
  CombinedActivity,
  StatsPeriod,
} from '@/lib/activities-types';
import {
  combineActivities,
  computeStats,
  fmtDist,
  fmtTime,
  fmtVolume,
  monthGroupLabel,
  collectStravaPhotoIds,
} from '@/lib/activities-utils';
import ActivityHeatmap from './ActivityHeatmap';
import CardioCard from './CardioCard';
import GymCard from './GymCard';

type StravaPhotoMap = Record<
  number,
  { urls: string[]; map?: { summary_polyline: string } }
>;

const PERIODS: { id: StatsPeriod; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All time' },
];

function pillClass(active: boolean): string {
  return active
    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white';
}

export default function MovePage() {
  const [payload, setPayload] = React.useState<ActivitiesPayload | null>(null);
  const [photos, setPhotos] = React.useState<StravaPhotoMap>({});
  const [loading, setLoading] = React.useState(true);
  const [fatalError, setFatalError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState<StatsPeriod>('month');

  React.useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    fetch('/api/activities', { signal: controller.signal })
      .then(async r => {
        const data = await r.json();
        if (!r.ok && !data.strava && !data.hevy) {
          throw new Error(data.error ?? `HTTP ${r.status}`);
        }
        return data as ActivitiesPayload;
      })
      .then(setPayload)
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') {
          setFatalError('Activities took too long to load. Try refreshing.');
        } else {
          setFatalError(err instanceof Error ? err.message : 'Failed to load activities');
        }
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  React.useEffect(() => {
    if (!payload) return;

    let cancelled = false;
    const ids = collectStravaPhotoIds(payload);
    if (ids.length === 0) return;

    async function loadAllPhotos() {
      const CHUNK = 6;
      const DELAY_MS = 1200;

      for (let i = 0; i < ids.length; i += CHUNK) {
        if (cancelled) break;

        const chunk = ids.slice(i, i + CHUNK);
        try {
          const res = await fetch('/api/activities/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: chunk }),
          });
          if (!res.ok) continue;
          const data = (await res.json()) as { photos?: StravaPhotoMap };
          if (cancelled || !data.photos) continue;
          setPhotos(prev => ({ ...prev, ...data.photos }));
        } catch {
          // keep going with next chunk
        }

        if (i + CHUNK < ids.length && !cancelled) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }
    }

    loadAllPhotos();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  const allActivities = React.useMemo(() => {
    if (!payload) return [];
    return combineActivities(payload.strava, payload.hevy);
  }, [payload]);

  const groupedActivities = React.useMemo(() => {
    const groups: { label: string; items: CombinedActivity[] }[] = [];
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

  const partialError = payload?.errors.strava || payload?.errors.hevy;
  const showEmpty = !loading && allActivities.length === 0;

  if (fatalError) {
    return (
      <div style={{ maxWidth: '75ch' }}>
        <h2 className="mb-6 text-lg font-medium dark:text-white">Move</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{fatalError}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Cardio',
      value:
        stats.runCount > 0
          ? `${fmtDist(stats.runDistance)} · ${stats.runCount} runs`
          : fmtTime(stats.cardioTime) || '—',
    },
    {
      label: 'Gym',
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
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-medium dark:text-white">Move</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Runs, rides, lifts
        </p>
      </div>

      {partialError && !loading && (
        <div className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          {payload?.errors.strava && 'Cardio data unavailable. '}
          {payload?.errors.hevy && 'Gym data unavailable.'}
        </div>
      )}

      {/* Period toggle */}
      {!loading && allActivities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {PERIODS.map(p => (
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

      {/* Stats strip */}
      {!loading && (
        <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800 sm:grid-cols-4">
          {statCards.map(({ label, value }) => (
            <div key={label} className="bg-zinc-50 p-3 dark:bg-zinc-900/50">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {label}
              </p>
              <p className="text-sm font-medium tabular-nums leading-snug dark:text-white sm:text-base">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Heatmap */}
      {!loading && allActivities.length > 0 && (
        <ActivityHeatmap activities={allActivities} />
      )}

      {/* Feed */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-w-0 animate-pulse overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800"
            >
              <div className="h-44 bg-zinc-100 dark:bg-zinc-800" />
              <div className="space-y-2 p-3">
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <div className="h-4 w-8 rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                  <div className="h-3 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
                <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      ) : showEmpty ? (
        <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
          No activities logged yet.
        </p>
      ) : (
        <div className="space-y-10">
          {groupedActivities.map(group => (
            <section key={group.label}>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {group.items.map(item => {
                  if (item.type === 'cardio' && item.stravaActivity) {
                    const photo = photos[item.stravaActivity.id];
                    return (
                      <CardioCard
                        key={item.id}
                        activity={item.stravaActivity}
                        photoUrls={photo?.urls}
                        mapPolyline={photo?.map?.summary_polyline}
                      />
                    );
                  }
                  if (item.type === 'gym' && item.gymWorkout) {
                    const stravaId = item.gymWorkout.matchedStrava?.id;
                    const photo = stravaId ? photos[stravaId] : undefined;
                    return (
                      <GymCard
                        key={item.id}
                        workout={item.gymWorkout}
                        stravaPhotoUrls={photo?.urls}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
