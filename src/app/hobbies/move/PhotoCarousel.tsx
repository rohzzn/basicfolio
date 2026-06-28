'use client';

import React from 'react';

const IMG_CLASS = 'block h-auto w-full max-w-full object-contain';

interface PhotoCarouselProps {
  images: string[];
  alt: string;
  onAllFailed?: () => void;
}

export default function PhotoCarousel({ images, alt, onAllFailed }: PhotoCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const [failed, setFailed] = React.useState<Set<number>>(() => new Set());

  const visible = React.useMemo(
    () => images.map((url, i) => ({ url, i })).filter(({ i }) => !failed.has(i)),
    [images, failed]
  );

  React.useEffect(() => {
    if (images.length > 0 && visible.length === 0) {
      onAllFailed?.();
    }
  }, [images.length, visible.length, onAllFailed]);

  if (visible.length === 0) return null;

  const safeIndex = index % visible.length;
  const current = visible[safeIndex];
  const hasMultiple = visible.length > 1;

  const go = (delta: number) => {
    setIndex(prev => {
      const next = (prev + delta) % visible.length;
      return next < 0 ? next + visible.length : next;
    });
  };

  return (
    <div className="group relative w-full min-w-0 bg-zinc-100 dark:bg-zinc-900/50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={current.url}
        src={current.url}
        alt={`${alt} ${safeIndex + 1}`}
        className={IMG_CLASS}
        loading="lazy"
        decoding="async"
        onError={() => {
          setFailed(prev => new Set(prev).add(current.i));
          setIndex(0);
        }}
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className="absolute inset-y-0 left-0 w-1/3 cursor-pointer bg-gradient-to-r from-black/30 to-transparent opacity-70 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          />
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className="absolute inset-y-0 right-0 w-1/3 cursor-pointer bg-gradient-to-l from-black/30 to-transparent opacity-70 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/50 to-transparent px-3 pb-2 pt-8">
            <div className="pointer-events-auto flex gap-1">
              {visible.map(({ url }, dotIndex) => (
                <button
                  key={url}
                  type="button"
                  aria-label={`Photo ${dotIndex + 1}`}
                  onClick={() => setIndex(dotIndex)}
                  className={`h-1.5 rounded-full transition-all ${
                    dotIndex === safeIndex
                      ? 'w-4 bg-white'
                      : 'w-1.5 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] tabular-nums text-white/90">
              {safeIndex + 1}/{visible.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
