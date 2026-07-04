'use client';

import React from 'react';
import type { CombinedActivity } from '@/lib/activities-types';
import { buildHeatmapWeeks, heatmapLevel } from '@/lib/activities-utils';

const LEVEL_CLASS = [
  'bg-zinc-100 dark:bg-neutral-800/80',
  'bg-zinc-300 dark:bg-neutral-600',
  'bg-zinc-400 dark:bg-neutral-500',
  'bg-zinc-500 dark:bg-neutral-400',
  'bg-zinc-700 dark:bg-neutral-300',
];

interface ActivityHeatmapProps {
  activities: CombinedActivity[];
}

export default function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const weeks = React.useMemo(() => buildHeatmapWeeks(activities, 52), [activities]);
  const total = activities.length;

  return (
    <div className="mb-8 rounded-lg border border-zinc-100 p-4 dark:border-neutral-800">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-neutral-400">
          Activity
        </p>
        <p className="text-xs tabular-nums text-zinc-400 dark:text-neutral-400">
          {total.toLocaleString()} sessions · last 52 weeks
        </p>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={week[0]?.key ?? weekIndex} className="flex flex-col gap-[3px]">
              {week.map(day => (
                <div
                  key={day.key}
                  title={`${day.label}: ${day.count} ${day.count === 1 ? 'session' : 'sessions'}`}
                  className={`h-[11px] w-[11px] rounded-sm ${LEVEL_CLASS[heatmapLevel(day.count)]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-zinc-400 dark:text-neutral-400">Less</span>
        {LEVEL_CLASS.map((cls, i) => (
          <div key={i} className={`h-[11px] w-[11px] rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-zinc-400 dark:text-neutral-400">More</span>
      </div>
    </div>
  );
}
