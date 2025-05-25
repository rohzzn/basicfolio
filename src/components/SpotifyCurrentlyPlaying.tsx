import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Music } from 'lucide-react';

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: SpotifyImage[];
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

interface CurrentlyPlaying {
  isPlaying: boolean;
  track: SpotifyTrack;
  progress_ms: number;
}

interface CurrentlyPlayingResponse {
  is_playing: boolean;
  item: SpotifyTrack;
  progress_ms: number;
}

const DEFAULT_COVER = "https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large";

const SpotifyCurrentlyPlaying: React.FC = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get a safe image URL or fall back to default
  const getSafeImageUrl = (images: SpotifyImage[] | undefined): string => {
    if (!images || images.length === 0) return DEFAULT_COVER;
    return images[0].url;
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;
    
    const fetchSpotifyData = async () => {
      try {
        // Get access token
        const getAccessToken = async () => {
          try {
            const clientId = '45adef0727fa4c5780c3f7408debee63';
            const clientSecret = '23257ff89ada446eb418c9b77be72b85';
            const refreshToken = 'AQDpB5aYyV0IBPO9Zz5TRT0K7RDUevzTEO0pugOZK6Pq-s2TuwiQi1U0ZJ1rXOqRcsvBTfO4_OBW7RJi6k3kGcBr58mPlRveQfCNzW4TrUPzFsGMXGkZbT-G54sLjacjfjE';
            
            const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
              },
              body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
              })
            });
            
            if (!tokenResponse.ok) {
              throw new Error(`Failed to get access token: ${tokenResponse.status}`);
            }
            
            const data = await tokenResponse.json();
            return data.access_token;
          } catch (error) {
            console.error('Access token error:', error);
            return null;
          }
        };
        
        // Get token first
        const accessToken = await getAccessToken();
        
        if (!accessToken) {
          if (isMounted) {
            setError('Could not authenticate with Spotify');
            setLoading(false);
          }
          return;
        }
        
        // Fetch currently playing
        const fetchCurrentlyPlaying = async () => {
          try {
            const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            if (response.status === 204) {
              // No content - not currently playing
              if (isMounted) setCurrentlyPlaying(null);
              return;
            }
            
            if (!response.ok) {
              throw new Error(`Error fetching currently playing: ${response.status}`);
            }
            
            const data: CurrentlyPlayingResponse = await response.json();
            
            if (isMounted && data.item) {
              setCurrentlyPlaying({
                isPlaying: data.is_playing,
                track: data.item,
                progress_ms: data.progress_ms
              });
            }
          } catch (error) {
            console.error('Error fetching currently playing:', error);
            if (isMounted) setError('Failed to fetch currently playing track');
          } finally {
            if (isMounted) setLoading(false);
          }
        };
        
        await fetchCurrentlyPlaying();
        
        // Set up polling interval (every 10 seconds)
        intervalId = setInterval(fetchCurrentlyPlaying, 10000);
        
      } catch (err) {
        console.error('Error in Spotify data fetch:', err);
        if (isMounted) {
          setLoading(false);
          setError('Sorry, we had trouble connecting to Spotify');
        }
      }
    };
    
    fetchSpotifyData();
    
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="animate-pulse flex space-x-2 items-center">
          <Music className="w-3 h-3 text-zinc-400" />
          <span className="text-xs text-zinc-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-zinc-400 text-center py-2">
        <span className="flex items-center justify-center gap-1">
          <Music className="w-3 h-3" /> Spotify unavailable
        </span>
      </div>
    );
  }

  if (!currentlyPlaying) {
    return (
      <div className="text-xs text-zinc-500 dark:text-zinc-400 py-2">
        <span className="flex items-center justify-center gap-1">
          <Music className="w-3 h-3" /> Not playing
        </span>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-md p-2">
      <div className="flex items-center gap-2">
        <div className="relative min-w-[40px] w-10 h-10">
          <Image
            src={getSafeImageUrl(currentlyPlaying.track.album.images)}
            alt={currentlyPlaying.track.album.name}
            className="rounded object-cover"
            fill
            sizes="40px"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-0.5">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate block">
              {currentlyPlaying.track.name}
            </span>
          </div>
          <p className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate">
            {currentlyPlaying.track.artists.map(a => a.name).join(', ')}
          </p>
          
          {/* Progress bar */}
          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full" 
              style={{ 
                width: `${(currentlyPlaying.progress_ms / currentlyPlaying.track.duration_ms) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyCurrentlyPlaying; 