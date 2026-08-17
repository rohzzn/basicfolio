'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function PreviewCard({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] overflow-hidden bg-zinc-50"
    >
      {visible ? (
        <div className="pointer-events-none absolute inset-0">{children}</div>
      ) : (
        <div className="absolute inset-0 animate-pulse bg-zinc-100" aria-hidden />
      )}
    </div>
  );
}
