"use client";

import React, { useState, useEffect } from 'react';
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
type MusicTab = 'artists' | 'tracks' | 'playlists' | 'genres';
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
  const [activeTab, setActiveTab] = useState<MusicTab>('artists');
  
  // Data states
  const [, setRecentTracks] = useState<SpotifyTrack[]>([]);
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

  useEffect(() => {
    let isMounted = true;
    
    const fetchSpotifyData = async () => {
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
        const safeFetch = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> => {
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
          const recentData = await safeFetch<RecentTracksResponse>('/me/player/recently-played', { limit: '10' });
          if (recentData && recentData.items && isMounted) {
            setRecentTracks(recentData.items.map(item => item.track).filter(Boolean));
            setLoadedSections(prev => ({ ...prev, recentTracks: true }));
          }
        } catch {
          console.log('Could not load recent tracks');
        }
        
        // Try to fetch top tracks
        try {
          const tracksData = await safeFetch<TopItemsResponse<SpotifyTrack>>('/me/top/tracks', { 
            limit: '20', 
            time_range: timeRange 
          });
          if (tracksData && tracksData.items && isMounted) {
            setTopTracks(tracksData.items);
            setLoadedSections(prev => ({ ...prev, topTracks: true }));
          }
        } catch {
          console.log('Could not load top tracks');
        }
        
        // Try to fetch top artists
        try {
          const artistsData = await safeFetch<TopItemsResponse<SpotifyArtist>>('/me/top/artists', { 
            limit: '20', 
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
    
    fetchSpotifyData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  // Function to safely get image URLs with fallback
  const getSafeImageUrl = (images: SpotifyImage[] | undefined): string => {
    if (!images || images.length === 0) {
      return DEFAULT_COVER;
    }
    return images[0].url;
  };

  const hasLoadedAnySection = Object.values(loadedSections).some(Boolean);
  const hasAuthorizationIssues = Object.values(authIssues).some(Boolean);
  
  // Time range selector component
  const TimeRangeSelector = () => (
    <div className="flex items-center justify-end mb-5">
      <div className="flex text-xs space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        <button 
          onClick={() => setTimeRange('short_term')}
          className={`px-3 py-1.5 rounded ${timeRange === 'short_term' ? 'bg-white dark:bg-zinc-700 shadow-sm font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          1 Month
        </button>
        <button 
          onClick={() => setTimeRange('medium_term')}
          className={`px-3 py-1.5 rounded ${timeRange === 'medium_term' ? 'bg-white dark:bg-zinc-700 shadow-sm font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          6 Months
        </button>
        <button 
          onClick={() => setTimeRange('long_term')}
          className={`px-3 py-1.5 rounded ${timeRange === 'long_term' ? 'bg-white dark:bg-zinc-700 shadow-sm font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
        >
          All Time
        </button>
      </div>
    </div>
  );

  // Tab navigation component
  const TabNavigation = () => (
    <div className="border-b border-zinc-200 dark:border-zinc-700 mb-6">
      <div className="flex space-x-6">
        <button
          onClick={() => setActiveTab('artists')}
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
        
        <button
          onClick={() => setActiveTab('tracks')}
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
        
        <button
          onClick={() => setActiveTab('genres')}
          className={`py-3 px-1 relative ${activeTab === 'genres' ? 'text-black dark:text-white font-medium' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
        >
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span>Genres</span>
          </div>
          {activeTab === 'genres' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white"></div>
          )}
        </button>
        
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

  // Artists tab content
  const ArtistsTabContent = () => (
    <div>
      <TimeRangeSelector />
      <h3 className="text-base font-medium mb-5 dark:text-white">
        Top Artists • {timeRangeLabels[timeRange]}
      </h3>
      
      {topArtists.length > 0 ? (
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
      <TimeRangeSelector />
      <h3 className="text-base font-medium mb-5 dark:text-white">
        Top Tracks • {timeRangeLabels[timeRange]}
      </h3>
      
      {topTracks.length > 0 ? (
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">Track</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 hidden md:table-cell">Album</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 w-20">
                    <Clock className="w-3 h-3 inline" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {topTracks.map((track, index) => (
                  <tr 
                    key={`${track.id}-${index}`}
                    className="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <a 
                        href={track.external_urls.spotify}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <div className="relative shrink-0 w-10 h-10">
                          <Image
                            src={getSafeImageUrl(track.album?.images)}
                            alt={track.album?.name || 'Album cover'}
                            fill
                            className="rounded object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium dark:text-white line-clamp-1">{track.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-1">
                            {track.artists.map(a => a.name).join(', ')}
                          </p>
                        </div>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-500 hidden md:table-cell line-clamp-1">
                      {track.album?.name || 'Unknown album'}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-500 text-right">
                      {formatDuration(track.duration_ms)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

  // Playlists tab content
  const PlaylistsTabContent = () => (
    <div>
      <h3 className="text-base font-medium mb-5 dark:text-white">
        My Playlists
      </h3>
      
      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map(playlist => (
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
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {playlist.tracks?.total || 0} tracks
              </p>
              {playlist.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 line-clamp-1">
                  {playlist.description}
                </p>
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400">No playlists available</p>
        </div>
      )}
    </div>
  );

  // Genres tab content
  const GenresTabContent = () => {
    // Process artists to extract and count genres
    const genreCounts: Record<string, number> = {};
    const genreArtists: Record<string, string[]> = {};
    
    // Count genres from top artists
    topArtists.forEach(artist => {
      if (artist.genres && artist.genres.length > 0) {
        artist.genres.forEach(genre => {
          // Increment genre count
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          
          // Track artists for each genre
          if (!genreArtists[genre]) {
            genreArtists[genre] = [];
          }
          if (!genreArtists[genre].includes(artist.name)) {
            genreArtists[genre].push(artist.name);
          }
        });
      }
    });
    
    // Sort genres by count (popularity)
    const sortedGenres = Object.keys(genreCounts).sort((a, b) => {
      return genreCounts[b] - genreCounts[a];
    });
    
    // Find the maximum count to calculate percentages
    const maxCount = Math.max(...Object.values(genreCounts));
    
    return (
      <div>
        <TimeRangeSelector />
        <h3 className="text-base font-medium mb-5 dark:text-white">
          Top Genres • {timeRangeLabels[timeRange]}
        </h3>
        
        {sortedGenres.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sortedGenres.map(genre => {
              const count = genreCounts[genre];
              const percentage = Math.round((count / maxCount) * 100);
              const artists = genreArtists[genre].slice(0, 3); // Show up to 3 artists
              
              return (
                <div 
                  key={genre}
                  className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-colors"
                >
                  <h4 className="font-medium dark:text-white text-sm mb-2 capitalize">{genre}</h4>
                  
                  {/* Progress bar showing relative popularity */}
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full mb-3">
                    <div 
                      className="bg-zinc-400 dark:bg-zinc-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    {count} {count === 1 ? 'artist' : 'artists'}
                  </p>
                  
                  {artists.length > 0 && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      <p className="font-medium mb-1">Top artists:</p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {artists.map(artist => (
                          <li key={artist}>{artist}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <p className="text-zinc-500 dark:text-zinc-400">
              {authIssues.topArtists 
                ? "Missing permission to access genre data" 
                : "No genre data available"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-4 dark:text-white">Music Library</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        A glimpse into my musical tastes and listening habits via Spotify.
      </p>
      
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
                
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 md:p-6">
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
            {activeTab === 'genres' && <GenresTabContent />}
          </div>
          
          <div className="pt-4 text-center">
            <a 
              href="https://open.spotify.com/user/rohansanjeev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              View full profile on Spotify <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPage; 