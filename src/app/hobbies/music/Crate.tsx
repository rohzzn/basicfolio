'use client';

import React, { useEffect, useRef } from 'react';
import Image from '@/components/SiteImage';

// A wooden crate of records to dig through. The one at the front stands face-out; those behind
// show only their top edges, each a little higher than the last. Flipping one forward tips it over
// towards you and the next is in front. Clicking a record's top edge flips straight to it, and
// clicking the one at the front puts it on the deck. Arrow keys, the buttons under the crate, or a
// swipe all flip too.

export interface CrateItem {
  id: string;
  image: string | null;
  title: string;
  subtitle: string;
}

const BEHIND = 8; // records whose tops show behind the front one

export default function Crate({
  items,
  at,
  onAt,
  onOpen,
  label,
  deckId,
  openLabel,
}: {
  items: CrateItem[];
  at: number;
  onAt: (i: number) => void;
  onOpen: (i: number) => void;
  label: string;
  deckId: string | null;
  openLabel: string;
}) {
  const drag = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const count = items.length;
  const go = (i: number) => onAt(Math.max(0, Math.min(count - 1, i)));

  // keep the index in range when the list under it changes
  useEffect(() => {
    if (count && at > count - 1) onAt(count - 1);
  }, [at, count, onAt]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      go(at + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      go(at - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(at);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY };
    suppressClick.current = false;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    suppressClick.current = true;
    // pulling a record towards you (down, or to the left) shows the next
    const next = Math.abs(dy) > Math.abs(dx) ? dy > 0 : dx < 0;
    go(at + (next ? 1 : -1));
  };

  const shown = [];
  for (let i = Math.max(0, at - 1); i <= Math.min(count - 1, at + BEHIND); i++) shown.push(i);

  return (
    <div className="crate-wrap">
      <div
        className="crate"
        tabIndex={0}
        role="group"
        aria-roledescription="crate of records"
        aria-label={`${label}: ${items[at]?.title ?? 'empty'}, ${at + 1} of ${count}`}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <div className="crate-bin">
          {shown.map((i) => {
            const d = i - at;
            const item = items[i];
            const style: React.CSSProperties =
              d < 0
                ? { transform: 'translateY(34px) rotateX(-72deg)', opacity: 0, zIndex: 55, pointerEvents: 'none' }
                : { transform: `translateY(calc(${-d} * var(--step))) scale(${1 - d * 0.024})`, zIndex: 50 - d };
            return (
              <div key={item.id} className={`crate-sleeve ${d === 0 ? 'crate-sleeve-front' : ''}`} style={style}>
                <button
                  type="button"
                  className="crate-lift"
                  tabIndex={-1}
                  aria-label={d === 0 ? `${openLabel}: ${item.title}` : `Flip to ${item.title}`}
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    if (d === 0) onOpen(i);
                    else go(i);
                  }}
                >
                  {d === 0 ? (
                    <span className="crate-record" aria-hidden>
                      {item.image ? <span className="crate-record-label" style={{ backgroundImage: `url(${item.image})` }} /> : null}
                    </span>
                  ) : null}
                  <span className="crate-cover">
                    {item.image ? (
                      <Image src={item.image} alt="" fill unoptimized className="object-cover" draggable={false} />
                    ) : (
                      <span className="flex h-full items-center justify-center p-3 text-center text-xs">{item.title}</span>
                    )}
                    {d > 0 ? <span className="crate-shade" style={{ opacity: Math.min(0.4, d * 0.05) }} /> : null}
                    {item.id === deckId ? <span className="crate-sticker music-hand">on the deck</span> : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <div className="crate-board">
          <span className="crate-handle" />
          <span className="music-hand crate-label">{label}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <button type="button" className="crate-nav" onClick={() => go(at - 1)} disabled={at <= 0} aria-label="Previous record">
          ‹
        </button>
        <span className="tabular-nums text-xs text-zinc-400 dark:text-neutral-400">
          {count ? at + 1 : 0} / {count}
        </span>
        <button type="button" className="crate-nav" onClick={() => go(at + 1)} disabled={at >= count - 1} aria-label="Next record">
          ›
        </button>
      </div>
    </div>
  );
}
