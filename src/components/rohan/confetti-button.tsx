"use client";

import React, { useCallback } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export interface ConfettiButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Number of confetti particles per burst */
  particleCount?: number;
  /** Spread angle in degrees */
  spread?: number;
  children?: React.ReactNode;
}

/**
 * @rohan/confetti-button
 * A button that fires a confetti burst from its center on click.
 */
export function ConfettiButton({
  children = "Celebrate",
  className,
  particleCount = 100,
  spread = 70,
  onClick,
  ...props
}: ConfettiButtonProps) {
  const fire = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      void confetti({
        particleCount,
        spread,
        origin: { x, y },
        disableForReducedMotion: true,
      });

      onClick?.(e);
    },
    [onClick, particleCount, spread]
  );

  return (
    <button
      type="button"
      onClick={fire}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-paper dark:hover:border-neutral-600 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-900",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
