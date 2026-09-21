'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getServerState, getState, initSound, subscribe, toggleSound } from '@/lib/site-sound';

// Mutes or unmutes the site's sounds (link clicks, taps on the stream). The state lives in
// lib/site-sound; this shows it and flips it.
export default function SoundToggle() {
  const { enabled } = useSyncExternalStore(subscribe, getState, getServerState);

  useEffect(() => initSound(), []);

  const label = enabled ? 'Mute site sounds' : 'Unmute site sounds';
  const Icon = enabled ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={!enabled}
      aria-label={label}
      title={label}
      className="flex h-4 w-4 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-paper"
    >
      <Icon className="h-[15px] w-[15px]" />
    </button>
  );
}
