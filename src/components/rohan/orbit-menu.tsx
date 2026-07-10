"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Orbit as OrbitIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrbitMenuItem {
  /** Stable identifier used for rendering and selection. */
  id: string;
  label: string;
  /** Accepts Lucide icons or any other React node. */
  icon: React.ReactNode;
  /** Optional supporting copy shown in the compact mobile layout. */
  description?: string;
  /** Optional visual keyboard hint, for example “⌘ K”. */
  shortcut?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface OrbitMenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: OrbitMenuItem[];
  /** Accessible name for the menu and visible title in the compact layout. */
  menuLabel?: string;
  /** Accessible label for the central trigger while the menu is closed. */
  triggerLabel?: string;
  /** Replaces the default orbit glyph in the central trigger. */
  triggerIcon?: React.ReactNode;
  /** Distance from the trigger to each action on wider viewports, in px. */
  radius?: number;
  /** Angle of the first action. -90 places it directly above the trigger. */
  startAngle?: number;
  /** Controlled open state. */
  open?: boolean;
  /** Initial state when the component is uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: OrbitMenuItem) => void;
  closeOnSelect?: boolean;
}

function useWideOrbit() {
  // Start compact on the server and switch after hydration. This keeps the
  // initial markup deterministic while still responding to viewport changes.
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => setWide(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return wide;
}

function orbitPosition(index: number, count: number, radius: number, startAngle: number) {
  const angle = startAngle + (360 / Math.max(count, 1)) * index;
  const radians = (angle * Math.PI) / 180;
  return {
    angle,
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
}

/**
 * @rohan/orbit-menu
 * A responsive radial command menu with spring-launched actions around a
 * central trigger. It collapses into a touch-friendly command tray on narrow
 * screens and includes roving keyboard focus, dismissal behavior, and a
 * reduced-motion mode.
 */
export function OrbitMenu({
  items,
  menuLabel = "Quick actions",
  triggerLabel = "Open quick actions",
  triggerIcon,
  radius = 112,
  startAngle = -90,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  closeOnSelect = true,
  className,
  ...props
}: OrbitMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const open = controlledOpen ?? uncontrolledOpen;
  const isControlled = controlledOpen !== undefined;
  const isWide = useWideOrbit();
  const reduceMotion = Boolean(useReducedMotion());

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const actionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingFocusIndex = useRef<number | null>(null);
  const menuId = `${useId()}-orbit-menu`;

  const enabledIndices = useMemo(
    () => items.flatMap((item, index) => (item.disabled ? [] : [index])),
    [items]
  );
  const firstEnabled = enabledIndices[0];
  const hasEnabledItems = firstEnabled !== undefined;

  const requestOpen = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen === open) return;
      if (!isControlled) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange, open]
  );

  const focusAction = useCallback((index: number) => {
    actionRefs.current[index]?.focus({ preventScroll: true });
  }, []);

  const closeAndRestoreFocus = useCallback(() => {
    requestOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, [requestOpen]);

  useEffect(() => {
    if (!open) {
      setActiveIndex(null);
      pendingFocusIndex.current = null;
      return;
    }

    if (pendingFocusIndex.current !== null) {
      const index = pendingFocusIndex.current;
      pendingFocusIndex.current = null;
      focusAction(index);
    }
  }, [focusAction, isWide, open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) requestOpen(false);
    }

    function handleFocusIn(event: FocusEvent) {
      if (!rootRef.current?.contains(event.target as Node)) requestOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        rootRef.current?.contains(document.activeElement)
      ) {
        event.preventDefault();
        closeAndRestoreFocus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAndRestoreFocus, open, requestOpen]);

  function moveFocus(fromIndex: number, direction: 1 | -1) {
    if (!enabledIndices.length) return;
    const current = enabledIndices.indexOf(fromIndex);
    const next =
      current === -1
        ? direction === 1
          ? 0
          : enabledIndices.length - 1
        : (current + direction + enabledIndices.length) % enabledIndices.length;
    focusAction(enabledIndices[next]);
  }

  function handleActionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(index, 1);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(index, -1);
      return;
    }
    if (event.key === "Home" && firstEnabled !== undefined) {
      event.preventDefault();
      focusAction(firstEnabled);
      return;
    }
    if (event.key === "End" && enabledIndices.length) {
      event.preventDefault();
      focusAction(enabledIndices[enabledIndices.length - 1]);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeAndRestoreFocus();
      return;
    }

    // Lightweight typeahead: jump to the next enabled command beginning with
    // the pressed character. This remains useful even when labels are hidden.
    if (
      event.key.length === 1 &&
      event.key !== " " &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      const start = Math.max(enabledIndices.indexOf(index), 0);
      const ordered = [
        ...enabledIndices.slice(start + 1),
        ...enabledIndices.slice(0, start + 1),
      ];
      const match = ordered.find((itemIndex) =>
        items[itemIndex].label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase())
      );
      if (match !== undefined) {
        event.preventDefault();
        focusAction(match);
      }
    }
  }

  function selectItem(item: OrbitMenuItem) {
    if (item.disabled) return;
    try {
      item.onSelect?.();
      onSelect?.(item);
    } finally {
      if (closeOnSelect) closeAndRestoreFocus();
    }
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (!hasEnabledItems) return;
    event.preventDefault();
    const target =
      event.key === "ArrowUp"
        ? enabledIndices[enabledIndices.length - 1]
        : firstEnabled;
    if (target === undefined) return;
    if (open) {
      focusAction(target);
    } else {
      pendingFocusIndex.current = target;
      requestOpen(true);
    }
  }

  const trigger = (
    <motion.button
      ref={triggerRef}
      type="button"
      aria-label={open ? `Close ${menuLabel.toLocaleLowerCase()}` : triggerLabel}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      disabled={!hasEnabledItems}
      onKeyDown={handleTriggerKeyDown}
      onClick={(event) => {
        if (!open && event.detail === 0 && firstEnabled !== undefined) {
          pendingFocusIndex.current = firstEnabled;
        }
        requestOpen(!open);
      }}
      whileHover={reduceMotion ? undefined : { scale: 1.05 }}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      animate={reduceMotion ? undefined : { rotate: open ? 8 : 0 }}
      transition={{ type: "spring", stiffness: 480, damping: 30 }}
      style={{ contain: "none" }}
      className={cn(
        "group/trigger relative z-20 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-paper shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 motion-reduce:transition-none dark:border-neutral-200 dark:bg-paper dark:text-neutral-900 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950",
        "disabled:cursor-not-allowed disabled:opacity-45"
      )}
    >
      <motion.span
        aria-hidden
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.72 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        className="pointer-events-none absolute -inset-2 rounded-full border border-zinc-300 dark:border-neutral-700"
      />
      <span className="absolute inset-[3px] rounded-full border border-white/10 dark:border-black/10" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={open ? "close" : "open"}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.55, rotate: -35 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.55, rotate: 35 }}
          transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          className="relative flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5"
        >
          {open ? <X aria-hidden /> : (triggerIcon ?? <OrbitIcon aria-hidden />)}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );

  const activeAngle =
    activeIndex === null
      ? null
      : orbitPosition(activeIndex, items.length, radius, startAngle).angle;

  return (
    <div
      ref={rootRef}
      className={cn("relative isolate mx-auto w-full", className)}
      {...props}
    >
      {isWide ? (
        <div className="relative mx-auto h-[360px] w-full max-w-[390px]">
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            {trigger}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="radial-menu"
                id={menuId}
                role="menu"
                aria-label={menuLabel}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                className="pointer-events-none absolute inset-0 z-10"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ width: radius * 2, height: radius * 2 }}
                >
                  <div className="absolute inset-0 rounded-full border border-dashed border-zinc-300/80 dark:border-neutral-700/80">
                    <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-zinc-400 dark:bg-neutral-500" />
                  </div>
                  <div className="absolute inset-[18px] rounded-full border border-zinc-200/60 dark:border-neutral-800" />
                </div>

                <AnimatePresence>
                  {activeAngle !== null && (
                    <motion.div
                      key="connector"
                      aria-hidden
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1, rotate: activeAngle }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.18 }}
                      className="pointer-events-none absolute left-1/2 top-1/2 h-px origin-left bg-gradient-to-r from-transparent to-zinc-400 dark:to-neutral-500"
                      style={{ width: radius }}
                    />
                  )}
                </AnimatePresence>

                {items.map((item, index) => {
                  const position = orbitPosition(index, items.length, radius, startAngle);
                  const active = activeIndex === index;
                  return (
                    <motion.div
                      key={item.id}
                      role="none"
                      initial={
                        reduceMotion
                          ? false
                          : { x: 0, y: 0, opacity: 0, scale: 0.45 }
                      }
                      animate={{
                        x: position.x,
                        y: position.y,
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 430,
                              damping: 27,
                              mass: 0.72,
                              delay: index * 0.035,
                            }
                      }
                      className="absolute left-1/2 top-1/2 -ml-[26px] -mt-[26px] h-[52px] w-[52px]"
                    >
                      <motion.button
                        ref={(node) => {
                          actionRefs.current[index] = node;
                        }}
                        type="button"
                        role="menuitem"
                        tabIndex={
                          !item.disabled && index === (activeIndex ?? firstEnabled) ? 0 : -1
                        }
                        aria-label={item.label}
                        disabled={item.disabled}
                        onKeyDown={(event) => handleActionKeyDown(event, index)}
                        onFocus={() => setActiveIndex(index)}
                        onBlur={() => setActiveIndex(null)}
                        onPointerEnter={() => setActiveIndex(index)}
                        onPointerLeave={(event) => {
                          if (document.activeElement !== event.currentTarget) setActiveIndex(null);
                        }}
                        onClick={() => selectItem(item)}
                        whileHover={reduceMotion || item.disabled ? undefined : { y: -3, scale: 1.06 }}
                        whileTap={reduceMotion || item.disabled ? undefined : { scale: 0.92 }}
                        style={{ contain: "none" }}
                        className={cn(
                          "pointer-events-auto group/action relative flex h-[52px] w-[52px] items-center justify-center rounded-xl border bg-white text-zinc-600 shadow-sm outline-none transition-[color,background-color,border-color] focus-visible:ring-2 focus-visible:ring-zinc-400 motion-reduce:transition-none dark:bg-neutral-900 dark:text-neutral-300 dark:focus-visible:ring-neutral-500",
                          active
                            ? "border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-paper"
                            : "border-zinc-200 hover:border-zinc-300 dark:border-neutral-700 dark:hover:border-neutral-600",
                          "disabled:cursor-not-allowed disabled:opacity-35"
                        )}
                      >
                        <span className="relative flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-[1.8]">
                          {item.icon}
                        </span>
                        <motion.span
                          aria-hidden
                          animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.7 }}
                          transition={{ duration: reduceMotion ? 0 : 0.16 }}
                          className="pointer-events-none absolute -inset-1.5 -z-10 rounded-2xl border border-zinc-300/70 dark:border-neutral-700"
                        />
                      </motion.button>

                      <div
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute left-1/2 top-[calc(100%+7px)] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] font-medium text-zinc-600 shadow-sm transition-all duration-150 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
                          active ? "translate-y-0 opacity-100" : "translate-y-0.5 opacity-75",
                          item.disabled && "opacity-35"
                        )}
                      >
                        {item.label}
                        {item.shortcut && (
                          <span className="text-[9px] text-zinc-400 dark:text-neutral-500">
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[330px]">
          <div className="flex justify-center">{trigger}</div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="compact-menu"
                id={menuId}
                role="menu"
                aria-label={menuLabel}
                initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -8, scale: 0.98 }
                }
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
                className="mt-4 grid grid-cols-1 gap-1.5 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm min-[380px]:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div
                  role="none"
                  className="col-span-full flex items-center justify-between px-2 pb-1 pt-0.5"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 dark:text-neutral-500">
                    {menuLabel}
                  </span>
                  <span className="text-[10px] tabular-nums text-zinc-400 dark:text-neutral-500">
                    {enabledIndices.length} actions
                  </span>
                </div>

                {items.map((item, index) => {
                  const active = activeIndex === index;
                  return (
                    <motion.button
                      key={item.id}
                      ref={(node) => {
                        actionRefs.current[index] = node;
                      }}
                      type="button"
                      role="menuitem"
                      tabIndex={
                        !item.disabled && index === (activeIndex ?? firstEnabled) ? 0 : -1
                      }
                      aria-label={item.label}
                      disabled={item.disabled}
                      onKeyDown={(event) => handleActionKeyDown(event, index)}
                      onFocus={() => setActiveIndex(index)}
                      onBlur={() => setActiveIndex(null)}
                      onPointerEnter={() => setActiveIndex(index)}
                      onPointerLeave={(event) => {
                        if (document.activeElement !== event.currentTarget) setActiveIndex(null);
                      }}
                      onClick={() => selectItem(item)}
                      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.18,
                        delay: reduceMotion ? 0 : index * 0.025,
                      }}
                      whileTap={reduceMotion || item.disabled ? undefined : { scale: 0.98 }}
                      className={cn(
                        "group/action flex min-h-14 w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left outline-none transition-[color,background-color,border-color] focus-visible:ring-2 focus-visible:ring-zinc-400 motion-reduce:transition-none dark:focus-visible:ring-neutral-500",
                        active
                          ? "border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-paper"
                          : "border-transparent text-zinc-600 hover:border-zinc-200 hover:bg-zinc-50 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/70",
                        "disabled:cursor-not-allowed disabled:opacity-35"
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-[1.8]">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">{item.label}</span>
                        {item.description && (
                          <span className="mt-0.5 block truncate text-[10px] text-zinc-400 dark:text-neutral-500">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {item.shortcut && (
                        <kbd className="shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-sans text-[9px] text-zinc-400 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500">
                          {item.shortcut}
                        </kbd>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
