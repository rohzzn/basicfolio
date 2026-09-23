'use client';

import React, { useState } from 'react';
import { fmtLb, type PrLift } from '@/lib/move-model';

// The lifts done most often, each as a ribbon with its best weight on it. Clicking one sketches
// that lift's history underneath: the heaviest set of every session, a new best marked in red.

const RIBBON = ['#e8c84a', '#518e9d', '#c8473f', '#7a5c8e', '#e4a05c', '#6f8f4f'];
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `rgb(${c.join(',')})`;
};

function Ribbon({ lift, color, active, onClick }: { lift: PrLift; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${lift.name}, best ${fmtLb(lift.best)} pounds`}
      className="group flex flex-col items-center"
    >
      <svg viewBox="0 0 80 96" className="w-[72px] transition-transform duration-200 group-hover:-rotate-3" aria-hidden>
        <g stroke="var(--move-ink)" strokeWidth={1.3} strokeLinejoin="round">
          <path d="M30 56 L22 92 L31 85 L38 93 L40 58 Z" fill={shade(color, 0.78)} />
          <path d="M50 56 L58 92 L49 85 L42 93 L40 58 Z" fill={shade(color, 0.78)} />
          <circle cx={40} cy={38} r={30} fill={color} strokeDasharray="5 2.5" />
          <circle cx={40} cy={38} r={21} fill={shade(color, 1.12)} />
        </g>
        {active ? <circle cx={40} cy={38} r={35} fill="none" stroke="var(--move-ink)" strokeWidth={1.2} strokeDasharray="3 3" /> : null}
        <text x={40} y={41} textAnchor="middle" fontSize={15} fontWeight={600} fill="#24232e">
          {fmtLb(lift.best)}
        </text>
        <text x={40} y={53} textAnchor="middle" fontSize={9} fill="#24232e" opacity={0.75}>
          lb
        </text>
      </svg>
      <span
        className={`mt-1 max-w-[7rem] text-center text-xs leading-snug ${
          active ? 'font-medium text-zinc-900 dark:text-paper' : 'text-zinc-600 dark:text-neutral-400'
        }`}
      >
        {lift.name}
      </span>
    </button>
  );
}

function hashOf(n: number): number {
  let h = Math.imul(n | 0, 0x27d4eb2d);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

// The history as a sketched line: x by date, y by weight, a little wobble so it reads as drawn.
function Sketch({ lift }: { lift: PrLift }) {
  const W = 600;
  const H = 190;
  const L = 44;
  const R = 14;
  const T = 14;
  const B = 28;
  const pts = lift.history;
  const t0 = pts[0].date.getTime();
  const t1 = pts[pts.length - 1].date.getTime();
  const lo = Math.min(...pts.map((p) => p.lb));
  const hi = Math.max(...pts.map((p) => p.lb));
  const pad = Math.max(2.5, (hi - lo) * 0.12);
  const x = (t: number) => L + ((t - t0) / Math.max(1, t1 - t0)) * (W - L - R);
  const y = (lb: number) => T + (1 - (lb - (lo - pad)) / (hi + pad - (lo - pad))) * (H - T - B);
  const line = pts
    .map((p, i) => `${i ? 'L' : 'M'}${(x(p.date.getTime()) + (hashOf(i) - 0.5) * 1.2).toFixed(1)} ${(y(p.lb) + (hashOf(i + 99) - 0.5) * 1.2).toFixed(1)}`)
    .join(' ');
  const month = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${lift.name} over time`}>
      <path d={`M${L} ${T} L${L} ${H - B} L${W - R} ${H - B}`} fill="none" stroke="var(--move-ink)" strokeWidth={1.2} />
      <g fontSize={11} fill="var(--move-muted)">
        <text x={L - 6} y={y(hi) + 4} textAnchor="end">
          {fmtLb(hi)}
        </text>
        <text x={L - 6} y={y(lo) + 4} textAnchor="end">
          {fmtLb(lo)}
        </text>
        <text x={L} y={H - 8}>
          {month(pts[0].date)}
        </text>
        <text x={W - R} y={H - 8} textAnchor="end">
          {month(pts[pts.length - 1].date)}
        </text>
      </g>
      <path d={`M${L} ${y(hi)} L${W - R} ${y(hi)}`} stroke="var(--move-rule)" strokeDasharray="3 4" />
      <path d={line} fill="none" stroke="var(--move-ink)" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={x(p.date.getTime())}
          cy={y(p.lb)}
          r={p.pr ? 4 : 2.2}
          fill={p.pr ? '#c8473f' : 'var(--move-paper)'}
          stroke="var(--move-ink)"
          strokeWidth={p.pr ? 1 : 1.1}
        >
          <title>{`${p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${fmtLb(p.lb)} lb${p.pr ? ', a new best' : ''}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export default function PrWall({ lifts }: { lifts: PrLift[] }) {
  const [key, setKey] = useState(lifts[0]?.key ?? null);
  const lift = lifts.find((l) => l.key === key) ?? lifts[0];
  if (!lift) return null;
  const when = lift.bestDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div>
      <div className="grid grid-cols-3 justify-items-center gap-y-4 sm:grid-cols-6">
        {lifts.map((l, i) => (
          <Ribbon key={l.key} lift={l} color={RIBBON[i % RIBBON.length]} active={l.key === lift.key} onClick={() => setKey(l.key)} />
        ))}
      </div>
      <div className="move-sheet mt-6 px-4 pb-2 pt-3">
        <p className="text-sm text-zinc-600 dark:text-neutral-300">
          <span className="font-medium text-zinc-900 dark:text-paper">{lift.name}</span> · best {fmtLb(lift.best)} lb on {when} · {lift.sessions}{' '}
          sessions
        </p>
        <Sketch lift={lift} />
      </div>
    </div>
  );
}
