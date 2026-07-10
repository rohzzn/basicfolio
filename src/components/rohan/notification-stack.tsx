"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Info,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationStackTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface NotificationStackAction {
  label: string;
  onClick: () => void;
}

export interface NotificationStackItem {
  id: string;
  title: string;
  description?: React.ReactNode;
  timestamp?: string;
  icon?: React.ReactNode;
  tone?: NotificationStackTone;
  action?: NotificationStackAction;
}

export interface NotificationStackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  notifications: NotificationStackItem[];
  label?: string;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onDismiss?: (notification: NotificationStackItem) => void;
  onRestore?: (notifications: NotificationStackItem[]) => void;
  onVisibleChange?: (notifications: NotificationStackItem[]) => void;
  /** Maximum number of cards visible in the collapsed stack. */
  maxCollapsed?: number;
  allowRestore?: boolean;
  live?: "off" | "polite" | "assertive";
}

const toneStyles: Record<
  NotificationStackTone,
  { icon: string; edge: string; fallback: React.ReactNode }
> = {
  neutral: {
    icon: "text-zinc-500 dark:text-neutral-400",
    edge: "border-l-zinc-300 dark:border-l-neutral-600",
    fallback: <Bell aria-hidden />,
  },
  info: {
    icon: "text-blue-600 dark:text-blue-400",
    edge: "border-l-blue-400 dark:border-l-blue-500/70",
    fallback: <Info aria-hidden />,
  },
  success: {
    icon: "text-emerald-600 dark:text-emerald-400",
    edge: "border-l-emerald-400 dark:border-l-emerald-500/70",
    fallback: <CheckCircle2 aria-hidden />,
  },
  warning: {
    icon: "text-amber-600 dark:text-amber-400",
    edge: "border-l-amber-400 dark:border-l-amber-500/70",
    fallback: <TriangleAlert aria-hidden />,
  },
  error: {
    icon: "text-red-600 dark:text-red-400",
    edge: "border-l-red-400 dark:border-l-red-500/70",
    fallback: <CircleAlert aria-hidden />,
  },
};

/**
 * @rohan/notification-stack
 * A compact notification center whose cards fan out on hover, focus, or tap.
 * Notifications can be dismissed and restored, with controlled expansion and
 * polite live-region announcements for assistive technology.
 */
export function NotificationStack({
  notifications,
  label = "Notifications",
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  onDismiss,
  onRestore,
  onVisibleChange,
  maxCollapsed = 4,
  allowRestore = true,
  live = "polite",
  className,
  onPointerEnter: onRootPointerEnter,
  onPointerLeave: onRootPointerLeave,
  onFocusCapture: onRootFocusCapture,
  onBlurCapture: onRootBlurCapture,
  ...props
}: NotificationStackProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const previousIds = useRef(new Set(notifications.map((item) => item.id)));
  const headerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const panelId = `${useId()}-notification-stack`;
  const baseExpanded = controlledExpanded ?? internalExpanded;
  const isExpanded = baseExpanded || hovered || focusWithin;
  const collapsedLimit = Number.isFinite(maxCollapsed)
    ? Math.max(1, Math.floor(maxCollapsed))
    : 4;

  const visibleNotifications = useMemo(
    () => notifications.filter((item) => !dismissedIds.includes(item.id)),
    [dismissedIds, notifications]
  );
  const renderedNotifications = isExpanded
    ? visibleNotifications
    : visibleNotifications.slice(0, collapsedLimit);

  useEffect(() => {
    const nextIds = new Set(notifications.map((item) => item.id));
    const incoming = notifications.filter((item) => !previousIds.current.has(item.id));
    if (incoming.length === 1) setAnnouncement(`${incoming[0].title} notification received.`);
    else if (incoming.length > 1) setAnnouncement(`${incoming.length} new notifications received.`);
    previousIds.current = nextIds;
  }, [notifications]);

  function requestExpanded(next: boolean) {
    if (controlledExpanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  }

  function dismiss(item: NotificationStackItem) {
    const nextDismissed = [...dismissedIds, item.id];
    const nextVisible = notifications.filter(
      (notification) => !nextDismissed.includes(notification.id)
    );
    setDismissedIds(nextDismissed);
    setAnnouncement(`${item.title} dismissed.`);
    onDismiss?.(item);
    onVisibleChange?.(nextVisible);
    requestAnimationFrame(() => headerRef.current?.focus({ preventScroll: true }));
  }

  function restore() {
    const restored = notifications.filter((item) => dismissedIds.includes(item.id));
    setDismissedIds([]);
    setAnnouncement(
      restored.length === 1
        ? `${restored[0].title} restored.`
        : `${restored.length} notifications restored.`
    );
    onRestore?.(restored);
    onVisibleChange?.(notifications);
    requestAnimationFrame(() => headerRef.current?.focus({ preventScroll: true }));
  }

  return (
    <div
      {...props}
      className={cn("mx-auto w-full max-w-md", className)}
      onPointerEnter={(event) => {
        onRootPointerEnter?.(event);
        if (event.defaultPrevented) return;
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={(event) => {
        onRootPointerLeave?.(event);
        if (!event.defaultPrevented) setHovered(false);
      }}
      onFocusCapture={(event) => {
        onRootFocusCapture?.(event);
        if (!event.defaultPrevented) setFocusWithin(true);
      }}
      onBlurCapture={(event) => {
        onRootBlurCapture?.(event);
        if (event.defaultPrevented) return;
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
    >
      <span className="sr-only" aria-live={live} aria-atomic="true">
        {announcement}
      </span>

      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <button
          ref={headerRef}
          type="button"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={() => {
            setFocusWithin(false);
            setHovered(false);
            requestExpanded(!baseExpanded);
          }}
          className="group inline-flex min-w-0 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-paper text-zinc-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
            <Bell className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="truncate text-xs font-semibold text-zinc-800 dark:text-neutral-100">
            {label}
          </span>
          <span className="rounded-full bg-zinc-200/80 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-zinc-600 dark:bg-neutral-800 dark:text-neutral-300">
            {visibleNotifications.length}
          </span>
          <motion.span
            aria-hidden
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="text-zinc-400 dark:text-neutral-500"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
        </button>

        {allowRestore && dismissedIds.length > 0 && (
          <button
            type="button"
            onClick={restore}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-zinc-500 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-500"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Restore
          </button>
        )}
      </div>

      <motion.div
        id={panelId}
        role="region"
        aria-label={label}
        layout
        transition={{ duration: reduceMotion ? 0 : 0.24 }}
        className="relative"
      >
        {visibleNotifications.length > 0 ? (
          <motion.ol
            layout
            className={cn("grid", isExpanded && "gap-2")}
            style={{
              paddingBottom: isExpanded
                ? 0
                : Math.max(0, Math.min(renderedNotifications.length - 1, 3) * 9),
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {renderedNotifications.map((item, itemIndex) => {
                const tone = toneStyles[item.tone ?? "neutral"];
                const obscured = !isExpanded && itemIndex > 0;
                return (
                  <motion.li
                    key={item.id}
                    layout
                    initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
                    animate={{
                      opacity: isExpanded ? 1 : 1 - itemIndex * 0.13,
                      y: isExpanded ? 0 : itemIndex * 9,
                      scale: isExpanded ? 1 : 1 - itemIndex * 0.025,
                    }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 28, scale: 0.97 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 430, damping: 34, mass: 0.72 }
                    }
                    aria-hidden={obscured}
                    inert={obscured ? true : undefined}
                    style={
                      isExpanded
                        ? { zIndex: renderedNotifications.length - itemIndex }
                        : {
                            gridArea: "1 / 1",
                            zIndex: renderedNotifications.length - itemIndex,
                            transformOrigin: "50% 0%",
                          }
                    }
                    className={cn(
                      "relative flex min-w-0 gap-3 rounded-xl border border-l-2 border-zinc-200 bg-paper p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900",
                      tone.edge,
                      obscured && "pointer-events-none"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-neutral-800 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:stroke-[1.9]",
                        tone.icon
                      )}
                    >
                      {item.icon ?? tone.fallback}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2 pr-6">
                        <p className="min-w-0 flex-1 text-xs font-semibold leading-5 text-zinc-800 dark:text-neutral-100">
                          {item.title}
                        </p>
                        {item.timestamp && (
                          <time className="shrink-0 pt-0.5 text-[9px] text-zinc-500 dark:text-neutral-400">
                            {item.timestamp}
                          </time>
                        )}
                      </div>
                      {item.description && (
                        <div className="mt-0.5 text-[11px] leading-[1.45] text-zinc-500 dark:text-neutral-400">
                          {item.description}
                        </div>
                      )}
                      {item.action && (
                        <button
                          type="button"
                          tabIndex={obscured ? -1 : 0}
                          onClick={item.action.onClick}
                          className="mt-2 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-500"
                        >
                          {item.action.label}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      tabIndex={obscured ? -1 : 0}
                      aria-label={`Dismiss ${item.title}`}
                      onClick={() => dismiss(item)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 dark:focus-visible:ring-neutral-500"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ol>
        ) : (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 px-4 py-7 text-center dark:border-neutral-700 dark:bg-neutral-900/60"
          >
            <CheckCircle2
              className="mx-auto mb-2 h-4 w-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
            <p className="text-xs font-medium text-zinc-600 dark:text-neutral-300">
              You’re all caught up
            </p>
            {allowRestore && dismissedIds.length > 0 && (
              <button
                type="button"
                onClick={restore}
                className="mt-2 rounded-md px-2 py-1 text-[10px] font-medium text-zinc-500 outline-none hover:bg-zinc-100 hover:text-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-500"
              >
                Restore dismissed
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
