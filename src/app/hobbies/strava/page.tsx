"use client";
import React, { useEffect, useState } from 'react';
import { Activity, Timer, Map, TrendingUp, Loader2 } from 'lucide-react';

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
        console.log('Starting token refresh...');
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
        console.log('Token refresh response:', tokenData);

        if (!tokenData.access_token) {
          throw new Error('Failed to get access token');
        }

        const accessToken = tokenData.access_token;

        console.log('Fetching activities...');
        const activitiesRes = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=10', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        console.log('Activities response status:', activitiesRes.status);
        const activitiesData = await activitiesRes.json();
        console.log('Activities data:', activitiesData);

        console.log('Fetching stats...');
        const statsRes = await fetch(`https://www.strava.com/api/v3/athletes/51964595/stats`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        console.log('Stats response status:', statsRes.status);
        const statsData = await statsRes.json();
        console.log('Stats data:', statsData);

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
    return `${km.toFixed(1)}km`;
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
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl">
        <h2 className="text-lg font-medium mb-6 dark:text-white">Running</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-600 dark:text-zinc-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl">
        <h2 className="text-lg font-medium mb-6 dark:text-white">Running</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Running</h2>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <h3 className="text-sm font-medium dark:text-white">Total Runs</h3>
            </div>
            <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
              {stats.all_run_totals.count}
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Map className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <h3 className="text-sm font-medium dark:text-white">Total Distance</h3>
            </div>
            <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
              {formatDistance(stats.all_run_totals.distance)}
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <h3 className="text-sm font-medium dark:text-white">Moving Time</h3>
            </div>
            <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
              {formatTime(stats.all_run_totals.moving_time)}
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <h3 className="text-sm font-medium dark:text-white">Elevation Gain</h3>
            </div>
            <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
              {stats.all_run_totals.elevation_gain.toFixed(0)}m
            </p>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <h3 className="text-base font-medium mb-4 dark:text-white">Recent Runs</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-medium dark:text-white">{activity.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                  {formatDate(activity.start_date)}
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-400">
                {formatDistance(activity.distance)}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Time</p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {formatTime(activity.moving_time)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Pace</p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {formatPace(activity.average_speed)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Elevation</p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {activity.total_elevation_gain.toFixed(0)}m
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StravaPage;