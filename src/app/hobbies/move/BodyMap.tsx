'use client';

import React, { useId, useState } from 'react';
import { MUSCLE_LABEL, type Muscle, type MuscleStat } from '@/lib/move-model';

// A figure from the front and from the back, drawn in ink, each muscle filled with a halftone
// screen as dense as the work it has had in the period. Beside it the same muscles as a ranked
// list; hovering either one picks the muscle out in both and says what went into it.

type Shape = { m: Muscle; mirror?: boolean } & ({ e: [number, number, number, number] } | { d: string });

// in figure coordinates: x from the centre line (left side, mirrored for the right), y down
const FRONT: Shape[] = [
  { m: 'chest', mirror: true, d: 'M-2 52 L-27 54 Q-32 68 -26 80 Q-14 86 -2 82 Z' },
  { m: 'shoulders', mirror: true, e: [-36, 57, 7, 9] },
  { m: 'biceps', mirror: true, e: [-41, 80, 5, 14] },
  { m: 'forearms', mirror: true, e: [-43, 122, 4.5, 16] },
  { m: 'abs', d: 'M-10 90 Q-10 87 -7 87 L7 87 Q10 87 10 90 L10 124 Q10 127 7 127 L-7 127 Q-10 127 -10 124 Z' },
  { m: 'quads', mirror: true, e: [-14, 175, 9, 24] },
];
const BACK: Shape[] = [
  { m: 'traps', d: 'M0 40 L20 50 L0 72 L-20 50 Z' },
  { m: 'rearDelts', mirror: true, e: [-36, 57, 7, 8] },
  { m: 'lats', mirror: true, d: 'M-6 74 L-29 62 Q-31 88 -23 112 L-6 120 Z' },
  { m: 'back', e: [0, 90, 7, 15] },
  { m: 'triceps', mirror: true, e: [-41, 80, 5, 14] },
  { m: 'forearms', mirror: true, e: [-43, 122, 4.5, 16] },
  { m: 'glutes', mirror: true, e: [-13, 152, 12, 11] },
  { m: 'hamstrings', mirror: true, e: [-14, 186, 8, 20] },
  { m: 'calves', mirror: true, e: [-13, 228, 6, 15] },
];

// the body itself: the torso, then one arm and one leg, drawn again mirrored
const TORSO =
  'M-32 48 Q-36 50 -34 58 L-30 96 Q-25 112 -24 128 L-26 146 L26 146 L24 128 Q25 112 30 96 L34 58 Q36 50 32 48 Q16 44 0 44 Q-16 44 -32 48 Z';
const LIMB = [
  'M-34 50 Q-44 50 -46 60 L-48 102 L-37 102 L-33 62 Z',
  'M-48 102 L-37 102 L-39 146 L-49 146 Z',
  'M-26 146 L-2 146 L-4 204 L-21 204 Z',
  'M-21 204 L-4 204 L-6 252 L-18 252 Z',
];

function ShapeEl({ s, fill, active, onEnter }: { s: Shape; fill: string; active: boolean; onEnter: () => void }) {
  const props = {
    fill,
    stroke: 'var(--move-ink)',
    strokeWidth: active ? 2 : 0.9,
    onMouseEnter: onEnter,
    style: { cursor: 'pointer', transition: 'stroke-width 150ms' },
  };
  const one = 'e' in s ? <ellipse cx={s.e[0]} cy={s.e[1]} rx={s.e[2]} ry={s.e[3]} {...props} /> : <path d={s.d} {...props} />;
  if (!s.mirror) return one;
  return (
    <>
      {one}
      <g transform="scale(-1 1)">{one}</g>
    </>
  );
}

function Figure({ cx, shapes, fillOf, active, setActive, label }: {
  cx: number;
  shapes: Shape[];
  fillOf: (m: Muscle) => string;
  active: Muscle | null;
  setActive: (m: Muscle) => void;
  label: string;
}) {
  return (
    <g transform={`translate(${cx} 0)`}>
      <g fill="var(--move-paper)" stroke="var(--move-ink)" strokeWidth={1.4} strokeLinejoin="round">
        <ellipse cx={0} cy={24} rx={12} ry={14} />
        <path d="M-6 37 L-6 45 L6 45 L6 37" />
        <path d={TORSO} />
        {[1, -1].map((k) => (
          <g key={k} transform={`scale(${k} 1)`}>
            {LIMB.map((d) => (
              <path key={d} d={d} />
            ))}
            <ellipse cx={-44} cy={153} rx={5.5} ry={7.5} />
            <ellipse cx={-12} cy={256} rx={9} ry={4} />
          </g>
        ))}
      </g>
      {shapes.map((s) => (
        <ShapeEl key={s.m + ('d' in s ? s.d : s.e.join())} s={s} fill={fillOf(s.m)} active={active === s.m} onEnter={() => setActive(s.m)} />
      ))}
      <text x={0} y={280} textAnchor="middle" className="move-hand" fontSize={14} fill="var(--move-muted)">
        {label}
      </text>
    </g>
  );
}

export default function BodyMap({ stats, periodLabel }: { stats: MuscleStat[]; periodLabel: string }) {
  const id = useId().replace(/:/g, '');
  const byMuscle = new Map(stats.map((s) => [s.muscle, s]));
  const most = Math.max(1, ...stats.map((s) => s.sets));
  const trained = stats.filter((s) => s.sets > 0);
  const [active, setActive] = useState<Muscle | null>(null);
  const shown = active ?? trained[0]?.muscle ?? null;
  const cur = shown ? byMuscle.get(shown) : undefined;

  // five screens, from a few scattered dots to nearly solid
  const level = (m: Muscle) => {
    const sets = byMuscle.get(m)?.sets ?? 0;
    if (sets === 0) return -1;
    return Math.min(4, Math.floor((sets / most) * 4.999));
  };
  const fillOf = (m: Muscle) => (level(m) < 0 ? 'var(--move-paper)' : `url(#${id}-dots${level(m)})`);

  return (
    <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,300px)_minmax(0,1fr)]" onMouseLeave={() => setActive(null)}>
      <div>
        <svg viewBox="0 0 300 290" className="w-full" role="img" aria-label={`Muscles trained ${periodLabel}`}>
          <defs>
            {[
              [7, 0.9],
              [6, 1.3],
              [5, 1.6],
              [4.5, 1.85],
              [4, 2.05],
            ].map(([cell, r], i) => (
              <pattern key={i} id={`${id}-dots${i}`} width={cell} height={cell} patternUnits="userSpaceOnUse">
                <rect width={cell} height={cell} fill="var(--move-paper)" />
                <circle cx={cell / 2} cy={cell / 2} r={r} fill="var(--move-dot)" />
              </pattern>
            ))}
          </defs>
          <Figure cx={78} shapes={FRONT} fillOf={fillOf} active={shown} setActive={setActive} label="front" />
          <Figure cx={222} shapes={BACK} fillOf={fillOf} active={shown} setActive={setActive} label="back" />
        </svg>
        <p className="mt-2 min-h-[2.5rem] text-sm leading-snug text-zinc-600 dark:text-neutral-300">
          {cur && cur.sets > 0 ? (
            <>
              <span className="font-medium text-zinc-900 dark:text-paper">{MUSCLE_LABEL[cur.muscle]}</span> · {cur.sets} sets
              {cur.top ? <>, mostly {cur.top}</> : null}
              {cur.change !== null ? (
                <span className={cur.change >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}>
                  {' '}
                  · {cur.change >= 0 ? 'up' : 'down'} {Math.abs(cur.change)}%
                </span>
              ) : null}
            </>
          ) : cur ? (
            <>
              <span className="font-medium text-zinc-900 dark:text-paper">{MUSCLE_LABEL[cur.muscle]}</span> · nothing {periodLabel}
            </>
          ) : (
            <>Nothing logged {periodLabel}.</>
          )}
        </p>
      </div>

      <ul className="min-w-0">
        {trained.map((s) => (
          <li
            key={s.muscle}
            onMouseEnter={() => setActive(s.muscle)}
            className={`grid cursor-default grid-cols-[5.75rem_minmax(0,1fr)_2rem] items-center gap-2.5 border-b border-zinc-100 py-1.5 last:border-0 dark:border-neutral-800/60 ${
              shown === s.muscle ? 'text-zinc-900 dark:text-paper' : 'text-zinc-600 dark:text-neutral-400'
            }`}
          >
            <span className={`text-sm ${shown === s.muscle ? 'font-medium' : ''}`}>{MUSCLE_LABEL[s.muscle]}</span>
            <span className="move-bar h-2.5" style={{ width: `${Math.max(6, (s.sets / most) * 100)}%` }} />
            <span className="text-right text-xs tabular-nums">{s.sets}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
