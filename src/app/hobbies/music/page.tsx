"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Music, Clock, User, Disc, Play, Pause, ExternalLink, Headphones, ListMusic } from 'lucide-react';

// Define types for Spotify API responses
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

interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
  followers: {
    total: number;
  };
  genres: string[];
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

interface CurrentlyPlaying {
  isPlaying: boolean;
  track: SpotifyTrack;
  progress_ms: number;
}

// Tabs and time range types
type MusicTab = 'artists' | 'tracks' | 'playlists' | 'recent';
type TimeRange = 'short_term' | 'medium_term' | 'long_term';

// Default images to use for placeholders
const DEFAULT_COVER = "https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large";

// Helper function to format time
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Define more specific types for API responses
interface RecentTracksResponse {
  items: Array<{ track: SpotifyTrack }>;
}

interface TopItemsResponse<T> {
  items: T[];
}

interface CurrentlyPlayingResponse {
  is_playing: boolean;
  item: SpotifyTrack;
  progress_ms: number;
}

const MusicPage: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<MusicTab>('recent');
  
  // Data states
  const [recentTracks, setRecentTracks] = useState<SpotifyTrack[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  
  // Map time range to human-readable format
  const timeRangeLabels: Record<TimeRange, string> = {
    'short_term': 'Last Month',
    'medium_term': 'Last 6 Months',
    'long_term': 'All Time'
  };
  
  // Track which API endpoints have authorization issues
  const [authIssues, setAuthIssues] = useState({
    recentTracks: false,
    topTracks: false,
    topArtists: false,
    currentlyPlaying: false
  });

  // Object to track which sections loaded successfully
  const [loadedSections, setLoadedSections] = useState({
    recentTracks: false,
    topTracks: false,
    topArtists: false,
    playlists: false,
    currentlyPlaying: false
  });

  // Separate loading states for tracks and artists
  const [tracksLoading, setTracksLoading] = useState(false);
  const [artistsLoading, setArtistsLoading] = useState(false);

  // Initial data fetch (without time range dependency)
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialSpotifyData = async () => {
      try {
        if (isMounted) setLoading(true);
        
        // Safely access token and handle API calls
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
        
        // Safe API fetch helper with improved error handling
        const safeFetch = async <T,>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> => {
          try {
            const queryParams = new URLSearchParams(params).toString();
            const url = `https://api.spotify.com/v1${endpoint}${queryParams ? `?${queryParams}` : ''}`;
            
            const response = await fetch(url, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            // Specifically handle 401 authorization errors
            if (response.status === 401) {
              console.log(`Authorization error for ${endpoint} - Missing required scopes`);
              
              // Track which endpoint had auth issues
              if (endpoint.includes('/recently-played')) {
                setAuthIssues(prev => ({ ...prev, recentTracks: true }));
              } else if (endpoint.includes('/top/artists')) {
                setAuthIssues(prev => ({ ...prev, topArtists: true }));
              } else if (endpoint.includes('/top/tracks')) {
                setAuthIssues(prev => ({ ...prev, topTracks: true }));
              } else if (endpoint.includes('/currently-playing')) {
                setAuthIssues(prev => ({ ...prev, currentlyPlaying: true }));
              }
              
              return null;
            }
            
            // Return null for 403 errors rather than throwing
            if (response.status === 403) {
              console.log(`Permission denied for ${endpoint}`);
              return null;
            }
            
            if (!response.ok) {
              console.error(`API error ${response.status} for ${endpoint}`);
              return null;
            }
            
            // Fix for empty responses
            const text = await response.text();
            if (!text || text.trim() === '') {
              console.log(`Empty response from ${endpoint}`);
              return null;
            }
            
            try {
              return JSON.parse(text) as T;
            } catch (jsonError) {
              console.error(`Failed to parse JSON from ${endpoint}:`, jsonError);
              return null;
            }
          } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
            return null;
          }
        };
        
        // Try to fetch recently played tracks
        try {
          const recentData = await safeFetch<RecentTracksResponse>('/me/player/recently-played', { limit: '50' });
          if (recentData && recentData.items && isMounted) {
            setRecentTracks(recentData.items.map(item => item.track).filter(Boolean));
            setLoadedSections(prev => ({ ...prev, recentTracks: true }));
          }
        } catch {
          console.log('Could not load recent tracks');
        }
        
        // Try to fetch top tracks (initial load with default time range)
        try {
          const tracksData = await safeFetch<TopItemsResponse<SpotifyTrack>>('/me/top/tracks', { 
            limit: '50', 
            time_range: timeRange 
          });
          if (tracksData && tracksData.items && isMounted) {
            setTopTracks(tracksData.items);
            setLoadedSections(prev => ({ ...prev, topTracks: true }));
          }
        } catch {
          console.log('Could not load top tracks');
        }
        
        // Try to fetch top artists (initial load with default time range)
        try {
          const artistsData = await safeFetch<TopItemsResponse<SpotifyArtist>>('/me/top/artists', { 
            limit: '50', 
            time_range: timeRange 
          });
          if (artistsData && artistsData.items && isMounted) {
            setTopArtists(artistsData.items);
            setLoadedSections(prev => ({ ...prev, topArtists: true }));
          }
        } catch {
          console.log('Could not load top artists');
        }
        
        // Try to fetch playlists
        try {
          const playlistsData = await safeFetch<TopItemsResponse<SpotifyPlaylist>>('/me/playlists', { limit: '20' });
          if (playlistsData && playlistsData.items && isMounted) {
            setPlaylists(playlistsData.items);
            setLoadedSections(prev => ({ ...prev, playlists: true }));
          }
        } catch {
          console.log('Could not load playlists');
        }
        
        // Try to fetch currently playing
        try {
          const nowPlaying = await safeFetch<CurrentlyPlayingResponse>('/me/player/currently-playing');
          if (nowPlaying && nowPlaying.item && isMounted) {
            setCurrentlyPlaying({
              isPlaying: nowPlaying.is_playing,
              track: nowPlaying.item,
              progress_ms: nowPlaying.progress_ms
            });
            setLoadedSections(prev => ({ ...prev, currentlyPlaying: true }));
          }
        } catch {
          console.log('Not currently playing anything');
        }
        
        // All done loading
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in Spotify data fetch:', err);
        if (isMounted) {
          setError('Sorry, we had trouble connecting to Spotify');
          setLoading(false);
        }
      }
    };
    
    fetchInitialSpotifyData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps - Intentionally only runs once on mount

  // Function to fetch time-range specific data
  const fetchTimeRangeData = async (newTimeRange: TimeRange, dataType: 'tracks' | 'artists' | 'both') => {
    try {
      // Set loading states
      if (dataType === 'tracks' || dataType === 'both') setTracksLoading(true);
      if (dataType === 'artists' || dataType === 'both') setArtistsLoading(true);

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
          
          const data = await tokenResponse.json();
          return data.access_token;
        } catch (error) {
          console.error('Access token error:', error);
          return null;
        }
      };

      const accessToken = await getAccessToken();
      if (!accessToken) return;

      // Safe API fetch helper
      const safeFetch = async <T,>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> => {
        try {
          const queryParams = new URLSearchParams(params).toString();
          const url = `https://api.spotify.com/v1${endpoint}${queryParams ? `?${queryParams}` : ''}`;
          
          const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          
          if (!response.ok) return null;
          
          const text = await response.text();
          if (!text || text.trim() === '') return null;
          
          return JSON.parse(text) as T;
        } catch (error) {
          console.error(`Failed to fetch ${endpoint}:`, error);
          return null;
        }
      };

      // Fetch tracks if needed
      if (dataType === 'tracks' || dataType === 'both') {
        try {
          const tracksData = await safeFetch<TopItemsResponse<SpotifyTrack>>('/me/top/tracks', { 
            limit: '50', 
            time_range: newTimeRange 
          });
          if (tracksData && tracksData.items) {
            setTopTracks(tracksData.items);
          }
        } catch {
          console.log('Could not load top tracks');
        } finally {
          setTracksLoading(false);
        }
      }

      // Fetch artists if needed
      if (dataType === 'artists' || dataType === 'both') {
        try {
          const artistsData = await safeFetch<TopItemsResponse<SpotifyArtist>>('/me/top/artists', { 
            limit: '50', 
            time_range: newTimeRange 
          });
          if (artistsData && artistsData.items) {
            setTopArtists(artistsData.items);
          }
        } catch {
          console.log('Could not load top artists');
        } finally {
          setArtistsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching time range data:', error);
      setTracksLoading(false);
      setArtistsLoading(false);
    }
  };

  // Function to safely get image URLs with fallback
  const getSafeImageUrl = (images: SpotifyImage[] | undefined): string => {
    if (!images || images.length === 0) {
      return DEFAULT_COVER;
    }
    return images[0].url;
  };

  const hasLoadedAnySection = Object.values(loadedSections).some(Boolean);
  const hasAuthorizationIssues = Object.values(authIssues).some(Boolean);
  

  // Tab navigation component with dropdown for time ranges
  const TabNavigation = () => {
    const [showTracksDropdown, setShowTracksDropdown] = useState(false);
    const [showArtistsDropdown, setShowArtistsDropdown] = useState(false);

    // Use refs to track timeouts
    const tracksTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const artistsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleTracksMouseEnter = () => {
      if (tracksTimeoutRef.current) {
        clearTimeout(tracksTimeoutRef.current);
        tracksTimeoutRef.current = null;
      }
      setShowTracksDropdown(true);
    };

    const handleTracksMouseLeave = () => {
      tracksTimeoutRef.current = setTimeout(() => {
        setShowTracksDropdown(false);
      }, 300);
    };

    const handleArtistsMouseEnter = () => {
      if (artistsTimeoutRef.current) {
        clearTimeout(artistsTimeoutRef.current);
        artistsTimeoutRef.current = null;
      }
      setShowArtistsDropdown(true);
    };

    const handleArtistsMouseLeave = () => {
      artistsTimeoutRef.current = setTimeout(() => {
        setShowArtistsDropdown(false);
      }, 300);
    };

    return (
      <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('recent')}
            className={`py-3 px-1 relative ${activeTab === 'recent' ? 'text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Recent</span>
            </div>
            {activeTab === 'recent' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
            )}
          </button>
          
          <div className="relative">
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab('tracks')}
                onMouseEnter={handleTracksMouseEnter}
                onMouseLeave={handleTracksMouseLeave}
                className={`py-3 px-1 relative ${activeTab === 'tracks' ? 'text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              >
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span>Tracks</span>
                </div>
                {activeTab === 'tracks' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
                )}
              </button>
              
              {/* Horizontal Time Range Options */}
              {showTracksDropdown && (
                <div 
                  className="flex items-center gap-3 ml-4"
                  onMouseEnter={handleTracksMouseEnter}
                  onMouseLeave={handleTracksMouseLeave}
                >
                  <button
                    onClick={() => {
                      setTimeRange('short_term');
                      fetchTimeRangeData('short_term', 'tracks');
                      setActiveTab('tracks');
                      setShowTracksDropdown(false);
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      timeRange === 'short_term' ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => {
                      setTimeRange('medium_term');
                      fetchTimeRangeData('medium_term', 'tracks');
                      setActiveTab('tracks');
                      setShowTracksDropdown(false);
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      timeRange === 'medium_term' ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    6M
                  </button>
                  <button
                    onClick={() => {
                      setTimeRange('long_term');
                      fetchTimeRangeData('long_term', 'tracks');
                      setActiveTab('tracks');
                      setShowTracksDropdown(false);
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      timeRange === 'long_term' ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    All
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            <div className="flex items-center">
              <button
                onClick={() => setActiveTab('artists')}
                onMouseEnter={handleArtistsMouseEnter}
                onMouseLeave={handleArtistsMouseLeave}
                className={`py-3 px-1 relative ${activeTab === 'artists' ? 'text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Artists</span>
                </div>
                {activeTab === 'artists' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
                )}
              </button>
              
              {/* Horizontal Time Range Options */}
              {showArtistsDropdown && (
                <div 
                  className="flex items-center gap-3 ml-4"
                  onMouseEnter={handleArtistsMouseEnter}
                  onMouseLeave={handleArtistsMouseLeave}
                >
                  <button
                    onClick={() => {
                      setTimeRange('short_term');
                      fetchTimeRangeData('short_term', 'artists');
                      setActiveTab('artists');
                      setShowArtistsDropdown(false);
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      timeRange === 'short_term' ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    1M
                  </button>
                  <button
                    onClick={() => {
                      setTimeRange('medium_term');
                      fetchTimeRangeData('medium_term', 'artists');
                      setActiveTab('artists');
                      setShowArtistsDropdown(false);
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      timeRange === 'medium_term' ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    6M
                  </button>
                  <button
                    onClick={() => {
                      setTimeRange('long_term');
                      fetchTimeRangeData('long_term', 'artists');
                      setActiveTab('artists');
                      setShowArtistsDropdown(false);
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      timeRange === 'long_term' ? 'bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    All
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('playlists')}
            className={`py-3 px-1 relative ${activeTab === 'playlists' ? 'text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          >
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4" />
              <span>Playlists</span>
            </div>
            {activeTab === 'playlists' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Artists tab content
  const ArtistsTabContent = () => (
    <div>
      <h3 className="text-base font-medium mb-5 dark:text-white">
        Top Artists • {timeRangeLabels[timeRange]}
      </h3>
      
      {artistsLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400"></div>
        </div>
      ) : topArtists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {topArtists.map(artist => (
            <a 
              key={artist.id}
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex flex-col"
            >
              <div className="relative w-full aspect-square mb-3">
                <Image
                  src={getSafeImageUrl(artist.images)}
                  alt={artist.name}
                  fill
                  className="rounded-md object-cover"
                  unoptimized
                />
              </div>
              <h4 className="font-medium dark:text-white text-sm mb-1 truncate">{artist.name}</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-1">
                {artist.genres && artist.genres.length > 0 
                  ? artist.genres.slice(0, 2).join(', ')
                  : 'Genre not available'}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400">
            {authIssues.topArtists 
              ? "Missing permission to access top artists" 
              : "No artist data available"}
          </p>
        </div>
      )}
    </div>
  );

  // Tracks tab content
  const TracksTabContent = () => (
    <div>
      <h3 className="text-base font-medium mb-5 dark:text-white">
        Top Tracks • {timeRangeLabels[timeRange]}
      </h3>
      
      {tracksLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400"></div>
        </div>
      ) : topTracks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topTracks.map((track, index) => (
            <a
              key={`${track.id}-${index}`}
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer block"
            >
              <article className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0 w-12 h-12">
                    <Image
                      src={getSafeImageUrl(track.album?.images)}
                      alt={track.album?.name || 'Album cover'}
                      fill
                      className="rounded-md object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                      <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium dark:text-white line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                      {track.name}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 mt-1">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-700/50">
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    {formatDuration(track.duration_ms)}
                  </span>
                </div>
              </article>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400">
            {authIssues.topTracks 
              ? "Missing permission to access top tracks" 
              : "No track data available"}
          </p>
        </div>
      )}
    </div>
  );

  // Custom playlist descriptions
  const getPlaylistDescription = (name: string, trackCount: number) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('melodies') || trackCount > 900) {
      return 'melodies / pop / bittersweet';
    } else if (lowerName.includes('shaking') || lowerName.includes('braids')) {
      return 'rap / hip hop';
    } else if (lowerName.includes('desi')) {
      return 'telugu / tamil / hindi';
    } else if (lowerName.includes('her') && trackCount < 50) {
      return 'lil romantic / lil sad';
    } else if (lowerName.includes('low fidelity') || lowerName.includes('lo-fi') || lowerName.includes('lofi')) {
      return 'chill / study / ambient';
    } else if (lowerName.includes('adrenaline') || lowerName.includes('energy') || lowerName.includes('pump')) {
      return 'high energy / workout / intense';
    }
    
    // Fallback to original description or genre-based description
    return null;
  };

  // Playlists tab content
  const PlaylistsTabContent = () => (
    <div>
      <h3 className="text-base font-medium mb-5 dark:text-white">
        My Playlists
      </h3>
      
      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map(playlist => {
            const customDescription = getPlaylistDescription(playlist.name, playlist.tracks?.total || 0);
            
            return (
              <a
                key={playlist.id}
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex flex-col"
              >
                <div className="relative w-full aspect-square mb-3">
                  <Image
                    src={getSafeImageUrl(playlist.images)}
                    alt={playlist.name}
                    fill
                    className="rounded-md object-cover"
                    unoptimized
                  />
                </div>
                <h4 className="font-medium dark:text-white text-sm mb-1 truncate">{playlist.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-1">
                  {playlist.tracks?.total || 0} tracks
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-400 line-clamp-2">
                  {customDescription || playlist.description || 'No description'}
                </p>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400">No playlists available</p>
        </div>
      )}
    </div>
  );

  // Recent tracks tab content
  const RecentTabContent = () => (
    <div>
      <h3 className="text-base font-medium mb-5 dark:text-white">
        Recently Played
      </h3>
      
      {recentTracks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentTracks.slice(0, 20).map((track, index) => (
            <a
              key={`${track.id}-${index}`}
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer block"
            >
              <article className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 border border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0 w-12 h-12">
                    <Image
                      src={getSafeImageUrl(track.album?.images)}
                      alt={track.album?.name || 'Album cover'}
                      fill
                      className="rounded-md object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                      <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium dark:text-white line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                      {track.name}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 mt-1">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-700/50">
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">
                    {formatDuration(track.duration_ms)}
                  </span>
                </div>
              </article>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400">
            {authIssues.recentTracks 
              ? "Missing permission to access recently played tracks" 
              : "No recent tracks available"}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-8 dark:text-white">Music Library</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-400"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : !hasLoadedAnySection ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <Music className="w-12 h-12 mx-auto text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium dark:text-white mb-2">Unable to load music data</h3>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Spotify API access is currently restricted. Check back later or visit my Spotify profile directly.
          </p>
          <a 
            href="https://open.spotify.com/user/rohansanjeev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mt-6 transition-colors"
          >
            View profile on Spotify <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div>
          {/* Authorization Issues Alert */}
          {hasAuthorizationIssues && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-600 dark:text-amber-400 mb-8">
              <h3 className="font-medium mb-2">Limited Spotify Data Access</h3>
              <p className="text-sm mb-2">
                Some Spotify features are unavailable due to missing permissions. The Spotify API needs the following scopes:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {authIssues.currentlyPlaying && (
                  <li>Need <code className="bg-amber-100 dark:bg-amber-800/30 px-1 rounded">user-read-currently-playing</code> for &quot;Now Playing&quot;</li>
                )}
                {authIssues.recentTracks && (
                  <li>Need <code className="bg-amber-100 dark:bg-amber-800/30 px-1 rounded">user-read-recently-played</code> for &quot;Recently Played&quot;</li>
                )}
                {authIssues.topArtists && (
                  <li>Need <code className="bg-amber-100 dark:bg-amber-800/30 px-1 rounded">user-top-read</code> for &quot;Top Artists&quot;</li>
                )}
                {authIssues.topTracks && (
                  <li>Need <code className="bg-amber-100 dark:bg-amber-800/30 px-1 rounded">user-top-read</code> for &quot;Top Tracks&quot;</li>
                )}
              </ul>
            </div>
          )}

          {/* Main Content */}
          <div className="mb-8">
            {/* Currently Playing Feature - Full width on top */}
            {currentlyPlaying && loadedSections.currentlyPlaying && (
              <section className="mb-8">
                <h3 className="text-base font-medium mb-4 flex items-center gap-2 dark:text-white">
                  <Disc className="w-4 h-4" />
                  {currentlyPlaying.isPlaying ? 'Now Playing' : 'Last Played'}
                </h3>
                
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 md:p-6 border border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative shrink-0">
                      <Image 
                        src={getSafeImageUrl(currentlyPlaying.track.album.images)}
                        alt={currentlyPlaying.track.album.name}
                        width={120}
                        height={120}
                        className="rounded-md"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
                        {currentlyPlaying.isPlaying ? (
                          <Pause className="w-10 h-10 text-white" />
                        ) : (
                          <Play className="w-10 h-10 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-grow text-center md:text-left">
                      <h4 className="font-medium dark:text-white">{currentlyPlaying.track.name}</h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {currentlyPlaying.track.artists.map(a => a.name).join(', ')}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                        {currentlyPlaying.track.album.name}
                      </p>
                      
                      <div className="mt-3">
                        <div className="bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full w-full max-w-xs mx-auto md:mx-0">
                          <div 
                            className="bg-zinc-500 dark:bg-zinc-300 h-1.5 rounded-full"
                            style={{
                              width: `${(currentlyPlaying.progress_ms / currentlyPlaying.track.duration_ms) * 100}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-500 mt-1 max-w-xs mx-auto md:mx-0">
                          <span>{formatDuration(currentlyPlaying.progress_ms)}</span>
                          <span>{formatDuration(currentlyPlaying.track.duration_ms)}</span>
                        </div>
                      </div>
                      
                      <a 
                        href={currentlyPlaying.track.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mt-3 transition-colors"
                      >
                        Open in Spotify <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            )}


            {/* Tab Navigation */}
            <TabNavigation />
            
            {/* Tab Content */}
            {activeTab === 'artists' && <ArtistsTabContent />}
            {activeTab === 'tracks' && <TracksTabContent />}
            {activeTab === 'playlists' && <PlaylistsTabContent />}
            {activeTab === 'recent' && <RecentTabContent />}
          </div>
          
        </div>
      )}
    </div>
  );
};

export default MusicPage; 