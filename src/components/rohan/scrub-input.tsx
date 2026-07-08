"use client";

import React, { useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScrubInputProps {
  /** Short label shown in the drag zone, e.g. "W" or "Size" */
  label: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Unit rendered after the number, e.g. "px" */
  suffix?: string;
  /** Value change per pixel dragged */
  sensitivity?: number;
  onChange?: (value: number) => void;
  className?: string;
}

function decimals(step: number) {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

/**
 * @rohan/scrub-input
 * A Figma-style numeric input. Drag horizontally across the label to scrub
 * the value — hold Shift for ×10, Alt for ×0.1 — or click the number to type
 * it directly. Arrow keys nudge when the field is focused.
 */
export function ScrubInput({
  label,
  defaultValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  suffix,
  sensitivity = 0.5,
  onChange,
  className,
}: ScrubInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [draft, setDraft] = useState("");
  const start = useRef({ x: 0, value: 0, moved: false });
  const places = decimals(step);

  function commit(raw: number) {
    const snapped = Math.round(raw / step) * step;
    const clamped = Math.min(max, Math.max(min, Number(snapped.toFixed(places))));
    setValue(clamped);
    onChange?.(clamped);
    return clamped;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (editing) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer already released — dragging still works while it stays inside
    }
    start.current = { x: e.clientX, value, moved: false };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || editing) return;
    const delta = e.clientX - start.current.x;
    if (Math.abs(delta) > 2) start.current.moved = true;
    const multiplier = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    commit(start.current.value + delta * sensitivity * multiplier * step);
  }

  function handlePointerUp() {
    setDragging(false);
  }

  function beginEditing() {
    setDraft(String(value));
    setEditing(true);
  }

  function commitDraft() {
    const parsed = parseFloat(draft);
    if (!Number.isNaN(parsed)) commit(parsed);
    setEditing(false);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={(e) => {
        if (editing) return;
        const multiplier = e.shiftKey ? 10 : 1;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          commit(value + step * multiplier);
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          commit(value - step * multiplier);
        }
        if (e.key === "Enter") beginEditing();
      }}
      tabIndex={editing ? -1 : 0}
      role="spinbutton"
      aria-label={label}
      aria-valuenow={value}
      className={cn(
        "group inline-flex h-9 w-40 cursor-ew-resize select-none items-stretch overflow-hidden rounded-lg border bg-white text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:bg-neutral-900 dark:focus-visible:ring-neutral-500",
        dragging
          ? "border-zinc-400 dark:border-neutral-500"
          : "border-zinc-200 hover:border-zinc-300 dark:border-neutral-700 dark:hover:border-neutral-600",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1 border-r px-2.5 text-xs font-medium transition-colors",
          dragging
            ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
            : "border-zinc-100 bg-zinc-50 text-zinc-400 group-hover:text-zinc-500 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-500 dark:group-hover:text-neutral-400"
        )}
      >
        <ChevronsLeftRight className="h-3 w-3" aria-hidden />
        {label}
      </span>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitDraft();
            if (e.key === "Escape") setEditing(false);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          inputMode="decimal"
          aria-label={`${label} value`}
          className="w-full min-w-0 bg-transparent px-2.5 text-right font-medium tabular-nums text-zinc-900 outline-none dark:text-paper"
        />
      ) : (
        <span
          onClick={() => {
            if (!start.current.moved) beginEditing();
          }}
          className="flex flex-1 items-center justify-end gap-0.5 px-2.5 font-medium tabular-nums text-zinc-900 dark:text-paper"
        >
          {value.toFixed(places)}
          {suffix && (
            <span className="text-xs font-normal text-zinc-400 dark:text-neutral-500">
              {suffix}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
