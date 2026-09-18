'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMedia } from '@/lib/use-media';
import type { Film } from './FilmCard';

// The pane that sits beside the list on /hobbies and /writing. The list stays a plain list of
// rows; whichever row the cursor is on plays its film in here, and the film it was last on
// stays up as a still once the cursor leaves. Only rendered where there is a cursor to follow.
export default function FilmPreviewPane({
  film,
  caption,
  note,
  playing,
}: {
  film: Film | undefined;
  caption: string;
  note?: string;
  playing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(() => ({ film, caption, note }));
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  // The pane is laid out by CSS at desktop widths, but nothing is fetched into it until we
  // know there is a cursor, so a phone never pays for a preview it cannot hover.
  const hasCursor = useMedia('(hover: hover)');

  // A swap waits a moment: a cursor crossing four rows on its way to the fifth should not
  // fetch five films.
  useEffect(() => {
    if (film === live.film && caption === live.caption) return;
    const id = window.setTimeout(() => setLive({ film, caption, note }), 90);
    return () => window.clearTimeout(id);
  }, [film, caption, note, live]);

  // The video element is only created once the pane is first asked to play, so a page nobody
  // hovers costs one still.
  useEffect(() => {
    if (playing && !reduced) setArmed(true);
  }, [playing, reduced]);

  // A video element that has only just been created is still starting its own load, and that
  // load aborts a play() made in the same breath. So the start is also hung off canplay.
  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v || !playing || reduced) return;
    // Only from a standstill: canplay fires again after the rewind's seek, and rewinding a
    // running film on every one of those would peg it to the first frame.
    if (!v.paused) return;
    v.currentTime = 0;
    v.play().catch(() => {
      // Autoplay can be refused (low power mode, data saver). The still stays up.
    });
  }, [playing, reduced]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing && !reduced) {
      start();
    } else {
      v.pause();
      setReady(false);
    }
  }, [playing, reduced, live, armed, start]);

  const q = live.film ? `?v=${live.film.v}` : '';

  return (
    <div className="sticky top-8">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 bg-[#f0ebe0] dark:border-neutral-800 dark:bg-neutral-900">
        {hasCursor && live.film ? (
          <>
            {armed ? (
              <video
                key={live.film.src}
                ref={videoRef}
                src={live.film.src + q}
                width={live.film.width}
                height={live.film.height}
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                aria-hidden
                tabIndex={-1}
                onCanPlay={start}
                onPlaying={() => setReady(true)}
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[.92]"
              />
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size still from /public, already sized and compressed */}
            <img
              src={live.film.poster + q}
              alt=""
              width={live.film.width}
              height={live.film.height}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 dark:brightness-[.92] ${
                ready && playing ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </>
        ) : null}
      </div>
      <div className="mt-3">
        <span className="block truncate text-sm font-medium text-zinc-700 dark:text-neutral-300">
          {live.caption}
        </span>
        {live.note ? (
          <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-neutral-400">{live.note}</p>
        ) : null}
      </div>
    </div>
  );
}
