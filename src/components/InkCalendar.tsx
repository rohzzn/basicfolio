'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { CalendarActivity } from '@/lib/github-calendar';
import { languageColor, type LanguageCalendar } from '@/lib/github-languages';
import { FPS_DRAW, fitCanvas, grain, hashSeed, rng, wobSquare } from '@/lib/hand-drawn';

// The same geometry the SVG calendar used, so the block keeps its proportions.
const MARGIN = 3;
const MAX_BLOCK = 28;
const MIN_BLOCK = 4;
const ROWS = 7;
// A hand-drawn square needs room. Nine months in a 52ch column works out at 10px cells,
// and a crooked 10px square is just a smudge. So the window is however much history fits
// at a size the marks can survive: seven months on a desktop column, fewer on a phone.
const MONTH_CHOICES = [7, 6, 5, 4, 3];
const READABLE_BLOCK = 13;

// The fallback ramps, for days whose commits have no language attached.
const RAMP = {
  light: ['#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'],
  dark: ['#262626', '#525252', '#737373', '#d4d4d4', '#F5F1EC'],
} as const;
// Paper and ink: light mode is the page's own cream, dark mode is chalk on near-black.
const INK = { light: '#33302a', dark: '#F5F1EC' } as const;

function recentMonths(data: CalendarActivity[], months: number): CalendarActivity[] {
  const now = new Date();
  const from = new Date(now);
  from.setMonth(now.getMonth() - months);
  return data.filter((day) => new Date(day.date) >= from);
}

/** The most history that still leaves the squares big enough to read as drawn. */
function fitWindow(data: CalendarActivity[], width: number) {
  let last = null as null | { days: CalendarActivity[]; columns: number; bs: number; offset: number };
  for (const months of MONTH_CHOICES) {
    const days = recentMonths(data, months);
    if (days.length === 0) continue;
    const offset = new Date(days[0].date).getDay();
    const columns = Math.ceil((offset + days.length) / ROWS);
    const bs = blockSize(width, columns);
    last = { days, columns, bs, offset };
    if (bs >= READABLE_BLOCK) break;
  }
  return last;
}

function blockSize(width: number, columns: number): number {
  if (width < 16 || columns < 1) return 9;
  const bs = Math.floor((width - (columns - 1) * MARGIN) / columns);
  return Math.max(MIN_BLOCK, Math.min(MAX_BLOCK, bs));
}

/**
 * A year of commits, drawn the way the project films are drawn: every square a
 * hand-drawn square, fill and outline on separate seeds so they never line up,
 * and the whole grid inking itself in column by column on twos.
 *
 * Live data, so unlike the cards this cannot be a film — it is drawn in the
 * browser on a canvas, once, and only redrawn when the width or the theme changes.
 */
export default function InkCalendar({
  data,
  languages,
  isDark,
}: {
  data: CalendarActivity[];
  languages: LanguageCalendar;
  isDark: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widthRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const draw = useCallback(
    (progress: number) => {
      const canvas = canvasRef.current;
      const width = widthRef.current;
      if (!canvas || width < 24) return;

      const fitted = fitWindow(data, width);
      if (!fitted) return;
      const { days, columns, bs, offset } = fitted;
      const height = ROWS * (bs + MARGIN) - MARGIN;

      const c = fitCanvas(canvas, width, height);
      if (!c) return;

      const scheme = isDark ? 'dark' : 'light';
      const ink = INK[scheme];
      const ramp = RAMP[scheme];
      // Small squares can only take a hair of wobble before they read as noise.
      const amp = Math.max(0.35, Math.min(1.5, bs * 0.075));
      const lw = Math.max(0.7, Math.min(1.8, bs * 0.075));
      c.lineJoin = 'round';
      c.lineCap = 'round';

      const shown = Math.ceil(columns * progress);
      days.forEach((day, i) => {
        const col = Math.floor((offset + i) / ROWS);
        if (col >= shown) return;
        const row = (offset + i) % ROWS;
        const x = col * (bs + MARGIN);
        const y = row * (bs + MARGIN);
        const seed = hashSeed(day.date);
        const level = Math.min(4, Math.max(0, day.level));
        const fill = level > 0 ? languageColor(languages.byDate[day.date], level, scheme) ?? ramp[level] : null;

        if (fill) {
          c.fillStyle = fill;
          wobSquare(c, x, y, bs, bs, amp, seed);
          c.fill();
          // the ink look: a little grain in the fill, hatch once the square is big enough to show it
          if (bs >= 7) grain(c, x, y, bs, bs, Math.round(bs * 0.6), ink, 0.12, seed + 3, Math.max(0.8, bs * 0.06));
          if (bs >= 13 && level >= 3) {
            const r = rng(seed + 9);
            c.save();
            c.strokeStyle = ink;
            c.globalAlpha = 0.16;
            c.lineWidth = lw * 0.8;
            c.beginPath();
            for (let k = 1; k < 4; k++) {
              const u = (bs * k) / 4 + (r() - 0.5) * 2;
              c.moveTo(x + u, y + 2);
              c.lineTo(x + u - bs * 0.35, y + bs - 2);
            }
            c.stroke();
            c.restore();
          }
        }

        // the outline, on its own seed so it sits beside the fill rather than on it
        c.strokeStyle = ink;
        c.globalAlpha = level > 0 ? 0.42 : 0.16;
        c.lineWidth = lw;
        wobSquare(c, x + 0.4, y + 0.4, bs - 0.8, bs - 0.8, amp, seed + 101);
        c.stroke();
        c.globalAlpha = 1;
      });
    },
    [data, languages, isDark]
  );

  const animate = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      frameRef.current = requestAnimationFrame(() => draw(1));
      return;
    }
    // On twos, like the films: the grid inks itself in over about nine tenths of a second.
    const steps = Math.round(0.9 * FPS_DRAW);
    let step = 0;
    draw(0);
    timerRef.current = setInterval(() => {
      step += 1;
      const t = step / steps;
      draw(1 - Math.pow(1 - t, 2));
      if (step >= steps && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000 / FPS_DRAW);
  }, [draw]);

  // width first: the block size, and so the canvas height, follow the column
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let last = 0;
    const sync = () => {
      const w = el.getBoundingClientRect().width;
      if (Math.abs(w - last) < 1) return;
      last = w;
      widthRef.current = w;
      animate();
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [animate]);

  // a theme flip repaints in the other ink, without replaying the draw-in
  useEffect(() => {
    if (widthRef.current > 24) draw(1);
  }, [isDark, draw]);

  if (data.length === 0) return null;

  return (
    <div ref={wrapRef} className="mb-3 w-full min-w-0">
      <canvas ref={canvasRef} className="block w-full" aria-label="GitHub contributions, the last few months" role="img" />
    </div>
  );
}
