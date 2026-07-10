"use client";

import React, { useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** RGB triplet, e.g. "245, 158, 11" */
  glowColor?: string;
  /** Spotlight radius in px */
  radius?: number;
}

/**
 * @rohan/spotlight-card
 * A card whose border and interior glow follow the cursor with a soft spring.
 */
export function SpotlightCard({
  className,
  children,
  glowColor = "217, 119, 6",
  radius = 220,
  ...props
}: SpotlightCardProps) {
  const [engaged, setEngaged] = useState(false);
  const reducedMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const sx = useSpring(mouseX, { stiffness: 420, damping: 42 });
  const sy = useSpring(mouseY, { stiffness: 420, damping: 42 });

  function updatePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handlePointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    // Snap the spotlight to the entry point so it doesn't sweep in
    // from wherever the cursor last left the card.
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.jump(e.clientX - rect.left);
    mouseY.jump(e.clientY - rect.top);
    setEngaged(true);
  }

  const rim = useMotionTemplate`radial-gradient(${radius}px circle at ${sx}px ${sy}px, rgba(${glowColor}, 0.85), transparent 68%)`;
  const glow = useMotionTemplate`radial-gradient(${radius * 1.4}px circle at ${sx}px ${sy}px, rgba(${glowColor}, 0.12), transparent 72%)`;

  return (
    <div
      onPointerMove={(event) => {
        if (!reducedMotion) updatePointer(event);
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={() => setEngaged(false)}
      onPointerDown={(event) => {
        updatePointer(event);
        setEngaged(true);
      }}
      onPointerUp={(event) => {
        if (event.pointerType !== "mouse") setEngaged(false);
      }}
      onPointerCancel={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      className={cn(
        "group relative mx-auto w-full max-w-[280px] rounded-2xl bg-zinc-200/90 p-px shadow-sm outline-none transition-shadow duration-300 hover:shadow-md hover:shadow-zinc-300/30 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:bg-neutral-800 dark:hover:shadow-black/30 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950",
        className
      )}
      {...props}
    >
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500",
          engaged ? "opacity-100" : "opacity-0"
        )}
        style={{ background: rim }}
      />
      <div className="relative h-full w-full overflow-hidden rounded-[calc(1rem-1px)] bg-white dark:bg-neutral-900">
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 transition-opacity duration-500",
            engaged ? "opacity-100" : "opacity-0"
          )}
          style={{ background: glow }}
        />
        <div className="relative h-full w-full">{children}</div>
      </div>
    </div>
  );
}
