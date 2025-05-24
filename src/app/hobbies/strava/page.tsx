"use client";
import React, { useState } from 'react';
import { 
  Activity, Timer, Map, Calendar, Watch, ArrowUp, 
  Gauge, Heart, Flame, Sun
} from 'lucide-react';
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
  
  const height = 100;
  const width = 200;
  
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

  const fetchStravaData = async (daysAgo: number) => {
    try {
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

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium dark:text-white">Activities</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {stats.totalActivities}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {stats.weeklyActivities} in the last week
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-medium dark:text-white">Distance</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {formatDistance(stats.totalDistance)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {formatDistance(stats.weeklyDistance)} in the last week
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-medium dark:text-white">Active Time</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {formatTime(stats.totalTime)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {Math.round(stats.totalTime / 3600)} hours total
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-medium dark:text-white">Calories</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {stats.totalCalories.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Estimated calories burned
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-medium dark:text-white">Elevation</h3>
          </div>
          <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300">
            {stats.totalElevation.toFixed(0)}m
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Total gain
          </p>
        </div>

        {stats.avgHeartRate > 0 && (
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-sm font-medium dark:text-white">Heart Rate</h3>
            </div>
            <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300">
              {Math.round(stats.avgHeartRate)} bpm
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Avg / {stats.maxHeartRate} max
            </p>
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 dark:text-white">Recent Activities</h3>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-medium dark:text-white">{activity.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(activity.start_date)}
                    </p>
                  </div>
                </div>
                {activity.distance > 10 && (
                  <span className="text-sm px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 font-medium">
                    {formatDistance(activity.distance)}
                  </span>
                )}
              </div>
                
              <div className="flex flex-col md:flex-row gap-6">
                {/* Display photos if available (from Hevy) */}
                {activity.photos?.primary?.urls && (
                  <div className="w-full md:w-auto">
                    <img 
                      src={activity.photos.primary.urls['600'] || activity.photos.primary.urls['100']} 
                      alt={`Photo from ${activity.name}`}
                      className="rounded-lg w-full md:w-auto max-h-[300px] object-cover"
                      onError={(e) => console.error('Image failed to load:', e)}
                    />
                  </div>
                )}

                {/* If no photo but there's a map polyline, show the map */}
                {!activity.photos?.primary?.urls && activity.map?.summary_polyline && (
                  <div className="w-[200px] h-[100px] bg-zinc-200 dark:bg-zinc-700/50 rounded-lg overflow-hidden flex items-center justify-center">
                    <ActivityPolyline polyline={activity.map.summary_polyline} />
                  </div>
                )}

                {/* If the previous approach doesn't show images, add this fallback approach */}
                {activity.photos && !activity.photos.primary?.urls && activity.photos.primary && (
                  <div className="w-full md:w-auto">
                    <img 
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
                      className="rounded-lg w-full md:w-auto max-h-[300px] object-cover"
                      onError={(e) => {
                        console.error('Fallback image failed to load:', e);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Alternative display for photos to debug the structure */}
                {activity.total_photo_count && activity.total_photo_count > 0 && !activity.photos?.primary?.urls && (
                  <div className="w-full md:w-auto bg-zinc-200 dark:bg-zinc-700 rounded-lg p-4 text-center">
                    <p className="text-zinc-700 dark:text-zinc-300">Activity has {activity.total_photo_count} photos</p>
                    <pre className="text-xs mt-2 text-left overflow-auto max-h-[200px]">
                      {JSON.stringify(activity.photos, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Watch className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <p className="text-xs text-zinc-500">Duration</p>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {formatTime(activity.moving_time)}
                    </p>
                  </div>
                  
                  {activity.average_speed > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Gauge className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        <p className="text-xs text-zinc-500">
                          {activity.type === 'Run' || activity.type === 'Walk' ? 'Pace' : 'Speed'}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {activity.type === 'Run' || activity.type === 'Walk' 
                          ? formatPace(activity.average_speed)
                          : formatSpeed(activity.average_speed)
                        }
                      </p>
                    </div>
                  )}

                  {activity.total_elevation_gain > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <ArrowUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        <p className="text-xs text-zinc-500">Elevation</p>
                      </div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {activity.total_elevation_gain.toFixed(0)}m
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Flame className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <p className="text-xs text-zinc-500">Calories</p>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {calculateCalories(activity)} kcal
                    </p>
                  </div>

                  {activity.average_heartrate && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Heart className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        <p className="text-xs text-zinc-500">Heart Rate</p>
                      </div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {Math.round(activity.average_heartrate)} bpm avg
                      </p>
                      {activity.max_heartrate && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {Math.round(activity.max_heartrate)} bpm max
                        </p>
                      )}
                    </div>
                  )}

                  {activity.suffer_score && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Sun className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        <p className="text-xs text-zinc-500">Training Load</p>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${activity.suffer_score > 150 ? 'bg-red-500' : activity.suffer_score > 100 ? 'bg-orange-500' : 'bg-green-500'} rounded-full`}
                          style={{ width: `${Math.min((activity.suffer_score / 250) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {activity.suffer_score} / 250
                      </p>
                    </div>
                  )}

                  {/* Show photo count if there are multiple photos */}
                  {(activity.total_photo_count && activity.total_photo_count > 1) && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-zinc-500 dark:text-zinc-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M20.4 14.5L16 10 4 20" />
                        </svg>
                        <p className="text-xs text-zinc-500">Photos</p>
                      </div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {activity.total_photo_count} photos
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400" />
            </div>
          )}
        </div>
      </div>

      {/* No Activities Message */}
      {!loading && activities.length === 0 && (
        <div className="text-center py-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <Activity className="w-12 h-12 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">No activities found in the selected time range</p>
        </div>
      )}
    </div>
  );
};

export default StravaPage;