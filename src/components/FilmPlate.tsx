'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMedia } from '@/lib/use-media';
import type { Film } from './FilmCard';

// The opening plate of a post or a project: the same hand-drawn short that plays beside its row on
// /writing or /projects, here at the top of the page under the title. It runs while it is on
// screen and stops once it is not, so nothing is moving above you while you read.
//
// The still is a plain img underneath and the film is laid over it, shown or hidden purely by
// whether the film should be running, so the still can never be left stranded over a film that
// is already playing behind it.
export default function FilmPlate({ film }: { film: Film | undefined }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Assumed on screen to begin with: the plate opens the post, so the observer's job is to stop
  // the film once it has been scrolled past, not to grant permission to start it.
  const [onScreen, setOnScreen] = useState(true);
  const [idle, setIdle] = useState(false);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const shouldPlay = onScreen && !reduced;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => setOnScreen(Boolean(entries[0]?.isIntersecting)),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // The film is a megabyte of nothing-to-read, so it waits for the page to go quiet before it
  // asks for the network. The still is up the whole time.
  useEffect(() => {
    type Idler = (cb: () => void, opts?: { timeout: number }) => number;
    const ric = (window as unknown as { requestIdleCallback?: Idler }).requestIdleCallback;
    if (ric) {
      const id = ric(() => setIdle(true), { timeout: 2000 });
      return () => (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setIdle(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  const armed = idle && onScreen;

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
    <div
      ref={boxRef}
      aria-hidden
      className="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#f0ebe0] ring-1 ring-zinc-900/[.07] dark:bg-neutral-900 dark:ring-white/10"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size still from /public, already sized and compressed */}
      <img
        src={film.poster + q}
        alt=""
        width={film.width}
        height={film.height}
        fetchPriority="high"
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
          tabIndex={-1}
          onCanPlay={start}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out dark:brightness-[.92] ${
            shouldPlay ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}
    </div>
  );
}
