"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { L } from "../demo-utils";

const ENTRIES = [
  { year: "Today", name: "Sentinelese", blurb: "Spoken now — never recorded." },
  { year: "2001", name: "Toki Pona", blurb: "A language built from ~120 words." },
  { year: "c. 800", name: "Old English", blurb: "Beowulf's tongue, not Shakespeare's." },
  { year: "c. 3200 BCE", name: "Sumerian", blurb: "Likely the first language ever written." },
  { year: "reconstructed", name: "Proto-Indo-European", blurb: "Rebuilt from descendants — never written." },
];

export function LanguagesLatDemo() {
  const [active, setActive] = useState(0);

  return (
    <div className="my-8 not-prose">
      <p className={L}>Timeline</p>

      <div className="relative pl-5">
        <div
          aria-hidden
          className="absolute bottom-1 left-[5px] top-1 w-px bg-zinc-200 dark:bg-neutral-800"
        />

        <div className="space-y-0">
          {ENTRIES.map((entry, i) => {
            const selected = active === i;
            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => setActive(i)}
                className="group relative flex w-full items-start gap-3 py-2.5 text-left first:pt-0 last:pb-0"
              >
                <span
                  className={`relative z-[1] mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 transition-colors ${
                    selected
                      ? "border-amber-500 bg-amber-500"
                      : "border-zinc-300 bg-white group-hover:border-zinc-400 dark:border-neutral-600 dark:bg-neutral-950 dark:group-hover:border-neutral-500"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[10px] uppercase tracking-wider transition-colors ${
                      selected
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-zinc-400 dark:text-neutral-500"
                    }`}
                  >
                    {entry.year}
                  </span>
                  <span
                    className={`block text-sm transition-colors ${
                      selected
                        ? "font-medium text-zinc-900 dark:text-paper"
                        : "text-zinc-600 group-hover:text-zinc-800 dark:text-neutral-400 dark:group-hover:text-neutral-200"
                    }`}
                  >
                    {entry.name}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="mt-3 border-t border-zinc-100 pt-3 text-xs leading-relaxed text-zinc-500 dark:border-neutral-800 dark:text-neutral-400"
        >
          {ENTRIES[active].blurb}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
