'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMedia } from '@/lib/use-media';
import type { Film } from './FilmCard';

type Layer = { key: string; film: Film };

// The pane beside the list on /hobbies and /writing. Nothing is there until the cursor is on a
// row: then that row's film fades up and plays, and the pane fades away again when the cursor
// leaves the list. Running down the list cross-fades, and the film being replaced is held until
// the new one's still has actually decoded, so there is never a blank frame in between.
export default function FilmPreviewPane({ film }: { film: Film | undefined }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [top, setTop] = useState<Layer | null>(null);
  const [under, setUnder] = useState<Layer | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const hasCursor = useMedia('(hover: hover)');

  // Leaving the list fades the pane out, but not on the instant: clipping the gap between two
  // rows should not blink it away and straight back.
  useEffect(() => {
    if (film) {
      setOpen(true);
      return;
    }
    const id = window.setTimeout(() => setOpen(false), 140);
    return () => window.clearTimeout(id);
  }, [film]);

  // The film on top changes; the one it replaces slides underneath and waits there.
  useEffect(() => {
    if (!film || !hasCursor || (top && top.film === film)) return;
    if (top && loaded) setUnder(top);
    setTop({ key: film.src, film });
    setLoaded(false);
    setRolling(false);
  }, [film, hasCursor, top, loaded]);

  useEffect(() => {
    if (!loaded || !under) return;
    const id = window.setTimeout(() => setUnder(null), 260);
    return () => window.clearTimeout(id);
  }, [loaded, under]);

  // A video element that has only just been created is still starting its own load, and that
  // load aborts a play() made in the same breath, so the start is also hung off canplay. Only
  // ever from a standstill: canplay fires again after the rewind's seek, and rewinding a running
  // film on every one of those would peg it to the first frame.
  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v || !open || reduced || !v.paused) return;
    v.currentTime = 0;
    v.play().catch(() => {
      // Autoplay can be refused (low power mode, data saver). The still stays up.
    });
  }, [open, reduced]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (open && !reduced) {
      start();
    } else {
      v.pause();
      setRolling(false);
    }
  }, [open, reduced, top, start]);

  // A cached still can finish loading before React has hung onLoad on it.
  const poster = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete) setLoaded(true);
  }, []);

  // No cursor, no pane, and nothing fetched for one either.
  if (!hasCursor) return null;

  return (
    <div
      aria-hidden
      className={`sticky top-8 transition-[opacity,transform] duration-300 ease-out ${
        open && top ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f0ebe0] ring-1 ring-zinc-900/[.07] dark:bg-neutral-900 dark:ring-white/10">
        {under ? (
          /* eslint-disable-next-line @next/next/no-img-element -- a fixed-size still from /public, already sized and compressed */
          <img
            key={under.key}
            src={`${under.film.poster}?v=${under.film.v}`}
            alt=""
            width={under.film.width}
            height={under.film.height}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[.92]"
          />
        ) : null}
        {top ? (
          <React.Fragment key={top.key}>
            {/* eslint-disable-next-line @next/next/no-img-element -- as above */}
            <img
              ref={poster}
              src={`${top.film.poster}?v=${top.film.v}`}
              alt=""
              width={top.film.width}
              height={top.film.height}
              decoding="async"
              onLoad={() => setLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out dark:brightness-[.92] ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <video
              ref={videoRef}
              src={`${top.film.src}?v=${top.film.v}`}
              width={top.film.width}
              height={top.film.height}
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              tabIndex={-1}
              onCanPlay={start}
              onPlaying={() => setRolling(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out dark:brightness-[.92] ${
                rolling ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </React.Fragment>
        ) : null}
      </div>
    </div>
  );
}
