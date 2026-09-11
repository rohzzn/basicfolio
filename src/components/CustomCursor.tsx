'use client';

import { useEffect } from 'react';

/**
 * A small solid circle that gets captured by whatever it can click.
 *
 * At rest it is a dot on a spring. Near a link or a button it is pulled to
 * that element's centre and grows into its exact shape, so targets feel
 * sticky and clicking gets easier; leaving releases it back to a dot.
 *
 * Kept cheap for old hardware:
 *  - one element, created once and mutated by ref; React never re-renders
 *  - one rAF loop that parks itself the moment everything settles, so a still
 *    mouse costs nothing at all
 *  - at rest nothing is written. The geometry writes that do cost layout are
 *    bounded to the ~200ms of a capture or release, and the element carries
 *    `contain` so that layout can never escape it
 *  - no mix-blend-mode and no backdrop-filter; both look lovely and both fall
 *    off the GPU fast path on older integrated graphics
 *  - the springs integrate on a fixed 120Hz substep, so a 30fps laptop and a
 *    144Hz monitor settle identically
 *
 * It bows out on touch and on reduced-motion, and the native cursor is only
 * hidden once this is confirmed running — so with JavaScript off nothing here
 * applies and the normal cursor stands.
 */

const INTERACTIVE =
  'a,button,[role="button"],select,summary,label,[data-cursor="interactive"]';
const TEXT_FIELD =
  'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]),textarea,[contenteditable="true"]';

const STEP_MS = 1000 / 120;
const MAX_STEPS = 8; // caps catch-up after a tab switch

/** Position: ~7% overshoot, settling inside ~175ms on a 400px flick. */
const K = 0.2;
const D = 0.6;

/** Capture and release: a looser spring so the snap has a little bounce. */
const MORPH_K = 0.18;
const MORPH_D = 0.66;

const DOT = 11;
const PAD = 7; // breathing room around a captured element

/**
 * Past this, wrapping the element would cover the thing you are trying to
 * look at — a project card is not a cursor. Those get a swell instead.
 */
const MAX_W = 260;
const MAX_H = 132;
const BIG_SCALE = 1.7;

interface Target {
  el: Element;
  cx: number;
  cy: number;
  w: number;
  h: number;
  r: number;
}

export default function CustomCursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || calm.matches) return;

    const root = document.documentElement;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    root.classList.add('has-custom-cursor');

    let px = 0;
    let py = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;

    // 0 = free dot, 1 = wrapped around the target. One spring drives the whole
    // capture, so position, size, radius and fill can never disagree.
    let morph = 0;
    let morphV = 0;
    let morphTo = 0;

    let swell = 1;
    let swellV = 0;
    let swellTo = 1;

    let target: Target | null = null;
    let seen = false;
    let inDocument = true;
    let overText = false;
    let boundsStale = false;
    let raf = 0;
    let last = 0;
    let acc = 0;

    const measure = (el: Element): Target | null => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      if (r.width + PAD * 2 > MAX_W || r.height + PAD * 2 > MAX_H) return null;

      const radius = parseFloat(getComputedStyle(el).borderRadius) || 0;
      return {
        el,
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
        w: r.width + PAD * 2,
        h: r.height + PAD * 2,
        r: radius > 0 ? radius + PAD : 999,
      };
    };

    const draw = () => {
      const m = morph;
      const w = target ? DOT + (target.w - DOT) * m : DOT;
      const h = target ? DOT + (target.h - DOT) * m : DOT;

      // Circle when free, the element's own corner when wrapped.
      const rest = Math.min(w, h) / 2;
      const r = target ? target.r + (rest - target.r) * (1 - m) : rest;

      dot.style.width = `${w}px`;
      dot.style.height = `${h}px`;
      dot.style.marginLeft = `${-w / 2}px`;
      dot.style.marginTop = `${-h / 2}px`;
      dot.style.borderRadius = `${r}px`;
      // Solid as a dot, a quiet wash once it is covering something readable.
      const shown = seen && inDocument && !overText;
      dot.style.opacity = shown ? `${0.85 - 0.71 * m}` : '0';
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${swell})`;
    };

    const settled = () =>
      Math.abs(px - x) < 0.06 &&
      Math.abs(py - y) < 0.06 &&
      Math.abs(vx) < 0.06 &&
      Math.abs(vy) < 0.06 &&
      Math.abs(morphTo - morph) < 0.002 &&
      Math.abs(morphV) < 0.002 &&
      Math.abs(swellTo - swell) < 0.002 &&
      Math.abs(swellV) < 0.002;

    const frame = (now: number) => {
      raf = 0;
      acc += Math.min(now - last, STEP_MS * MAX_STEPS);
      last = now;

      // The page moved under a captured element, or it went away entirely.
      if (target && boundsStale) {
        boundsStale = false;
        target = target.el.isConnected ? measure(target.el) : null;
        if (!target) morphTo = 0;
      }

      let steps = 0;
      while (acc >= STEP_MS && steps < MAX_STEPS) {
        acc -= STEP_MS;
        steps += 1;

        // Anchor blends from the pointer to the element as the capture closes.
        const ax = target ? px + (target.cx - px) * morph : px;
        const ay = target ? py + (target.cy - py) * morph : py;

        vx = (vx + (ax - x) * K) * D;
        vy = (vy + (ay - y) * K) * D;
        x += vx;
        y += vy;

        morphV = (morphV + (morphTo - morph) * MORPH_K) * MORPH_D;
        morph += morphV;

        swellV = (swellV + (swellTo - swell) * MORPH_K) * MORPH_D;
        swell += swellV;
      }

      if (settled()) {
        const ax = target ? px + (target.cx - px) * morphTo : px;
        const ay = target ? py + (target.cy - py) * morphTo : py;
        x = ax;
        y = ay;
        vx = 0;
        vy = 0;
        morph = morphTo;
        morphV = 0;
        swell = swellTo;
        swellV = 0;
        if (morph === 0) target = null;
        draw();
        return; // idle: nothing queued until something moves again
      }

      draw();
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (event: MouseEvent) => {
      px = event.clientX;
      py = event.clientY;

      if (!seen) {
        // First sighting: drop it onto the pointer rather than letting it fly
        // in from the corner.
        seen = true;
        inDocument = true;
        x = px;
        y = py;
        draw();
      }

      wake();
    };

    const onOver = (event: MouseEvent) => {
      const node = event.target as Element | null;
      if (!node || typeof node.closest !== 'function') return;

      // Over a text field, stand down and let the native I-beam do its job.
      const nextText = Boolean(node.closest(TEXT_FIELD));
      if (nextText !== overText) {
        overText = nextText;
        draw();
      }

      const el = node.closest(INTERACTIVE);
      if (el === target?.el) return;

      const next = el ? measure(el) : null;

      if (next) {
        target = next;
        morphTo = 1;
        swellTo = 1;
      } else {
        morphTo = 0;
        // Too big to wrap, but still worth acknowledging.
        swellTo = el ? BIG_SCALE : 1;
      }

      wake();
    };

    const onScroll = () => {
      if (!target) return;
      boundsStale = true;
      wake();
    };

    const onLeave = () => {
      inDocument = false;
      draw();
    };
    const onEnter = () => {
      inDocument = true;
      draw();
    };

    // Passive: none of these ever call preventDefault.
    const opts = { passive: true } as const;
    window.addEventListener('mousemove', onMove, opts);
    window.addEventListener('mouseover', onOver, opts);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, opts);
    document.addEventListener('mouseleave', onLeave, opts);
    document.addEventListener('mouseenter', onEnter, opts);

    // A hybrid laptop can gain or lose a mouse mid-session.
    const onPointerKindChange = () => {
      inDocument = fine.matches;
      draw();
    };
    fine.addEventListener('change', onPointerKindChange);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      fine.removeEventListener('change', onPointerKindChange);
      root.classList.remove('has-custom-cursor');
      dot.remove();
    };
  }, []);

  return null;
}
