'use client';

import { useEffect } from 'react';

/**
 * A small solid circle that opens into a word naming what a click will do.
 *
 * At rest it is a dot on a spring. Over something actionable it widens into a
 * pill — Read, View, Open, Copy — and closes again on the way out. On a
 * portfolio where half the page is a link, that says something the link text
 * usually does not: whether you are about to read an essay, open a demo, or
 * leave the site entirely.
 *
 * Labels are derived from the element itself rather than hand-tagged through
 * the markup, so nothing has to be annotated and nothing can go stale. Any
 * element can still override with `data-cursor-label`.
 *
 * Kept cheap for old hardware:
 *  - one element, created once and mutated by ref; React never re-renders
 *  - one rAF loop that parks itself the moment everything settles, so a still
 *    mouse costs nothing at all
 *  - at rest nothing is written. The width writes that do cost layout are
 *    bounded to the ~200ms of an open or close, and the pill carries `contain`
 *    so that layout can never escape it
 *  - no mix-blend-mode and no backdrop-filter; both look lovely and both fall
 *    off the GPU fast path on older integrated graphics
 *  - the springs integrate on a fixed 120Hz substep, so a 30fps laptop and a
 *    144Hz monitor settle identically
 *
 * It bows out on touch and on reduced-motion, and the native cursor is only
 * hidden once this is confirmed running — so with JavaScript off nothing here
 * applies and the normal cursor stands.
 */

const INTERACTIVE = 'a,button,[role="button"],summary,[data-cursor-label]';
const TEXT_FIELD =
  'input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=submit]),textarea,[contenteditable="true"]';

const STEP_MS = 1000 / 120;
const MAX_STEPS = 8; // caps catch-up after a tab switch

/** Position: ~7% overshoot, settling inside ~175ms on a 400px flick. */
const K = 0.2;
const D = 0.6;

/** Open and close: a looser spring, so the pill arrives with a little bounce. */
const MORPH_K = 0.18;
const MORPH_D = 0.66;

const DOT = 11;
const PILL_H = 26;
const PILL_PAD = 26; // total horizontal padding around the label
const SWELL = 1.7; // for actionable things that have nothing useful to say

/**
 * What a click actually does, read off the element. Order matters: the more
 * specific a rule, the earlier it sits.
 */
function labelFor(el: Element): string | null {
  const explicit = el.getAttribute('data-cursor-label');
  if (explicit !== null) return explicit.trim() || null;

  if (el instanceof HTMLAnchorElement) {
    const href = el.getAttribute('href') ?? '';

    if (href.startsWith('mailto:')) return 'Email';
    if (href.startsWith('tel:')) return 'Call';
    if (href.startsWith('#')) return null;

    // Anything leaving the site is worth flagging as such.
    const external = /^https?:\/\//i.test(href) && el.hostname !== window.location.hostname;
    if (external || el.target === '_blank') return 'Open ↗';

    // Named destinations first, in the site's own words.
    if (href === '/meet') return 'Book';
    if (href === '/guestbook') return 'Sign';
    if (href === '/resume') return 'Read';
    if (href === '/timeline') return 'View';
    if (href === '/links') return 'Open';

    // Then indexes, then the things inside them.
    if (href === '/writing' || href === '/projects' || href === '/hobbies') return 'Browse';
    if (href.startsWith('/writing/')) return 'Read';
    if (href.startsWith('/projects/')) return 'View';
    if (href.startsWith('/hobbies/')) return 'Open';
    if (href.startsWith('/')) return 'Go';
    return null;
  }

  if (el instanceof HTMLButtonElement) {
    // `type` defaults to "submit" on any <button> that did not opt out, so it
    // says nothing about intent. Only a button that actually owns a form
    // submits anything; everything else is a plain action whose own text
    // already says what it does.
    if (el.form && el.type === 'submit') return 'Send';
    return null;
  }

  return null;
}

export default function CustomCursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || calm.matches) return;

    const root = document.documentElement;
    const pill = document.createElement('div');
    const text = document.createElement('span');
    pill.className = 'cursor-dot';
    pill.setAttribute('aria-hidden', 'true');
    pill.appendChild(text);
    document.body.appendChild(pill);
    root.classList.add('has-custom-cursor');

    let px = 0;
    let py = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;

    // 0 = closed dot, 1 = open pill. One spring drives width, height, radius
    // and the label's fade together, so they can never disagree.
    let morph = 0;
    let morphV = 0;
    let morphTo = 0;

    let swell = 1;
    let swellV = 0;
    let swellTo = 1;

    let pillW = DOT;
    let hovered: Element | null = null;
    let seen = false;
    let inDocument = true;
    let overText = false;
    let raf = 0;
    let last = 0;
    let acc = 0;

    const draw = () => {
      const m = morph;
      const w = DOT + (pillW - DOT) * m;
      const h = DOT + (PILL_H - DOT) * m;

      pill.style.width = `${w}px`;
      pill.style.height = `${h}px`;
      pill.style.marginLeft = `${-w / 2}px`;
      pill.style.marginTop = `${-h / 2}px`;
      pill.style.borderRadius = `${Math.min(w, h) / 2}px`;
      pill.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${swell})`;
      pill.style.opacity = seen && inDocument && !overText ? '0.92' : '0';

      // Hold the word back until there is room for it. Clamped, because the
      // spring deliberately overshoots past 1 on the way open.
      text.style.opacity = `${Math.min(1, Math.max(0, (m - 0.45) / 0.55))}`;
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

      // The thing we were labelling went away — a route change, a re-render.
      if (hovered && !hovered.isConnected) {
        hovered = null;
        morphTo = 0;
        swellTo = 1;
      }

      let steps = 0;
      while (acc >= STEP_MS && steps < MAX_STEPS) {
        acc -= STEP_MS;
        steps += 1;

        vx = (vx + (px - x) * K) * D;
        vy = (vy + (py - y) * K) * D;
        x += vx;
        y += vy;

        morphV = (morphV + (morphTo - morph) * MORPH_K) * MORPH_D;
        morph += morphV;

        swellV = (swellV + (swellTo - swell) * MORPH_K) * MORPH_D;
        swell += swellV;
      }

      if (settled()) {
        x = px;
        y = py;
        vx = 0;
        vy = 0;
        morph = morphTo;
        morphV = 0;
        swell = swellTo;
        swellV = 0;
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
      if (el === hovered) return;
      hovered = el;

      const label = el ? labelFor(el) : null;

      if (label) {
        // Set the word first, then measure it: the span is nowrap inside an
        // overflow-hidden parent, so its own width is the natural text width.
        text.textContent = label;
        pillW = Math.max(DOT, text.offsetWidth + PILL_PAD);
        morphTo = 1;
        swellTo = 1;
      } else {
        morphTo = 0;
        // Actionable, but nothing useful to say about it.
        swellTo = el ? SWELL : 1;
      }

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
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      fine.removeEventListener('change', onPointerKindChange);
      root.classList.remove('has-custom-cursor');
      pill.remove();
    };
  }, []);

  return null;
}
