'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMedia } from '@/lib/use-media';

export type Film = {
  src: string;
  poster: string;
  duration: number;
  width: number;
  height: number;
  v: string;
};

export type FilmManifest = Record<string, Film>;

// Every tile on /projects and /hobbies is a short hand-drawn film: drawn frame by frame on a
// canvas by the files in /films and rendered to a looping mp4. The tile shows a still until it
// is hovered (or focused), then plays from the top; leaving puts the still back. Touch screens
// have no hover, so there a film plays while its tile is on screen.
//
// The still is a plain img underneath and the film is laid over it, shown or hidden purely by
// whether the film should be running. Nothing here hangs on a media event that could be missed
// and leave the still stranded over a film already playing behind it.
export default function FilmCard({
  film,
  hovered,
  eager = false,
}: {
  film: Film | undefined;
  hovered: boolean;
  /** For the tiles above the fold: their still is the page's largest paint, so it is not lazy. */
  eager?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [armed, setArmed] = useState(false);
  const touch = useMedia('(hover: none)');
  const reduced = useMedia('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const el = boxRef.current;
    if (!el || !touch) return;
    const obs = new IntersectionObserver((entries) => setOnScreen(Boolean(entries[0]?.isIntersecting)), {
      threshold: 0.6,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [touch]);

  const shouldPlay = !reduced && (touch ? onScreen : hovered);

  // The video element is only created once a tile is first asked to play, so a page of stills
  // costs nothing but the stills.
  useEffect(() => {
    if (shouldPlay) setArmed(true);
  }, [shouldPlay]);

  // A play() can be aborted by the element's own load, so it is also hung off canplay.
  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v || !shouldPlay || !v.paused) return;
    // Seeking an element that has not loaded yet aborts the play() right behind it, so only a
    // film with something to rewind gets rewound.
    if (v.readyState >= 2 && v.currentTime > 0.05) v.currentTime = 0;
    v.play().catch(() => {
      // Autoplay can be refused (low power mode, data saver). The still stays up.
    });
  }, [shouldPlay]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (shouldPlay) start();
    else v.pause();
  }, [shouldPlay, armed, start]);

  if (!film) return null;
  const q = `?v=${film.v}`;

  return (
    <div ref={boxRef} className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size still from /public, already sized and compressed */}
      <img
        src={film.poster + q}
        alt=""
        width={film.width}
        height={film.height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[.92]"
      />
      {armed ? (
        <video
          ref={videoRef}
          src={film.src + q}
          poster={film.poster + q}
          width={film.width}
          height={film.height}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          tabIndex={-1}
          onCanPlay={start}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ease-out dark:brightness-[.92] ${
            shouldPlay ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}
    </div>
  );
}
