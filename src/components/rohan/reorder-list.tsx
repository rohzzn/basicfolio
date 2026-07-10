"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Reorder,
  useDragControls,
  useReducedMotion,
} from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical, ListRestart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReorderListItem {
  /** Stable identifier used by the reorder engine. */
  id: string;
  /** Visible row contents. */
  content: React.ReactNode;
  /** Accessible item name; falls back to its position. */
  label?: string;
  disabled?: boolean;
}

export interface ReorderListProps
  extends Omit<React.HTMLAttributes<HTMLOListElement>, "onChange" | "onReset"> {
  /** Controlled order. */
  items?: ReorderListItem[];
  /** Initial order when uncontrolled. */
  defaultItems?: ReorderListItem[];
  onChange?: (items: ReorderListItem[]) => void;
  label?: string;
  emptyLabel?: React.ReactNode;
  itemClassName?: string;
  /** Shows a reset control when using defaultItems. */
  allowReset?: boolean;
  onReset?: (items: ReorderListItem[]) => void;
}

interface ReorderRowProps {
  item: ReorderListItem;
  index: number;
  total: number;
  itemClassName?: string;
  reduceMotion: boolean;
  onMove: (item: ReorderListItem, from: number, to: number) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (item: ReorderListItem) => void;
}

function ReorderRow({
  item,
  index,
  total,
  itemClassName,
  reduceMotion,
  onMove,
  onDragStart,
  onDragEnd,
}: ReorderRowProps) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const itemLabel = item.label ?? `Item ${index + 1}`;

  return (
    <Reorder.Item
      value={item.id}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => {
        setDragging(true);
        onDragStart(item.id);
      }}
      onDragEnd={() => {
        setDragging(false);
        onDragEnd(item);
      }}
      whileDrag={reduceMotion ? undefined : { scale: 1.01 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 460, damping: 36, mass: 0.72 }
      }
      aria-label={itemLabel}
      aria-roledescription="sortable item"
      aria-posinset={index + 1}
      aria-setsize={total}
      className={cn(
        "group flex min-w-0 items-center gap-2 rounded-lg border border-zinc-200 bg-paper p-2 shadow-sm outline-none transition-[border-color,background-color] dark:border-neutral-700 dark:bg-neutral-900",
        dragging &&
          "z-10 border-zinc-300 bg-zinc-50 ring-1 ring-zinc-200 dark:border-neutral-600 dark:bg-neutral-800 dark:ring-neutral-700",
        item.disabled && "opacity-50",
        itemClassName
      )}
    >
      <button
        type="button"
        disabled={item.disabled}
        aria-label={`Drag ${itemLabel} to reorder`}
        title={`Drag ${itemLabel}`}
        onPointerDown={(event) => {
          if (event.button !== 0 || item.disabled) return;
          controls.start(event);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp" && (event.altKey || event.metaKey)) {
            event.preventDefault();
            onMove(item, index, index - 1);
          } else if (event.key === "ArrowDown" && (event.altKey || event.metaKey)) {
            event.preventDefault();
            onMove(item, index, index + 1);
          }
        }}
        className="flex h-9 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-zinc-400 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 active:cursor-grabbing disabled:cursor-not-allowed dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus-visible:ring-neutral-500"
      >
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>

      <span
        aria-hidden
        className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 px-1 text-[9px] font-semibold tabular-nums text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1 text-sm text-zinc-700 dark:text-neutral-200">
        {item.content}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          disabled={item.disabled || index === 0}
          aria-label={`Move ${itemLabel} up`}
          onClick={() => onMove(item, index, index - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-25 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus-visible:ring-neutral-500"
        >
          <ArrowUp className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          disabled={item.disabled || index === total - 1}
          aria-label={`Move ${itemLabel} down`}
          onClick={() => onMove(item, index, index + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-25 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus-visible:ring-neutral-500"
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </Reorder.Item>
  );
}

/**
 * @rohan/reorder-list
 * A controlled or uncontrolled sortable list with handle-only pointer dragging,
 * visible keyboard move controls, position announcements, and reduced-motion
 * support.
 */
export function ReorderList({
  items: controlledItems,
  defaultItems = [],
  onChange,
  label = "Reorderable list",
  emptyLabel = "There are no items to reorder.",
  itemClassName,
  allowReset = false,
  onReset,
  className,
  ...props
}: ReorderListProps) {
  const [internalItems, setInternalItems] = useState(defaultItems);
  const [announcement, setAnnouncement] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const currentItems = controlledItems ?? internalItems;
  const latestOrder = useRef(currentItems);
  const reduceMotion = Boolean(useReducedMotion());
  const isControlled = controlledItems !== undefined;

  useEffect(() => {
    latestOrder.current = currentItems;
  }, [currentItems]);

  function commit(nextItems: ReorderListItem[]) {
    latestOrder.current = nextItems;
    if (!isControlled) setInternalItems(nextItems);
    onChange?.(nextItems);
  }

  function reorderFromIds(nextIds: string[]) {
    const byId = new Map(currentItems.map((item) => [item.id, item]));
    const nextItems = nextIds.flatMap((id) => {
      const item = byId.get(id);
      return item ? [item] : [];
    });
    if (nextItems.length === currentItems.length) commit(nextItems);
  }

  function move(item: ReorderListItem, from: number, to: number) {
    if (item.disabled || to < 0 || to >= currentItems.length || from === to) return;
    const nextItems = [...currentItems];
    const [moved] = nextItems.splice(from, 1);
    nextItems.splice(to, 0, moved);
    commit(nextItems);
    setAnnouncement(`${item.label ?? `Item ${from + 1}`} moved to position ${to + 1}.`);
  }

  function finishDrag(item: ReorderListItem) {
    const finalIndex = latestOrder.current.findIndex((entry) => entry.id === item.id);
    if (finalIndex >= 0) {
      setAnnouncement(`${item.label ?? "Item"} moved to position ${finalIndex + 1}.`);
    }
    setDraggingId(null);
  }

  function reset() {
    const nextItems = [...defaultItems];
    commit(nextItems);
    setAnnouncement("List order reset.");
    onReset?.(nextItems);
  }

  return (
    <div className="w-full">
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>

      {allowReset && defaultItems.length > 0 && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={reset}
            disabled={draggingId !== null}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-zinc-500 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-500"
          >
            <ListRestart className="h-3 w-3" aria-hidden />
            Reset order
          </button>
        </div>
      )}

      <Reorder.Group
        as="ol"
        axis="y"
        values={currentItems.map((item) => item.id)}
        onReorder={reorderFromIds}
        aria-label={label}
        className={cn(
          currentItems.length > 0
            ? "space-y-1.5 rounded-xl border border-zinc-200 bg-zinc-100/60 p-2 dark:border-neutral-800 dark:bg-neutral-950/40"
            : "rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 dark:border-neutral-700 dark:bg-neutral-900/60",
          className
        )}
        {...props}
      >
        {currentItems.length === 0 ? (
          <li
            role="status"
            className="list-none px-4 py-7 text-center text-xs text-zinc-500 dark:text-neutral-400"
          >
            {emptyLabel}
          </li>
        ) : (
          currentItems.map((item, index) => (
            <ReorderRow
              key={item.id}
              item={item}
              index={index}
              total={currentItems.length}
              itemClassName={itemClassName}
              reduceMotion={reduceMotion}
              onMove={move}
              onDragStart={setDraggingId}
              onDragEnd={finishDrag}
            />
          ))
        )}
      </Reorder.Group>
    </div>
  );
}
