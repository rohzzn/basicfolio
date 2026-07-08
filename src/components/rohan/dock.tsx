"use client";

import React, { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export interface DockProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DockItem[];
  /** Icon size at rest, in px */
  baseSize?: number;
  /** Icon size under the cursor, in px */
  maxSize?: number;
}

function DockIcon({
  item,
  mouseX,
  baseSize,
  maxSize,
  active,
  onSelect,
}: {
  item: DockItem;
  mouseX: MotionValue<number>;
  baseSize: number;
  maxSize: number;
  active: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (mx) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || mx === Infinity) return Infinity;
    return mx - (rect.left + rect.width / 2);
  });

  const size = useSpring(
    useTransform(distance, [-130, 0, 130], [baseSize, maxSize, baseSize]),
    { stiffness: 320, damping: 22, mass: 0.35 }
  );
  const y = useSpring(
    useTransform(distance, [-130, 0, 130], [0, -(maxSize - baseSize) / 2.8, 0]),
    { stiffness: 320, damping: 22, mass: 0.35 }
  );

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={item.label}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.88 }}
      style={{ width: size, height: size, y }}
      className={cn(
        "relative flex items-center justify-center rounded-[14px] border shadow-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-neutral-500",
        active
          ? "border-zinc-300 bg-white text-zinc-800 dark:border-neutral-600 dark:bg-neutral-700 dark:text-paper"
          : "border-zinc-200/90 bg-white/95 text-zinc-600 hover:border-zinc-300 dark:border-neutral-700/90 dark:bg-neutral-800/95 dark:text-neutral-300 dark:hover:border-neutral-600"
      )}
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 520, damping: 32 }}
            className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-paper shadow-lg dark:bg-paper dark:text-neutral-900"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="flex h-[52%] w-[52%] items-center justify-center [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-[1.75]">
        {item.icon}
      </span>
      <motion.span
        animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-zinc-500 dark:bg-neutral-400"
      />
    </motion.button>
  );
}

/**
 * @rohan/dock
 * A macOS-style dock. Icons magnify smoothly as the cursor approaches,
 * with springy tooltips and running-app indicator dots.
 */
export function Dock({ items, baseSize = 42, maxSize = 72, className, ...props }: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex w-fit items-end gap-1.5 rounded-2xl border border-zinc-200/80 bg-zinc-100/80 px-3.5 pb-2.5 pt-2 shadow-sm backdrop-blur-md dark:border-neutral-800/90 dark:bg-neutral-900/80 dark:shadow-black/20",
        className
      )}
      style={{ height: baseSize + 24 }}
      {...props}
    >
      {items.map((item) => (
        <DockIcon
          key={item.id}
          item={item}
          mouseX={mouseX}
          baseSize={baseSize}
          maxSize={maxSize}
          active={activeId === item.id}
          onSelect={() => {
            setActiveId(item.id);
            item.onClick?.();
          }}
        />
      ))}
    </div>
  );
}
