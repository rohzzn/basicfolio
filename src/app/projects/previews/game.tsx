'use client';

import React, { useEffect, useState } from 'react';

// ── Dock Poker: a hand deals and re-deals with its rank, pot growing ──

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', 'K', 'Q', 'J', '10', '9'];
function dealHand(seed: number) {
  const arr = Array.from({ length: 5 }, (_, i) => {
    const r = RANKS[(seed + i * 3) % RANKS.length];
    const s = SUITS[(seed + i * 7) % SUITS.length];
    return { r, s, red: s === '♥' || s === '♦' };
  });
  return arr;
}
const HAND_LABELS = ['Two Pair', 'Flush', 'Full House', 'Straight'];
export function DockPokerPreview() {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeed((s) => s + 1), 2600);
    return () => clearInterval(id);
  }, []);
  const hand = dealHand(seed);
  const pot = 40 + (seed % 4) * 25;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
      <span className="font-mono text-[7px] text-amber-600 dark:text-amber-500">pot: ${pot}</span>
      <div className="flex gap-1">
        {hand.map((c, i) => (
          <div
            key={`${seed}-${i}`}
            className={`flex h-10 w-7 flex-col items-center justify-center rounded border-2 bg-white dark:bg-neutral-950 ${c.red ? 'border-red-200 text-red-500 dark:border-red-900 dark:text-red-400' : 'border-zinc-200 text-zinc-800 dark:border-neutral-700 dark:text-paper'}`}
            style={{ animation: `pokerDeal 0.4s ease-out ${i * 0.08}s both` }}
          >
            <span className="text-[8px] font-bold leading-none">{c.r}</span>
            <span className="text-[10px] leading-none">{c.s}</span>
          </div>
        ))}
      </div>
      <span className="text-[8px] font-medium text-zinc-500 dark:text-neutral-400">{HAND_LABELS[seed % HAND_LABELS.length]}</span>
      <style>{`@keyframes pokerDeal { 0%{ transform: translateY(-6px) rotate(-4deg); opacity:0 } 100%{ transform: translateY(0) rotate(0); opacity:1 } }`}</style>
    </div>
  );
}

// ── Catan Online: hex resource tiles with a rolling dice indicator ──

const HEX_TILES = [
  { c: '#8fae5b', n: '' }, { c: '#e0a94a', n: '8' }, { c: '#d9c66b', n: '' },
  { c: '#9aa5ab', n: '6' }, { c: '#c9863f', n: '5' }, { c: '#7fbf6a', n: '9' },
  { c: '#e6d27a', n: '4' },
];
const hexClip = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
export function CatanOnlinePreview() {
  const [roll, setRoll] = useState<[number, number]>([3, 5]);
  useEffect(() => {
    const id = setInterval(() => setRoll([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2">
      <div className="grid grid-cols-3 gap-0.5" style={{ width: 110 }}>
        {HEX_TILES.map((h, i) => (
          <div
            key={i}
            className={`relative flex aspect-[6/5.2] items-center justify-center ${i === 1 || i === 4 ? 'translate-y-2.5' : i === 3 || i === 5 ? '' : ''}`}
            style={{ backgroundColor: h.c, clipPath: hexClip }}
          >
            {h.n && (
              <span className={`flex h-3 w-3 items-center justify-center rounded-full bg-[#f2e5c8] text-[6px] font-bold text-zinc-800 ${Number(h.n) === roll[0] + roll[1] ? 'ring-1 ring-red-500' : ''}`}>
                {h.n}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-0.5">
          {roll.map((d, i) => (
            <span key={i} className="flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-300 bg-white text-[8px] font-bold text-zinc-700 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">{d}</span>
          ))}
        </div>
        <span className="text-[6px] text-zinc-400 dark:text-neutral-500">= {roll[0] + roll[1]}</span>
      </div>
    </div>
  );
}

// ── Wordle: three guesses revealing on a loop, attempt counter ──

type GS = 'correct' | 'present' | 'absent';
const WORDLE_GUESSES: { w: string; s: GS[] }[] = [
  { w: 'CRAFT', s: ['present', 'absent', 'correct', 'absent', 'present'] },
  { w: 'TRACK', s: ['absent', 'present', 'correct', 'absent', 'correct'] },
  { w: 'STACK', s: ['correct', 'correct', 'correct', 'correct', 'correct'] },
];
const GC: Record<GS, string> = {
  correct: 'bg-green-500 border-green-500 text-white',
  present: 'bg-amber-400 border-amber-400 text-white',
  absent: 'bg-zinc-400 border-zinc-400 text-white dark:bg-neutral-600 dark:border-neutral-600',
};
export function WordlePreview() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDLE_GUESSES.length), 2400);
    return () => clearInterval(id);
  }, []);
  const g = WORDLE_GUESSES[i];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
      <div className="flex gap-1">
        {g.w.split('').map((ch, ci) => (
          <div
            key={`${i}-${ci}`}
            className={`flex h-7 w-7 items-center justify-center rounded border-2 text-[11px] font-bold ${GC[g.s[ci]]}`}
            style={{ animation: `wordleFlip 0.4s ease-out ${ci * 0.1}s both` }}
          >
            {ch}
          </div>
        ))}
      </div>
      <span className="text-[7px] text-zinc-400 dark:text-neutral-500">guess {i + 1}/6</span>
      <style>{`@keyframes wordleFlip { 0%{ transform: rotateX(90deg); opacity:0 } 100%{ transform: rotateX(0); opacity:1 } }`}</style>
    </div>
  );
}

// ── Pokemon 2D Platformer: a sprite walking, collecting a coin ──

export function PokemonPlatformerPreview() {
  const [collected, setCollected] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setCollected((c) => !c), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100 dark:from-slate-800 dark:to-slate-900">
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-500/70 dark:bg-emerald-700/50" />
      <div className="absolute bottom-4 left-6 h-1.5 w-8 rounded-t bg-amber-700/60" />
      <div className="absolute bottom-8 left-24 h-1.5 w-8 rounded-t bg-amber-700/60" />
      {!collected && <span className="absolute bottom-11 left-[104px] h-2 w-2 rounded-full bg-amber-400" style={{ animation: 'coinSpin 1s linear infinite' }} />}
      <div className="absolute bottom-4" style={{ animation: 'pkmWalk 4s linear infinite' }}>
        <div className="relative h-4 w-4 rounded-sm bg-yellow-400" style={{ animation: 'pkmBob 0.3s ease-in-out infinite alternate' }}>
          <div className="absolute -top-1 left-0.5 h-1.5 w-1 rounded-t-full bg-yellow-400" />
          <div className="absolute -top-1 right-0.5 h-1.5 w-1 rounded-t-full bg-yellow-400" />
        </div>
      </div>
      <style>{`
        @keyframes pkmWalk { 0%{ left:8px } 45%{ left:calc(100% - 28px) } 50%{ left:calc(100% - 28px) } 95%{ left:8px } 100%{ left:8px } }
        @keyframes pkmBob { 0%{ transform: translateY(0) } 100%{ transform: translateY(-2px) } }
        @keyframes coinSpin { 0%{ transform: scaleX(1) } 50%{ transform: scaleX(0.2) } 100%{ transform: scaleX(1) } }
      `}</style>
    </div>
  );
}

// ── Pokedex: cycles between two entries with stat bars and type badge ──

const DEX_ENTRIES = [
  { num: '006', name: 'CHARIZARD', type: 'Fire', typeColor: 'bg-orange-400', stats: [{ k: 'HP', v: 78, c: 'bg-red-400' }, { k: 'ATK', v: 84, c: 'bg-orange-400' }, { k: 'SPD', v: 100, c: 'bg-emerald-400' }] },
  { num: '009', name: 'BLASTOISE', type: 'Water', typeColor: 'bg-blue-400', stats: [{ k: 'HP', v: 79, c: 'bg-red-400' }, { k: 'ATK', v: 83, c: 'bg-orange-400' }, { k: 'SPD', v: 78, c: 'bg-emerald-400' }] },
];
export function PokedexPreview() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % DEX_ENTRIES.length), 2600);
    return () => clearInterval(id);
  }, []);
  const e = DEX_ENTRIES[i];
  return (
    <div className="absolute inset-2.5 flex flex-col overflow-hidden rounded-lg border-2 border-red-500/70 bg-white dark:bg-neutral-950">
      <div className="flex items-center gap-1.5 bg-red-500/90 px-2 py-1">
        <span className="h-2.5 w-2.5 rounded-full border border-white/70 bg-sky-300" />
        <span className="text-[7px] font-bold text-white">#{e.num} {e.name}</span>
        <span className={`ml-auto rounded px-1 text-[6px] font-bold text-white ${e.typeColor}`}>{e.type}</span>
      </div>
      <div className="flex-1 space-y-1 px-2.5 py-2">
        {e.stats.map((s, si) => (
          <div key={s.k} className="flex items-center gap-1.5">
            <span className="w-5 text-[6.5px] font-medium text-zinc-500 dark:text-neutral-400">{s.k}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-neutral-800">
              <div className={`h-full rounded-full ${s.c}`} style={{ width: `${s.v}%`, animation: `dexFill 1.2s ease-out ${si * 0.15}s both` }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes dexFill { 0%{ width: 0% } }`}</style>
    </div>
  );
}

// ── Greed Island Dex: card catalog with search highlight and a found tick ──

const GI_CARDS = ['Accompany', 'Beautify', 'Clone', 'Cure', 'Ecstasy', 'Guidemap'];
export function GreedIslandDexPreview() {
  const [hi, setHi] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHi((h) => (h + 1) % GI_CARDS.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-2.5 overflow-hidden rounded-lg border border-zinc-200 dark:border-neutral-800">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-2 py-1 dark:border-neutral-800 dark:bg-neutral-900">
        <span className="text-[7.5px] text-zinc-400 dark:text-neutral-500">Search cards…</span>
        <span className="text-[7px] text-zinc-400 dark:text-neutral-500">{GI_CARDS.length} total</span>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
        {GI_CARDS.map((c, i) => (
          <div key={c} className={`flex items-center justify-between px-2 py-1 text-[8px] transition-colors ${i === hi ? 'bg-zinc-100 dark:bg-neutral-800' : ''}`}>
            <span className="flex items-center gap-1 text-zinc-700 dark:text-neutral-300">{i === hi && <span className="text-emerald-500">✓</span>}{c}</span>
            <span className="font-mono text-[7px] text-zinc-400 dark:text-neutral-500">GI-{String(i + 1).padStart(3, '0')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
