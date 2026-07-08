"use client";

import React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
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
export function TiltCard({ className, children, maxTilt = 10, ...props }: TiltCardProps) {
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

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    scale.set(1.02);
  }

  function handleMouseLeave() {
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className="group relative w-full rounded-2xl border border-zinc-200/90 bg-white shadow-sm transition-shadow duration-300 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-300/30 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-black/40"
        {...props}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:mix-blend-soft-light"
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
