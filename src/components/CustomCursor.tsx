'use client';

import { useEffect } from 'react';

/**
 * One small solid circle that springs along after the pointer.
 *
 * Built to stay cheap on old hardware:
 *  - a single element, created once and mutated by ref; React never re-renders
 *  - one rAF loop that parks itself the moment the spring settles, so a still
 *    mouse costs nothing at all
 *  - only `transform` and `opacity` are ever written, so frames composite
 *    without layout or paint
 *  - no mix-blend-mode and no backdrop-filter; both look lovely and both fall
 *    off the GPU path on older integrated graphics
 *  - the spring integrates on a fixed 120Hz substep, so a 30fps laptop and a
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
const REST = 0.05;

/**
 * Tuned against a simulated 400px flick: ~7% overshoot, settling inside
 * ~175ms. Enough spring to read as alive, tight enough that the circle never
 * feels detached from where you are actually pointing.
 */
const STIFFNESS = 0.2;
const DAMPING = 0.6;

/** The hover pop is a flourish, so it gets a looser, livelier bounce (~11%). */
const SCALE_STIFFNESS = 0.16;
const SCALE_DAMPING = 0.66;

const SCALE_REST = 1;
const SCALE_HOVER = 1.8;
const SCALE_PRESS = 0.75;

export default function CustomCursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || still.matches) return;

    const root = document.documentElement;
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    root.classList.add('has-custom-cursor');

    // Pointer target, circle position and velocity, and the scale spring.
    let px = 0;
    let py = 0;
    let cx = 0;
    let cy = 0;
    let vx = 0;
    let vy = 0;
    let scale = SCALE_REST;
    let scaleV = 0;
    let scaleTarget = SCALE_REST;

    let hovering = false;
    let pressing = false;
    let seen = false;
    let raf = 0;
    let last = 0;
    let acc = 0;

    const draw = () => {
      dot.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(${scale})`;
    };

    const settled = () =>
      Math.abs(px - cx) < REST &&
      Math.abs(py - cy) < REST &&
      Math.abs(vx) < REST &&
      Math.abs(vy) < REST &&
      Math.abs(scaleTarget - scale) < 0.001 &&
      Math.abs(scaleV) < 0.001;

    const frame = (now: number) => {
      raf = 0;
      acc += Math.min(now - last, STEP_MS * MAX_STEPS);
      last = now;

      let steps = 0;
      while (acc >= STEP_MS && steps < MAX_STEPS) {
        acc -= STEP_MS;
        steps += 1;

        vx = (vx + (px - cx) * STIFFNESS) * DAMPING;
        vy = (vy + (py - cy) * STIFFNESS) * DAMPING;
        cx += vx;
        cy += vy;

        scaleV = (scaleV + (scaleTarget - scale) * SCALE_STIFFNESS) * SCALE_DAMPING;
        scale += scaleV;
      }

      if (settled()) {
        cx = px;
        cy = py;
        vx = 0;
        vy = 0;
        scale = scaleTarget;
        scaleV = 0;
        draw();
        return; // idle: nothing queued, no work until the mouse moves again
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
        // First sighting: drop it straight onto the pointer rather than
        // letting it fly in from the corner.
        seen = true;
        cx = px;
        cy = py;
        root.classList.add('cursor-visible');
        draw();
      }

      wake();
    };

    const applyScale = () => {
      scaleTarget = pressing ? SCALE_PRESS : hovering ? SCALE_HOVER : SCALE_REST;
      wake();
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || typeof target.closest !== 'function') return;

      // Over a text field, stand down and let the native I-beam do its job.
      root.classList.toggle('cursor-text', Boolean(target.closest(TEXT_FIELD)));

      const next = Boolean(target.closest(INTERACTIVE));
      if (next !== hovering) {
        hovering = next;
        applyScale();
      }
    };

    const onDown = () => {
      pressing = true;
      applyScale();
    };
    const onUp = () => {
      pressing = false;
      applyScale();
    };
    const onLeave = () => root.classList.remove('cursor-visible');
    const onEnter = () => {
      if (seen) root.classList.add('cursor-visible');
    };

    // Passive: none of these ever call preventDefault.
    const opts = { passive: true } as const;
    window.addEventListener('mousemove', onMove, opts);
    window.addEventListener('mouseover', onOver, opts);
    window.addEventListener('mousedown', onDown, opts);
    window.addEventListener('mouseup', onUp, opts);
    document.addEventListener('mouseleave', onLeave, opts);
    document.addEventListener('mouseenter', onEnter, opts);

    // A hybrid laptop can gain or lose a mouse mid-session.
    const onPointerKindChange = () => {
      if (!fine.matches) root.classList.remove('cursor-visible');
    };
    fine.addEventListener('change', onPointerKindChange);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      fine.removeEventListener('change', onPointerKindChange);
      root.classList.remove('has-custom-cursor', 'cursor-visible', 'cursor-text');
      dot.remove();
    };
  }, []);

  return null;
}
