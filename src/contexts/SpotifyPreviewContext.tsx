'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import SpotifyPreviewPlayerBar from '@/components/SpotifyPreviewPlayerBar';
import { isDesktopPreviewEnabled, useDesktopPreviewEnabled } from '@/hooks/use-desktop-preview';

export interface PreviewTrackMeta {
  id: string;
  name: string;
  artists: string;
  imageUrl: string;
  spotifyUrl?: string;
  durationMs?: number;
}

interface SpotifyPreviewContextValue {
  currentTrack: PreviewTrackMeta | null;
  currentTrackId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  progressMs: number;
  durationMs: number;
  volume: number;
  setVolume: (volume: number) => void;
  toggleTrack: (trackId: string, meta?: PreviewTrackMeta) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (ms: number) => void;
  isPlayingTrack: (trackId: string) => boolean;
  isLoadingTrack: (trackId: string) => boolean;
}

const SpotifyPreviewContext = createContext<SpotifyPreviewContextValue | null>(null);
const VOLUME_STORAGE_KEY = 'spotify-preview-volume';
const DEFAULT_VOLUME = 0.5;

const previewUrlCache = new Map<string, string>();
const trackMetaCache = new Map<string, PreviewTrackMeta>();

const DEFAULT_COVER =
  'https://community.spotify.com/t5/image/serverpage/image-id/55829iC2AD64ADB887E2A5/image-size/large';

async function fetchPreviewUrl(trackId: string): Promise<string | null> {
  if (previewUrlCache.has(trackId)) {
    return previewUrlCache.get(trackId)!;
  }

  const response = await fetch(`/api/spotify/preview?trackId=${encodeURIComponent(trackId)}`);
  if (!response.ok) return null;

  const data = await response.json();
  if (typeof data.previewUrl === 'string') {
    previewUrlCache.set(trackId, data.previewUrl);
    return data.previewUrl;
  }

  return null;
}

async function fetchTrackMeta(trackId: string): Promise<PreviewTrackMeta | null> {
  if (trackMetaCache.has(trackId)) {
    return trackMetaCache.get(trackId)!;
  }

  const response = await fetch(`/api/spotify/track?trackId=${encodeURIComponent(trackId)}`);
  if (!response.ok) return null;

  const data = await response.json();
  const meta: PreviewTrackMeta = {
    id: data.id,
    name: data.name,
    artists: data.artists,
    imageUrl: data.imageUrl ?? DEFAULT_COVER,
    spotifyUrl: data.spotifyUrl,
    durationMs: data.durationMs,
  };

  trackMetaCache.set(trackId, meta);
  return meta;
}

function readStoredVolume(): number {
  if (typeof window === 'undefined') return DEFAULT_VOLUME;
  const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
  if (!stored) return DEFAULT_VOLUME;
  const parsed = Number(stored);
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : DEFAULT_VOLUME;
}

export function SpotifyPreviewProvider({ children }: { children: React.ReactNode }) {
  const isDesktopEnabled = useDesktopPreviewEnabled();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PreviewTrackMeta | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(30000);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);

  const pausePreview = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTrackId(null);
    setProgressMs(0);
    setDurationMs(30000);
    window.dispatchEvent(new CustomEvent('resume-background-music'));
  }, []);

  useEffect(() => {
    setVolumeState(readStoredVolume());
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setProgressMs(Math.floor(audio.currentTime * 1000));
    };

    const onLoadedMetadata = () => {
      const duration = Number.isFinite(audio.duration) ? Math.floor(audio.duration * 1000) : 30000;
      setDurationMs(duration > 0 ? duration : 30000);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
      setCurrentTrackId(null);
      setProgressMs(0);
      window.dispatchEvent(new CustomEvent('resume-background-music'));
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    if (!isDesktopEnabled && currentTrackId) {
      stopPreview();
    }
  }, [isDesktopEnabled, currentTrackId, stopPreview]);

  const setVolume = useCallback((nextVolume: number) => {
    setVolumeState(Math.min(1, Math.max(0, nextVolume)));
  }, []);

  const seek = useCallback((ms: number) => {
    if (!audioRef.current) return;
    const clampedMs = Math.max(0, Math.min(ms, durationMs));
    audioRef.current.currentTime = clampedMs / 1000;
    setProgressMs(clampedMs);
  }, [durationMs]);

  const resume = useCallback(async () => {
    if (!audioRef.current || !currentTrackId) return;

    try {
      window.dispatchEvent(new CustomEvent('pause-background-music'));
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Spotify preview resume failed:', error);
    }
  }, [currentTrackId]);

  const toggleTrack = useCallback(
    async (trackId: string, meta?: PreviewTrackMeta) => {
      if (!isDesktopPreviewEnabled()) {
        return;
      }

      if (currentTrackId === trackId && isPlaying) {
        pausePreview();
        window.dispatchEvent(new CustomEvent('resume-background-music'));
        return;
      }

      if (currentTrackId === trackId && !isPlaying && audioRef.current?.src) {
        await resume();
        return;
      }

      setLoadingTrackId(trackId);

      try {
        const [previewUrl, resolvedMeta] = await Promise.all([
          fetchPreviewUrl(trackId),
          meta ? Promise.resolve(meta) : fetchTrackMeta(trackId),
        ]);

        if (!previewUrl || !audioRef.current) return;

        const trackMeta = resolvedMeta ?? {
          id: trackId,
          name: 'Unknown track',
          artists: 'Spotify preview',
          imageUrl: DEFAULT_COVER,
          spotifyUrl: `https://open.spotify.com/track/${trackId}`,
        };

        audioRef.current.src = previewUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.volume = volume;
        setCurrentTrack(trackMeta);
        setCurrentTrackId(trackId);
        setProgressMs(0);
        setDurationMs(trackMeta.durationMs ?? 30000);
        window.dispatchEvent(new CustomEvent('pause-background-music'));
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Spotify preview playback failed:', error);
        window.dispatchEvent(new CustomEvent('resume-background-music'));
      } finally {
        setLoadingTrackId(null);
      }
    },
    [currentTrackId, isPlaying, pausePreview, resume, volume]
  );

  const value: SpotifyPreviewContextValue = {
    currentTrack,
    currentTrackId,
    isPlaying,
    isLoading: loadingTrackId !== null,
    progressMs,
    durationMs,
    volume,
    setVolume,
    toggleTrack,
    pause: pausePreview,
    resume,
    stop: stopPreview,
    seek,
    isPlayingTrack: (trackId) => currentTrackId === trackId && isPlaying,
    isLoadingTrack: (trackId) => loadingTrackId === trackId,
  };

  return (
    <SpotifyPreviewContext.Provider value={value}>
      {children}
      <SpotifyPreviewPlayerBar />
    </SpotifyPreviewContext.Provider>
  );
}

export function useSpotifyPreview() {
  const context = useContext(SpotifyPreviewContext);
  if (!context) {
    throw new Error('useSpotifyPreview must be used within SpotifyPreviewProvider');
  }
  return context;
}

export function useSpotifyPreviewActive(): boolean {
  const { currentTrack, isLoading } = useSpotifyPreview();
  const isDesktopEnabled = useDesktopPreviewEnabled();
  return isDesktopEnabled && (currentTrack !== null || isLoading);
}
