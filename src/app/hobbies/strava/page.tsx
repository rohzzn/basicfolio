"use client";
import React, { useState } from 'react';
import Image from 'next/image';
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
  map?: {
    summary_polyline: string;
  };
  photos?: {
    primary?: {
      urls: {
        '100': string;
        '600': string;
      };
    };
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

const ActivityPolyline: React.FC<{ polyline: string }> = ({ polyline }) => {
  const points = decode(polyline);
  const minLat = Math.min(...points.map(p => p[0]));
  const maxLat = Math.max(...points.map(p => p[0]));
  const minLng = Math.min(...points.map(p => p[1]));
  const maxLng = Math.max(...points.map(p => p[1]));
  
  const height = 200;
  const width = 400;
  
  const normalizedPoints = points.map(point => [
    ((point[1] - minLng) / (maxLng - minLng)) * width,
    height - ((point[0] - minLat) / (maxLat - minLat)) * height
  ]);
  
  const pathData = normalizedPoints.reduce((acc, point, i) => 
    acc + (i === 0 ? 'M' : 'L') + point[0] + ',' + point[1]
  , '');

  return (
    <svg width={width} height={height} className="opacity-75">
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-orange-400"
      />
    </svg>
  );
};

const calculateCalories = (activity: StravaActivity): number => {
  if (activity.calories) return activity.calories;
  
  const hours = activity.moving_time / 3600;
  
  switch(activity.type) {
    case 'Run':
      return Math.round(hours * 600);
    case 'Ride':
      return Math.round(hours * 500);
    case 'Swim':
      return Math.round(hours * 550);
    case 'Walk':
      return Math.round(hours * 300);
    case 'Hike':
      return Math.round(hours * 400);
    case 'Workout':
      return Math.round(hours * 450);
    default:
      return Math.round(hours * 350);
  }
};

type CombinedActivity = {
  id: string;
  type: 'cardio' | 'gym';
  date: string;
  stravaActivity?: StravaActivity;
  gymWorkout?: Workout;
};

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

  const fetchStravaData = async (daysAgo: number) => {
    try {
      if (!process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || 
          !process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET || 
          !process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN) {
        throw new Error('Strava API credentials not configured');
      }

      const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
          client_secret: process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET,
          refresh_token: process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        throw new Error('Failed to get access token');
      }

      const timestamp = Math.floor((Date.now() - daysAgo * 24 * 60 * 60 * 1000) / 1000);
      const activitiesRes = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=200&after=${timestamp}`,
        {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        }
      );

      const activitiesData = await activitiesRes.json();
      
      if (!Array.isArray(activitiesData)) {
        throw new Error('Invalid response from Strava API');
      }
      
      const sortedActivities = [...activitiesData].sort((a: StravaActivity, b: StravaActivity) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
      
      const activitiesWithPhotos = await Promise.all(
        sortedActivities.map(async (activity) => {
          try {
            const detailedActivityRes = await fetch(
              `https://www.strava.com/api/v3/activities/${activity.id}?include_all_efforts=false`,
              {
                headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
              }
            );
            
            if (!detailedActivityRes.ok) {
              return activity;
            }
            
            const detailedActivity = await detailedActivityRes.json();
            
            return {
              ...activity,
              photos: detailedActivity.photos,
              total_photo_count: detailedActivity.total_photo_count
            };
          } catch (error) {
            return activity;
          }
        })
      );
      
      setActivities(activitiesWithPhotos);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch Strava data');
    }
  };

  const fetchHevyData = async (daysAgo: number) => {
    try {
      const response = await fetch('/api/hevy/workouts');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: HevyResponse = await response.json();
      
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const filteredWorkouts = data.workouts.filter(workout => {
        const workoutDate = new Date(workout.start_time);
        return workoutDate >= cutoffDate;
      });
      
      setWorkouts(filteredWorkouts);
    } catch (err) {
      console.error('Hevy error:', err);
    }
  };

  React.useEffect(() => {
    setActivities([]);
    setWorkouts([]);
    setLoading(true);
    Promise.all([
      fetchStravaData(timeRange),
      fetchHevyData(timeRange)
    ]).finally(() => setLoading(false));
  }, [timeRange]);

  // Combine and sort activities
  const combinedActivities = React.useMemo(() => {
    const combined: CombinedActivity[] = [];
    
    activities.forEach(activity => {
      combined.push({
        id: `strava-${activity.id}`,
        type: 'cardio',
        date: activity.start_date,
        stravaActivity: activity
      });
    });
    
    workouts.forEach(workout => {
      combined.push({
        id: `gym-${workout.id}`,
        type: 'gym',
        date: workout.start_time,
        gymWorkout: workout
      });
    });
    
    return combined.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities, workouts]);

  const stravaStats = React.useMemo(() => {
    const typeGroups = activities.reduce((acc: {[key: string]: number}, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    const sortedTypes = Object.entries(typeGroups)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekActivities = activities.filter(a => new Date(a.start_date) >= oneWeekAgo);
    
    return {
      totalActivities: activities.length,
      totalDistance: activities.reduce((sum, activity) => sum + activity.distance, 0),
      totalTime: activities.reduce((sum, activity) => sum + activity.moving_time, 0),
      totalElevation: activities.reduce((sum, activity) => sum + activity.total_elevation_gain, 0),
      activityTypes: new Set(activities.map(a => a.type)).size,
      topActivityTypes: sortedTypes.slice(0, 3),
      weeklyActivities: lastWeekActivities.length,
      weeklyDistance: lastWeekActivities.reduce((sum, activity) => sum + activity.distance, 0),
      maxHeartRate: Math.max(...activities.filter(a => a.max_heartrate).map(a => a.max_heartrate || 0), 0),
      avgHeartRate: activities.filter(a => a.average_heartrate).length 
        ? activities.filter(a => a.average_heartrate).reduce((sum, a) => sum + (a.average_heartrate || 0), 0) / 
          activities.filter(a => a.average_heartrate).length
        : 0,
      totalCalories: activities.reduce((sum, activity) => sum + calculateCalories(activity), 0)
    };
  }, [activities]);

  const gymStats = React.useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekWorkouts = workouts.filter(w => new Date(w.start_time) >= oneWeekAgo);

    let totalVolume = 0;
    let totalReps = 0;
    let totalDuration = 0;
    const exerciseCount = new Map<string, number>();

    workouts.forEach(workout => {
      const duration = new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime();
      totalDuration += duration;

      workout.exercises.forEach(exercise => {
        exerciseCount.set(exercise.title, (exerciseCount.get(exercise.title) || 0) + 1);
        
        exercise.sets.forEach(set => {
          if (set.weight_kg && set.reps) {
            totalVolume += set.weight_kg * set.reps;
            totalReps += set.reps;
          }
        });
      });
    });

    const topExercises = Array.from(exerciseCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalWorkouts: workouts.length,
      weeklyWorkouts: lastWeekWorkouts.length,
      totalVolume: Math.ceil(totalVolume),
      totalReps: Math.ceil(totalReps),
      totalDuration: Math.ceil(totalDuration / 1000 / 60),
      topExercises,
      avgDuration: workouts.length > 0 ? Math.ceil(totalDuration / workouts.length / 1000 / 60) : 0,
    };
  }, [workouts]);

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km >= 10 ? `${km.toFixed(1)}km` : `${km.toFixed(2)}km`;
  };

  const formatPace = (metersPerSecond: number): string => {
    const minutesPerKm = (1000 / metersPerSecond) / 60;
    const minutes = Math.floor(minutesPerKm);
    const seconds = Math.round((minutesPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  const formatSpeed = (metersPerSecond: number): string => {
    const kmPerHour = metersPerSecond * 3.6;
    return `${kmPerHour.toFixed(1)} km/h`;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 
      ? `${hours}h ${minutes.toString().padStart(2, '0')}m`
      : `${minutes}m`;
  };

  const formatDuration = (startTime: string, endTime: string): string => {
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const minutes = Math.ceil(duration / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="max-w-7xl">
        <h2 className="text-lg font-medium mb-6 dark:text-white">Activities</h2>
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  // Combined stats
  const combinedStats = React.useMemo(() => {
    const totalActivities = activities.length + workouts.length;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = combinedActivities.filter(a => new Date(a.date) >= oneWeekAgo).length;
    
    return {
      total: totalActivities,
      weekly: weeklyCount,
      cardioCount: activities.length,
      gymCount: workouts.length,
      totalDistance: stravaStats.totalDistance,
      totalVolume: gymStats.totalVolume,
      totalCalories: stravaStats.totalCalories,
      totalTime: stravaStats.totalTime + gymStats.totalDuration * 60
    };
  }, [combinedActivities, activities, workouts, stravaStats, gymStats]);

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium dark:text-white">Activities</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm"
        >
          <option value={30}>Last 30 Days</option>
          <option value={60}>Last 60 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={180}>Last 6 Months</option>
          <option value={365}>Last Year</option>
        </select>
      </div>

      {/* Stats Overview - Hevy Focused */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Volume</p>
          <p className="text-xl font-medium dark:text-white mt-1">{gymStats.totalVolume.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            kg lifted
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Distance</p>
          <p className="text-xl font-medium dark:text-white mt-1">{formatDistance(combinedStats.totalDistance)}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            traveled
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Workouts</p>
          <p className="text-xl font-medium dark:text-white mt-1">{gymStats.totalWorkouts}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            gym sessions
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Reps</p>
          <p className="text-xl font-medium dark:text-white mt-1">{gymStats.totalReps.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            total reps
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium dark:text-white">Recent Activities</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Activity intensity over the past {timeRange} days
              </p>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: Math.ceil(timeRange / 7) * 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (timeRange - i));
                  
                  const dayActivities = combinedActivities.filter(activity => {
                    const activityDate = new Date(activity.date);
                    return activityDate.toDateString() === date.toDateString();
                  });
                  
                  const intensity = Math.min(dayActivities.length, 4);
                  const intensityColors = [
                    'bg-zinc-100 dark:bg-zinc-800',
                    'bg-zinc-200 dark:bg-zinc-700',
                    'bg-zinc-300 dark:bg-zinc-600',
                    'bg-zinc-400 dark:bg-zinc-500',
                    'bg-zinc-500 dark:bg-zinc-400'
                  ];
                  
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded ${intensityColors[intensity]} border border-zinc-200 dark:border-zinc-700 hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-500 transition-all cursor-pointer group relative`}
                      title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${dayActivities.length} ${dayActivities.length === 1 ? 'activity' : 'activities'}`}
                    >
                      {dayActivities.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {dayActivities.length}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between mt-6 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Less active</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`w-4 h-4 rounded ${
                        level === 0 ? 'bg-zinc-100 dark:bg-zinc-800' :
                        level === 1 ? 'bg-zinc-200 dark:bg-zinc-700' :
                        level === 2 ? 'bg-zinc-300 dark:bg-zinc-600' :
                        level === 3 ? 'bg-zinc-400 dark:bg-zinc-500' :
                        'bg-zinc-500 dark:bg-zinc-400'
                      } border border-zinc-200 dark:border-zinc-700`}
                    />
                  ))}
                </div>
                <span>More active</span>
              </div>
            </div>
          </div>
        )}

        {/* Unified Timeline View - 3 Column Grid */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinedActivities.map((item) => {
              if (item.type === 'cardio' && item.stravaActivity) {
                const activity = item.stravaActivity;
                const hasVisuals = activity.photos?.primary?.urls || activity.map?.summary_polyline;
                
                return (
                  <article key={item.id} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
                        {activity.name}
                      </h4>
                      <time className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(activity.start_date)}
                      </time>
                    </div>

                    {hasVisuals ? (
                      <div className="mb-3">
                        {activity.photos?.primary?.urls ? (
                          <div className="w-full rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                            <Image 
                              src={activity.photos.primary.urls['600'] || activity.photos.primary.urls['100']} 
                              alt={`Photo from ${activity.name}`}
                              className="w-full h-auto"
                              width={600}
                              height={400}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        ) : activity.map?.summary_polyline ? (
                          <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-700 rounded-lg overflow-hidden flex items-center justify-center">
                            <ActivityPolyline polyline={activity.map.summary_polyline} />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mb-3 p-4 bg-white/60 dark:bg-zinc-900/20 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="grid grid-cols-2 gap-3">
                          {activity.distance > 0 && (
                            <div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Distance</p>
                              <p className="text-lg font-medium text-zinc-900 dark:text-white">{formatDistance(activity.distance)}</p>
                            </div>
                          )}
                          {activity.moving_time > 0 && (
                            <div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Duration</p>
                              <p className="text-lg font-medium text-zinc-900 dark:text-white">{formatTime(activity.moving_time)}</p>
                            </div>
                          )}
                          {activity.average_speed > 0 && (
                            <div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                {activity.type === 'Run' || activity.type === 'Walk' ? 'Pace' : 'Speed'}
                              </p>
                              <p className="text-lg font-medium text-zinc-900 dark:text-white">
                                {activity.type === 'Run' || activity.type === 'Walk' 
                                  ? formatPace(activity.average_speed)
                                  : formatSpeed(activity.average_speed)
                                }
                              </p>
                            </div>
                          )}
                          {calculateCalories(activity) > 0 && (
                            <div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Calories</p>
                              <p className="text-lg font-medium text-zinc-900 dark:text-white">{calculateCalories(activity)}</p>
                            </div>
                          )}
                          {activity.total_elevation_gain > 0 && (
                            <div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Elevation</p>
                              <p className="text-lg font-medium text-zinc-900 dark:text-white">{Math.ceil(activity.total_elevation_gain)}m</p>
                            </div>
                          )}
                          {activity.average_heartrate && activity.average_heartrate > 0 && (
                            <div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Avg HR</p>
                              <p className="text-lg font-medium text-zinc-900 dark:text-white">{Math.round(activity.average_heartrate)} bpm</p>
                            </div>
                          )}
                          {activity.max_heartrate && activity.max_heartrate > 0 && (
                            <div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Max HR</p>
                              <p className="text-lg font-medium text-zinc-900 dark:text-white">{Math.round(activity.max_heartrate)} bpm</p>
                            </div>
                          )}
                          {activity.max_speed > 0 && (
                            <div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Max Speed</p>
                              <p className="text-lg font-medium text-zinc-900 dark:text-white">{formatSpeed(activity.max_speed)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {hasVisuals && (
                      <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {activity.distance > 0 && (
                          <span>{formatDistance(activity.distance)}</span>
                        )}
                        {activity.moving_time > 0 && (
                          <span>{formatTime(activity.moving_time)}</span>
                        )}
                        {activity.average_speed > 0 && (
                          <span>
                            {activity.type === 'Run' || activity.type === 'Walk' 
                              ? formatPace(activity.average_speed)
                              : formatSpeed(activity.average_speed)
                            }
                          </span>
                        )}
                        {activity.total_elevation_gain > 0 && (
                          <span>{Math.ceil(activity.total_elevation_gain)}m</span>
                        )}
                        {calculateCalories(activity) > 0 && (
                          <span>{calculateCalories(activity)} kcal</span>
                        )}
                      </div>
                    )}
                  </article>
                );
              } else if (item.type === 'gym' && item.gymWorkout) {
                const workout = item.gymWorkout;
                return (
                  <article key={item.id} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
                        {workout.title}
                      </h4>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {formatDuration(workout.start_time, workout.end_time)}
                      </span>
                    </div>
                    <time className="text-xs text-zinc-500 dark:text-zinc-400 block mb-3">
                      {formatDate(workout.start_time)}
                    </time>

                    {(workout.images && workout.images.length > 0 || workout.image_urls && workout.image_urls.length > 0) && (
                      <div className="mb-3">
                        <div className="grid grid-cols-3 gap-1.5">
                          {(workout.images || workout.image_urls?.map((url, idx) => ({ id: idx.toString(), url })) || []).slice(0, 3).map((img) => (
                            <div key={img.id} className="relative aspect-square rounded overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                              <Image
                                src={img.url}
                                alt="Workout"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 16vw, 11vw"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 overflow-y-auto max-h-80 pr-1">
                      {workout.exercises.map((exercise) => {
                        const totalVolume = exercise.sets.reduce((sum, set) => {
                          if (set.weight_kg && set.reps) {
                            return sum + set.weight_kg * set.reps;
                          }
                          return sum;
                        }, 0);

                        return (
                          <div
                            key={exercise.id}
                            className="bg-white/60 dark:bg-zinc-900/20 rounded border border-zinc-200 dark:border-zinc-700 p-2"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h5 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                                {exercise.title}
                              </h5>
                              {totalVolume > 0 && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                  {Math.ceil(totalVolume)} kg
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {exercise.sets.map((set) => (
                                <span
                                  key={set.index}
                                  className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-700 dark:text-zinc-300"
                                >
                                  {set.weight_kg && set.reps ? (
                                    `${Math.ceil(set.weight_kg)}×${set.reps}`
                                  ) : set.distance_meters ? (
                                    `${Math.ceil(set.distance_meters)}m`
                                  ) : set.duration_seconds ? (
                                    `${Math.ceil(set.duration_seconds / 60)}m`
                                  ) : (
                                    'W'
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              }
              return null;
            })}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400" />
          </div>
        )}
      </div>

      {!loading && combinedActivities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">No activities found in the selected time range</p>
        </div>
      )}

    </div>
  );
};

export default ActivitiesPage;
