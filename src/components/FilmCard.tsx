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

// Every card on /projects, /hobbies and /writing is a short hand-drawn film: drawn frame by
// frame on a canvas by the files in /films and rendered to a looping mp4. The card shows a
// still until it is hovered (or focused), then plays from the top; leaving puts the still
// back. Touch screens have no hover, so there a film plays while its card is on screen.
export default function FilmCard({ film, hovered }: { film: Film | undefined; hovered: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
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

  const shouldPlay = touch ? onScreen && !reduced : hovered;

  // The video element is only created once a card is first asked to play, so a page of
  // stills costs nothing but the stills.
  useEffect(() => {
    if (shouldPlay) setArmed(true);
  }, [shouldPlay]);

  // A video element that has only just been created is still starting its own load, and that
  // load aborts a play() made in the same breath. So the start is also hung off canplay.
  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v || !shouldPlay) return;
    // Only from a standstill: canplay fires again after the rewind's seek, and rewinding a
    // running film on every one of those would peg it to the first frame.
    if (!v.paused) return;
    v.currentTime = 0;
    v.play().catch(() => {
      // Autoplay can be refused (low power mode, data saver). The still stays up.
    });
  }, [shouldPlay]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (shouldPlay) {
      start();
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [shouldPlay, armed, start]);

  if (!film) return null;
  const q = `?v=${film.v}`;

  return (
    <div ref={boxRef} className="absolute inset-0">
      {armed ? (
        <video
          ref={videoRef}
          src={film.src + q}
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
          onPlaying={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[.92]"
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size still from /public, already sized and compressed */}
      <img
        src={film.poster + q}
        alt=""
        width={film.width}
        height={film.height}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 dark:brightness-[.92] ${
          playing && shouldPlay ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
