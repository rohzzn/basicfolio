"use client";
import React, { useState } from 'react';
import { Activity, Timer, Map, TrendingUp, Calendar, Watch, ArrowUp, Gauge, Heart } from 'lucide-react';
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
  map?: {
    summary_polyline: string;
  };
}

const ActivityPolyline = ({ polyline }: { polyline: string }) => {
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

const StravaPage = () => {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  const fetchStravaData = async (pageNum: number, daysAgo: number) => {
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
      const activitiesRes = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?per_page=50&page=${pageNum}&after=${timestamp}`,
        {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        }
      );

      const activitiesData = await activitiesRes.json();
      
      if (activitiesData.length < 50) {
        setHasMore(false);
      }

      setActivities(prev => {
        const newActivities = [...prev, ...activitiesData];
        return newActivities.sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch Strava data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setActivities([]); // Clear activities when timeRange changes
    setPage(1);
    setHasMore(true);
    setLoading(true);
    fetchStravaData(1, timeRange);
  }, [timeRange]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    setPage(prev => {
      const nextPage = prev + 1;
      fetchStravaData(nextPage, timeRange);
      return nextPage;
    });
  };

  const monthlyStats = React.useMemo(() => {
    return {
      totalActivities: activities.length,
      totalDistance: activities.reduce((sum, activity) => sum + activity.distance, 0),
      totalTime: activities.reduce((sum, activity) => sum + activity.moving_time, 0),
      totalElevation: activities.reduce((sum, activity) => sum + activity.total_elevation_gain, 0),
      activityTypes: new Set(activities.map(a => a.type)).size
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

      {/* Monthly Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium dark:text-white">Activities</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {monthlyStats.totalActivities}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Last {timeRange} Days
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-medium dark:text-white">Distance</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {formatDistance(monthlyStats.totalDistance)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Last {timeRange} Days
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-sm font-medium dark:text-white">Active Time</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {formatTime(monthlyStats.totalTime)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Last {timeRange} Days
          </p>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-medium dark:text-white">Types</h3>
          </div>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
            {monthlyStats.activityTypes}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Activity Types
          </p>
        </div>
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
                <span className="text-sm px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 font-medium">
                  {formatDistance(activity.distance)}
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6">
                {activity.map?.summary_polyline && (
                  <div className="w-[200px] h-[100px] bg-zinc-200 dark:bg-zinc-700/50 rounded-lg overflow-hidden flex items-center justify-center">
                    <ActivityPolyline polyline={activity.map.summary_polyline} />
                  </div>
                )}

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Watch className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <p className="text-xs text-zinc-500">Duration</p>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {formatTime(activity.moving_time)}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Gauge className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <p className="text-xs text-zinc-500">Pace</p>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {formatPace(activity.average_speed)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <ArrowUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <p className="text-xs text-zinc-500">Elevation</p>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {activity.total_elevation_gain.toFixed(0)}m
                    </p>
                  </div>

                  {activity.average_heartrate && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Heart className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        <p className="text-xs text-zinc-500">Heart Rate</p>
                      </div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {Math.round(activity.average_heartrate)} bpm
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
          
          {!loading && hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Load More Activities
            </button>
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