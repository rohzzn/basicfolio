"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type EReaderSettings = {
  enabled: boolean;
};

const STORAGE_KEY = "basicfolio:ereader:v1";

function safeParseSettings(raw: string | null): EReaderSettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<EReaderSettings>;
    if (typeof parsed !== "object" || parsed === null) return null;
    return { enabled: Boolean(parsed.enabled) };
  } catch {
    return null;
  }
}

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
  const hadDarkRef = useRef<boolean>(false);

  const [settings, setSettings] = useState<EReaderSettings>({ enabled: false });
  const [showToast, setShowToast] = useState(false);

  // Load saved settings once.
  useEffect(() => {
    const saved = safeParseSettings(localStorage.getItem(STORAGE_KEY));
    if (saved) setSettings(saved);
  }, []);

  // Apply/remove global class (+ temporarily force light mode).
  useEffect(() => {
    const root = document.documentElement;

    if (settings.enabled) {
      hadDarkRef.current = root.classList.contains("dark");
      root.classList.remove("dark");
      root.classList.add("e-reader-mode");
    } else {
      root.classList.remove("e-reader-mode");
      if (hadDarkRef.current) root.classList.add("dark");
      hadDarkRef.current = false;
    }
  }, [settings.enabled]);

  // Persist on change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

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
        setSettings({ enabled: false });
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
          setSettings((s) => {
            const next = !s.enabled;
            if (next) {
              setShowToast(true);
              if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = window.setTimeout(() => {
                setShowToast(false);
                toastTimeoutRef.current = null;
              }, 3400);
            }
            return { enabled: next };
          });
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
      {settings.enabled && <div className="ereader-overlay" aria-hidden="true" />}

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

