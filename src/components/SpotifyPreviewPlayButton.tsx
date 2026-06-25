'use client';

import React from 'react';
import { Loader2, Pause, Play } from 'lucide-react';
import { PreviewTrackMeta, useSpotifyPreview } from '@/contexts/SpotifyPreviewContext';
import { useDesktopPreviewEnabled } from '@/hooks/use-desktop-preview';

interface SpotifyPreviewPlayButtonProps {
  trackId: string;
  trackName?: string;
  artists?: string;
  imageUrl?: string;
  spotifyUrl?: string;
  durationMs?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export default function SpotifyPreviewPlayButton({
  trackId,
  trackName,
  artists,
  imageUrl,
  spotifyUrl,
  durationMs,
  size = 'sm',
  className = '',
}: SpotifyPreviewPlayButtonProps) {
  const isDesktopEnabled = useDesktopPreviewEnabled();
  const { toggleTrack, isPlayingTrack, isLoadingTrack } = useSpotifyPreview();

  if (!isDesktopEnabled) {
    return null;
  }

  const playing = isPlayingTrack(trackId);
  const loading = isLoadingTrack(trackId);
  const iconClass = iconSizes[size];

  const meta: PreviewTrackMeta | undefined =
    trackName && artists && imageUrl
      ? {
          id: trackId,
          name: trackName,
          artists,
          imageUrl,
          spotifyUrl,
          durationMs,
        }
      : undefined;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleTrack(trackId, meta);
      }}
      aria-label={playing ? 'Pause preview' : 'Play 30 second preview'}
      className={`flex items-center justify-center transition-opacity ${className}`}
    >
      {loading ? (
        <Loader2 className={`${iconClass} text-white animate-spin`} />
      ) : playing ? (
        <Pause className={`${iconClass} text-white`} />
      ) : (
        <Play className={`${iconClass} text-white`} />
      )}
    </button>
  );
}
