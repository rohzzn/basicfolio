"use client";
import React, { useEffect, useState } from 'react';
import { Activity, Timer, Map, TrendingUp, Calendar, Watch, ArrowUp, Gauge } from 'lucide-react';
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
  map?: {
    summary_polyline: string;
  };
}

interface StravaStats {
  all_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  ytd_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
  };
  recent_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
  };
}

const StravaPage = () => {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [stats, setStats] = useState<StravaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStravaData = async () => {
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

        const accessToken = tokenData.access_token;

        const activitiesRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=10', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const activitiesData = await activitiesRes.json();

        const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/51964595/stats`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const statsData = await statsRes.json();

        setActivities(activitiesData);
        setStats(statsData);
      } catch (error) {
        console.error('Detailed error:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch Strava data');
      } finally {
        setLoading(false);
      }
    };

    fetchStravaData();
  }, []);

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km >= 10 
      ? `${km.toFixed(1)}km`
      : `${km.toFixed(2)}km`;
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
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  };

  const ActivityPolyline = ({ polyline }: { polyline: string }) => {
  type Point = [number, number];
  
  const points: Point[] = decode(polyline) as Point[];
  const minLat = Math.min(...points.map((p: Point) => p[0]));
  const maxLat = Math.max(...points.map((p: Point) => p[0]));
  const minLng = Math.min(...points.map((p: Point) => p[1]));
  const maxLng = Math.max(...points.map((p: Point) => p[1]));
  
  const height = 100;
  const width = 200;
  
  const normalizedPoints: Point[] = points.map((point: Point): Point => [
    ((point[1] - minLng) / (maxLng - minLng)) * width,
    height - ((point[0] - minLat) / (maxLat - minLat)) * height
  ]);
  
  const pathData = normalizedPoints.reduce((acc: string, point: Point, i: number) => 
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

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Activity Statistics</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Activity Statistics</h2>
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <h2 className="text-xl font-semibold mb-6 dark:text-white">Activity Statistics</h2>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-medium dark:text-white">Activities</h3>
            </div>
            <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
              {stats.all_run_totals.count.toLocaleString()}
            </p>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Map className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="text-sm font-medium dark:text-white">Distance</h3>
            </div>
            <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
              {formatDistance(stats.all_run_totals.distance)}
            </p>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-sm font-medium dark:text-white">Time</h3>
            </div>
            <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
              {formatTime(stats.all_run_totals.moving_time)}
            </p>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-medium dark:text-white">Elevation</h3>
            </div>
            <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">
              {stats.all_run_totals.elevation_gain.toLocaleString()}m
            </p>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-white">Recent Activities</h3>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing last {activities.length} activities
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-semibold dark:text-white">{activity.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(activity.start_date)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm px-3 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 font-medium">
                  {formatDistance(activity.distance)}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {activity.type}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Activity Polyline */}
              {activity.map?.summary_polyline && (
                <div className="w-[200px] h-[100px] bg-zinc-200 dark:bg-zinc-700/50 rounded-lg overflow-hidden flex items-center justify-center">
                  <ActivityPolyline polyline={activity.map.summary_polyline} />
                </div>
              )}

              {/* Activity Stats */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Watch className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <p className="text-xs text-zinc-500">Time</p>
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StravaPage;