"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 22], [72, 22], [28, 50], [72, 50], [28, 78], [72, 78]],
};

function Die({ value, shaking }: { value: number; shaking: boolean }) {
  return (
    <div
      className="relative w-12 h-12 bg-white dark:bg-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-300 shadow-sm flex-shrink-0"
      style={{
        animation: shaking ? "shake 0.08s linear infinite" : "none",
      }}
    >
      {(PIPS[value] || []).map(([x, y], i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-zinc-900"
          style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
        />
      ))}
      <style>{`@keyframes shake { 0%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} 100%{transform:rotate(-6deg)} }`}</style>
    </div>
  );
}

const TOTALS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function emptyDist(): Record<number, number> {
  return Object.fromEntries(TOTALS.map((n) => [n, 0])) as Record<number, number>;
}

export default function DiceRoller() {
  const [dice, setDice] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [bulkRolling, setBulkRolling] = useState(false);
  /** Single running histogram: every Roll and every Roll 100× adds here. */
  const [dist, setDist] = useState(emptyDist);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bulkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (bulkTimeoutRef.current) clearTimeout(bulkTimeoutRef.current);
    };
  }, []);

  const total = dice[0] + dice[1];
  const is7 = total === 7;
  const isHot = total === 6 || total === 8;

  const roll = () => {
    if (rolling || bulkRolling) return;
    setRolling(true);
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      ticks++;
      if (ticks >= 10) {
        clearInterval(intervalRef.current!);
        const d1 = Math.ceil(Math.random() * 6);
        const d2 = Math.ceil(Math.random() * 6);
        const sum = d1 + d2;
        setDice([d1, d2]);
        setDist((prev) => ({ ...prev, [sum]: (prev[sum] ?? 0) + 1 }));
        setRolling(false);
      }
    }, 75);
  };

  /** 100 rolls in quick succession: dice + one histogram bin per step (visible, no shuffle loop). */
  const roll100 = () => {
    if (rolling || bulkRolling) return;
    if (bulkTimeoutRef.current) clearTimeout(bulkTimeoutRef.current);

    setBulkRolling(true);
    const STEP_MS = 24;
    let i = 0;

    const runStep = () => {
      const d1 = Math.ceil(Math.random() * 6);
      const d2 = Math.ceil(Math.random() * 6);
      const sum = d1 + d2;
      setDice([d1, d2]);
      setDist((prev) => ({ ...prev, [sum]: (prev[sum] ?? 0) + 1 }));
      i++;
      if (i >= 100) {
        setBulkRolling(false);
        bulkTimeoutRef.current = null;
        return;
      }
      bulkTimeoutRef.current = setTimeout(runStep, STEP_MS);
    };

    runStep();
  };

  const totalRolls = useMemo(() => TOTALS.reduce((s, n) => s + (dist[n] ?? 0), 0), [dist]);
  const barMax = useMemo(() => Math.max(...TOTALS.map((n) => dist[n] ?? 0), 1), [dist]);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Dice Roller</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-3">
            <Die value={dice[0]} shaking={rolling && !bulkRolling} />
            <Die value={dice[1]} shaking={rolling && !bulkRolling} />
          </div>
          <div className="flex flex-col">
            <span
              className={`text-3xl font-bold leading-none ${is7 ? "text-red-500" : isHot ? "text-amber-500 dark:text-amber-400" : "dark:text-white"}`}
            >
              {total}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {is7 ? "Move the robber" : isHot ? "High probability" : "Roll total"}
            </span>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={roll100}
              disabled={rolling || bulkRolling}
              className="px-3 py-2 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            >
              Roll 100×
            </button>
            <button
              type="button"
              onClick={roll}
              disabled={rolling || bulkRolling}
              className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
            >
              Roll
            </button>
          </div>
        </div>

        {totalRolls > 0 && (
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">
              Running totals · {totalRolls} roll{totalRolls === 1 ? "" : "s"}{" "}
              <span className="text-zinc-300 dark:text-zinc-600">(shape should lean toward 6–8)</span>
            </p>
            <div className="flex items-end gap-1.5 h-32 mb-2">
              {TOTALS.map((n) => {
                const c = dist[n] ?? 0;
                return (
                  <div key={n} className="flex flex-col items-center flex-1 min-w-0">
                    <span className="text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400 mb-0.5">{c}</span>
                    <div
                      className={`w-full rounded-t-sm transition-[height] duration-100 ease-out ${
                        n === 7
                          ? "bg-red-400 dark:bg-red-500"
                          : n === 6 || n === 8
                            ? "bg-amber-400 dark:bg-amber-500"
                            : "bg-zinc-300 dark:bg-zinc-600"
                      }`}
                      style={{ height: `${(c / barMax) * 100}px`, minHeight: c > 0 ? 4 : 0 }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1.5">
              {TOTALS.map((n) => (
                <div key={n} className="flex-1 min-w-0 text-center text-[9px] text-zinc-400 dark:text-zinc-600">
                  {n}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
