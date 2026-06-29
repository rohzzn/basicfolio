"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE =
  'a, button, [role="button"], [data-cursor], label, summary, input[type="checkbox"], input[type="radio"]';

const TEXT_FIELD =
  'input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"], .cursor-text';

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    document.body.classList.add("custom-cursor-active");

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;
    let hovering = false;
    let hidden = false;

    const setHover = (next: boolean) => {
      if (hovering === next) return;
      hovering = next;
      document.body.classList.toggle("custom-cursor-hover", next);
    };

    const setHidden = (next: boolean) => {
      if (hidden === next) return;
      hidden = next;
      document.body.classList.toggle("custom-cursor-hidden", next);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      d.style.transform = `translate(${mx}px, ${my}px)`;

      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target) return;

      setHidden(!!target.closest(TEXT_FIELD));
      setHover(!!target.closest(INTERACTIVE) && !target.closest(TEXT_FIELD));
    };

    const tick = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      r.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      setHover(false);
      setHidden(false);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove(
        "custom-cursor-active",
        "custom-cursor-hover",
        "custom-cursor-hidden",
      );
    };
  }, []);

  return (
    <>
      <div ref={dot} className="custom-cursor-dot" aria-hidden />
      <div ref={ring} className="custom-cursor-ring" aria-hidden />
    </>
  );
}
