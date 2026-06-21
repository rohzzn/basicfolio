"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  EREADER_CHANGE_EVENT,
  applyEReaderMode,
  getEReaderEnabled,
  setEReaderEnabled,
} from "@/lib/ereader-mode";

export default function EReaderEasterEgg() {
  const sequence = useMemo(
    () => [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ],
    []
  );

  const indexRef = useRef(0);
  const toastTimeoutRef = useRef<number | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const saved = getEReaderEnabled();
    setEnabled(saved);
    if (saved) applyEReaderMode(true);
  }, []);

  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<{ enabled: boolean }>).detail.enabled;
      setEnabled(next);
    };

    window.addEventListener(EREADER_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(EREADER_CHANGE_EVENT, onChange);
  }, []);

  const showEasterEggToast = () => {
    setShowToast(true);
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setShowToast(false);
      toastTimeoutRef.current = null;
    }, 3400);
  };

  // Konami listener (toggles e-reader mode).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable =
        target?.isContentEditable ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select";
      if (isEditable) return;

      if (e.key === "Escape") {
        if (getEReaderEnabled()) {
          setEReaderEnabled(false);
        }
        setShowToast(false);
        if (toastTimeoutRef.current) {
          window.clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = null;
        }
        indexRef.current = 0;
        return;
      }

      const expected = sequence[indexRef.current];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === expected) {
        indexRef.current += 1;
        if (indexRef.current >= sequence.length) {
          indexRef.current = 0;
          const next = !getEReaderEnabled();
          setEReaderEnabled(next);
          if (next) showEasterEggToast();
        }
        return;
      }

      indexRef.current = key === sequence[0] ? 1 : 0;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sequence]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {enabled && <div className="ereader-overlay" aria-hidden="true" />}

      {showToast && (
        <div
          className="easteregg-toast fixed left-1/2 top-4 z-[80] w-[92vw] max-w-md -translate-x-1/2 rounded-xl border border-zinc-200/70 bg-zinc-50/90 px-4 py-3 text-sm text-zinc-800 shadow-lg backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-900/80 dark:text-zinc-200"
          role="status"
          aria-live="polite"
        >
          <div className="font-medium">You found the easter egg.</div>
          <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
            E‑reader mode enabled. Press <span className="font-medium">Esc</span> to
            turn it off.
          </div>
        </div>
      )}
    </>
  );
}
