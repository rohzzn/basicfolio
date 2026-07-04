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

function cardioStats(activity: StravaActivity): { label: string; value: string }[] {
  const isPaceType = activity.type === 'Run' || activity.type === 'Walk';
  const stats: { label: string; value: string }[] = [];

  if (activity.distance > 0) {
    stats.push({ label: 'Distance', value: fmtDist(activity.distance) });
  }
  if (activity.moving_time > 0) {
    stats.push({ label: 'Time', value: fmtTime(activity.moving_time) });
  }
  if (activity.average_speed > 0) {
    stats.push({
      label: isPaceType ? 'Pace' : 'Speed',
      value: isPaceType ? fmtPace(activity.average_speed) : fmtSpeed(activity.average_speed),
    });
  }
  if (activity.total_elevation_gain > 0) {
    stats.push({
      label: 'Elevation',
      value: `${Math.ceil(activity.total_elevation_gain)} m`,
    });
  }
  if (activity.average_heartrate) {
    stats.push({
      label: 'Avg HR',
      value: `${Math.round(activity.average_heartrate)} bpm`,
    });
  }

  return stats;
}

function CardioStatsGrid({ activity }: { activity: StravaActivity }) {
  const stats = cardioStats(activity);
  if (stats.length === 0) return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-zinc-100 dark:border-zinc-800 sm:grid-cols-3">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-zinc-50 px-2.5 py-2 dark:bg-zinc-900/50">
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-0.5 text-xs font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function CardioCardBody({
  activity,
  label,
}: {
  activity: StravaActivity;
  label: string;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="flex-shrink-0 rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-800 dark:text-zinc-400">
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
        <time className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-400">
          {shortDate(activity.start_date)}
        </time>
      </div>
      <CardioStatsGrid activity={activity} />
    </>
  );
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

  if (showPhotos) {
    return (
      <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
        <PhotoCarousel
          images={photoUrls}
          alt={activity.name}
          onAllFailed={() => setPhotosFailed(true)}
        />
        <div className="p-3">
          <CardioCardBody activity={activity} label={label} />
        </div>
      </div>
    );
  }

  if (polyline) {
    return (
      <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
        <RouteMap polyline={polyline} />
        <div className="p-3">
          <CardioCardBody activity={activity} label={label} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
      <CardioCardBody activity={activity} label={label} />
    </div>
  );
}
