"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ButtonStatus = "idle" | "loading" | "success" | "error";

export interface StatusButtonProps {
  /** Async work to run on click. Resolve → success, reject → error. */
  action?: () => Promise<unknown>;
  /** Idle label */
  children?: React.ReactNode;
  successLabel?: string;
  errorLabel?: string;
  /** ms before returning to idle after success/error */
  revertAfter?: number;
  className?: string;
}

const contentVariants = {
  initial: { opacity: 0, y: 12, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(3px)" },
};

/**
 * @rohan/status-button
 * A button that runs an async action and morphs through loading, success
 * and error states — spinner, drawn-in checkmark, shake — resizing itself
 * to fit each label, then reverts to idle.
 */
export function StatusButton({
  action,
  children = "Save changes",
  successLabel = "Saved",
  errorLabel = "Failed",
  revertAfter = 2000,
  className,
}: StatusButtonProps) {
  const [status, setStatus] = useState<ButtonStatus>("idle");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (status !== "success" && status !== "error") return;
    const timer = setTimeout(() => setStatus("idle"), revertAfter);
    return () => clearTimeout(timer);
  }, [status, revertAfter]);

  async function handleClick() {
    if (status !== "idle") return;
    setStatus("loading");
    try {
      await action?.();
      if (mounted.current) setStatus("success");
    } catch {
      if (mounted.current) setStatus("error");
    }
  }

  return (
    <motion.button
      type="button"
      layout
      onClick={handleClick}
      disabled={status === "loading"}
      animate={status === "error" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ layout: { type: "spring", stiffness: 500, damping: 34 }, x: { duration: 0.4 } }}
      className={cn(
        "relative inline-flex h-10 items-center justify-center overflow-hidden rounded-lg px-5 text-sm font-medium shadow-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-900",
        status === "success"
          ? "bg-emerald-600 text-white"
          : status === "error"
            ? "bg-red-600 text-white"
            : "bg-zinc-900 text-paper hover:bg-zinc-800 dark:bg-paper dark:text-neutral-900 dark:hover:bg-white",
        status === "loading" && "cursor-wait opacity-90",
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "idle" && (
          <motion.span key="idle" {...contentVariants} className="flex items-center gap-2">
            {children}
          </motion.span>
        )}
        {status === "loading" && (
          <motion.span key="loading" {...contentVariants} className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent opacity-80"
            />
            Working…
          </motion.span>
        )}
        {status === "success" && (
          <motion.span key="success" {...contentVariants} className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <motion.path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
              />
            </svg>
            {successLabel}
          </motion.span>
        )}
        {status === "error" && (
          <motion.span key="error" {...contentVariants} className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <motion.path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </svg>
            {errorLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
