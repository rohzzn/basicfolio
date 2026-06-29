"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from '@/components/SiteImage';
import { X } from 'lucide-react';
import SpotifyPreviewPlayButton from '@/components/SpotifyPreviewPlayButton';
import { decodeSpotifyText } from '@/lib/spotify-text';

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

interface PlaylistTrackItem {
  added_at: string;
  track: SpotifyTrack | null;
}

interface PlaylistTracksResponse {
  items: PlaylistTrackItem[];
  next: string | null;
}

interface PlaylistTrackEntry {
  track: SpotifyTrack;
  added_at: string;
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
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrackEntry[]>([]);
  const [playlistTracksLoading, setPlaylistTracksLoading] = useState(false);
  const playlistTracksCache = useRef<Map<string, PlaylistTrackEntry[]>>(new Map());

  // Initial data fetch (without time range dependency)
  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialSpotifyData = async () => {
      try {
        if (isMounted) setLoading(true);
        
        // Safely access token and handle API calls
        const getAccessToken = async () => {
          try {
            const tokenResponse = await fetch('/api/spotify/token');
            if (!tokenResponse.ok) {
              throw new Error(`Failed to get access token: ${tokenResponse.status}`);
            }

            const data = await tokenResponse.json();
            return data.access_token as string;
          } catch (tokenError) {
            console.error('Access token error:', tokenError);
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
            time_range: 'medium_term' 
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
            time_range: 'medium_term' 
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
  }, []);

  // Function to fetch time-range specific data
  const fetchTimeRangeData = async (newTimeRange: TimeRange, dataType: 'tracks' | 'artists' | 'both') => {
    try {
      // Set loading states
      if (dataType === 'tracks' || dataType === 'both') setTracksLoading(true);
      if (dataType === 'artists' || dataType === 'both') setArtistsLoading(true);

      // Get access token
      const getAccessToken = async () => {
        try {
          const tokenResponse = await fetch('/api/spotify/token');
          if (!tokenResponse.ok) return null;
          const data = await tokenResponse.json();
          return data.access_token as string;
        } catch (tokenError) {
          console.error('Access token error:', tokenError);
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

  const fetchPlaylistTracks = async (playlist: SpotifyPlaylist) => {
    const cached = playlistTracksCache.current.get(playlist.id);
    const expectedTotal = playlist.tracks?.total ?? 0;
    const cacheLooksTruncated = cached && expectedTotal > 0 && cached.length < expectedTotal;

    if (cached && !cacheLooksTruncated) {
      setSelectedPlaylist(playlist);
      setPlaylistTracks(cached);
      return;
    }

    setSelectedPlaylist(playlist);
    setPlaylistTracks([]);
    setPlaylistTracksLoading(true);

    try {
      const tokenResponse = await fetch('/api/spotify/token');
      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token');
      }

      const { access_token: accessToken } = await tokenResponse.json();
      if (!accessToken) {
        throw new Error('Missing access token');
      }

      const collected: PlaylistTrackEntry[] = [];
      let nextUrl: string | null =
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=100`;

      while (nextUrl) {
        const response = await fetch(nextUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
        }

        const data = (await response.json()) as PlaylistTracksResponse;

        for (const item of data.items) {
          if (item.track?.id) {
            collected.push({ track: item.track, added_at: item.added_at });
          }
        }

        nextUrl = data.next;
      }

      collected.sort(
        (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      );

      playlistTracksCache.current.set(playlist.id, collected);
      setPlaylistTracks(collected);
    } catch (fetchError) {
      console.error('Failed to load playlist tracks:', fetchError);
      setPlaylistTracks([]);
    } finally {
      setPlaylistTracksLoading(false);
    }
  };

  const handlePlaylistClick = (playlist: SpotifyPlaylist) => {
    if (selectedPlaylist?.id === playlist.id) {
      setSelectedPlaylist(null);
      return;
    }

    void fetchPlaylistTracks(playlist);
  };

  const renderPlaylistTracksPanel = (playlist: SpotifyPlaylist) => (
    <section className="flex min-h-0 flex-col overflow-hidden border border-zinc-100 dark:border-zinc-800/60">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800/60">
        <div className="relative h-11 w-11 shrink-0">
          <Image
            src={getSafeImageUrl(playlist.images)}
            alt={playlist.name}
            fill
            className="rounded-md object-cover"
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium dark:text-white">{playlist.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {playlistTracksLoading
              ? `Loading ${playlist.tracks?.total || 0} tracks...`
              : `${playlistTracks.length || playlist.tracks?.total || 0} tracks · newest first`}
          </p>
        </div>

        <button
          type="button"
          onClick={closePlaylistPanel}
          className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          aria-label="Close playlist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3 scrollbar-hide xl:max-h-[min(70vh,640px)]">
        {playlistTracksLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-zinc-600 dark:border-zinc-400" />
          </div>
        ) : playlistTracks.length > 0 ? (
          <div className="space-y-1">
            {playlistTracks.map(({ track, added_at }, index) => (
              <article
                key={`${track.id}-${added_at}-${index}`}
                className="group flex items-center gap-3 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
              >
                <div className="relative h-11 w-11 shrink-0">
                  <Image
                    src={getSafeImageUrl(track.album?.images)}
                    alt={track.album?.name || 'Album cover'}
                    fill
                    className="rounded-md object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 hidden items-center justify-center rounded-md bg-black/0 transition-colors group-hover:bg-black/30 lg:flex">
                    <SpotifyPreviewPlayButton
                      trackId={track.id}
                      trackName={track.name}
                      artists={track.artists.map((artist) => artist.name).join(', ')}
                      imageUrl={getSafeImageUrl(track.album?.images)}
                      spotifyUrl={track.external_urls.spotify}
                      durationMs={track.duration_ms}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="truncate text-sm font-medium dark:text-white">{track.name}</h5>
                  <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                    {track.artists.map((artist) => artist.name).join(', ')}
                  </p>
                </div>

                <span className="hidden shrink-0 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400 sm:inline">
                  {formatDuration(track.duration_ms)}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Could not load tracks for this playlist.
          </p>
        )}
      </div>
    </section>
  );

  const closePlaylistPanel = () => {
    setSelectedPlaylist(null);
  };


  const hasLoadedAnySection = Object.values(loadedSections).some(Boolean);

  const TabNavigation = () => (
    <div className="mb-6">
      <div className="flex flex-wrap gap-x-4 gap-y-2" role="tablist" aria-label="Music sections">
        {(
          [
            { id: "recent" as MusicTab, label: "recent" },
            { id: "tracks" as MusicTab, label: "tracks" },
            { id: "artists" as MusicTab, label: "artists" },
            { id: "playlists" as MusicTab, label: "playlists" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm capitalize transition-colors ${
              activeTab === tab.id
                ? "font-medium text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "tracks" || activeTab === "artists" ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {(
            [
              { id: "short_term" as TimeRange, label: "1M" },
              { id: "medium_term" as TimeRange, label: "6M" },
              { id: "long_term" as TimeRange, label: "all" },
            ] as const
          ).map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => {
                setTimeRange(range.id);
                void fetchTimeRangeData(range.id, activeTab === "tracks" ? "tracks" : "artists");
              }}
              className={`text-xs capitalize transition-colors ${
                timeRange === range.id
                  ? "font-medium text-zinc-900 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  const renderTrackTile = (track: SpotifyTrack, index: number) => (
    <article key={`${track.id}-${index}`} className="group min-w-0">
      <div className="relative mb-2 aspect-square overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={getSafeImageUrl(track.album?.images)}
          alt={track.album?.name || "Album cover"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          unoptimized
        />
        <div className="absolute inset-0 hidden items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
          <SpotifyPreviewPlayButton
            trackId={track.id}
            trackName={track.name}
            artists={track.artists.map((artist) => artist.name).join(", ")}
            imageUrl={getSafeImageUrl(track.album?.images)}
            spotifyUrl={track.external_urls.spotify}
            durationMs={track.duration_ms}
            size="sm"
          />
        </div>
      </div>
      <a href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="block min-w-0">
        <h4 className="truncate text-sm font-medium text-zinc-800 transition-colors group-hover:text-zinc-600 dark:text-zinc-200 dark:group-hover:text-white">
          {track.name}
        </h4>
        <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
          {track.artists.map((artist) => artist.name).join(", ")}
        </p>
      </a>
    </article>
  );

  const ArtistsTabContent = () => (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Top artists · {timeRangeLabels[timeRange]}
      </p>

      {artistsLoading ? (
        <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">Loading artists…</p>
      ) : topArtists.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {topArtists.map((artist) => (
            <a
              key={artist.id}
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group min-w-0"
            >
              <div className="relative mb-2 aspect-square overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={getSafeImageUrl(artist.images)}
                  alt={artist.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  unoptimized
                />
              </div>
              <h4 className="truncate text-sm font-medium text-zinc-800 transition-colors group-hover:text-zinc-600 dark:text-zinc-200 dark:group-hover:text-white">
                {artist.name}
              </h4>
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                {artist.genres?.length ? artist.genres.slice(0, 2).join(", ") : "—"}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">No artist data right now.</p>
      )}
    </div>
  );

  const TracksTabContent = () => (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Top tracks · {timeRangeLabels[timeRange]}
      </p>

      {tracksLoading ? (
        <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">Loading tracks…</p>
      ) : topTracks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {topTracks.map((track, index) => renderTrackTile(track, index))}
        </div>
      ) : (
        <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">No track data right now.</p>
      )}
    </div>
  );

  const PlaylistsTabContent = () => (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Playlists
      </p>

      {playlists.length > 0 ? (
        <div className={`flex flex-col gap-6 ${selectedPlaylist ? "xl:flex-row xl:items-start" : ""}`}>
          <div className={selectedPlaylist ? "xl:w-[min(100%,360px)] xl:shrink-0" : "w-full"}>
            <div
              className={`grid gap-3 ${
                selectedPlaylist ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              }`}
            >
              {playlists.map((playlist) => {
                const isSelected = selectedPlaylist?.id === playlist.id;
                const playlistDescription = decodeSpotifyText(playlist.description);

                return (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => handlePlaylistClick(playlist)}
                    className={`min-w-0 rounded-md p-2 text-left transition-colors ${
                      isSelected ? "bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800/80 dark:ring-zinc-700" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={getSafeImageUrl(playlist.images)}
                        alt={playlist.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <h4 className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{playlist.name}</h4>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {playlist.tracks?.total || 0} tracks
                    </p>
                    {playlistDescription ? (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
                        {playlistDescription}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPlaylist ? (
            <div className="min-w-0 flex-1 xl:sticky xl:top-4">{renderPlaylistTracksPanel(selectedPlaylist)}</div>
          ) : null}
        </div>
      ) : (
        <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">No playlists available.</p>
      )}
    </div>
  );

  const RecentTabContent = () => (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Recently played
      </p>

      {recentTracks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recentTracks.slice(0, 20).map((track, index) => renderTrackTile(track, index))}
        </div>
      ) : (
        <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">No recent tracks right now.</p>
      )}
    </div>
  );

  return (
    <div className="w-full min-w-0 max-w-5xl">
      <h2 className="mb-8 text-lg font-medium dark:text-white">Music</h2>

      {loading ? (
        <p className="py-8 text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : error ? (
        <p className="py-8 text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
      ) : !hasLoadedAnySection ? (
        <div className="space-y-3 py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Spotify data unavailable right now.</p>
          <a
            href="https://open.spotify.com/user/rohansanjeev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            Open Spotify profile
          </a>
        </div>
      ) : (
        <div>
          {currentlyPlaying && loadedSections.currentlyPlaying ? (
            <section className="mb-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {currentlyPlaying.isPlaying ? "Now playing" : "Last played"}
              </p>
              <div className="flex flex-col gap-4 rounded-lg border border-zinc-100 p-4 sm:flex-row sm:items-center dark:border-zinc-800/80">
                <div className="relative mx-auto h-24 w-24 shrink-0 sm:mx-0">
                  <Image
                    src={getSafeImageUrl(currentlyPlaying.track.album.images)}
                    alt={currentlyPlaying.track.album.name}
                    fill
                    className="rounded-md object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 hidden items-center justify-center rounded-md bg-black/30 lg:flex">
                    <SpotifyPreviewPlayButton
                      trackId={currentlyPlaying.track.id}
                      trackName={currentlyPlaying.track.name}
                      artists={currentlyPlaying.track.artists.map((artist) => artist.name).join(", ")}
                      imageUrl={getSafeImageUrl(currentlyPlaying.track.album.images)}
                      spotifyUrl={currentlyPlaying.track.external_urls.spotify}
                      durationMs={currentlyPlaying.track.duration_ms}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {currentlyPlaying.track.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {currentlyPlaying.track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                    {currentlyPlaying.track.album.name}
                  </p>
                  <div className="mt-3 h-1 max-w-sm overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-500 dark:bg-zinc-400"
                      style={{
                        width: `${(currentlyPlaying.progress_ms / currentlyPlaying.track.duration_ms) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex max-w-sm justify-between text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    <span>{formatDuration(currentlyPlaying.progress_ms)}</span>
                    <span>{formatDuration(currentlyPlaying.track.duration_ms)}</span>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <TabNavigation />

          {activeTab === "artists" && <ArtistsTabContent />}
          {activeTab === "tracks" && <TracksTabContent />}
          {activeTab === "playlists" && <PlaylistsTabContent />}
          {activeTab === "recent" && <RecentTabContent />}
        </div>
      )}
    </div>
  );
};

export default MusicPage; 