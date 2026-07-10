"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_WAVEFORM = Array.from({ length: 56 }, (_, index) => {
  const primary = Math.abs(Math.sin(index * 1.37));
  const secondary = Math.abs(Math.cos(index * 0.43));
  return Number((0.16 + primary * 0.58 + secondary * 0.26).toFixed(3));
});

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function formatTime(value: number) {
  const totalSeconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function WaveformBars({
  bars,
  className,
}: {
  bars: readonly number[];
  className: string;
}) {
  return (
    <div aria-hidden className="absolute inset-0 flex items-center gap-[2px] overflow-hidden">
      {bars.map((height, index) => (
        <span
          key={index}
          className={cn("min-w-px flex-1 rounded-full", className)}
          style={{ height: `${Math.round(height * 78)}%` }}
        />
      ))}
    </div>
  );
}

export interface WaveformScrubberProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Normalized controlled playhead position, from 0 to 1. */
  progress?: number;
  /** Initial normalized playhead position when uncontrolled. */
  defaultProgress?: number;
  /** Duration of the media in seconds. */
  duration?: number;
  /** Controlled play state. */
  playing?: boolean;
  /** Initial play state when uncontrolled. */
  defaultPlaying?: boolean;
  /** Deterministic normalized bar heights. Values are clamped from 0 to 1. */
  data?: readonly number[];
  /** Seconds moved by the left and right arrow keys. */
  seekStep?: number;
  /** Accessible and visible title for the media. */
  label?: string;
  /** Called with a normalized position whenever the playhead moves. */
  onChange?: (progress: number) => void;
  /** Called whenever the play button changes state. */
  onPlayChange?: (playing: boolean) => void;
  disabled?: boolean;
}

/**
 * @rohan/waveform-scrubber
 * A compact media waveform with an animated playhead, standalone playback,
 * pointer scrubbing, and complete slider keyboard semantics.
 */
export function WaveformScrubber({
  progress,
  defaultProgress = 0,
  duration = 86,
  playing,
  defaultPlaying = false,
  data = DEFAULT_WAVEFORM,
  seekStep = 5,
  label = "Audio preview",
  onChange,
  onPlayChange,
  disabled = false,
  className,
  ...props
}: WaveformScrubberProps) {
  const shouldReduceMotion = useReducedMotion();
  const progressIsControlled = progress !== undefined;
  const playingIsControlled = playing !== undefined;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;

  const [internalProgress, setInternalProgress] = useState(() =>
    clampProgress(defaultProgress)
  );
  const [internalPlaying, setInternalPlaying] = useState(defaultPlaying);
  const [dragging, setDragging] = useState(false);

  const currentProgress = safeDuration > 0 ? clampProgress(progress ?? internalProgress) : 0;
  const isPlaying = playing ?? internalPlaying;
  const progressRef = useRef(currentProgress);
  const activePointerRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onPlayChangeRef = useRef(onPlayChange);

  useEffect(() => {
    progressRef.current = currentProgress;
  }, [currentProgress]);

  useEffect(() => {
    if (!disabled && safeDuration > 0) return;
    activePointerRef.current = null;
    setDragging(false);
  }, [disabled, safeDuration]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onPlayChangeRef.current = onPlayChange;
  }, [onPlayChange]);

  const bars = useMemo(() => {
    const source = data.length > 0 ? data : DEFAULT_WAVEFORM;
    return source.map((value) => {
      const finiteValue = Number.isFinite(value) ? value : 0;
      const normalizedValue = Math.min(1, Math.max(0, finiteValue));
      return Math.max(0.14, normalizedValue);
    });
  }, [data]);

  const commitProgress = useCallback(
    (nextProgress: number) => {
      const next = clampProgress(nextProgress);
      progressRef.current = next;
      if (!progressIsControlled) setInternalProgress(next);
      onChangeRef.current?.(next);
    },
    [progressIsControlled]
  );

  const commitPlaying = useCallback(
    (nextPlaying: boolean) => {
      if (!playingIsControlled) setInternalPlaying(nextPlaying);
      onPlayChangeRef.current?.(nextPlaying);
    },
    [playingIsControlled]
  );

  useEffect(() => {
    if (
      !isPlaying ||
      dragging ||
      progressIsControlled ||
      disabled ||
      safeDuration === 0
    )
      return;

    let frame = 0;
    let previousTime = performance.now();

    const advance = (time: number) => {
      const elapsed = Math.max(0, time - previousTime) / 1000;
      previousTime = time;
      const next = Math.min(1, progressRef.current + elapsed / safeDuration);
      commitProgress(next);

      if (next >= 1) {
        commitPlaying(false);
        return;
      }

      frame = requestAnimationFrame(advance);
    };

    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [
    commitPlaying,
    commitProgress,
    disabled,
    dragging,
    isPlaying,
    progressIsControlled,
    safeDuration,
  ]);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const element = trackRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.width === 0) return;
      commitProgress((clientX - bounds.left) / bounds.width);
    },
    [commitProgress]
  );

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (
      disabled ||
      safeDuration === 0 ||
      (event.pointerType === "mouse" && event.button !== 0)
    )
      return;
    event.preventDefault();
    event.currentTarget.focus();
    activePointerRef.current = event.pointerId;
    setDragging(true);
    seekFromClientX(event.clientX);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (activePointerRef.current !== event.pointerId) return;
    seekFromClientX(event.clientX);
  }

  function finishPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (activePointerRef.current !== event.pointerId) return;
    activePointerRef.current = null;
    setDragging(false);
  }

  function togglePlaying() {
    if (disabled || safeDuration === 0) return;
    const nextPlaying = !isPlaying;
    if (nextPlaying && progressRef.current >= 1) commitProgress(0);
    commitPlaying(nextPlaying);
  }

  const currentTime = currentProgress * safeDuration;
  const currentTimeLabel = formatTime(currentTime);
  const durationLabel = formatTime(safeDuration);
  const safeSeekStep = Number.isFinite(seekStep) ? Math.max(0, seekStep) : 5;
  const keyboardStep = safeDuration > 0 ? safeSeekStep / safeDuration : 0.05;

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900",
        disabled && "opacity-60",
        className
      )}
      {...props}
    >
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 gap-y-1.5">
        <div className="col-span-2 row-start-1 flex min-w-0 items-center justify-between gap-3 min-[360px]:col-span-1 min-[360px]:col-start-2">
          <span className="truncate text-xs font-medium text-zinc-700 dark:text-neutral-200">
            {label}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-zinc-500 dark:text-neutral-400">
            <span className="text-zinc-700 dark:text-neutral-300">{currentTimeLabel}</span>
            <span aria-hidden> / </span>
            <span className="sr-only"> of </span>
            {durationLabel}
          </span>
        </div>

        <motion.button
          type="button"
          aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
          aria-pressed={isPlaying}
          disabled={disabled || safeDuration === 0}
          onClick={togglePlaying}
          whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.94 }}
          className="col-start-1 row-start-2 flex h-10 w-10 shrink-0 self-center items-center justify-center rounded-lg bg-zinc-900 text-paper transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed min-[360px]:row-span-2 min-[360px]:row-start-1 dark:bg-paper dark:text-neutral-900 dark:hover:bg-white dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-900"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" aria-hidden />
          ) : (
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
          )}
        </motion.button>

        <div
          role="slider"
          tabIndex={disabled || safeDuration === 0 ? -1 : 0}
          aria-label={`${label} playhead`}
          aria-valuemin={0}
          aria-valuemax={Math.max(1, safeDuration)}
          aria-valuenow={Math.floor(currentTime)}
          aria-valuetext={`${currentTimeLabel} of ${durationLabel}`}
          aria-disabled={disabled || safeDuration === 0}
          onKeyDown={(event) => {
            if (disabled || safeDuration === 0) return;
            if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              commitProgress(progressRef.current - keyboardStep);
            }
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              commitProgress(progressRef.current + keyboardStep);
            }
            if (event.key === "Home") {
              event.preventDefault();
              commitProgress(0);
            }
            if (event.key === "End") {
              event.preventDefault();
              commitProgress(1);
            }
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          onLostPointerCapture={(event) => {
            if (activePointerRef.current === event.pointerId) {
              activePointerRef.current = null;
              setDragging(false);
            }
          }}
          className={cn(
            "group relative col-start-2 row-start-2 h-10 touch-none select-none rounded-lg bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-neutral-800 dark:focus-visible:ring-neutral-500",
            disabled || safeDuration === 0
              ? "cursor-not-allowed"
              : dragging
                ? "cursor-grabbing"
                : "cursor-pointer"
          )}
        >
          <div ref={trackRef} className="absolute inset-x-2 inset-y-0">
              <WaveformBars
                bars={bars}
                className="bg-zinc-200 transition-colors group-hover:bg-zinc-300 dark:bg-neutral-600 dark:group-hover:bg-neutral-500"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 [will-change:clip-path]"
                style={{
                  clipPath: `inset(0 ${100 - currentProgress * 100}% 0 0)`,
                }}
              >
                <WaveformBars bars={bars} className="bg-zinc-800 dark:bg-neutral-200" />
              </div>

              <span
                aria-hidden
                style={{ left: `${currentProgress * 100}%` }}
                className={cn(
                  "pointer-events-none absolute inset-y-1.5 w-px -translate-x-1/2 bg-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.7)] transition-transform duration-150 dark:bg-paper dark:shadow-[0_0_0_1px_rgba(23,23,23,0.7)]",
                  dragging && !shouldReduceMotion && "scale-[1.12]",
                  shouldReduceMotion && "transition-none"
                )}
              >
                <span className="absolute -left-1 -top-0.5 h-2 w-2 rounded-full border border-zinc-300 bg-white dark:border-neutral-600 dark:bg-neutral-900" />
              </span>
          </div>
        </div>
      </div>
    </div>
  );
}
