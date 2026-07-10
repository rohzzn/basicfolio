"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Check, RotateCcw, Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SwipeDeckItem {
  /** Stable identifier for the card. */
  id: string;
  /** Card contents; layout and typography remain up to the caller. */
  content: React.ReactNode;
  /** Accessible name used while the card is focused. */
  ariaLabel?: string;
}

export type SwipeDeckDecision = "approve" | "reject";

export interface SwipeDeckProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: SwipeDeckItem[];
  /** Horizontal distance in px required to accept a drag. */
  threshold?: number;
  approveLabel?: string;
  rejectLabel?: string;
  undoLabel?: string;
  resetLabel?: string;
  emptyLabel?: React.ReactNode;
  cardClassName?: string;
  onApprove?: (item: SwipeDeckItem) => void;
  onReject?: (item: SwipeDeckItem) => void;
  onDecision?: (item: SwipeDeckItem, decision: SwipeDeckDecision) => void;
  onUndo?: (item: SwipeDeckItem, decision: SwipeDeckDecision) => void;
  onReset?: () => void;
}

interface DecisionRecord {
  item: SwipeDeckItem;
  decision: SwipeDeckDecision;
}

/**
 * @rohan/swipe-deck
 * An accessible stack of cards that can be approved or rejected with a
 * gesture, visible controls, or the arrow keys. Includes spring recovery,
 * undo, reset, and reduced-motion behavior.
 */
export function SwipeDeck({
  items,
  threshold = 96,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  undoLabel = "Undo last decision",
  resetLabel = "Start over",
  emptyLabel = "You reached the end of the deck.",
  cardClassName,
  onApprove,
  onReject,
  onDecision,
  onUndo,
  onReset,
  className,
  ...props
}: SwipeDeckProps) {
  const [history, setHistory] = useState<DecisionRecord[]>([]);
  const [settling, setSettling] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const topCardRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);
  const restoreCardFocus = useRef(false);
  const mountedRef = useRef(true);
  const reduceMotion = Boolean(useReducedMotion());
  const swipeThreshold = Number.isFinite(threshold) ? Math.max(40, threshold) : 96;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 0, 260], [-11, 0, 11]);
  const cardOpacity = useTransform(x, [-520, -270, 0, 270, 520], [0, 1, 1, 1, 0]);
  const approveOpacity = useTransform(x, [16, swipeThreshold], [0, 1]);
  const rejectOpacity = useTransform(x, [-swipeThreshold, -16], [1, 0]);

  const decidedIds = useMemo(() => new Set(history.map((record) => record.item.id)), [history]);
  const remainingItems = useMemo(
    () => items.filter((item) => !decidedIds.has(item.id)),
    [decidedIds, items]
  );
  const currentItem = remainingItems[0];
  const visibleItems = remainingItems.slice(0, 3);
  const currentPosition = currentItem
    ? Math.max(1, items.findIndex((item) => item.id === currentItem.id) + 1)
    : items.length;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (restoreCardFocus.current && currentItem) {
      restoreCardFocus.current = false;
      requestAnimationFrame(() => topCardRef.current?.focus({ preventScroll: true }));
    }
  }, [currentItem]);

  const decide = useCallback(
    async (decision: SwipeDeckDecision, refocus = false) => {
      const item = currentItem;
      if (!item || animatingRef.current) return;

      animatingRef.current = true;
      setSettling(true);
      restoreCardFocus.current = refocus;
      const direction = decision === "approve" ? 1 : -1;
      const distance = Math.max((rootRef.current?.clientWidth ?? 340) * 1.35, 440);

      if (!reduceMotion) {
        await animate(x, direction * distance, {
          type: "spring",
          stiffness: 360,
          damping: 34,
          mass: 0.72,
        });
      }

      if (!mountedRef.current) return;
      x.set(0);
      setHistory((previous) => [...previous, { item, decision }]);
      setSettling(false);
      animatingRef.current = false;
      onDecision?.(item, decision);
      if (decision === "approve") onApprove?.(item);
      else onReject?.(item);
    },
    [currentItem, onApprove, onDecision, onReject, reduceMotion, x]
  );

  function returnToCenter() {
    if (reduceMotion) x.set(0);
    else animate(x, 0, { type: "spring", stiffness: 430, damping: 25, mass: 0.65 });
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const projected = info.offset.x + info.velocity.x * 0.12;
    if (
      Math.abs(info.offset.x) >= swipeThreshold ||
      Math.abs(projected) >= swipeThreshold * 1.35
    ) {
      void decide(projected >= 0 ? "approve" : "reject");
    } else {
      returnToCenter();
    }
  }

  function undo() {
    if (settling || history.length === 0) return;
    const record = history[history.length - 1];
    setHistory((previous) => previous.slice(0, -1));
    x.set(0);
    onUndo?.(record.item, record.decision);
  }

  function reset() {
    if (settling) return;
    restoreCardFocus.current = true;
    setHistory([]);
    x.set(0);
    onReset?.();
  }

  return (
    <div
      ref={rootRef}
      className={cn("mx-auto w-full max-w-md", className)}
      {...props}
    >
      <div className="relative h-[300px] w-full sm:h-[320px]" aria-live="polite">
        {currentItem ? (
          visibleItems
            .map((item, itemIndex) => ({ item, depth: itemIndex }))
            .reverse()
            .map(({ item, depth }) => {
              const isTop = depth === 0;
              return (
                <motion.div
                  key={item.id}
                  ref={isTop ? topCardRef : undefined}
                  role={isTop ? "group" : undefined}
                  tabIndex={isTop ? 0 : -1}
                  aria-label={
                    isTop
                      ? item.ariaLabel ?? `Card ${currentPosition} of ${items.length}`
                      : undefined
                  }
                  aria-hidden={!isTop}
                  inert={isTop ? undefined : true}
                  onKeyDown={
                    isTop
                      ? (event) => {
                          if (event.target !== event.currentTarget) return;
                          if (event.key === "ArrowRight") {
                            event.preventDefault();
                            void decide("approve", true);
                          } else if (event.key === "ArrowLeft") {
                            event.preventDefault();
                            void decide("reject", true);
                          }
                        }
                      : undefined
                  }
                  drag={isTop && !settling ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.92}
                  dragMomentum={false}
                  onDragEnd={isTop ? handleDragEnd : undefined}
                  whileDrag={reduceMotion ? undefined : { scale: 1.015, cursor: "grabbing" }}
                  animate={{
                    y: depth * 10,
                    scale: 1 - depth * 0.045,
                    opacity: 1 - depth * 0.2,
                  }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 30, mass: 0.7 }
                  }
                  style={
                    isTop
                      ? { x, rotate, opacity: cardOpacity, zIndex: 3, transformOrigin: "50% 100%" }
                      : { zIndex: 3 - depth }
                  }
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-xl border border-zinc-200 bg-paper shadow-sm outline-none dark:border-neutral-700 dark:bg-neutral-900",
                    isTop
                      ? "cursor-grab touch-pan-y select-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 active:cursor-grabbing dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950"
                      : "pointer-events-none",
                    cardClassName
                  )}
                >
                  {isTop && (
                    <>
                      <motion.div
                        aria-hidden
                        style={{ opacity: rejectOpacity }}
                        className="pointer-events-none absolute inset-0 z-10 border-2 border-red-500/70 bg-red-500/5"
                      >
                        <span className="absolute left-4 top-4 rounded-md border border-red-300 bg-paper px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-red-700 dark:border-red-500/40 dark:bg-neutral-900 dark:text-red-300">
                          {rejectLabel}
                        </span>
                      </motion.div>
                      <motion.div
                        aria-hidden
                        style={{ opacity: approveOpacity }}
                        className="pointer-events-none absolute inset-0 z-10 border-2 border-emerald-500/70 bg-emerald-500/5"
                      >
                        <span className="absolute right-4 top-4 rounded-md border border-emerald-300 bg-paper px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-500/40 dark:bg-neutral-900 dark:text-emerald-300">
                          {approveLabel}
                        </span>
                      </motion.div>
                    </>
                  )}
                  <div className="h-full overflow-auto p-5 sm:p-6">{item.content}</div>
                </motion.div>
              );
            })
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 px-6 text-center dark:border-neutral-700 dark:bg-neutral-900/60">
            <Check className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <div className="text-sm text-zinc-600 dark:text-neutral-300">{emptyLabel}</div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-paper px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm outline-none transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-500"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                {resetLabel}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => void decide("reject")}
          disabled={!currentItem || settling}
          aria-label={rejectLabel}
          className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-paper px-3 text-xs font-medium text-zinc-600 shadow-sm outline-none transition-colors hover:border-red-200 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-red-500/40 dark:hover:text-red-300 dark:focus-visible:ring-neutral-500"
        >
          <X className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{rejectLabel}</span>
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0 || settling}
          aria-label={undoLabel}
          title={undoLabel}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus-visible:ring-neutral-500"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => void decide("approve")}
          disabled={!currentItem || settling}
          aria-label={approveLabel}
          className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-paper px-3 text-xs font-medium text-zinc-600 shadow-sm outline-none transition-colors hover:border-emerald-200 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-emerald-500/40 dark:hover:text-emerald-300 dark:focus-visible:ring-neutral-500"
        >
          <Check className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{approveLabel}</span>
        </button>
      </div>

      <p className="mt-3 text-center text-[10px] text-zinc-500 dark:text-neutral-400">
        Swipe or use <kbd className="font-sans">←</kbd> <kbd className="font-sans">→</kbd>
      </p>
    </div>
  );
}
