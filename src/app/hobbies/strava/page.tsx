"use client";
import React, { useState } from 'react';
import { decode } from '@mapbox/polyline';

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  calories?: number;
  achievement_count?: number;
  kudos_count?: number;
  athlete_count?: number;
  map?: { summary_polyline: string };
  photos?: {
    primary?: { urls: { '100': string; '600': string } };
    count: number;
    use_primary_photo?: boolean;
  };
  total_photo_count?: number;
}

interface ExerciseSet {
  index: number;
  set_type: string;
  weight_kg?: number;
  reps?: number;
  distance_meters?: number;
  duration_seconds?: number;
}

interface Exercise {
  id: string;
  title: string;
  notes?: string;
  exercise_template_id: string;
  superset_id?: string | null;
  sets: ExerciseSet[];
}

interface WorkoutImage {
  id: string;
  url: string;
}

interface Workout {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  exercises: Exercise[];
  images?: WorkoutImage[];
  image_urls?: string[];
}

interface HevyResponse {
  page: number;
  page_count: number;
  workouts: Workout[];
}

type CombinedActivity = {
  id: string;
  type: 'cardio' | 'gym';
  date: string;
  stravaActivity?: StravaActivity;
  gymWorkout?: Workout;
};

const calculateCalories = (activity: StravaActivity): number => {
  if (activity.calories) return activity.calories;
  const hours = activity.moving_time / 3600;
  switch (activity.type) {
    case 'Run': return Math.round(hours * 600);
    case 'Ride': return Math.round(hours * 500);
    case 'Swim': return Math.round(hours * 550);
    case 'Walk': return Math.round(hours * 300);
    case 'Hike': return Math.round(hours * 400);
    case 'Workout': return Math.round(hours * 450);
    default: return Math.round(hours * 350);
  }
};

// Route map SVG rendered from polyline
const RouteMap: React.FC<{ polyline: string }> = ({ polyline }) => {
  const points = decode(polyline);
  if (points.length < 2) return null;

  const lats = points.map(p => p[0]);
  const lngs = points.map(p => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.001;
  const lngRange = maxLng - minLng || 0.001;
  const W = 500, H = 160, pad = 24;

  const toXY = (lat: number, lng: number) => [
    pad + ((lng - minLng) / lngRange) * (W - 2 * pad),
    pad + ((maxLat - lat) / latRange) * (H - 2 * pad),
  ];

  const d = points
    .map(([lat, lng], i) => {
      const [x, y] = toXY(lat, lng);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const [sx, sy] = toXY(points[0][0], points[0][1]);
  const [ex, ey] = toXY(points[points.length - 1][0], points[points.length - 1][1]);

  return (
    <div className="bg-zinc-100 dark:bg-zinc-800/60 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
        <path
          d={d}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-zinc-600 dark:stroke-zinc-300"
        />
        <circle cx={sx} cy={sy} r="4" className="fill-zinc-500 dark:fill-zinc-400" />
        <circle cx={ex} cy={ey} r="4" className="fill-zinc-700 dark:fill-zinc-200" />
      </svg>
    </div>
  );
};

const ACTIVITY_LABEL: Record<string, string> = {
  Run: 'run', VirtualRun: 'run',
  Ride: 'ride', VirtualRide: 'ride',
  Swim: 'swim', Walk: 'walk', Hike: 'hike',
  WeightTraining: 'gym', Workout: 'gym',
};

/** Strava list/detail flow is reliable for ~30d; wider windows hit limits and bad responses. */
const ACTIVITIES_LOOKBACK_DAYS = 30;

/** Full-width activity media: natural aspect, no crop; scales only with card width. */
const ACTIVITY_MEDIA_IMG = 'block h-auto w-full max-w-full object-contain';

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStravaData = async (daysAgo: number) => {
    try {
      if (
        !process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ||
        !process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET ||
        !process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN
      ) {
        throw new Error('Strava API credentials not configured');
      }

      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
          refresh_token: process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) throw new Error('Failed to get access token');

      const timestamp = Math.floor((Date.now() - daysAgo * 24 * 60 * 60 * 1000) / 1000);
      const activitiesRes = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=200&after=${timestamp}`,
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );

      const activitiesData = await activitiesRes.json();
      if (!Array.isArray(activitiesData)) throw new Error('Invalid response from Strava API');

      const sorted = [...activitiesData].sort(
        (a: StravaActivity, b: StravaActivity) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );

      // Fetch detailed data (includes photos) for each activity
      const withPhotos = await Promise.all(
        sorted.map(async activity => {
          try {
            const res = await fetch(
              `https://www.strava.com/api/v3/activities/${activity.id}?include_all_efforts=false`,
              { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
            );
            if (!res.ok) return activity;
            const detail = await res.json();
            return { ...activity, photos: detail.photos, total_photo_count: detail.total_photo_count };
          } catch {
            return activity;
          }
        })
      );

      setActivities(withPhotos);
    } catch (err) {
      console.error('Strava error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Strava data');
    }
  };

  const fetchHevyData = async (daysAgo: number) => {
    try {
      const response = await fetch('/api/hevy/workouts');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: HevyResponse = await response.json();
      const cutoff = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      setWorkouts(data.workouts.filter(w => new Date(w.start_time) >= cutoff));
    } catch (err) {
      console.error('Hevy error:', err);
    }
  };

  React.useEffect(() => {
    setActivities([]);
    setWorkouts([]);
    setLoading(true);
    Promise.all([
      fetchStravaData(ACTIVITIES_LOOKBACK_DAYS),
      fetchHevyData(ACTIVITIES_LOOKBACK_DAYS),
    ]).finally(() => setLoading(false));
  }, []);

  const combinedActivities = React.useMemo(() => {
    const combined: CombinedActivity[] = [
      ...activities.map(a => ({ id: `strava-${a.id}`, type: 'cardio' as const, date: a.start_date, stravaActivity: a })),
      ...workouts.map(w => ({ id: `gym-${w.id}`, type: 'gym' as const, date: w.start_time, gymWorkout: w })),
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, workouts]);

  const gymStats = React.useMemo(() => {
    let totalDuration = 0;
    let totalSets = 0;
    workouts.forEach(w => {
      totalDuration += new Date(w.end_time).getTime() - new Date(w.start_time).getTime();
      w.exercises.forEach(ex => {
        totalSets += ex.sets.length;
      });
    });
    return {
      totalWorkouts: workouts.length,
      totalSets,
      totalDuration: Math.ceil(totalDuration / 60000),
    };
  }, [workouts]);

  const stravaStats = React.useMemo(() => ({
    totalDistance: activities.reduce((s, a) => s + a.distance, 0),
    totalTime: activities.reduce((s, a) => s + a.moving_time, 0),
    totalCalories: activities.reduce((s, a) => s + calculateCalories(a), 0),
  }), [activities]);

  const fmtDist = (m: number) => { const km = m / 1000; return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`; };
  const fmtPace = (mps: number) => { const mpk = 1000 / mps / 60; const min = Math.floor(mpk); const sec = Math.round((mpk - min) * 60); return `${min}:${sec.toString().padStart(2, '0')}/km`; };
  const fmtSpeed = (mps: number) => `${(mps * 3.6).toFixed(1)} km/h`;
  const fmtTime = (sec: number) => { const h = Math.floor(sec / 3600); const m = Math.floor((sec % 3600) / 60); return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`; };
  const fmtDur = (start: string, end: string) => { const min = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 60000); const h = Math.floor(min / 60); return h > 0 ? `${h}h ${min % 60}m` : `${min}m`; };
  const shortDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (error) {
    return (
      <div style={{ maxWidth: '75ch' }}>
        <h2 className="text-lg font-medium mb-6 dark:text-white">Activities</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
      </div>
    );
  }

  const stats = [
    { label: 'Gym sessions', value: gymStats.totalWorkouts.toString() },
    { label: 'Sets', value: gymStats.totalSets.toLocaleString() },
    { label: 'Distance', value: fmtDist(stravaStats.totalDistance) },
    { label: 'Active time', value: fmtTime(stravaStats.totalTime + gymStats.totalDuration * 60) },
  ];

  return (
    <div style={{ maxWidth: '75ch' }}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-medium dark:text-white">Activities</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Last {ACTIVITIES_LOOKBACK_DAYS} days</p>
      </div>

      {/* Stats strip */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-8 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-zinc-50 dark:bg-zinc-900/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{label}</p>
              <p className="text-base font-medium dark:text-white tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Feed */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="min-w-0 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800 animate-pulse"
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
        ) : combinedActivities.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 py-6">
            No activities in the last {ACTIVITIES_LOOKBACK_DAYS} days.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {combinedActivities.map(item => {
              // ── CARDIO ──────────────────────────────────────────────
              if (item.type === 'cardio' && item.stravaActivity) {
                const a = item.stravaActivity;
                const label = ACTIVITY_LABEL[a.type] ?? a.type.toLowerCase();
                const photoUrl = a.photos?.primary?.urls?.['600'] ?? a.photos?.primary?.urls?.['100'];
                const hasRoute = !!a.map?.summary_polyline;

                const statParts = [
                  a.distance > 0 && fmtDist(a.distance),
                  a.moving_time > 0 && fmtTime(a.moving_time),
                  a.average_speed > 0 && (a.type === 'Run' || a.type === 'Walk' ? fmtPace(a.average_speed) : fmtSpeed(a.average_speed)),
                  a.total_elevation_gain > 0 && `${Math.ceil(a.total_elevation_gain)}m ↑`,
                ].filter(Boolean).join(' · ');

                if (photoUrl) {
                  return (
                    <div
                      key={item.id}
                      className="min-w-0 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrl}
                        alt={a.name}
                        className={ACTIVITY_MEDIA_IMG}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  );
                }

                if (hasRoute) {
                  return (
                    <div
                      key={item.id}
                      className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800"
                    >
                      <RouteMap polyline={a.map!.summary_polyline} />
                      <div className="p-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex min-w-0 items-baseline gap-2">
                            <span className="flex-shrink-0 rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                              {label}
                            </span>
                            <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                              {a.name}
                            </span>
                          </div>
                          <time className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                            {shortDate(a.start_date)}
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
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col rounded-lg border border-zinc-100 dark:border-zinc-800 p-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex min-w-0 items-baseline gap-2">
                        <span className="flex-shrink-0 rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                          {label}
                        </span>
                        <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">{a.name}</span>
                      </div>
                      <time className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                        {shortDate(a.start_date)}
                      </time>
                    </div>
                    {statParts ? (
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{statParts}</p>
                    ) : null}
                  </div>
                );
              }

              // ── GYM ────────────────────────────────────────────────
              if (item.type === 'gym' && item.gymWorkout) {
                const w = item.gymWorkout;
                const gymImages = [
                  ...(w.images ?? []).map(img => img.url),
                  ...(w.image_urls ?? []),
                ].slice(0, 9);
                const hasGymImages = gymImages.length > 0;

                const exerciseBlock = (
                  <div className="mt-2 space-y-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    {w.exercises.map(ex => (
                      <div key={ex.id} className="flex min-w-0 items-baseline justify-between gap-2">
                        <span className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          {ex.title}
                        </span>
                        <span className="flex-shrink-0 tabular-nums text-xs text-zinc-400 dark:text-zinc-600">
                          {ex.sets.length} {ex.sets.length === 1 ? 'set' : 'sets'}
                        </span>
                      </div>
                    ))}
                  </div>
                );

                if (hasGymImages) {
                  return (
                    <div
                      key={item.id}
                      className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex flex-col bg-zinc-100 dark:bg-zinc-900/50">
                        {gymImages.map((url, idx) => (
                          <div key={idx} className="w-full min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`${w.title} photo ${idx + 1}`}
                              className={ACTIVITY_MEDIA_IMG}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="p-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="flex min-w-0 items-baseline gap-2">
                            <span className="flex-shrink-0 rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                              gym
                            </span>
                            <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                              {w.title}
                            </span>
                          </div>
                          <time className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                            {shortDate(w.start_time)}
                          </time>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {fmtDur(w.start_time, w.end_time)} · {w.exercises.length}{' '}
                          exercise{w.exercises.length !== 1 ? 's' : ''}
                        </p>
                        {exerciseBlock}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex min-w-0 items-baseline gap-2">
                          <span className="flex-shrink-0 rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                            gym
                          </span>
                          <span className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {w.title}
                          </span>
                        </div>
                        <time className="flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                          {shortDate(w.start_time)}
                        </time>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {fmtDur(w.start_time, w.end_time)} · {w.exercises.length}{' '}
                        exercise{w.exercises.length !== 1 ? 's' : ''}
                      </p>
                      {exerciseBlock}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;
