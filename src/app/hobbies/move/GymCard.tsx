'use client';

import React from 'react';
import type { HevyWorkout } from '@/lib/activities-types';
import {
  calcWorkoutVolume,
  fmtDur,
  fmtVolume,
  shortDate,
} from '@/lib/activities-utils';
import PhotoCarousel from './PhotoCarousel';

interface GymCardProps {
  workout: HevyWorkout;
  stravaPhotoUrls?: string[];
}

export default function GymCard({ workout, stravaPhotoUrls }: GymCardProps) {
  const workoutVolume = calcWorkoutVolume(workout);
  const [photosFailed, setPhotosFailed] = React.useState(false);

  const hevyImages = [
    ...(workout.images ?? []).map(img => img.url),
    ...(workout.image_urls ?? []),
  ].slice(0, 9);

  const carouselImages = [...(stravaPhotoUrls ?? []), ...hevyImages];
  const hasStravaPhotos =
    (stravaPhotoUrls?.length ?? 0) > 0 && !photosFailed;
  const showCarousel = carouselImages.length > 0 && !photosFailed;

  const gymMeta = (
    <p className="mt-1 text-xs text-zinc-500 dark:text-neutral-400">
      {fmtDur(workout.start_time, workout.end_time)} · {workout.exercises.length}{' '}
      exercise{workout.exercises.length !== 1 ? 's' : ''}
      {workoutVolume > 0 && ` · ${fmtVolume(workoutVolume)}`}
    </p>
  );

  const exerciseBlock = (
    <div className="mt-2 space-y-1.5 border-t border-zinc-100 pt-2 dark:border-neutral-800">
      {workout.exercises.map(ex => {
        const exVol = ex.sets.reduce(
          (s, set) => s + (set.weight_kg ?? 0) * (set.reps ?? 0),
          0
        );
        return (
          <div key={ex.id} className="flex min-w-0 items-baseline justify-between gap-2">
            <span className="truncate text-xs font-medium text-zinc-600 dark:text-neutral-400">
              {ex.title}
            </span>
            <span className="flex-shrink-0 tabular-nums text-xs text-zinc-400 dark:text-neutral-400">
              {ex.sets.length} {ex.sets.length === 1 ? 'set' : 'sets'}
              {exVol > 0 && ` · ${Math.round(exVol).toLocaleString()} kg`}
            </span>
          </div>
        );
      })}
    </div>
  );

  const titleNode =
    hasStravaPhotos && workout.matchedStrava ? (
      <a
        href={`https://www.strava.com/activities/${workout.matchedStrava.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-neutral-300 dark:hover:text-paper"
      >
        {workout.title}
      </a>
    ) : (
      <span className="truncate text-sm font-medium text-zinc-700 dark:text-neutral-300">
        {workout.title}
      </span>
    );

  const header = (
    <div className="flex items-baseline justify-between gap-2">
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="flex-shrink-0 rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-neutral-800 dark:text-neutral-400">
          gym
        </span>
        {titleNode}
      </div>
      <time className="flex-shrink-0 text-xs text-zinc-400 dark:text-neutral-400">
        {shortDate(workout.start_time)}
      </time>
    </div>
  );

  if (showCarousel) {
    return (
      <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 dark:border-neutral-800">
        <PhotoCarousel
          images={carouselImages}
          alt={workout.title}
          onAllFailed={() => setPhotosFailed(true)}
        />
        <div className="p-3">
          {header}
          {gymMeta}
          {exerciseBlock}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 dark:border-neutral-800">
      <div className="p-3">
        {header}
        {gymMeta}
        {exerciseBlock}
      </div>
    </div>
  );
}
