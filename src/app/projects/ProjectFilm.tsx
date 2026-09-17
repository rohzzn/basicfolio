'use client';

import React, { useEffect, useRef, useState } from 'react';
import films from '@/data/project-films.json';

type Film = { src: string; poster: string; duration: number; width: number; height: number; v: string };

const FILMS: Record<string, Film> = films;

export function hasFilm(slug: string): boolean {
  return slug in FILMS;
}

function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);
  return matches;
}

// Every card is a short hand-drawn film: drawn frame by frame on a canvas by the
// files in /films and rendered to a looping mp4. The card shows a still until it
// is hovered (or focused), then plays from the top; leaving puts the still back.
// Touch screens have no hover, so there the film plays while the card is on screen.
export default function ProjectFilm({ slug, hovered }: { slug: string; hovered: boolean }) {
  const film = FILMS[slug];
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

  // The video element is only created once a card is first asked to play, so a
  // page of stills costs nothing but the stills.
  useEffect(() => {
    if (shouldPlay) setArmed(true);
  }, [shouldPlay]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (shouldPlay) {
      v.currentTime = 0;
      v.play().catch(() => {
        // Autoplay can be refused (low power mode, data saver). The still stays up.
      });
    } else {
      v.pause();
      setPlaying(false);
    }
  }, [shouldPlay, armed]);

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
