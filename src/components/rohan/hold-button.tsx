"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

export type HoldButtonState = "idle" | "holding" | "success";

export interface HoldButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onAnimationStart" | "onClick" | "onDrag" | "onDragEnd" | "onDragStart"
  > {
  /** Time in milliseconds the button must remain pressed. */
  duration?: number;
  /** Label shown after a completed hold. */
  successLabel?: React.ReactNode;
  /** Milliseconds before returning to idle. Pass 0 to keep the success state. */
  resetAfter?: number;
  /** Fired once a full hold completes. */
  onComplete?: () => void;
  /** Fired when an in-progress hold is released or interrupted. */
  onCancel?: () => void;
  /** Reports normalized hold progress from 0 to 1. */
  onProgressChange?: (progress: number) => void;
  /** Fired after the success state returns to idle. */
  onReset?: () => void;
}

/**
 * @rohan/hold-button
 * A deliberate press-and-hold action with pointer and keyboard support,
 * visible progress, early-release cancellation, and a calm success state.
 */
export function HoldButton({
  duration = 1200,
  successLabel = "Confirmed",
  resetAfter = 1600,
  onComplete,
  onCancel,
  onProgressChange,
  onReset,
  children = "Hold to confirm",
  disabled = false,
  className,
  type = "button",
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...props
}: HoldButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [status, setStatus] = useState<HoldButtonState>("idle");
  const [progress, setProgress] = useState(0);
  const statusRef = useRef<HoldButtonState>("idle");
  const progressRef = useRef(0);
  const startedAtRef = useRef(0);
  const frameRef = useRef(0);
  const pointerRef = useRef<number | null>(null);
  const keyRef = useRef<string | null>(null);
  const safeDuration = Number.isFinite(duration) ? Math.max(100, duration) : 1200;
  const safeResetAfter = Number.isFinite(resetAfter) ? Math.max(0, resetAfter) : 1600;

  function updateProgress(nextProgress: number) {
    const next = Math.min(1, Math.max(0, nextProgress));
    progressRef.current = next;
    setProgress(next);
    onProgressChange?.(next);
  }

  function completeHold() {
    cancelAnimationFrame(frameRef.current);
    updateProgress(1);
    statusRef.current = "success";
    setStatus("success");
    onComplete?.();
  }

  function tick(time: number) {
    if (statusRef.current !== "holding") return;
    const next = (time - startedAtRef.current) / safeDuration;

    if (next >= 1) {
      completeHold();
      return;
    }

    updateProgress(next);
    frameRef.current = requestAnimationFrame(tick);
  }

  function startHold() {
    if (disabled || statusRef.current !== "idle") return false;
    cancelAnimationFrame(frameRef.current);
    statusRef.current = "holding";
    setStatus("holding");
    updateProgress(0);
    startedAtRef.current = performance.now();
    frameRef.current = requestAnimationFrame(tick);
    return true;
  }

  function cancelHold(notify = true) {
    if (statusRef.current !== "holding") return;
    cancelAnimationFrame(frameRef.current);
    statusRef.current = "idle";
    setStatus("idle");
    updateProgress(0);
    if (notify) onCancel?.();
  }

  useEffect(() => {
    if (status !== "success" || safeResetAfter <= 0) return;

    const timer = window.setTimeout(() => {
      pointerRef.current = null;
      keyRef.current = null;
      statusRef.current = "idle";
      setStatus("idle");
      updateProgress(0);
      onReset?.();
    }, safeResetAfter);

    return () => window.clearTimeout(timer);
    // Callback props intentionally reflect the values active for this success cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeResetAfter, status]);

  useEffect(() => {
    if (!disabled || statusRef.current !== "holding") return;
    cancelAnimationFrame(frameRef.current);
    pointerRef.current = null;
    keyRef.current = null;
    statusRef.current = "idle";
    setStatus("idle");
    progressRef.current = 0;
    setProgress(0);
    onProgressChange?.(0);
    onCancel?.();
  }, [disabled, onCancel, onProgressChange]);

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const percent = Math.round(progress * 100);
  const statusAnnouncement =
    status === "success"
      ? "Action confirmed"
      : status === "holding"
        ? "Hold in progress"
        : "Ready";

  return (
    <motion.button
      {...props}
      type={type}
      disabled={disabled}
      data-state={status}
      aria-busy={status === "holding"}
      onClick={(event) => {
        // Assistive technology commonly activates buttons with a synthetic
        // click instead of a key hold. Treat that as an accessible completion.
        if (event.detail === 0 && statusRef.current === "idle" && !disabled) {
          completeHold();
          return;
        }
        // An early release must not submit a form or trigger an ordinary click.
        if (statusRef.current !== "success") event.preventDefault();
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (
          event.defaultPrevented ||
          (event.pointerType === "mouse" && event.button !== 0) ||
          !startHold()
        ) {
          return;
        }

        pointerRef.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (pointerRef.current !== event.pointerId) return;
        pointerRef.current = null;
        cancelHold();
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        if (pointerRef.current !== event.pointerId) return;
        pointerRef.current = null;
        cancelHold();
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event);
        if (pointerRef.current !== event.pointerId) return;
        pointerRef.current = null;
        cancelHold();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || (event.key !== " " && event.key !== "Enter")) return;
        event.preventDefault();
        if (event.repeat || keyRef.current !== null) return;
        if (startHold()) keyRef.current = event.key;
      }}
      onKeyUp={(event) => {
        onKeyUp?.(event);
        if (event.key !== keyRef.current) return;
        event.preventDefault();
        keyRef.current = null;
        cancelHold();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        keyRef.current = null;
        cancelHold();
      }}
      animate={{ scale: status === "holding" && !shouldReduceMotion ? 0.985 : 1 }}
      whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
      className={cn(
        "relative inline-flex h-11 min-w-[220px] touch-none select-none items-center overflow-hidden rounded-xl border px-4 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-900",
        status === "success"
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400"
          : status === "holding"
            ? "border-zinc-300 bg-white text-zinc-900 dark:border-neutral-600 dark:bg-neutral-900 dark:text-paper"
            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {status !== "success" && (
        <>
          <motion.span
            aria-hidden
            animate={{ scaleX: progress }}
            transition={
              status === "holding" || shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
            className="absolute inset-0 origin-left bg-zinc-100 dark:bg-neutral-800"
          />
          <motion.span
            aria-hidden
            animate={{ scaleX: progress }}
            transition={{ duration: 0 }}
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-zinc-900 dark:bg-paper"
          />
        </>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.span
            key="success"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
            className="relative flex w-full items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            {successLabel}
          </motion.span>
        ) : (
          <motion.span
            key="action"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
            className="relative flex w-full items-center gap-2.5"
          >
            <motion.span
              animate={
                status === "holding" && !shouldReduceMotion ? { rotate: 360 } : { rotate: 0 }
              }
              transition={
                status === "holding" && !shouldReduceMotion
                  ? { duration: 1.5, repeat: Infinity, ease: "linear" }
                  : { duration: 0 }
              }
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-neutral-600 dark:bg-neutral-900"
            >
              <CircleDashed className="h-3.5 w-3.5" aria-hidden />
            </motion.span>
            <span className="flex-1 text-left">{children}</span>
            <span className="w-8 text-right text-[11px] font-medium tabular-nums text-zinc-400 dark:text-neutral-500">
              {status === "holding" ? `${percent}%` : "0%"}
            </span>
          </motion.span>
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {statusAnnouncement}
      </span>
    </motion.button>
  );
}
