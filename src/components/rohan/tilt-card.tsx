"use client";

import React, { useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface TiltCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  /** Maximum tilt in degrees */
  maxTilt?: number;
  children?: React.ReactNode;
  className?: string;
}

/**
 * @rohan/tilt-card
 * A 3D perspective card that tilts toward the cursor with a moving glare.
 * Children can pop out of the surface with `[transform:translateZ(..px)]`.
 */
export function TiltCard({
  className,
  children,
  maxTilt = 10,
  onPointerMove,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  ...props
}: TiltCardProps) {
  const [engaged, setEngaged] = useState(false);
  const reducedMotion = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 260,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 260,
    damping: 22,
  });
  const scale = useSpring(1, { stiffness: 260, damping: 22 });

  const glareX = useTransform(px, [0, 1], [0, 100]);
  const glareY = useTransform(py, [0, 1], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(80% 80% at ${glareX}% ${glareY}%, rgba(255,255,255,0.35), transparent 65%)`;

  function updatePointer(e: React.PointerEvent<HTMLDivElement>) {
    setEngaged(true);
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    scale.set(1.01);
  }

  function reset() {
    setEngaged(false);
    px.set(0.5);
    py.set(0.5);
    scale.set(1);
  }

  return (
    <div
      style={{ perspective: 1000 }}
      className={cn("mx-auto w-full max-w-[280px]", className)}
    >
      <motion.div
        onPointerMove={(event) => {
          updatePointer(event);
          onPointerMove?.(event);
        }}
        onPointerDown={(event) => {
          updatePointer(event);
          onPointerDown?.(event);
        }}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse") reset();
          onPointerUp?.(event);
        }}
        onPointerLeave={(event) => {
          reset();
          onPointerLeave?.(event);
        }}
        onPointerCancel={reset}
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className="group relative w-full touch-pan-y rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition-shadow duration-300 hover:border-zinc-300 hover:shadow-md hover:shadow-zinc-300/30 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-black/30"
        {...props}
      >
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 dark:mix-blend-soft-light",
            engaged ? "opacity-100" : "opacity-0"
          )}
          style={{ background: glare }}
        />
        <div
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full [transform:translateZ(0)]"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
