"use client";
import React, { useState, useRef, useEffect } from 'react';

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
        animation: shaking ? 'shake 0.08s linear infinite' : 'none',
      }}
    >
      {(PIPS[value] || []).map(([x, y], i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-zinc-900"
          style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
        />
      ))}
      <style>{`@keyframes shake { 0%{transform:rotate(-6deg)} 50%{transform:rotate(6deg)} 100%{transform:rotate(-6deg)} }`}</style>
    </div>
  );
}

const TOTALS = [2,3,4,5,6,7,8,9,10,11,12];

export default function DiceRoller() {
  const [dice, setDice] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  /** Distribution from the last "Roll 100×" run (2–12 → count). */
  const [simCounts, setSimCounts] = useState<Record<number, number> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const total = dice[0] + dice[1];
  const is7 = total === 7;
  const isHot = total === 6 || total === 8;

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    intervalRef.current = setInterval(() => {
      setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      ticks++;
      if (ticks >= 10) {
        clearInterval(intervalRef.current!);
        const d1 = Math.ceil(Math.random() * 6);
        const d2 = Math.ceil(Math.random() * 6);
        setDice([d1, d2]);
        setHistory(p => [d1 + d2, ...p].slice(0, 12));
        setRolling(false);
      }
    }, 75);
  };

  const roll100 = () => {
    if (rolling) return;
    const next: Record<number, number> = Object.fromEntries(TOTALS.map((n) => [n, 0])) as Record<
      number,
      number
    >;
    let d1 = 1;
    let d2 = 1;
    for (let i = 0; i < 100; i++) {
      d1 = Math.ceil(Math.random() * 6);
      d2 = Math.ceil(Math.random() * 6);
      next[d1 + d2]++;
    }
    setDice([d1, d2]);
    setSimCounts(next);
  };

  const counts = history.reduce<Record<number, number>>((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {});
  const maxCount = Math.max(...Object.values(counts), 1);
  const simMax = simCounts ? Math.max(...TOTALS.map((n) => simCounts[n] ?? 0), 1) : 1;

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Dice Roller</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-3">
            <Die value={dice[0]} shaking={rolling} />
            <Die value={dice[1]} shaking={rolling} />
          </div>
          <div className="flex flex-col">
            <span className={`text-3xl font-bold leading-none ${is7 ? 'text-red-500' : isHot ? 'text-amber-500 dark:text-amber-400' : 'dark:text-white'}`}>
              {total}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {is7 ? 'Move the robber' : isHot ? 'High probability' : 'Roll total'}
            </span>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={roll100}
              disabled={rolling}
              className="px-3 py-2 text-sm font-medium rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            >
              Roll 100×
            </button>
            <button
              type="button"
              onClick={roll}
              disabled={rolling}
              className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-40 transition-colors"
            >
              Roll
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">Roll history (last 12)</p>
            <div className="flex items-end gap-1 h-10 mb-2">
              {TOTALS.map(n => {
                const c = counts[n] ?? 0;
                return (
                  <div key={n} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${n === 7 ? 'bg-red-400 dark:bg-red-500' : n === 6 || n === 8 ? 'bg-amber-400 dark:bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                      style={{ height: `${(c / maxCount) * 36}px`, minHeight: c > 0 ? 3 : 0 }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1">
              {TOTALS.map(n => (
                <div key={n} className="flex-1 text-center text-[9px] text-zinc-400 dark:text-zinc-600">{n}</div>
              ))}
            </div>
          </div>
        )}

        {simCounts && (
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-1">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">
              Distribution · 100 simulated rolls <span className="text-zinc-300 dark:text-zinc-600">(expected peaks at 6–8)</span>
            </p>
            <div className="flex items-end gap-1.5 h-32 mb-2">
              {TOTALS.map((n) => {
                const c = simCounts[n] ?? 0;
                return (
                  <div key={n} className="flex flex-col items-center flex-1 min-w-0">
                    <span className="text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400 mb-0.5">{c}</span>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-300 ${n === 7 ? 'bg-red-400 dark:bg-red-500' : n === 6 || n === 8 ? 'bg-amber-400 dark:bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                      style={{ height: `${(c / simMax) * 100}px`, minHeight: c > 0 ? 4 : 0 }}
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
