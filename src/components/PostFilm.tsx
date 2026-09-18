'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMedia } from '@/lib/use-media';
import films from '@/data/writing-films.json';

// The opening plate of a post: the same hand-drawn short that plays beside its row on /writing,
// here at the top of the piece under the date. It runs while it is on screen and stops once it
// is not, so nothing is moving above you while you read.
export default function PostFilm({ slug }: { slug: string }) {
  const film = films[slug as keyof typeof films];
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [rolling, setRolling] = useState(false);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const shouldPlay = onScreen && !reduced;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => setOnScreen(Boolean(entries[0]?.isIntersecting)),
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // The video element is only created once the plate has been scrolled to, so a post opened and
  // read from the middle costs one still.
  useEffect(() => {
    if (shouldPlay) setArmed(true);
  }, [shouldPlay]);

  // A video element that has only just been created is still starting its own load, and that
  // load aborts a play() made in the same breath, so the start is also hung off canplay. Only
  // ever from a standstill: canplay fires again after the rewind's seek, and rewinding a running
  // film on every one of those would peg it to the first frame.
  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v || !shouldPlay || !v.paused) return;
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
      setRolling(false);
    }
  }, [shouldPlay, armed, start]);

  if (!film) return null;
  const q = `?v=${film.v}`;

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#f0ebe0] ring-1 ring-zinc-900/[.07] dark:bg-neutral-900 dark:ring-white/10"
    >
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
          tabIndex={-1}
          onCanPlay={start}
          onPlaying={() => setRolling(true)}
          // timeupdate keeps running while the film does, so the still cannot be left
          // stranded on top of a film that is already playing underneath it.
          onTimeUpdate={() => {
            if (!rolling) setRolling(true);
          }}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[.92]"
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size still from /public, already sized and compressed */}
      <img
        src={film.poster + q}
        alt=""
        width={film.width}
        height={film.height}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out dark:brightness-[.92] ${
          rolling && shouldPlay ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
