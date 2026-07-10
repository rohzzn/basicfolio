"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MorphTabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface MorphTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  items: readonly MorphTabItem[];
  /** Controlled tab id. */
  value?: string;
  /** Initial tab id when the component is uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  ariaLabel?: string;
  tabListClassName?: string;
  panelClassName?: string;
}

/**
 * @rohan/morph-tabs
 * An accessible tab set with roving keyboard focus, a shared spring-morphing
 * selection surface, and direction-aware panel transitions.
 */
export function MorphTabs({
  items,
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  ariaLabel = "Content sections",
  tabListClassName,
  panelClassName,
  className,
  ...props
}: MorphTabsProps) {
  const enabledItems = useMemo(
    () => items.filter((item) => !item.disabled),
    [items]
  );
  const firstEnabledId = enabledItems[0]?.id;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? firstEnabledId
  );
  const isControlled = controlledValue !== undefined;
  const requestedValue = isControlled ? controlledValue : uncontrolledValue;
  const selectedItem =
    items.find((item) => item.id === requestedValue && !item.disabled) ??
    enabledItems[0];
  const selectedId = selectedItem?.id;
  const selectedIndex = selectedItem ? items.indexOf(selectedItem) : -1;
  const previousIndex = useRef(selectedIndex);
  const direction = selectedIndex >= previousIndex.current ? 1 : -1;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = Boolean(useReducedMotion());
  const instanceId = `${useId()}-morph-tabs`;
  const panelVariants = {
    initial: (travel: number) =>
      reduceMotion
        ? { opacity: 0 }
        : orientation === "horizontal"
          ? { opacity: 0, x: travel * 12 }
          : { opacity: 0, y: travel * 10 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: (travel: number) =>
      reduceMotion
        ? { opacity: 0 }
        : orientation === "horizontal"
          ? { opacity: 0, x: travel * -8 }
          : { opacity: 0, y: travel * -8 },
  };

  useEffect(() => {
    previousIndex.current = selectedIndex;
  }, [selectedIndex]);

  function select(id: string) {
    if (id === selectedId) return;
    if (!isControlled) setUncontrolledValue(id);
    onValueChange?.(id);
  }

  function focusAndSelect(index: number) {
    const item = items[index];
    if (!item || item.disabled) return;
    select(item.id);
    tabRefs.current[index]?.focus({ preventScroll: true });
  }

  function move(index: number, delta: 1 | -1) {
    const enabledIndices = items.flatMap((item, itemIndex) =>
      item.disabled ? [] : [itemIndex]
    );
    if (!enabledIndices.length) return;
    const position = enabledIndices.indexOf(index);
    const nextPosition =
      position === -1
        ? 0
        : (position + delta + enabledIndices.length) % enabledIndices.length;
    focusAndSelect(enabledIndices[nextPosition]);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    const previousKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";

    if (event.key === previousKey) {
      event.preventDefault();
      move(index, -1);
      return;
    }
    if (event.key === nextKey) {
      event.preventDefault();
      move(index, 1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      const firstIndex = items.findIndex((item) => !item.disabled);
      if (firstIndex !== -1) focusAndSelect(firstIndex);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const lastIndex = items.findLastIndex((item) => !item.disabled);
      if (lastIndex !== -1) focusAndSelect(lastIndex);
    }
  }

  return (
    <div
      className={cn(
        "min-w-0",
        orientation === "vertical" && "flex flex-col gap-3 sm:flex-row",
        className
      )}
      {...props}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={cn(
          "relative flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-neutral-700 dark:bg-neutral-800/80",
          orientation === "horizontal"
            ? "w-full overflow-x-auto"
            : "w-full flex-col sm:w-44 sm:shrink-0",
          tabListClassName
        )}
      >
        {items.map((item, index) => {
          const selected = item.id === selectedId;
          const tabId = `${instanceId}-tab-${index}`;
          const panelId = `${instanceId}-panel-${index}`;

          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative isolate flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none dark:focus-visible:ring-neutral-500",
                orientation === "horizontal" ? "min-w-fit flex-1" : "w-full justify-start",
                selected
                  ? "text-zinc-900 dark:text-paper"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              {selected && (
                <motion.span
                  layoutId={`${instanceId}-indicator`}
                  aria-hidden
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 460, damping: 34, mass: 0.7 }
                  }
                  className="absolute inset-0 -z-10 rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-900"
                />
              )}
              {item.icon && (
                <span
                  aria-hidden
                  className="flex shrink-0 items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:stroke-[1.8]"
                >
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "min-w-0",
          orientation === "horizontal" ? "mt-3" : "flex-1"
        )}
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {selectedItem && (
            <motion.div
              key={selectedItem.id}
              id={`${instanceId}-panel-${selectedIndex}`}
              role="tabpanel"
              aria-labelledby={`${instanceId}-tab-${selectedIndex}`}
              tabIndex={0}
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
              className={cn(
                "rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:focus-visible:ring-neutral-500",
                panelClassName
              )}
            >
              {selectedItem.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
