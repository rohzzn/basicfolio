"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CompareSliderProps {
  /** Layer revealed on the left of the divider */
  before: React.ReactNode;
  /** Layer revealed on the right of the divider */
  after: React.ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Initial divider position, 0–100 */
  defaultPosition?: number;
  className?: string;
}

/**
 * @rohan/compare-slider
 * A before/after comparison. Both layers stay perfectly registered while a
 * draggable divider clips between them on a soft spring. Works with images
 * or any React content; arrow keys move the divider too.
 */
export function CompareSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  defaultPosition = 50,
  className,
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(defaultPosition);

  const target = useMotionValue(defaultPosition);
  const percent = useSpring(target, { stiffness: 400, damping: 40 });
  const clip = useMotionTemplate`inset(0 ${useTransform(percent, (v) => 100 - v)}% 0 0)`;
  const dividerLeft = useTransform(percent, (v) => `${v}%`);

  function update(next: number) {
    const clamped = Math.min(100, Math.max(0, next));
    target.set(clamped);
    setPosition(Math.round(clamped));
  }

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    update(((e.clientX - rect.left) / rect.width) * 100);
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // pointer already released — dragging still works while it stays inside
        }
        setDragging(true);
        handlePointer(e);
      }}
      onPointerMove={(e) => {
        if (dragging) handlePointer(e);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onLostPointerCapture={() => setDragging(false)}
      className={cn(
        "group relative w-full max-w-[340px] cursor-ew-resize touch-none select-none overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-neutral-800",
        className
      )}
    >
      {/* Base layer: after */}
      <div className="relative w-full">{after}</div>

      {/* Clipped layer: before */}
      <motion.div style={{ clipPath: clip }} className="absolute inset-0">
        {before}
      </motion.div>

      {/* Labels */}
      <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-zinc-900/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-md bg-zinc-900/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {afterLabel}
      </span>

      {/* Divider */}
      <motion.div
        style={{ left: dividerLeft }}
        className="absolute inset-y-0 z-[1] w-px -translate-x-1/2 bg-white/90 shadow-[0_0_8px_rgba(0,0,0,0.25)]"
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={position}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              update(target.get() - 5);
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              update(target.get() + 5);
            }
            if (e.key === "Home") {
              e.preventDefault();
              update(0);
            }
            if (e.key === "End") {
              e.preventDefault();
              update(100);
            }
          }}
          className={cn(
            "absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-500 shadow-md ring-1 ring-black/5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
            dragging ? "scale-110" : "group-hover:scale-105"
          )}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </div>
      </motion.div>
    </div>
  );
}
