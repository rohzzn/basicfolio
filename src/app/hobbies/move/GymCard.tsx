'use client';

import React from 'react';
import type { HevyWorkout } from '@/lib/activities-types';
import {
  deltaColorClass,
  type WorkoutCardModel,
} from '@/lib/move-workout-analytics';
import { fmtDur, fmtVolume, shortDate } from '@/lib/activities-utils';

interface GymCardProps {
  workout: HevyWorkout;
  model: WorkoutCardModel;
}

export default function GymCard({ workout, model }: GymCardProps) {
  return (
    <article className="rounded-lg border border-zinc-100 dark:border-neutral-800">
      <div className="space-y-4 p-4 sm:p-5">
        <header className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-paper">
                {workout.title}
              </h4>
              {model.prLabel && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-neutral-400">
                  {model.prLabel}
                </span>
              )}
            </div>
            <time className="shrink-0 text-xs text-zinc-500 dark:text-neutral-400">
              {shortDate(workout.start_time)}
            </time>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <div>
              <p className="text-2xl font-semibold tabular-nums leading-none text-zinc-900 dark:text-paper">
                {model.volume > 0 ? fmtVolume(model.volume) : '—'}
              </p>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-neutral-400">
                {fmtDur(workout.start_time, workout.end_time)}
              </p>
            </div>
            {model.sessionDelta.text && (
              <p
                className={`text-xs tabular-nums ${deltaColorClass(model.sessionDelta.direction)}`}
              >
                {model.sessionDelta.text}
              </p>
            )}
          </div>

          {model.muscleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {model.muscleTags.map((tag) => (
                <span
                  key={tag.label}
                  className="bg-zinc-200/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:bg-neutral-800/80 dark:text-neutral-400"
                >
                  {tag.label}
                  {tag.primary ? ' — primary' : ''}
                </span>
              ))}
            </div>
          )}
        </header>

        {model.exercises.length > 0 && (
          <div className="space-y-2.5 border-t border-zinc-100 pt-4 dark:border-neutral-800">
            {model.exercises.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-x-3 gap-y-0.5 sm:grid-cols-[minmax(0,9rem)_1fr_auto]"
              >
                <span className="truncate text-xs text-zinc-700 dark:text-neutral-300">
                  {row.title}
                </span>
                <div className="h-2 min-w-0 bg-zinc-200/70 dark:bg-neutral-800">
                  {row.barPct > 0 && (
                    <div
                      className="h-full bg-zinc-800 dark:bg-neutral-300"
                      style={{ width: `${row.barPct}%` }}
                    />
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
                  {row.volume > 0 && (
                    <span className="text-xs tabular-nums text-zinc-700 dark:text-neutral-300">
                      {Math.round(row.volume).toLocaleString()} kg
                    </span>
                  )}
                  {row.delta.text && (
                    <span
                      className={`text-[10px] tabular-nums ${deltaColorClass(row.delta.direction)}`}
                    >
                      {row.delta.text}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
