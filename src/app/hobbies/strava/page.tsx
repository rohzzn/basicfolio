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

// Calculate calories based on activity type, time, and distance if not provided
const calculateCalories = (activity: StravaActivity): number => {
  if (activity.calories) return activity.calories;
  
  // Rough estimates
  const hours = activity.moving_time / 3600;
  
  switch(activity.type) {
    case 'Run':
      return Math.round(hours * 600); // ~600 calories per hour running
    case 'Ride':
      return Math.round(hours * 500); // ~500 calories per hour cycling
    case 'Swim':
      return Math.round(hours * 550); // ~550 calories per hour swimming
    case 'Walk':
      return Math.round(hours * 300); // ~300 calories per hour walking
    case 'Hike':
      return Math.round(hours * 400); // ~400 calories per hour hiking
    case 'Workout':
      return Math.round(hours * 450); // ~450 calories per hour working out
    default:
      return Math.round(hours * 350); // Default estimate
  }
};

const StravaPage: React.FC = () => {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');

  const fetchStravaData = async (daysAgo: number) => {
    try {
      // Check if environment variables are available
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
      // Calculate how many activities to show based on time range
      // Use a fixed large number for per_page to get all activities
      const activitiesRes = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=200&after=${timestamp}`,
        {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        }
      );

      const activitiesData = await activitiesRes.json();
      
      // Check if activitiesData is an array
      if (!Array.isArray(activitiesData)) {
        throw new Error('Invalid response from Strava API');
      }
      
      // Sort all activities by date (newest first)
      const sortedActivities = [...activitiesData].sort((a: StravaActivity, b: StravaActivity) => 
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
      
      // For each activity, fetch detailed data including photos
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
              console.warn(`Failed to fetch detailed data for activity ${activity.id}`);
              return activity;
            }
            
            const detailedActivity = await detailedActivityRes.json();
            
            // Log photo data for debugging
            if (detailedActivity.photos && detailedActivity.total_photo_count > 0) {
              console.log('Activity with photos:', activity.id, detailedActivity.photos);
            }
            
            return {
              ...activity,
              photos: detailedActivity.photos,
              total_photo_count: detailedActivity.total_photo_count
            };
          } catch (error) {
            console.warn(`Error fetching detailed data for activity ${activity.id}:`, error);
            return activity;
          }
        })
      );
      
      setActivities(activitiesWithPhotos);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch Strava data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setActivities([]);
    setLoading(true);
    fetchStravaData(timeRange);
  }, [timeRange]);

  const stats = React.useMemo(() => {
    // Group activities by type
    const typeGroups = activities.reduce((acc: {[key: string]: number}, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    // Get activity types sorted by count
    const sortedTypes = Object.entries(typeGroups)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type);

    // Weekly stats calculation
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
        <h2 className="text-lg font-medium mb-6 dark:text-white">Activity Statistics</h2>
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium dark:text-white">Activity Statistics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700"
        >
          <option value={30}>Last 30 Days</option>
          <option value={60}>Last 60 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={180}>Last 6 Months</option>
          <option value={365}>Last Year</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <article>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">Activities</h3>
          </div>
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {stats.totalActivities}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {stats.weeklyActivities} in the last week
          </p>
        </article>

        <article>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">Distance</h3>
          </div>
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {formatDistance(stats.totalDistance)}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {formatDistance(stats.weeklyDistance)} in the last week
          </p>
        </article>

        <article>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">Active Time</h3>
          </div>
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {formatTime(stats.totalTime)}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {Math.round(stats.totalTime / 3600)} hours total
          </p>
        </article>

        <article>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">Calories</h3>
          </div>
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {stats.totalCalories.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Estimated calories burned
          </p>
        </article>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-12"></div>

      {/* Recent Activities */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium dark:text-white">Recent Activities</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Cards
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
            
            {/* Calendar heatmap */}
            <div className="p-6">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: Math.ceil(timeRange / 7) * 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (timeRange - i));
                  
                  const dayActivities = activities.filter(activity => {
                    const activityDate = new Date(activity.start_date);
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
                      className={`aspect-square rounded-sm ${intensityColors[intensity]} border border-zinc-200 dark:border-zinc-700 hover:ring-2 hover:ring-zinc-400 transition-all cursor-pointer group relative`}
                      title={`${date.toDateString()}: ${dayActivities.length} activities`}
                    >
                      {dayActivities.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {dayActivities.length}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-sm ${
                        level === 0 ? 'bg-zinc-100 dark:bg-zinc-800' :
                        level === 1 ? 'bg-zinc-200 dark:bg-zinc-700' :
                        level === 2 ? 'bg-zinc-300 dark:bg-zinc-600' :
                        level === 3 ? 'bg-zinc-400 dark:bg-zinc-500' :
                        'bg-zinc-500 dark:bg-zinc-400'
                      }`}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <article key={activity.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group cursor-pointer">
                {/* Header */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-2 line-clamp-2">
                    {activity.name}
                  </h4>
                  <time className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(activity.start_date)}
                  </time>
                  {activity.distance > 0 && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      {formatDistance(activity.distance)}
                    </p>
                  )}
                </div>

                {/* Visual Content */}
                {(activity.photos?.primary?.urls || activity.map?.summary_polyline || (activity.photos && !activity.photos.primary?.urls && activity.photos.primary)) && (
                  <div className="mb-4">
                    {/* Display photos if available */}
                    {activity.photos?.primary?.urls && (
                      <Image 
                        src={activity.photos.primary.urls['600'] || activity.photos.primary.urls['100']} 
                        alt={`Photo from ${activity.name}`}
                        className="rounded-lg w-full h-48 object-cover"
                        width={300}
                        height={200}
                        onError={(e) => console.error('Image failed to load:', e)}
                      />
                    )}

                    {/* If no photo but there's a map polyline, show the map */}
                    {!activity.photos?.primary?.urls && activity.map?.summary_polyline && (
                      <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-700 rounded-lg overflow-hidden flex items-center justify-center">
                        <ActivityPolyline polyline={activity.map.summary_polyline} />
                      </div>
                    )}

                    {/* Fallback approach for different photo structures */}
                    {activity.photos && !activity.photos.primary?.urls && activity.photos.primary && (
                      <Image 
                        src={
                          typeof activity.photos.primary === 'object' && 
                          'source' in activity.photos.primary && 
                          'unique_id' in activity.photos.primary && 
                          activity.photos.primary.source === 1 && 
                          typeof activity.photos.primary.unique_id === 'string'
                            ? `https://dgtzuqphqg23d.cloudfront.net/${activity.photos.primary.unique_id}-768x576.jpg`
                            : (activity.photos.primary as { urls?: { [key: string]: string } }).urls?.['600'] || ''
                        } 
                        alt={`Photo from ${activity.name}`}
                        className="rounded-lg w-full h-48 object-cover"
                        width={300}
                        height={200}
                        onError={(e) => {
                          console.error('Fallback image failed to load:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Activity Details */}
                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                  {activity.moving_time > 0 && (
                    <div>Duration: {formatTime(activity.moving_time)}</div>
                  )}
                  {activity.average_speed > 0 && (
                    <div>
                      {activity.type === 'Run' || activity.type === 'Walk' ? 'Pace' : 'Speed'}: {' '}
                      {activity.type === 'Run' || activity.type === 'Walk' 
                        ? formatPace(activity.average_speed)
                        : formatSpeed(activity.average_speed)
                      }
                    </div>
                  )}
                  {activity.total_elevation_gain > 0 && (
                    <div>Elevation: {activity.total_elevation_gain.toFixed(0)}m</div>
                  )}
                  {calculateCalories(activity) > 0 && (
                    <div>Calories: {calculateCalories(activity)} kcal</div>
                  )}
                  {activity.average_heartrate && activity.average_heartrate > 0 && (
                    <div>Heart Rate: {Math.round(activity.average_heartrate)} bpm avg</div>
                  )}
                  {(activity.total_photo_count ?? 0) > 1 && (
                    <div>{activity.total_photo_count} photos</div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}


        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400" />
          </div>
        )}
      </div>

      {/* No Activities Message */}
      {!loading && activities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">No activities found in the selected time range</p>
        </div>
      )}
    </div>
  );
};

export default StravaPage;