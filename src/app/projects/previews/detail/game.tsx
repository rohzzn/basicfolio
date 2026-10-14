'use client';

import React, { useState } from 'react';

// ── Dock Poker: real deal + hand ranking + a running hand history and chip stack ──

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
function dealHand() {
  const deck = SUITS.flatMap((s) => RANKS.map((r) => ({ r, s, red: s === '♥' || s === '♦' })));
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck.slice(0, 5);
}
const HAND_RANK_VALUE: Record<string, number> = {
  'Straight Flush': 100, 'Four of a Kind': 90, 'Full House': 80, Flush: 70, Straight: 60,
  'Three of a Kind': 50, 'Two Pair': 40, 'One Pair': 30, 'High Card': 10,
};
function rankHand(hand: { r: string; s: string }[]): string {
  const rv: Record<string, number> = { A: 14, K: 13, Q: 12, J: 11, '10': 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 };
  const vals = hand.map((c) => rv[c.r]).sort((a, b) => b - a);
  const flush = new Set(hand.map((c) => c.s)).size === 1;
  const straight = vals.every((v, i) => i === 0 || vals[i - 1] - v === 1);
  const counts: Record<number, number> = {};
  vals.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  const groups = Object.values(counts).sort((a, b) => b - a);
  if (flush && straight) return 'Straight Flush';
  if (groups[0] === 4) return 'Four of a Kind';
  if (groups[0] === 3 && groups[1] === 2) return 'Full House';
  if (flush) return 'Flush';
  if (straight) return 'Straight';
  if (groups[0] === 3) return 'Three of a Kind';
  if (groups[0] === 2 && groups[1] === 2) return 'Two Pair';
  if (groups[0] === 2) return 'One Pair';
  return 'High Card';
}
export function DockPokerDetail() {
  const [hand, setHand] = useState<ReturnType<typeof dealHand>>([]);
  const [best, setBest] = useState('');
  const [chips, setChips] = useState(500);
  const [history, setHistory] = useState<{ rank: string; delta: number }[]>([]);
  const deal = () => {
    const h = dealHand();
    const rank = rankHand(h);
    const win = HAND_RANK_VALUE[rank] >= 50;
    const delta = win ? HAND_RANK_VALUE[rank] : -20;
    setHand(h); setBest(rank);
    setChips((c) => Math.max(0, c + delta));
    setHistory((hist) => [{ rank, delta }, ...hist].slice(0, 4));
  };
  return (
    <div className="flex h-full items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex min-h-[88px] gap-2">
          {hand.length === 0 && <p className="self-center text-sm text-zinc-400 dark:text-neutral-400">No cards dealt yet</p>}
          {hand.map((c, i) => (
            <div key={i} className={`flex h-20 w-14 flex-col items-center justify-center rounded-lg border-2 bg-white dark:bg-neutral-900 ${c.red ? 'border-red-200 text-red-500 dark:border-red-900' : 'border-zinc-200 text-zinc-800 dark:border-neutral-700 dark:text-paper'}`}>
              <span className="text-sm font-bold leading-none">{c.r}</span>
              <span className="text-2xl leading-none">{c.s}</span>
            </div>
          ))}
        </div>
        {best && <p className="text-sm font-medium dark:text-paper">{best}</p>}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-amber-600 dark:text-amber-400">{chips} chips</span>
          <button onClick={deal} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-85 dark:bg-neutral-100 dark:text-neutral-900">
            {hand.length ? 'Deal again' : 'Deal hand'}
          </button>
        </div>
      </div>
      <div className="w-32 border-l border-zinc-100 pl-4 dark:border-neutral-800">
        <p className="mb-1.5 text-[10px] font-medium text-zinc-400 dark:text-neutral-500">History</p>
        {history.length === 0 && <p className="text-[10px] text-zinc-300 dark:text-neutral-700">No hands yet</p>}
        <div className="space-y-1">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-500 dark:text-neutral-400">{h.rank}</span>
              <span className={h.delta > 0 ? 'text-emerald-500' : 'text-red-500'}>{h.delta > 0 ? '+' : ''}{h.delta}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Catan Online: click a number for odds, or roll real dice and watch the histogram ──

const CATAN_PROB: Record<number, { ways: number; pct: string }> = {
  2: { ways: 1, pct: '2.8%' }, 3: { ways: 2, pct: '5.6%' }, 4: { ways: 3, pct: '8.3%' }, 5: { ways: 4, pct: '11.1%' },
  6: { ways: 5, pct: '13.9%' }, 8: { ways: 5, pct: '13.9%' }, 9: { ways: 4, pct: '11.1%' }, 10: { ways: 3, pct: '8.3%' },
  11: { ways: 2, pct: '5.6%' }, 12: { ways: 1, pct: '2.8%' },
};
export function CatanOnlineDetail() {
  const [sel, setSel] = useState<number | null>(6);
  const [rolls, setRolls] = useState<Record<number, number>>({});
  const [dice, setDice] = useState<[number, number]>([3, 3]);
  const roll = () => {
    const d1 = 1 + Math.floor(Math.random() * 6), d2 = 1 + Math.floor(Math.random() * 6);
    const sum = d1 + d2;
    setDice([d1, d2]);
    setSel(sum);
    setRolls((r) => ({ ...r, [sum]: (r[sum] ?? 0) + 1 }));
  };
  const maxRolls = Math.max(1, ...Object.values(rolls));
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex flex-wrap justify-center gap-1.5">
        {Object.entries(CATAN_PROB).map(([n]) => {
          const num = Number(n); const hot = num === 6 || num === 8;
          return (
            <button key={n} onClick={() => setSel(sel === num ? null : num)}
              className={`flex flex-col items-center rounded-lg border px-2.5 py-1.5 transition-colors ${sel === num ? 'border-transparent bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'border-zinc-200 hover:bg-zinc-50 dark:border-neutral-700 dark:hover:bg-neutral-800/40'}`}>
              <span className={`text-xs font-bold ${hot && sel !== num ? 'text-red-500' : ''}`}>{n}</span>
              <div className="mt-0.5 h-6 w-3 overflow-hidden rounded-sm bg-zinc-100 dark:bg-neutral-800">
                <div className="w-full bg-blue-400" style={{ height: `${((rolls[num] ?? 0) / maxRolls) * 100}%`, marginTop: 'auto' }} />
              </div>
            </button>
          );
        })}
      </div>
      {sel && (
        <div className="rounded-lg bg-zinc-50 p-2.5 text-center text-xs text-zinc-600 dark:bg-neutral-800/40 dark:text-neutral-400">
          Rolling <strong className="dark:text-paper">{sel}</strong>: {CATAN_PROB[sel]?.ways ?? '?'} of 36 combos · <strong className="dark:text-paper">{CATAN_PROB[sel]?.pct ?? ''}</strong>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-bold dark:border-neutral-600 dark:bg-neutral-900 dark:text-paper">{dice[0]}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded border border-zinc-300 bg-white text-xs font-bold dark:border-neutral-600 dark:bg-neutral-900 dark:text-paper">{dice[1]}</span>
        <button onClick={roll} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-neutral-100 dark:text-neutral-900">Roll dice</button>
      </div>
    </div>
  );
}

// ── Wordle: a fully playable mini round with a letter-state keyboard ──

const W_LIST = ['stack', 'codes', 'pixel', 'craft', 'build', 'debug', 'bytes', 'shell', 'react', 'swift'];
const W_TARGET = 'STACK';
type GS = 'correct' | 'present' | 'absent' | 'empty';
function evalGuess(w: string, t: string): GS[] {
  const r: GS[] = Array(5).fill('absent'), ta = t.split('');
  w.split('').forEach((c, i) => { if (c === ta[i]) { r[i] = 'correct'; ta[i] = '#'; } });
  w.split('').forEach((c, i) => { if (r[i] === 'correct') return; const j = ta.indexOf(c); if (j !== -1) { r[i] = 'present'; ta[j] = '#'; } });
  return r;
}
const GC: Record<GS, string> = {
  correct: 'bg-green-500 border-green-500 text-white',
  present: 'bg-amber-400 border-amber-400 text-white',
  absent: 'bg-zinc-500 border-zinc-500 text-white dark:bg-neutral-600 dark:border-neutral-600',
  empty: 'border-zinc-200 text-zinc-700 dark:border-neutral-700 dark:text-neutral-300',
};
export function WordleDetail() {
  const [rows, setRows] = useState<{ w: string; s: GS[] }[]>([]);
  const [cur, setCur] = useState('');
  const [done, setDone] = useState(false); const [won, setWon] = useState(false); const [err, setErr] = useState('');
  const [letterState, setLetterState] = useState<Record<string, GS>>({});
  const submit = () => {
    if (cur.length !== 5) { setErr('5 letters needed'); return; }
    if (!W_LIST.includes(cur.toLowerCase())) { setErr('not in word list'); return; }
    const s = evalGuess(cur, W_TARGET), nr = [...rows, { w: cur, s }];
    setRows(nr); setCur(''); setErr('');
    setLetterState((ls) => {
      const next = { ...ls };
      cur.split('').forEach((ch, i) => {
        const rank = { correct: 3, present: 2, absent: 1, empty: 0 };
        if (!next[ch] || rank[s[i]] > rank[next[ch]]) next[ch] = s[i];
      });
      return next;
    });
    if (s.every((x) => x === 'correct')) { setWon(true); setDone(true); }
    else if (nr.length >= 5) setDone(true);
  };
  const reset = () => { setRows([]); setCur(''); setDone(false); setWon(false); setErr(''); setLetterState({}); };
  const grid = Array.from({ length: 5 }, (_, i) => {
    if (i < rows.length) return rows[i];
    if (i === rows.length && !done) return { w: cur.padEnd(5), s: Array(5).fill('empty') as GS[] };
    return { w: '     ', s: Array(5).fill('empty') as GS[] };
  });
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="space-y-1.5">
        {grid.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, ci) => {
              const ch = row.w[ci] ?? ''; const st = ri < rows.length ? row.s[ci] : 'empty';
              return <div key={ci} className={`flex h-9 w-9 items-center justify-center rounded border-2 text-sm font-bold uppercase transition-all ${GC[st]}`}>{ch.trim()}</div>;
            })}
          </div>
        ))}
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      {!done ? (
        <>
          <div className="flex gap-2">
            <input value={cur} onChange={(e) => { setCur(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase()); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="w-28 rounded-lg border border-zinc-200 bg-transparent px-3 py-1.5 text-center font-mono text-sm uppercase tracking-widest text-zinc-800 focus:outline-none dark:border-neutral-700 dark:text-neutral-200" placeholder="GUESS" maxLength={5} />
            <button onClick={submit} disabled={cur.length !== 5} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-30 dark:bg-neutral-100 dark:text-neutral-900">Enter</button>
          </div>
          {Object.keys(letterState).length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {Object.entries(letterState).map(([ch, st]) => (
                <span key={ch} className={`flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold uppercase ${GC[st]}`}>{ch}</span>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className="mb-2 text-sm text-zinc-600 dark:text-neutral-400">{won ? `Got it in ${rows.length}!` : `The word was ${W_TARGET}`}</p>
          <button onClick={reset} className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-neutral-300">play again</button>
        </div>
      )}
    </div>
  );
}

// ── Pokemon Platformer: click D-pad to move, collect coins, avoid the rock ──

const COINS = [{ x: 3, y: 2 }, { x: 12, y: 6 }, { x: 15, y: 3 }, { x: 6, y: 7 }];
const ROCK = { x: 9, y: 4 };
export function PokemonPlatformerDetail() {
  const [pos, setPos] = useState({ x: 9, y: 5 });
  const [pressed, setPressed] = useState<string | null>(null);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [hits, setHits] = useState(0);
  const cols = 18, rows = 9;
  const move = (dir: string) => {
    setPressed(dir); setTimeout(() => setPressed(null), 150);
    setPos((p) => {
      const next = dir === 'up' ? { x: p.x, y: Math.max(0, p.y - 1) }
        : dir === 'down' ? { x: p.x, y: Math.min(rows - 1, p.y + 1) }
        : dir === 'left' ? { x: Math.max(0, p.x - 1), y: p.y }
        : { x: Math.min(cols - 1, p.x + 1), y: p.y };
      const coinKey = `${next.x},${next.y}`;
      if (COINS.some((c) => `${c.x},${c.y}` === coinKey) && !collected.has(coinKey)) {
        setCollected((s) => new Set([...s, coinKey]));
      }
      if (next.x === ROCK.x && next.y === ROCK.y) setHits((h) => h + 1);
      return next;
    });
  };
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-neutral-400">
        <span>🪙 {collected.size}/{COINS.length}</span>
        <span>💥 {hits} hits</span>
      </div>
      <div className="relative grid gap-px overflow-hidden rounded-lg bg-zinc-200 dark:bg-neutral-700" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, width: 260 }}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          const x = i % cols, y = Math.floor(i / cols);
          const isPlayer = x === pos.x && y === pos.y;
          const isCoin = COINS.some((c) => c.x === x && c.y === y) && !collected.has(`${x},${y}`);
          const isRock = x === ROCK.x && y === ROCK.y;
          return (
            <div key={i} className={`relative flex aspect-square items-center justify-center transition-colors ${isPlayer ? 'bg-red-500' : 'bg-zinc-50 dark:bg-neutral-900'}`}>
              {!isPlayer && isCoin && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
              {!isPlayer && isRock && <span className="h-2 w-2 rounded-sm bg-zinc-500 dark:bg-neutral-500" />}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-center gap-1">
        <button onClick={() => move('up')} className={`h-8 w-8 rounded text-sm font-bold transition-all ${pressed === 'up' ? 'scale-95 bg-zinc-800 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>↑</button>
        <div className="flex gap-1">
          <button onClick={() => move('left')} className={`h-8 w-8 rounded text-sm font-bold transition-all ${pressed === 'left' ? 'scale-95 bg-zinc-800 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>←</button>
          <button onClick={() => move('down')} className={`h-8 w-8 rounded text-sm font-bold transition-all ${pressed === 'down' ? 'scale-95 bg-zinc-800 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>↓</button>
          <button onClick={() => move('right')} className={`h-8 w-8 rounded text-sm font-bold transition-all ${pressed === 'right' ? 'scale-95 bg-zinc-800 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>→</button>
        </div>
      </div>
    </div>
  );
}

// ── Pokedex: real type matchups plus a two-type damage calculator ──

const TYPE_DATA: Record<string, { strong: string[]; weak: string[]; immune: string[] }> = {
  Fire: { strong: ['Grass', 'Ice', 'Bug', 'Steel'], weak: ['Water', 'Rock', 'Ground'], immune: [] },
  Water: { strong: ['Fire', 'Rock', 'Ground'], weak: ['Electric', 'Grass'], immune: [] },
  Grass: { strong: ['Water', 'Rock', 'Ground'], weak: ['Fire', 'Ice', 'Flying', 'Bug'], immune: [] },
  Electric: { strong: ['Water', 'Flying'], weak: ['Ground'], immune: ['Ground'] },
  Psychic: { strong: ['Fighting', 'Poison'], weak: ['Bug', 'Dark', 'Ghost'], immune: [] },
  Dragon: { strong: ['Dragon'], weak: ['Ice', 'Dragon', 'Fairy'], immune: [] },
  Fighting: { strong: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], weak: ['Flying', 'Psychic', 'Fairy'], immune: [] },
  Fairy: { strong: ['Fighting', 'Dragon', 'Dark'], weak: ['Poison', 'Steel'], immune: ['Dragon'] },
};
const TYPE_COLORS: Record<string, string> = {
  Fire: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  Water: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Grass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Electric: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500',
  Psychic: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  Dragon: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  Fighting: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  Fairy: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
};
export function PokedexDetail() {
  const [atk, setAtk] = useState('Fire');
  const [def, setDef] = useState('Grass');
  const d = TYPE_DATA[atk];
  const multiplier = TYPE_DATA[def]?.immune.includes(atk) ? 0 : d.strong.includes(def) ? 2 : d.weak.includes(def) ? 0.5 : 1;
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 dark:text-neutral-500">
        <span>Attacker</span><span>vs</span><span>Defender</span>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {Object.keys(TYPE_DATA).map((t) => (
          <button key={t} onClick={() => setAtk(t)} className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${atk === t ? 'ring-2 ring-zinc-900 dark:ring-neutral-100' : ''} ${TYPE_COLORS[t]}`}>{t}</button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {Object.keys(TYPE_DATA).map((t) => (
          <button key={t} onClick={() => setDef(t)} className={`rounded-md px-2 py-1 text-[10px] font-medium opacity-70 transition-colors ${def === t ? 'ring-2 ring-zinc-500 opacity-100' : ''} ${TYPE_COLORS[t]}`}>{t}</button>
        ))}
      </div>
      <div className="text-center">
        <span className={`text-lg font-bold ${multiplier > 1 ? 'text-emerald-500' : multiplier < 1 && multiplier > 0 ? 'text-amber-500' : multiplier === 0 ? 'text-zinc-400' : 'text-zinc-600 dark:text-neutral-300'}`}>×{multiplier}</span>
        <p className="text-[10px] text-zinc-400 dark:text-neutral-500">{multiplier === 0 ? 'No effect' : multiplier > 1 ? 'Super effective' : multiplier < 1 ? 'Not very effective' : 'Normal damage'}</p>
      </div>
    </div>
  );
}

// ── Greed Island Dex: real search, favorite toggle, sort ──

const GI_CARDS = ['Accompany', 'Beautify', 'Blue Planet', 'Clone', 'Copy', 'Cure', 'Dark Hole', 'Dice', 'Ecstasy', 'Eden', 'Guidemap', 'Herb', 'Kite', 'Ring'];
export function GreedIslandDexDetail() {
  const [q, setQ] = useState('');
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<'az' | 'fav'>('az');
  const toggleFav = (c: string) => setFavs((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  let filtered = GI_CARDS.filter((c) => c.toLowerCase().includes(q.toLowerCase()));
  if (sort === 'fav') filtered = [...filtered].sort((a, b) => Number(favs.has(b)) - Number(favs.has(a)));
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-6">
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cards…"
          className="flex-1 rounded-lg border border-zinc-100 bg-transparent px-3 py-2 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none dark:border-neutral-800 dark:text-neutral-300" />
        <button onClick={() => setSort((s) => (s === 'az' ? 'fav' : 'az'))} className="rounded-lg border border-zinc-200 px-2 text-[10px] text-zinc-500 dark:border-neutral-700 dark:text-neutral-400">{sort === 'az' ? 'A–Z' : '★ first'}</button>
      </div>
      <div className="max-h-40 divide-y divide-zinc-100 overflow-y-auto rounded-lg border border-zinc-100 dark:divide-neutral-800 dark:border-neutral-800">
        {filtered.map((c) => (
          <div key={c} className="flex items-center justify-between px-3 py-2 text-xs">
            <button onClick={() => toggleFav(c)} className={favs.has(c) ? 'text-amber-400' : 'text-zinc-300 dark:text-neutral-700'}>★</button>
            <span className="flex-1 px-2 text-zinc-700 dark:text-neutral-300">{c}</span>
            <span className="font-mono text-zinc-400 dark:text-neutral-500">GI-{String(GI_CARDS.indexOf(c) + 1).padStart(3, '0')}</span>
          </div>
        ))}
        {filtered.length === 0 && <div className="px-3 py-2 text-xs text-zinc-400 dark:text-neutral-400">No cards found</div>}
      </div>
    </div>
  );
}

// ── Captain Claw: the key map under your fingers, and a room handed out the way the relay does ──

const CLAW_KEYS: Record<string, string> = {
  W: 'Climb up, look up (hold)',
  A: 'Walk left',
  S: 'Crouch, climb down, look down (hold)',
  D: 'Walk right',
  Space: 'Jump, hold for a higher one',
  J: 'Attack: sword or punch',
  K: 'Fire: pistol, magic, dynamite',
  L: 'Next weapon',
  Z: 'Pick up, throw: kegs and soldiers',
};
// the relay's alphabet: no I, L, O, 0 or 1 to misread, and no X or Z, since the menu lettering has neither
const CLAW_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWY23456789';
const CLAW_COLORS = ['#ff6f6f', '#7dff7a', '#ffd84a', '#c98bff', '#6ff2ff', '#ffa04d', '#ff8ad2', '#d9d9d9'];
const clawName = () => `Pirate ${10 + Math.floor(Math.random() * 90)}`;

function ClawKey({ k, on, wide, onPress }: { k: string; on: boolean; wide?: boolean; onPress: (k: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onPress(k)}
      className={`flex h-8 items-center justify-center rounded-md border font-mono text-[11px] font-semibold transition-colors ${wide ? 'w-[6.5rem]' : 'w-8'} ${
        on
          ? 'border-amber-500 bg-amber-400 text-zinc-900'
          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
      }`}
    >
      {k}
    </button>
  );
}

export function CaptainClawDetail() {
  const [key, setKey] = useState('J');
  const [code, setCode] = useState<string | null>(null);
  const [size, setSize] = useState(4);
  const [crew, setCrew] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const press = (k: string) => setKey(k);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key === ' ' ? 'Space' : e.key.toUpperCase();
    if (!(k in CLAW_KEYS)) return;
    e.preventDefault();
    setKey(k);
  };
  const create = () => {
    let c = '';
    for (let i = 0; i < 6; i++) c += CLAW_CODE_ALPHABET[Math.floor(Math.random() * CLAW_CODE_ALPHABET.length)];
    setCode(c);
    setCrew(['You']);
    setNote('Share the code. Everyone who types it lands in the same level.');
  };
  const join = () => {
    const name = clawName();
    if (crew.length >= size) { setNote(`The room is full: ${name} was turned away.`); return; }
    setCrew((c) => [...c, name]);
    setNote(`${name} joined the crew.`);
  };
  const leave = () => { setCode(null); setCrew([]); setNote(''); };

  return (
    <div className="flex h-full gap-5 p-5 outline-none" tabIndex={0} onKeyDown={onKeyDown} aria-label="Captain Claw controls and multiplayer room">
      <div className="hidden w-[13.5rem] shrink-0 flex-col sm:flex">
        <span className="mb-2 text-[10px] uppercase tracking-wide text-zinc-400 dark:text-neutral-500">Press a key</span>
        <div className="flex flex-col items-start gap-1.5">
          <div className="flex gap-1.5"><span className="w-8" /><ClawKey k="W" on={key === 'W'} onPress={press} /></div>
          <div className="flex gap-1.5">{['A', 'S', 'D'].map((k) => <ClawKey key={k} k={k} on={key === k} onPress={press} />)}</div>
          <ClawKey k="Space" wide on={key === 'Space'} onPress={press} />
          <div className="mt-2 flex gap-1.5">{['J', 'K', 'L', 'Z'].map((k) => <ClawKey key={k} k={k} on={key === k} onPress={press} />)}</div>
        </div>
        <p className="mt-3 min-h-[2.5rem] text-xs text-zinc-700 dark:text-neutral-300">{CLAW_KEYS[key]}</p>
        <p className="mt-auto text-[10px] leading-relaxed text-zinc-400 dark:text-neutral-500">Nothing uses Ctrl or Alt, so the browser never takes the key. The arrow keys work too.</p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="mb-2 text-[10px] uppercase tracking-wide text-zinc-400 dark:text-neutral-500">Sail together</span>
        {code ? (
          <>
            <div className="mb-2 flex gap-1">
              {code.split('').map((ch, i) => (
                <span key={i} className="flex h-8 w-7 items-center justify-center rounded border border-amber-500/60 bg-amber-50 font-mono text-sm font-bold text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">{ch}</span>
              ))}
            </div>
            <span className="mb-1.5 text-[11px] text-zinc-500 dark:text-neutral-400">{crew.length} of {size} aboard · shared world</span>
            <div className="min-h-0 flex-1 space-y-1 overflow-hidden">
              {crew.map((n, i) => (
                <div key={`${n}-${i}`} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-neutral-300">
                  <span className="h-2 w-2 rounded-sm" style={{ background: CLAW_COLORS[i % CLAW_COLORS.length] }} />
                  {n}{i === 0 ? <span className="text-zinc-400 dark:text-neutral-500"> (host)</span> : null}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              <button type="button" onClick={join} className="rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] text-white hover:opacity-85 dark:bg-neutral-100 dark:text-neutral-900">A pirate joins</button>
              <button type="button" onClick={leave} className="rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] text-zinc-600 hover:bg-zinc-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">Leave room</button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="mb-3 flex items-center gap-2">
              <button type="button" onClick={create} className="rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] text-white hover:opacity-85 dark:bg-neutral-100 dark:text-neutral-900">Create room</button>
              <span className="text-[11px] text-zinc-500 dark:text-neutral-400">for</span>
              <div className="flex overflow-hidden rounded-md border border-zinc-200 dark:border-neutral-700">
                {[2, 4, 6, 8].map((n) => (
                  <button key={n} type="button" onClick={() => setSize(n)} className={`px-2 py-1 text-[11px] ${size === n ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-neutral-800 dark:text-paper' : 'text-zinc-500 hover:bg-zinc-50 dark:text-neutral-400 dark:hover:bg-neutral-800/60'}`}>{n}</button>
                ))}
              </div>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-neutral-400">A small Node relay hands out a six-character code. Everyone who types it plays the same level, each Claw in their own colour, and kills and treasure count for the whole crew.</p>
          </div>
        )}
        <p className="mt-2 min-h-[1rem] text-[11px] text-zinc-500 dark:text-neutral-400">{note}</p>
      </div>
    </div>
  );
}
