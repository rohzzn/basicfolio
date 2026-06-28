'use client';

import React from 'react';
import type { StravaActivity } from '@/lib/activities-types';
import {
  ACTIVITY_LABEL,
  fmtDist,
  fmtPace,
  fmtSpeed,
  fmtTime,
  shortDate,
} from '@/lib/activities-utils';
import PhotoCarousel from './PhotoCarousel';
import RouteMap from './RouteMap';

interface CardioCardProps {
  activity: StravaActivity;
  photoUrls?: string[];
  mapPolyline?: string;
}

export default function CardioCard({
  activity,
  photoUrls: photoUrlsProp,
  mapPolyline,
}: CardioCardProps) {
  const label = ACTIVITY_LABEL[activity.type] ?? activity.type.toLowerCase();
  const [photosFailed, setPhotosFailed] = React.useState(false);

  const fallbackPrimary =
    activity.photos?.primary?.urls?.['600'] ??
    activity.photos?.primary?.urls?.['100'];

  const photoUrls = photoUrlsProp?.length
    ? photoUrlsProp
    : fallbackPrimary
      ? [fallbackPrimary]
      : [];

  const showPhotos = photoUrls.length > 0 && !photosFailed;
  const polyline = mapPolyline ?? activity.map?.summary_polyline ?? '';

  const statParts = [
    activity.distance > 0 && fmtDist(activity.distance),
    activity.moving_time > 0 && fmtTime(activity.moving_time),
    activity.average_speed > 0 &&
      (activity.type === 'Run' || activity.type === 'Walk'
        ? fmtPace(activity.average_speed)
        : fmtSpeed(activity.average_speed)),
    activity.total_elevation_gain > 0 &&
      `${Math.ceil(activity.total_elevation_gain)}m ↑`,
    activity.average_heartrate &&
      `${Math.round(activity.average_heartrate)} bpm avg`,
  ]
    .filter(Boolean)
    .join(' · ');

  if (showPhotos) {
    return (
      <div className="min-w-0 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
        <PhotoCarousel
          images={photoUrls}
          alt={activity.name}
          onAllFailed={() => setPhotosFailed(true)}
        />
      </div>
    );
  }

  if (polyline) {
    return (
      <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
        <RouteMap polyline={polyline} />
        <div className="p-3">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="flex-shrink-0 rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                {label}
              </span>
              <a
                href={`https://www.strava.com/activities/${activity.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                {activity.name}
              </a>
            </div>
            <time className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
              {shortDate(activity.start_date)}
            </time>
          </div>
          {statParts ? (
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{statParts}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="flex-shrink-0 rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            {label}
          </span>
          <a
            href={`https://www.strava.com/activities/${activity.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            {activity.name}
          </a>
        </div>
        <time className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
          {shortDate(activity.start_date)}
        </time>
      </div>
      {statParts ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{statParts}</p>
      ) : null}
    </div>
  );
}
