"use client";
import React, { useState } from 'react';

type Res = 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore';

const RES_COLORS: Record<Res, string> = {
  wood:  'bg-green-700',
  brick: 'bg-orange-700',
  sheep: 'bg-green-500',
  wheat: 'bg-yellow-500',
  ore:   'bg-slate-500',
};
const RES_ORDER: Res[] = ['wood', 'brick', 'sheep', 'wheat', 'ore'];

const BUILDINGS = [
  { name: 'Road',       vp: 0,   cost: { wood: 1, brick: 1 } as Partial<Record<Res,number>> },
  { name: 'Settlement', vp: 1,   cost: { wood: 1, brick: 1, sheep: 1, wheat: 1 } as Partial<Record<Res,number>> },
  { name: 'City',       vp: 2,   cost: { wheat: 2, ore: 3 } as Partial<Record<Res,number>> },
  { name: 'Dev Card',   vp: '?', cost: { ore: 1, sheep: 1, wheat: 1 } as Partial<Record<Res,number>> },
];

export default function BuildCosts() {
  const [hand, setHand] = useState<Record<Res, number>>({ wood:0, brick:0, sheep:0, wheat:0, ore:0 });

  const adj = (r: Res, d: number) =>
    setHand(p => ({ ...p, [r]: Math.max(0, Math.min(9, p[r] + d)) }));

  const canAfford = (cost: Partial<Record<Res, number>>) =>
    RES_ORDER.every(r => (hand[r] ?? 0) >= (cost[r] ?? 0));

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Build Cost Reference</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <div className="mb-5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Set your hand</p>
          <div className="flex flex-wrap gap-3">
            {RES_ORDER.map(r => (
              <div key={r} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded ${RES_COLORS[r]} text-white text-xs font-bold flex items-center justify-center`}>
                  {hand[r]}
                </div>
                <div className="flex flex-col gap-px">
                  <button onClick={() => adj(r, 1)} className="text-[10px] leading-none text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">▲</button>
                  <button onClick={() => adj(r, -1)} className="text-[10px] leading-none text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">▼</button>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {BUILDINGS.map(b => {
            const ok = canAfford(b.cost);
            return (
              <div key={b.name}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md border transition-all duration-200 ${ok ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {b.name}
                  </span>
                  {ok && <span className="text-[10px] text-emerald-600 dark:text-emerald-500">can build</span>}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 mr-1">{b.vp} VP</span>
                  {(Object.entries(b.cost) as [Res, number][]).map(([res, n]) =>
                    Array.from({ length: n }).map((_, j) => (
                      <div key={`${res}-${j}`} className={`w-4 h-4 rounded-sm ${RES_COLORS[res]} text-white text-[9px] font-bold flex items-center justify-center`}>
                        {res[0].toUpperCase()}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-3">Colour key: green=wood, orange=brick, lime=sheep, yellow=wheat, slate=ore</p>
      </div>
    </div>
  );
}
