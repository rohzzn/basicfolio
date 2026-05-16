"use client";

import React, { useState, useEffect, useRef } from 'react';

const COLS = 16;
const ROWS = 8;
const TOTAL = COLS * ROWS;

// ── presets ──────────────────────────────────────────────────────────────────
const mkGrid = (fn: (r: number, c: number) => boolean): boolean[] =>
  Array.from({ length: TOTAL }, (_, i) => fn(Math.floor(i / COLS), i % COLS));

const PRESETS = [
  // Gentle cascade — high notes rippling down every 4 steps
  mkGrid((r, c) => {
    const pairs: [number, number][] = [
      [0,0],[1,2],[2,4],[3,6],[2,8],[1,10],[0,12],[1,14],
      [3,1],[4,5],[3,9],[4,13],
    ];
    return pairs.some(([row, col]) => r === row && c === col);
  }),
  // Pentatonic waltz — flowing arpeggios
  mkGrid((r, c) => {
    const pattern: [number, number][] = [
      [4,0],[2,1],[0,2],[2,3],[4,4],[2,5],[0,6],[2,7],
      [4,8],[2,9],[1,10],[3,11],[4,12],[2,13],[0,14],[3,15],
    ];
    return pattern.some(([row, col]) => r === row && c === col);
  }),
  // Sparse lullaby — wide open space, few notes
  mkGrid((r, c) => {
    const notes: [number, number][] = [
      [0,0],[3,4],[1,8],[4,12],
      [2,2],[4,6],[2,10],[0,14],
    ];
    return notes.some(([row, col]) => r === row && c === col);
  }),
];

function makeEmpty(): boolean[] { return Array(TOTAL).fill(false); }
function makeRandom(): boolean[] { return Array.from({ length: TOTAL }, () => Math.random() > 0.75); }

// ── audio ─────────────────────────────────────────────────────────────────────
// C pentatonic major across 2 octaves — nothing can clash
const PENTA = [0, 2, 4, 7, 9]; // semitones: C D E G A

function rowToFreq(row: number): number {
  // row 0 = highest, row 7 = lowest
  const idx = ROWS - 1 - row;
  const oct = Math.floor(idx / PENTA.length);
  const semi = PENTA[idx % PENTA.length] + oct * 12;
  return 130.81 * Math.pow(2, semi / 12); // C3 root
}

function triggerNote(ctx: AudioContext, row: number, bpm: number) {
  const now = ctx.currentTime;
  const freq = rowToFreq(row);
  const stepLen = 60 / bpm;
  const release = Math.min(stepLen * 1.2, 0.9);

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + release);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + release + 0.02);
}

// ── component ─────────────────────────────────────────────────────────────────
export default function NotFound() {
  const [grid, setGrid] = useState<boolean[]>(makeEmpty);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [headCol, setHeadCol] = useState(-1);
  const [painting, setPainting] = useState<boolean | null>(null);
  const [preset, setPreset] = useState<number | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  // Keep a ref copy of grid so the interval closure always reads latest
  const gridRef = useRef(grid);
  useEffect(() => { gridRef.current = grid; }, [grid]);

  // ── sequencer loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) {
      setHeadCol(-1);
      return;
    }

    // Create or resume AudioContext only on play (requires user gesture)
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    let col = 0;
    const stepMs = (60 / bpm) * 1000;

    // Fire first step immediately so there's no silent first beat
    const fire = () => {
      setHeadCol(col);
      const g = gridRef.current;
      for (let row = 0; row < ROWS; row++) {
        if (g[row * COLS + col]) triggerNote(ctx, row, bpm);
      }
      col = (col + 1) % COLS;
    };

    fire();
    const id = setInterval(fire, stepMs);
    return () => clearInterval(id);
    // Intentionally not including grid in deps — we read via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, bpm]);

  // ── grid interaction ──────────────────────────────────────────────────────
  const paintCell = (i: number, val: boolean) => {
    setGrid(prev => { const n = [...prev]; n[i] = val; return n; });
    setPreset(null);
  };

  const onMouseDown = (i: number) => {
    const val = !grid[i];
    setPainting(val);
    paintCell(i, val);
  };

  const onMouseEnter = (i: number) => {
    if (painting !== null) paintCell(i, painting);
  };

  const onMouseUp = () => setPainting(null);

  // ── controls ──────────────────────────────────────────────────────────────
  const togglePlay = () => setPlaying(p => !p);

  const loadPreset = (idx: number) => {
    setGrid([...PRESETS[idx]]);
    setPreset(idx);
  };

  return (
    <div
      className="flex flex-col items-start select-none"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
        404 — you&apos;re lost
      </p>

      {/* TE-style panel */}
      <div className="w-full max-w-lg bg-zinc-900 rounded-xl p-4">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            loop sequencer
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-400 w-14 text-right tabular-nums">
              {bpm} bpm
            </span>
            <input
              type="range"
              min={40}
              max={200}
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="w-24 cursor-pointer accent-zinc-400"
            />
          </div>
        </div>

        {/* Grid */}
        <div
          className="grid mb-4"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: '3px',
          }}
          // prevent drag selecting text while painting
          onDragStart={e => e.preventDefault()}
        >
          {grid.map((on, i) => {
            const c = i % COLS;
            const isHead = c === headCol;
            return (
              <div
                key={i}
                onMouseDown={() => onMouseDown(i)}
                onMouseEnter={() => onMouseEnter(i)}
                style={{ paddingBottom: '100%', position: 'relative' }}
                className={`rounded-sm cursor-pointer transition-colors duration-75 ${
                  on
                    ? isHead ? 'bg-white' : 'bg-zinc-300'
                    : isHead ? 'bg-zinc-600' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              />
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className={`w-9 h-8 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
              playing ? 'bg-white text-zinc-900' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
            }`}
          >
            {playing ? (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
                <rect x="1" y="1" width="3" height="9" rx="0.5" />
                <rect x="7" y="1" width="3" height="9" rx="0.5" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
                <path d="M2 1L10 5.5L2 10V1Z" />
              </svg>
            )}
          </button>

          {/* Presets */}
          {[0, 1, 2].map(idx => (
            <button
              key={idx}
              onClick={() => loadPreset(idx)}
              className={`w-8 h-8 rounded-md text-[10px] font-mono transition-colors ${
                preset === idx
                  ? 'bg-zinc-300 text-zinc-900'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => { setGrid(makeRandom()); setPreset(null); }}
            className="px-3 h-8 rounded-md text-[10px] font-mono bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors uppercase tracking-wider"
          >
            rnd
          </button>
          <button
            onClick={() => { setGrid(makeEmpty()); setPreset(null); }}
            className="px-3 h-8 rounded-md text-[10px] font-mono bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors uppercase tracking-wider"
          >
            clr
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-5">
        make a beat while you figure out where you were going
      </p>
    </div>
  );
}
