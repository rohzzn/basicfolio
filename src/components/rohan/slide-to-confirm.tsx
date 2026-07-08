"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlideToConfirmProps {
  /** Prompt shown in the track */
  label?: string;
  /** Label shown after confirming */
  confirmedLabel?: string;
  /** Fired once the knob reaches the end */
  onConfirm?: () => void;
  /** Auto-reset delay in ms; 0 keeps it confirmed */
  resetAfter?: number;
  className?: string;
}

const PADDING = 4;

/**
 * @rohan/slide-to-confirm
 * A slide-to-unlock control for destructive or irreversible actions.
 * Drag the knob to the end to confirm; release early and it springs back.
 * The prompt carries a slow shimmer and fades as you drag.
 */
export function SlideToConfirm({
  label = "Slide to confirm",
  confirmedLabel = "Confirmed",
  onConfirm,
  resetAfter = 0,
  className,
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [confirmed, setConfirmed] = useState(false);
  // Knob size and travel are measured from the track, so the knob always
  // fits the height exactly and can never slide past the rounded ends.
  const [bounds, setBounds] = useState({ knob: 40, maxDrag: 0 });

  const x = useMotionValue(0);
  const labelOpacity = useTransform(x, [0, 110], [1, 0]);
  const fillWidth = useTransform(x, (v) => PADDING + v + bounds.knob);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const knob = track.clientHeight - PADDING * 2;
      setBounds({ knob, maxDrag: track.clientWidth - PADDING * 2 - knob });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  function confirm() {
    if (confirmed) return;
    // Near-critical damping: any overshoot past maxDrag gets clipped
    // against the track's rounded end by overflow-hidden.
    animate(x, bounds.maxDrag, { type: "spring", stiffness: 400, damping: 40 });
    setConfirmed(true);
    onConfirm?.();
  }

  function handleDragEnd() {
    if (x.get() >= bounds.maxDrag * 0.9) {
      confirm();
    } else {
      animate(x, 0, { type: "spring", stiffness: 340, damping: 18 });
    }
  }

  useEffect(() => {
    if (!confirmed || resetAfter <= 0) return;
    const timer = setTimeout(() => {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 26 });
      setConfirmed(false);
    }, resetAfter);
    return () => clearTimeout(timer);
  }, [confirmed, resetAfter, x]);

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-12 w-full max-w-[300px] select-none overflow-hidden rounded-full border transition-colors duration-300",
        confirmed
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10"
          : "border-zinc-200 bg-zinc-100 dark:border-neutral-700 dark:bg-neutral-800",
        className
      )}
      style={{ padding: PADDING }}
    >
      <motion.div
        aria-hidden
        style={{ width: fillWidth }}
        className={cn(
          "absolute inset-y-0 left-0 rounded-full transition-colors duration-300",
          confirmed ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-zinc-200/70 dark:bg-neutral-700/50"
        )}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {confirmed ? (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-emerald-700 dark:text-emerald-400"
          >
            {confirmedLabel}
          </motion.span>
        ) : (
          <motion.span
            style={{
              opacity: labelOpacity,
              // The glyphs are painted by the gradient itself (text is
              // transparent), so the glint band actually shows through.
              backgroundImage:
                "linear-gradient(90deg, var(--shimmer-base) 0%, var(--shimmer-base) 46%, var(--shimmer-glint) 50%, var(--shimmer-base) 54%, var(--shimmer-base) 100%)",
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["100% 0%", "0% 0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
            className="bg-clip-text text-sm font-medium text-transparent [--shimmer-base:#71717a] [--shimmer-glint:#18181b] dark:[--shimmer-base:#a3a3a3] dark:[--shimmer-glint:#fafafa]"
          >
            {label}
          </motion.span>
        )}
      </div>

      <motion.div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={confirmed ? 100 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
            e.preventDefault();
            confirm();
          }
        }}
        drag={confirmed ? false : "x"}
        dragConstraints={{ left: 0, right: bounds.maxDrag }}
        dragElastic={0.02}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.06 }}
        style={{ x, width: bounds.knob, height: bounds.knob }}
        className={cn(
          "relative z-[1] flex cursor-grab touch-none items-center justify-center rounded-full shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 active:cursor-grabbing dark:focus-visible:ring-neutral-500",
          confirmed
            ? "bg-emerald-600 text-white"
            : "bg-white text-zinc-500 dark:bg-neutral-600 dark:text-neutral-200"
        )}
      >
        {confirmed ? (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
          >
            <Check className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden />
          </motion.span>
        ) : (
          <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
        )}
      </motion.div>
    </div>
  );
}
