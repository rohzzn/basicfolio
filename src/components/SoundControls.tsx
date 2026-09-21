'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useSpotifyPreview } from '@/contexts/SpotifyPreviewContext';
import { duck, getServerState, getState, initSound, setVolume, subscribe, toggle } from '@/lib/stream-sound';

// The switch and the volume for the brook's sound, at the foot of the sidebar. The sound itself
// lives in lib/stream-sound; this only shows its state and changes it. While a Spotify preview
// plays, the brook steps back so the two never fight.
export default function SoundControls() {
  const sound = useSyncExternalStore(subscribe, getState, getServerState);
  const { isPlaying } = useSpotifyPreview();

  useEffect(() => initSound(), []);
  useEffect(() => duck(isPlaying), [isPlaying]);

  const on = sound.enabled;
  const Icon = !on || sound.volume === 0 ? VolumeX : sound.volume < 0.5 ? Volume1 : Volume2;
  const label = !on ? 'Turn the stream sound on' : sound.running ? 'Turn the stream sound off' : 'Start the stream sound';

  return (
    <div data-sound-controls className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on && sound.running}
        aria-label={label}
        title={label}
        className="-m-1 rounded p-1 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-paper"
      >
        <Icon className="h-4 w-4" />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={sound.volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Stream sound volume"
        className={`stream-volume w-16 transition-opacity ${on ? 'opacity-100' : 'opacity-40'}`}
        style={{ '--v': `${Math.round(sound.volume * 100)}%` } as React.CSSProperties}
      />
    </div>
  );
}
