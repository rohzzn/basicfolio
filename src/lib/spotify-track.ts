import { getSpotifyAccessToken } from '@/lib/spotify-token';

export const SPOTIFY_DEFAULT_COVER =
  'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large';

export interface SpotifyTrackMeta {
  id: string;
  name: string;
  artists: string;
  imageUrl: string;
  spotifyUrl: string;
  durationMs: number;
}

interface SpotifyTrackResponse {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album?: {
    images?: Array<{ url: string }>;
  };
  duration_ms?: number;
  external_urls?: {
    spotify?: string;
  };
}

export function mapSpotifyTrackResponse(
  track: SpotifyTrackResponse,
  fallbackId?: string
): SpotifyTrackMeta {
  const trackId = track.id || fallbackId || '';

  return {
    id: trackId,
    name: track.name,
    artists: track.artists.map((artist) => artist.name).join(', '),
    imageUrl: track.album?.images?.[0]?.url ?? SPOTIFY_DEFAULT_COVER,
    spotifyUrl: track.external_urls?.spotify ?? `https://open.spotify.com/track/${trackId}`,
    durationMs: track.duration_ms ?? 30000,
  };
}

export async function getSpotifyTrackMeta(trackId: string): Promise<SpotifyTrackMeta | null> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  const track = (await response.json()) as SpotifyTrackResponse;
  return mapSpotifyTrackResponse(track, trackId);
}

export interface SpotifyCurrentlyPlayingMeta {
  isPlaying: boolean;
  progressMs: number;
  track: SpotifyTrackMeta | null;
}

export async function getSpotifyCurrentlyPlaying(): Promise<SpotifyCurrentlyPlayingMeta> {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    throw new Error('Spotify not configured');
  }

  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (response.status === 204) {
    return { isPlaying: false, progressMs: 0, track: null };
  }

  if (!response.ok) {
    throw new Error(`Currently playing request failed: ${response.status}`);
  }

  const data = await response.json();
  const item = data.item as SpotifyTrackResponse | undefined;

  if (!item?.id) {
    return { isPlaying: false, progressMs: 0, track: null };
  }

  const trackMeta = await getSpotifyTrackMeta(item.id);

  return {
    isPlaying: Boolean(data.is_playing),
    progressMs: data.progress_ms ?? 0,
    track: trackMeta ?? mapSpotifyTrackResponse(item),
  };
}
