'use client';

import React, { useEffect, useState } from 'react';

// ── Dock Poker: a hand deals and re-deals with its rank ──

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
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <div className="flex gap-1">
        {hand.map((c, i) => (
          <div
            key={`${seed}-${i}`}
            className={`flex h-10 w-7 flex-col items-center justify-center rounded border-2 bg-white ${c.red ? 'border-red-200 text-red-500' : 'border-zinc-200 text-zinc-800'}`}
            style={{ animation: `pokerDeal 0.4s ease-out ${i * 0.08}s both` }}
          >
            <span className="text-[8px] font-bold leading-none">{c.r}</span>
            <span className="text-[10px] leading-none">{c.s}</span>
          </div>
        ))}
      </div>
      <span className="text-[8px] font-medium text-zinc-500">{HAND_LABELS[seed % HAND_LABELS.length]}</span>
      <style>{`@keyframes pokerDeal { 0%{ transform: translateY(-6px) rotate(-4deg); opacity:0 } 100%{ transform: translateY(0) rotate(0); opacity:1 } }`}</style>
    </div>
  );
}

// ── Catan Online: hex resource tiles ──

const HEX_TILES = [
  { c: '#8fae5b', n: '' }, { c: '#e0a94a', n: '8' }, { c: '#d9c66b', n: '' },
  { c: '#9aa5ab', n: '6' }, { c: '#c9863f', n: '5' }, { c: '#7fbf6a', n: '9' },
  { c: '#e6d27a', n: '4' },
];
const hexClip = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
export function CatanOnlinePreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="grid grid-cols-3 gap-0.5" style={{ width: 132 }}>
        {HEX_TILES.map((h, i) => (
          <div
            key={i}
            className={`flex aspect-[6/5.2] items-center justify-center ${i === 1 || i === 4 ? 'translate-y-2.5' : i === 3 || i === 5 ? '' : ''}`}
            style={{ backgroundColor: h.c, clipPath: hexClip }}
          >
            {h.n && (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f2e5c8] text-[7px] font-bold text-zinc-800">
                {h.n}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Wordle: guesses revealing on a loop ──

type GS = 'correct' | 'present' | 'absent';
const WORDLE_GUESSES: { w: string; s: GS[] }[] = [
  { w: 'CRAFT', s: ['present', 'absent', 'correct', 'absent', 'present'] },
  { w: 'STACK', s: ['correct', 'correct', 'correct', 'correct', 'correct'] },
];
const GC: Record<GS, string> = {
  correct: 'bg-green-500 border-green-500 text-white',
  present: 'bg-amber-400 border-amber-400 text-white',
  absent: 'bg-zinc-400 border-zinc-400 text-white',
};
export function WordlePreview() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDLE_GUESSES.length), 2800);
    return () => clearInterval(id);
  }, []);
  const g = WORDLE_GUESSES[i];
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-1">
      {g.w.split('').map((ch, ci) => (
        <div
          key={`${i}-${ci}`}
          className={`flex h-7 w-7 items-center justify-center rounded border-2 text-[11px] font-bold ${GC[g.s[ci]]}`}
          style={{ animation: `wordleFlip 0.4s ease-out ${ci * 0.1}s both` }}
        >
          {ch}
        </div>
      ))}
      <style>{`@keyframes wordleFlip { 0%{ transform: rotateX(90deg); opacity:0 } 100%{ transform: rotateX(0); opacity:1 } }`}</style>
    </div>
  );
}

// ── Pokemon 2D Platformer: a sprite walking across platforms ──

export function PokemonPlatformerPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100">
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-500/70" />
      <div className="absolute bottom-4 left-6 h-1.5 w-8 rounded-t bg-amber-700/60" />
      <div className="absolute bottom-8 left-24 h-1.5 w-8 rounded-t bg-amber-700/60" />
      <div className="absolute bottom-4" style={{ animation: 'pkmWalk 4s linear infinite' }}>
        <div className="relative h-4 w-4 rounded-sm bg-yellow-400" style={{ animation: 'pkmBob 0.3s ease-in-out infinite alternate' }}>
          <div className="absolute -top-1 left-0.5 h-1.5 w-1 rounded-t-full bg-yellow-400" />
          <div className="absolute -top-1 right-0.5 h-1.5 w-1 rounded-t-full bg-yellow-400" />
        </div>
      </div>
      <style>{`
        @keyframes pkmWalk { 0%{ left:8px } 45%{ left:calc(100% - 28px) } 50%{ left:calc(100% - 28px) } 95%{ left:8px } 100%{ left:8px } }
        @keyframes pkmBob { 0%{ transform: translateY(0) } 100%{ transform: translateY(-2px) } }
      `}</style>
    </div>
  );
}

// ── Pokedex: entry card with stat bars filling ──

const DEX_STATS = [
  { k: 'HP', v: 78, c: 'bg-red-400' },
  { k: 'ATK', v: 84, c: 'bg-orange-400' },
  { k: 'SPD', v: 100, c: 'bg-emerald-400' },
];
export function PokedexPreview() {
  return (
    <div className="absolute inset-2.5 flex flex-col overflow-hidden rounded-lg border-2 border-red-500/70 bg-white">
      <div className="flex items-center gap-1.5 bg-red-500/90 px-2 py-1">
        <span className="h-2.5 w-2.5 rounded-full border border-white/70 bg-sky-300" />
        <span className="text-[7px] font-bold text-white">#006 CHARIZARD</span>
      </div>
      <div className="flex-1 space-y-1 px-2.5 py-2">
        {DEX_STATS.map((s, i) => (
          <div key={s.k} className="flex items-center gap-1.5">
            <span className="w-5 text-[6.5px] font-medium text-zinc-500">{s.k}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div className={`h-full rounded-full ${s.c}`} style={{ width: `${s.v}%`, animation: `dexFill 1.2s ease-out ${i * 0.15}s both` }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes dexFill { 0%{ width: 0% } }`}</style>
    </div>
  );
}

// ── Greed Island Dex: card catalog with search highlight cycling ──

const GI_CARDS = ['Accompany', 'Beautify', 'Clone', 'Cure', 'Ecstasy', 'Guidemap'];
export function GreedIslandDexPreview() {
  const [hi, setHi] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHi((h) => (h + 1) % GI_CARDS.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-2.5 overflow-hidden rounded-lg border border-zinc-200">
      <div className="border-b border-zinc-100 bg-zinc-50 px-2 py-1">
        <span className="text-[7.5px] text-zinc-400">Search cards…</span>
      </div>
      <div className="divide-y divide-zinc-100">
        {GI_CARDS.map((c, i) => (
          <div key={c} className={`flex items-center justify-between px-2 py-1 text-[8px] transition-colors ${i === hi ? 'bg-zinc-100' : ''}`}>
            <span className="text-zinc-700">{c}</span>
            <span className="font-mono text-[7px] text-zinc-400">GI-{String(i + 1).padStart(3, '0')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
