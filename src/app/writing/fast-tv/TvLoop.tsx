'use client';

import React, { useEffect, useRef } from 'react';
import { useMedia } from '@/lib/use-media';

// A screen recording of the TV that loops like a gif: no sound, no controls, playing only while it
// is on screen. With reduced motion it waits on its poster and offers controls instead.
export default function TvLoop({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced) {
      v.pause();
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      controls={reduced}
      width={1280}
      height={720}
      aria-label={label}
      className="block aspect-video h-auto w-full"
    />
  );
}
