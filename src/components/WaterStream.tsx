'use client';

import React, { useEffect, useRef } from 'react';
import { useMedia } from '@/lib/use-media';
import { plip } from '@/lib/site-sound';

// A brook down the right side of the About page, drawn the way the films in /films are drawn:
// flat water on paper under a halftone screen, wobbly ink banks with hatching outside them, and
// lines whose jitter re-rolls twelve times a second, on twos, so it reads as drawn by hand.
//
// Unlike the films it is live. The cursor is a finger in the water: held still, the current
// parts around it and sheds eddies behind it the way it does round the stones; moved, it drags
// the water along and leaves rings. A click drops a pebble with a plip (lib/site-sound, so the
// sidebar's mute covers it). A paper boat and two leaves ride the current and can be pushed about,
// and a click on the boat rocks it.
//
// The canvas takes no pointer events. It reads the pointer off the window, so everything under
// and around it stays exactly as clickable as it was.

type Pt = [number, number];
type BankPt = { x: number; y: number; nx: number; ny: number };
type Pal = {
  water: string;
  deep: string;
  dotAlpha: number;
  current: string;
  currentAlpha: number;
  glint: string;
  glintAlpha: number;
  ink: string;
  hatch: string;
  hatchAlpha: number;
  sand: string;
  stone: string;
  boat: string;
  boatShade: string;
  flag: string;
  leaves: string[];
  shadow: string;
  shadowAlpha: number;
};

// Light is the paper-boat film's sea on this site's paper; dark is the same drawing in chalk.
const LIGHT: Pal = {
  water: '#a9c7c9',
  deep: '#0a5083',
  dotAlpha: 0.32,
  current: '#0a5083',
  currentAlpha: 0.62,
  glint: '#fbf9f3',
  glintAlpha: 0.95,
  ink: '#24232e',
  hatch: '#24232e',
  hatchAlpha: 0.3,
  sand: '#ebe2d3',
  stone: '#d3ccbb',
  boat: '#fdfbf6',
  boatShade: '#0a5083',
  flag: '#c8473f',
  leaves: ['#8f8e5f', '#df9a57'],
  shadow: '#0a2a45',
  shadowAlpha: 0.2,
};
const DARK: Pal = {
  water: '#0f1b24',
  deep: '#6d9fc4',
  dotAlpha: 0.34,
  current: '#b4d3e8',
  currentAlpha: 0.5,
  glint: '#f5f1ec',
  glintAlpha: 0.72,
  ink: '#d8d3c9',
  hatch: '#8c9098',
  hatchAlpha: 0.32,
  sand: '#141413',
  stone: '#26272b',
  boat: '#e6e0d4',
  boatShade: '#6d9fc4',
  flag: '#d8614f',
  leaves: ['#7f7f4e', '#b97d45'],
  shadow: '#000000',
  shadowAlpha: 0.5,
};

const TAU = Math.PI * 2;
const BOIL = 12; // line jitter re-rolls on twos, like the films
const V0 = 38; // px/s down the middle of the stream
const DOT = 7; // halftone cell
const FINGER = 15; // radius of the dimple the cursor makes
const PUSH_LIFE = 0.8;
const TRAIL_DT = 0.07; // how often a speck notes where it is
const TRAIL_N = 26; // and how many of those it keeps
const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], [contenteditable="true"]';
// Where the stones sit: fraction of the height, position across the stream (-1 bank to 1 bank), radius.
const STONES: [number, number, number][] = [
  [0.22, -0.46, 15],
  [0.55, 0.42, 19],
  [0.84, -0.22, 12],
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function hash(a: number, b = 0, c = 0): number {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x61c88647);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// The films' seeded generator (films/core.js): nothing here uses Math.random.
function rng(seed: number): () => number {
  let a = (seed * 1000003) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A tracer is a speck carried by the current. It remembers where it has been, and its line is
// drawn along that path: a trail changes only as fast as the speck moves, so the lines bend
// round the cursor smoothly instead of being redrawn from scratch every frame.
type Tracer = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  glint: boolean;
  id: number;
  sp: number;
  hx: number[];
  hy: number[];
  ht: number;
};
type Body = { x: number; y: number; r: number; ux: number; uy: number; shed: number; side: number };
type Stone = Body & { pts: Pt[]; seed: number };
type Vortex = { x: number; y: number; g: number; core: number; age: number; life: number };
type Push = { x: number; y: number; vx: number; vy: number; age: number };
type Ripple = { x: number; y: number; age: number; life: number; rMax: number; k: number; seed: number };
type Drop = { x: number; y: number; vx: number; vy: number; age: number; life: number };
type Floater = {
  boat: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  size: number;
  color: number;
  seed: number;
  away: number; // seconds until it floats back in; 0 while it is on screen
  bump: number;
};

function runStream(canvas: HTMLCanvasElement, startDark: boolean, still: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setDark() {}, destroy() {} };
  const c = ctx;
  const rand = rng(7);
  let pal = startDark ? DARK : LIGHT;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let live = false;
  let time = 0;

  // ---- the course of the stream: a centreline x(y) and a half-width, both gentle sines ----
  let cx0 = 0;
  let a1 = 0;
  let a2 = 0;
  let hw0 = 0;
  const K1 = TAU / 980;
  const K2 = TAU / 520;
  const K3 = TAU / 640;
  const centerX = (y: number) => cx0 + a1 * Math.sin(y * K1 + 0.9) + a2 * Math.sin(y * K2 + 2.1);
  const slope = (y: number) => a1 * K1 * Math.cos(y * K1 + 0.9) + a2 * K2 * Math.cos(y * K2 + 2.1);
  const halfW = (y: number) => hw0 * (1 + 0.16 * Math.sin(y * K3 + 4));

  // The local frame at a point: the tangent downstream, the normal towards the right bank, and u,
  // how far across the stream the point is (-1 left bank, 0 middle, 1 right bank). Two Newton steps
  // find the spot on the centreline whose normal passes through the point.
  const F = { tx: 0, ty: 1, nx: 1, ny: 0, u: 0, hw: 1 };
  function frameAt(x: number, y: number) {
    let s = y;
    for (let k = 0; k < 2; k++) {
      const m = slope(s);
      s += ((x - centerX(s)) * m + (y - s)) / (1 + m * m);
    }
    const m = slope(s);
    const inv = 1 / Math.sqrt(1 + m * m);
    F.tx = m * inv;
    F.ty = inv;
    F.nx = inv;
    F.ny = -m * inv;
    F.hw = halfW(s);
    F.u = ((x - centerX(s)) * F.nx + (y - s) * F.ny) / F.hw;
  }
  function placeAt(s: number, u: number): Pt {
    const m = slope(s);
    const inv = 1 / Math.sqrt(1 + m * m);
    const d = u * halfW(s);
    return [centerX(s) + inv * d, s - m * inv * d];
  }
  const inWater = (x: number, y: number, lim: number) => {
    frameAt(x, y);
    return Math.abs(F.u) < lim;
  };

  // ---- state ----
  const tracers: Tracer[] = [];
  let stones: Stone[] = [];
  const vortices: Vortex[] = [];
  const pushes: Push[] = [];
  const ripples: Ripple[] = [];
  const drops: Drop[] = [];
  const floaters: Floater[] = [];
  let left: BankPt[] = [];
  let right: BankPt[] = [];
  let waterPath = new Path2D();
  let dotX = new Float32Array(0);
  let dotY = new Float32Array(0);
  let dotD = new Float32Array(0);
  let under: HTMLCanvasElement | null = null;
  let over: HTMLCanvasElement | null = null;
  const pointer = { x: -1e4, y: -1e4, inside: false };
  const finger: Body & { vx: number; vy: number; wet: boolean; rx: number; ry: number; still: number } = {
    x: 0, y: 0, r: 0, ux: 0, uy: 0, shed: 0, side: 1, vx: 0, vy: 0, wet: false, rx: 0, ry: 0, still: 0,
  };
  let nextAmbient = 1.5;
  let rippleSeed = 1;

  // ---- the water's velocity at a point ----
  const V = { x: 0, y: 0 };
  function base(x: number, y: number) {
    frameAt(x, y);
    const u = F.u;
    if (Math.abs(u) > 1.02) {
      V.x = 0;
      V.y = 0;
      return;
    }
    const prof = Math.max(0, 1 - 0.72 * u * u);
    const s = V0 * prof;
    // a lazy curl noise on top, so no two stretches of the current look alike
    const t = time;
    const c1 = Math.cos(x * 0.021 + y * 0.013 + t * 0.35);
    const c2 = Math.cos(-x * 0.017 + y * 0.027 - t * 0.28 + 1.7);
    const c3 = Math.cos(x * 0.035 - y * 0.009 + t * 0.5 + 4.2);
    V.x = F.tx * s + prof * (160 * 0.013 * c1 + 125 * 0.027 * c2 - 90 * 0.009 * c3);
    V.y = F.ty * s - prof * (160 * 0.021 * c1 - 125 * 0.017 * c2 + 90 * 0.035 * c3);
  }
  // Flow round a cylinder: the doublet that turns uniform flow U into flow that parts round radius r.
  function obstacle(x: number, y: number, o: Body) {
    let zx = x - o.x;
    let zy = y - o.y;
    let r2 = zx * zx + zy * zy;
    const a2r = o.r * o.r;
    if (r2 > 36 * a2r) return;
    if (r2 < a2r) {
      // anything caught inside eases out and slides round the rim, rather than being thrown
      const d = Math.sqrt(r2) || 0.01;
      const k = (1 - d / o.r) * 60;
      V.x += (zx / d) * k;
      V.y += (zy / d) * k;
      zx *= o.r / d;
      zy *= o.r / d;
      r2 = a2r;
    }
    const A = zx * zx - zy * zy;
    const B = 2 * zx * zy;
    const r4 = r2 * r2;
    V.x -= (a2r * (o.ux * A + o.uy * B)) / r4;
    V.y -= (a2r * (o.ux * B - o.uy * A)) / r4;
  }
  function field(x: number, y: number) {
    base(x, y);
    if (V.x === 0 && V.y === 0) return;
    for (const s of stones) obstacle(x, y, s);
    if (finger.r > 0.5) obstacle(x, y, finger);
    for (const v of vortices) {
      const dx = x - v.x;
      const dy = y - v.y;
      const r2 = dx * dx + dy * dy;
      if (r2 > 4200) continue;
      const env = Math.min(1, v.age / 0.3) * (1 - v.age / v.life);
      const k = (v.g * env) / (TAU * (r2 + v.core * v.core));
      V.x -= dy * k;
      V.y += dx * k;
    }
    for (const p of pushes) {
      const dx = x - p.x;
      const dy = y - p.y;
      const r2 = dx * dx + dy * dy;
      if (r2 > 3000) continue;
      const k = Math.exp(-r2 / 700) * (1 - p.age / PUSH_LIFE) * 0.8;
      V.x += p.vx * k;
      V.y += p.vy * k;
    }
  }
  function curl(x: number, y: number) {
    field(x + 3, y);
    const a = V.y;
    field(x - 3, y);
    const b = V.y;
    field(x, y + 3);
    const d = V.x;
    field(x, y - 3);
    const e = V.x;
    return (a - b) / 6 - (d - e) / 6;
  }

  // ---- layout ----
  function layout() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const scale = Math.min(2, window.devicePixelRatio || 1);
    live = w >= 280 && h >= 240;
    // Nothing moved (the observer's first call, a page change): leave the water exactly as it is.
    if (!live || (w === W && h === H && scale === dpr)) return;
    const first = W === 0;
    const kx = first ? 1 : w / W;
    const ky = first ? 1 : h / H;
    W = w;
    H = h;
    dpr = scale;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    hw0 = clamp(W * 0.27, 90, 132);
    // Room for the bends. Both banks, hatching and grass included, stay inside the canvas, with a
    // little more held back on the right so nothing runs under the scrollbar.
    const rim = hw0 * 1.16;
    const marginL = 26;
    const marginR = 34;
    cx0 = (W + marginL - marginR) / 2;
    const room = Math.max(0, cx0 - rim - marginL);
    a1 = Math.min(W * 0.15, 84);
    a2 = a1 * 0.25;
    if (a1 + a2 > room) {
      const k = room / (a1 + a2);
      a1 *= k;
      a2 *= k;
    }
    buildBanks();
    placeStones();
    buildDots();
    buildLayers();
    seedTracers();
    vortices.length = 0;
    pushes.length = 0;
    if (first) seedFloaters();
    else
      for (const f of floaters) {
        f.x *= kx;
        f.y *= ky;
      }
  }

  function buildBanks() {
    left = [];
    right = [];
    for (let y = -160; y <= H + 160; y += 6) {
      const m = slope(y);
      const inv = 1 / Math.sqrt(1 + m * m);
      const nx = inv;
      const ny = -m * inv;
      const cxy = centerX(y);
      const hw = halfW(y);
      left.push({ x: cxy - nx * hw, y: y - ny * hw, nx: -nx, ny: -ny });
      right.push({ x: cxy + nx * hw, y: y + ny * hw, nx, ny });
    }
    waterPath = new Path2D();
    left.forEach((p, i) => (i ? waterPath.lineTo(p.x, p.y) : waterPath.moveTo(p.x, p.y)));
    for (let i = right.length - 1; i >= 0; i--) waterPath.lineTo(right[i].x, right[i].y);
    waterPath.closePath();
  }

  function placeStones() {
    const scale = hw0 / 85;
    stones = STONES.map(([fy, u, r0], i) => {
      const R = rng(40 + i);
      const r = r0 * scale;
      const [x, y] = placeAt(fy * H, u);
      const rot = R() * TAU;
      const ell = 1.05 + R() * 0.08;
      const pts: Pt[] = [];
      for (let k = 0; k < 18; k++) {
        const a = (k / 18) * TAU;
        const rr = r * (1 + (R() - 0.5) * 0.14);
        const ex = Math.cos(a) * rr * ell;
        const ey = (Math.sin(a) * rr) / ell;
        pts.push([x + ex * Math.cos(rot) - ey * Math.sin(rot), y + ex * Math.sin(rot) + ey * Math.cos(rot)]);
      }
      return { x, y, r: r * ell * 1.02, pts, seed: 60 + i * 7, ux: 0, uy: V0, shed: R(), side: 1 };
    });
  }

  function buildDots() {
    const xs: number[] = [];
    const ys: number[] = [];
    const ds: number[] = [];
    for (let y = -DOT; y < H + DOT; y += DOT) {
      for (let x = DOT / 2; x < W; x += DOT) {
        frameAt(x, y);
        const u = F.u;
        if (Math.abs(u) >= 0.985) continue;
        // deeper towards the middle, with a few slow pools along the way
        const depth = Math.pow(1 - u * u, 1.2);
        const pool = 0.82 + 0.3 * Math.sin(x * 0.031 + y * 0.012) * Math.sin(y * 0.021 + 1.3);
        xs.push(x);
        ys.push(y);
        ds.push(clamp((0.03 + 0.36 * depth) * pool, 0, 0.5));
      }
    }
    dotX = Float32Array.from(xs);
    dotY = Float32Array.from(ys);
    dotD = Float32Array.from(ds);
  }

  function newLayer(): [HTMLCanvasElement, CanvasRenderingContext2D] | null {
    const l = document.createElement('canvas');
    l.width = canvas.width;
    l.height = canvas.height;
    const g = l.getContext('2d');
    if (!g) return null;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    return [l, g];
  }

  function strokeBank(g: CanvasRenderingContext2D, bank: BankPt[], off = 0) {
    g.beginPath();
    bank.forEach((p, i) => {
      const x = p.x + p.nx * off;
      const y = p.y + p.ny * off;
      if (i) g.lineTo(x, y);
      else g.moveTo(x, y);
    });
    g.stroke();
  }
  function wobLine(g: CanvasRenderingContext2D, pts: Pt[], amp: number, seed: number, close = false) {
    const R = rng(seed);
    g.beginPath();
    pts.forEach(([x, y], i) => {
      const jx = x + (R() - 0.5) * amp;
      const jy = y + (R() - 0.5) * amp;
      if (i) g.lineTo(jx, jy);
      else g.moveTo(jx, jy);
    });
    if (close) g.closePath();
    g.stroke();
  }

  // Everything that holds still is drawn once per size and theme: the water and the hatched earth
  // under the moving marks, the ink banks, tufts and stones over them.
  function buildLayers() {
    const u = newLayer();
    const o = newLayer();
    if (!u || !o) return;
    const [ul, g] = u;
    const [ol, h] = o;

    // wet earth and hatching, only outside the water
    g.save();
    const outside = new Path2D();
    outside.rect(-10, -10, W + 20, H + 20);
    outside.addPath(waterPath);
    g.clip(outside, 'evenodd');
    g.strokeStyle = pal.sand;
    g.lineWidth = 20;
    strokeBank(g, left);
    strokeBank(g, right);
    const R = rng(11);
    const ha = 1.15;
    const hx = Math.cos(ha);
    const hy = Math.sin(ha);
    g.strokeStyle = pal.hatch;
    g.globalAlpha = pal.hatchAlpha;
    g.lineWidth = 1;
    g.beginPath();
    for (const bank of [left, right]) {
      for (let i = 0; i < bank.length - 1; i++) {
        for (let half = 0; half < 2; half++) {
          const p = bank[i];
          const q = bank[i + 1];
          const t = half * 0.5;
          const px = p.x + (q.x - p.x) * t;
          const py = p.y + (q.y - p.y) * t;
          for (let row = 0; row < 3; row++) {
            if (R() > [0.8, 0.45, 0.18][row]) continue;
            const off = 2 + row * 5 + R() * 2.5;
            const len = 4 + R() * 5 - row;
            const x0 = px + p.nx * off;
            const y0 = py + p.ny * off;
            g.moveTo(x0, y0);
            g.lineTo(x0 + hx * len, y0 + hy * len);
          }
        }
      }
    }
    g.stroke();
    g.restore();
    g.fillStyle = pal.water;
    g.fill(waterPath);

    // the banks, drawn twice like a crayon: a firm pass and a ghost of it
    h.strokeStyle = pal.ink;
    for (const [bank, seed] of [
      [left, 21],
      [right, 22],
    ] as [BankPt[], number][]) {
      const pts: Pt[] = bank.map((p) => [p.x, p.y]);
      h.globalAlpha = 0.9;
      h.lineWidth = 1.5;
      wobLine(h, pts, 1.1, seed);
      h.globalAlpha = 0.3;
      h.lineWidth = 1;
      wobLine(h, pts, 2.2, seed + 50);
    }
    h.globalAlpha = 1;

    // tufts of grass and a few pebbles on the banks
    const T = rng(31);
    for (const bank of [left, right]) {
      let next = 30 + T() * 90;
      let run = 0;
      for (let i = 1; i < bank.length; i++) {
        run += Math.hypot(bank[i].x - bank[i - 1].x, bank[i].y - bank[i - 1].y);
        if (run < next) continue;
        next = run + 70 + T() * 130;
        const p = bank[i];
        const off = 9 + T() * 9;
        const bx = p.x + p.nx * off;
        const by = p.y + p.ny * off;
        if (T() < 0.7) {
          // grass drawn side-on, the way a picture map draws it: blades fanning up from one root
          const blades = 4 + Math.floor(T() * 3);
          h.strokeStyle = pal.ink;
          h.globalAlpha = 0.65;
          h.lineWidth = 1;
          h.beginPath();
          for (let b = 0; b < blades; b++) {
            const q = b / (blades - 1) - 0.5;
            const a = -Math.PI / 2 + q * 1.5 + (T() - 0.5) * 0.2;
            const L = (7 + T() * 3) * (1 - Math.abs(q) * 0.8);
            const rx = bx + q * 3;
            h.moveTo(rx, by);
            h.quadraticCurveTo(rx + Math.cos(a) * L * 0.4, by - L * 0.55, rx + Math.cos(a) * L, by + Math.sin(a) * L);
          }
          h.stroke();
        } else {
          const r = 1.8 + T() * 1.6;
          h.globalAlpha = 1;
          h.fillStyle = pal.stone;
          h.beginPath();
          h.ellipse(bx, by, r * 1.3, r, T() * 3, 0, TAU);
          h.fill();
          h.strokeStyle = pal.ink;
          h.globalAlpha = 0.6;
          h.lineWidth = 0.9;
          h.stroke();
        }
      }
    }
    h.globalAlpha = 1;

    // the stones: a shadow on the water, a flat fill, a dot screen on the side away from the light,
    // a wobbly outline, and a wet highlight
    for (const s of stones) {
      const path = new Path2D();
      s.pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
      path.closePath();
      h.save();
      h.translate(2.5, 3.2);
      h.fillStyle = pal.shadow;
      h.globalAlpha = pal.shadowAlpha;
      h.fill(path);
      h.restore();
      h.fillStyle = pal.stone;
      h.fill(path);
      h.save();
      h.clip(path);
      h.fillStyle = pal.ink;
      h.globalAlpha = 0.5;
      h.beginPath();
      const cell = 3.4;
      for (let y = s.y - s.r; y < s.y + s.r; y += cell) {
        for (let x = s.x - s.r; x < s.x + s.r; x += cell) {
          const d = clamp((((x - s.x) * 0.6 + (y - s.y) * 0.8) / s.r) * 0.45 + 0.12, 0, 0.6);
          if (d < 0.05) continue;
          const rad = cell * 0.5 * Math.sqrt(d);
          h.moveTo(x + rad, y);
          h.arc(x, y, rad, 0, TAU);
        }
      }
      h.fill();
      h.restore();
      h.strokeStyle = pal.ink;
      h.globalAlpha = 0.9;
      h.lineWidth = 1.4;
      wobLine(h, s.pts, 0.9, s.seed, true);
      h.strokeStyle = pal.glint;
      h.globalAlpha = 0.85;
      h.lineWidth = 1.5;
      h.beginPath();
      h.arc(s.x - s.r * 0.1, s.y - s.r * 0.1, s.r * 0.62, Math.PI * 1.08, Math.PI * 1.42);
      h.stroke();
      h.globalAlpha = 1;
    }

    under = ul;
    over = ol;
  }

  // ---- things in the water ----
  function respawn(p: Tracer) {
    const [x, y] = placeAt(-10 + rand() * (H + 20), (rand() * 2 - 1) * 0.9);
    p.x = x;
    p.y = y;
    p.hx.length = 0;
    p.hy.length = 0;
    p.ht = 0;
    base(x, y);
    p.vx = V.x;
    p.vy = V.y;
    p.age = 0;
    p.life = 2.4 + rand() * 2.6;
  }
  function seedTracers() {
    const n = Math.round(clamp((2 * hw0 * H) / 1500, 50, 160));
    tracers.length = 0;
    for (let i = 0; i < n; i++) {
      const p: Tracer = { x: 0, y: 0, vx: 0, vy: V0, age: 0, life: 1, glint: i % 20 < 7, id: i, sp: V0, hx: [], hy: [], ht: 0 };
      respawn(p);
      p.age = rand() * p.life;
      tracers.push(p);
    }
  }
  function floatIn(f: Floater, y: number) {
    const [x, yy] = placeAt(y, (rand() - 0.5) * 0.7);
    f.x = x;
    f.y = yy;
    base(x, yy);
    f.vx = V.x;
    f.vy = V.y;
    f.away = 0;
  }
  function seedFloaters() {
    floaters.length = 0;
    const mk = (boat: boolean, y: number, i: number): Floater => {
      const f: Floater = { boat, x: 0, y: 0, vx: 0, vy: 0, a: boat ? 0 : rand() * TAU, va: 0, size: boat ? 34 : 14 + rand() * 3, color: i % 2, seed: i * 13 + 5, away: 0, bump: 0 };
      floatIn(f, y);
      return f;
    };
    floaters.push(mk(false, H * 0.48, 0), mk(false, H * 0.76, 1), mk(true, H * 0.2, 2));
  }

  function ripple(x: number, y: number, rMax: number, life: number, k: number, delay = 0) {
    ripples.push({ x, y, age: -delay, life, rMax, k, seed: rippleSeed++ });
    if (ripples.length > 26) ripples.shift();
  }

  function pebble(x: number, y: number) {
    ripple(x, y, 44, 2, 1);
    ripple(x, y, 28, 1.6, 0.7, 0.14);
    const n = 7 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) {
      const a = rand() * TAU;
      const sp = 60 + rand() * 90;
      drops.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: 0.28 + rand() * 0.2 });
    }
    // the water is shoved outwards for a moment
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      pushes.push({ x: x + Math.cos(a) * 10, y: y + Math.sin(a) * 10, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, age: 0 });
    }
    while (pushes.length > 40) pushes.shift();
    plip(1, 0.08);
    plip(1.5, 0.025, 0.32);
  }

  // ---- simulation ----
  function shed(o: Body, dt: number, cap = Infinity) {
    o.shed -= dt;
    const um = Math.min(cap, Math.hypot(o.ux, o.uy));
    if (o.shed > 0 || um < 8) return;
    o.shed = clamp((5 * o.r) / um, 0.45, 1.5);
    o.side = -o.side;
    const uu = Math.hypot(o.ux, o.uy);
    const tx = o.ux / uu;
    const ty = o.uy / uu;
    vortices.push({
      x: o.x + tx * o.r * 1.35 - ty * o.side * o.r * 0.55,
      y: o.y + ty * o.r * 1.35 + tx * o.side * o.r * 0.55,
      g: -o.side * TAU * um * o.r * 0.42,
      core: o.r * 0.8,
      age: 0,
      life: 2.8,
    });
    if (vortices.length > 28) vortices.shift();
  }

  function collide(f: Floater, cx: number, cy: number, R: number, vx: number, vy: number) {
    const dx = f.x - cx;
    const dy = f.y - cy;
    const d = Math.hypot(dx, dy);
    if (d >= R || d === 0) return;
    const nx = dx / d;
    const ny = dy / d;
    f.x = cx + nx * R;
    f.y = cy + ny * R;
    const rel = (f.vx - vx) * nx + (f.vy - vy) * ny;
    if (rel >= 0) return;
    f.vx -= nx * rel * 1.4;
    f.vy -= ny * rel * 1.4;
    f.va += (nx * (f.vy - vy) - ny * (f.vx - vx)) * 0.012;
    if (rel < -30 && f.bump <= 0) {
      ripple(f.x, f.y, 12 + f.size * 0.4, 1, 0.5);
      f.bump = 0.35;
    }
  }

  function stepFloater(f: Floater, dt: number) {
    if (f.away > 0) {
      f.away -= dt;
      if (f.away <= 0) floatIn(f, -28);
      return;
    }
    field(f.x, f.y);
    const k = 1 - Math.exp(-dt * (f.boat ? 1.5 : 2.2));
    f.vx += (V.x - f.vx) * k;
    f.vy += (V.y - f.vy) * k;
    if (f.boat) {
      // the boat rocks back to level; knocks set it swaying
      f.va += (-f.a * 7 - f.va * 1.6) * dt;
    } else {
      // leaves turn with the water's own spin, and a little on their own
      const w = curl(f.x, f.y);
      f.va += (w * 0.6 + 0.2 - f.va) * (1 - Math.exp(-dt * 2));
    }
    f.a += f.va * dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    const pad = f.size * (f.boat ? 0.42 : 0.38);
    for (const s of stones) collide(f, s.x, s.y, s.r + pad, 0, 0);
    if (finger.r > 3) collide(f, finger.x, finger.y, finger.r + pad, finger.vx, finger.vy);
    frameAt(f.x, f.y);
    const lim = f.boat ? 0.68 : 0.8;
    if (Math.abs(F.u) > lim) {
      const sgn = Math.sign(F.u);
      const push = (Math.abs(F.u) - lim) * F.hw * sgn;
      f.x -= F.nx * push;
      f.y -= F.ny * push;
      const vn = f.vx * F.nx + f.vy * F.ny;
      if (vn * sgn > 0) {
        f.vx -= F.nx * vn * 1.3;
        f.vy -= F.ny * vn * 1.3;
      }
    }
    f.bump = Math.max(0, f.bump - dt);
    if (f.y > H + 44 || f.y < -70) f.away = f.boat ? 5 + rand() * 6 : 2 + rand() * 6;
  }

  function step(dt: number) {
    time += dt;

    // the finger
    const wet = pointer.inside && inWater(pointer.x, pointer.y, 0.93) && !stones.some((s) => Math.hypot(pointer.x - s.x, pointer.y - s.y) < s.r + 4);
    if (wet && !finger.wet) {
      finger.x = finger.rx = pointer.x;
      finger.y = finger.ry = pointer.y;
      finger.vx = finger.vy = 0;
      finger.still = 0;
      ripple(pointer.x, pointer.y, 22, 1.1, 0.7);
    } else if (!wet && finger.wet && finger.r > 4) {
      ripple(finger.x, finger.y, 16, 0.9, 0.45);
    }
    finger.wet = wet;
    if (wet) {
      const k = 1 - Math.exp(-dt * 14);
      finger.vx += ((pointer.x - finger.x) / dt - finger.vx) * k;
      finger.vy += ((pointer.y - finger.y) / dt - finger.vy) * k;
      const fs = Math.hypot(finger.vx, finger.vy);
      if (fs > 900) {
        finger.vx *= 900 / fs;
        finger.vy *= 900 / fs;
      }
      finger.x = pointer.x;
      finger.y = pointer.y;
    } else {
      finger.vx *= 0.9;
      finger.vy *= 0.9;
    }
    finger.r += ((wet ? FINGER : 0) - finger.r) * (1 - Math.exp(-dt * 12));
    const fs = Math.hypot(finger.vx, finger.vy);
    if (wet) {
      base(finger.x, finger.y);
      let ux = V.x - finger.vx;
      let uy = V.y - finger.vy;
      const um = Math.hypot(ux, uy);
      if (um > 110) {
        ux *= 110 / um;
        uy *= 110 / um;
      }
      finger.ux = ux;
      finger.uy = uy;
      if (fs > 25) {
        const k = Math.min(0.4, 220 / fs);
        pushes.push({ x: finger.x, y: finger.y, vx: finger.vx * k, vy: finger.vy * k, age: 0 });
        if (pushes.length > 40) pushes.shift();
      }
      if (Math.hypot(finger.x - finger.rx, finger.y - finger.ry) > 30) {
        ripple(finger.x, finger.y, 18 + Math.min(fs, 600) * 0.03, 1.2, 0.55);
        finger.rx = finger.x;
        finger.ry = finger.y;
        finger.still = 0;
      } else if ((finger.still += dt) > 1.6) {
        finger.still = 0;
        ripple(finger.x, finger.y, 20, 1.5, 0.3);
      }
    }

    // stones and the finger shed eddies
    for (const s of stones) {
      base(s.x, s.y);
      s.ux = V.x;
      s.uy = V.y;
      shed(s, dt);
    }
    if (finger.r > 6) shed(finger, dt, 60);
    for (let i = vortices.length - 1; i >= 0; i--) {
      const v = vortices[i];
      base(v.x, v.y);
      v.x += V.x * dt * 0.92;
      v.y += V.y * dt * 0.92;
      v.age += dt;
      if (v.age >= v.life || v.y > H + 60) vortices.splice(i, 1);
    }
    for (let i = pushes.length - 1; i >= 0; i--) if ((pushes[i].age += dt) >= PUSH_LIFE) pushes.splice(i, 1);

    // the current
    for (const p of tracers) {
      field(p.x, p.y);
      p.sp = Math.hypot(V.x, V.y);
      const u = F.u;
      p.x += V.x * dt;
      p.y += V.y * dt;
      p.vx += (V.x - p.vx) * 0.2;
      p.vy += (V.y - p.vy) * 0.2;
      p.age += dt;
      if ((p.ht += dt) >= TRAIL_DT) {
        p.ht = 0;
        p.hx.unshift(p.x);
        p.hy.unshift(p.y);
        if (p.hx.length > TRAIL_N) {
          p.hx.pop();
          p.hy.pop();
        }
      }
      if (p.age >= p.life || Math.abs(u) > 0.97 || p.y > H + 30) respawn(p);
    }

    // rings drift downstream as they spread
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.age += dt;
      if (r.age >= r.life) {
        ripples.splice(i, 1);
        continue;
      }
      if (r.age < 0) continue;
      base(r.x, r.y);
      r.x += V.x * dt * 0.8;
      r.y += V.y * dt * 0.8;
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.age += dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.age >= d.life) {
        if (inWater(d.x, d.y, 0.98)) ripple(d.x, d.y, 9 + rand() * 6, 0.8, 0.5);
        drops.splice(i, 1);
      }
    }

    for (const f of floaters) stepFloater(f, dt);

    // now and then something rises and rings the surface
    if ((nextAmbient -= dt) <= 0) {
      nextAmbient = 2.5 + rand() * 5;
      const [x, y] = placeAt(H * (0.05 + rand() * 0.9), (rand() - 0.5) * 1.3);
      if (!stones.some((s) => Math.hypot(x - s.x, y - s.y) < s.r + 10)) ripple(x, y, 14 + rand() * 10, 1.7, 0.42);
    }
  }

  // ---- drawing ----
  function ring(cx: number, cy: number, r: number, seed: number, tick: number, amp: number, a0 = 0, a1r = TAU) {
    const n = clamp(Math.round(Math.max(24, r * 1.2) * ((a1r - a0) / TAU)), 6, 110);
    c.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1r - a0) * i) / n;
      const rr = r + (hash(seed, i % n, tick) - 0.5) * amp;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
  }

  function drawDots() {
    const rs = ripples
      .filter((r) => r.age > 0)
      .map((r) => {
        const k = r.age / r.life;
        return { x: r.x, y: r.y, r: r.rMax * easeOut(k), s: r.k * Math.pow(1 - k, 1.4) };
      });
    const fr = finger.r;
    const t = time;
    c.fillStyle = pal.deep;
    c.globalAlpha = pal.dotAlpha;
    c.beginPath();
    for (let i = 0; i < dotX.length; i++) {
      let x = dotX[i];
      let y = dotY[i];
      // light on the bed: a slow caustic that drifts downstream
      const cs = (Math.sin(x * 0.043 + t * 0.6) + Math.sin(y * 0.037 - t * 0.9 + x * 0.018) + Math.sin((x + y) * 0.027 - t * 0.5)) / 3;
      const d = dotD[i] * (0.8 + 0.34 * cs);
      // a passing ring bends the screen under it
      for (const r of rs) {
        const dx = x - r.x;
        const dy = y - r.y;
        const d2 = dx * dx + dy * dy;
        const lo = Math.max(0, r.r - 12);
        if (d2 > (r.r + 12) * (r.r + 12) || d2 < lo * lo) continue;
        const dist = Math.sqrt(d2) || 1;
        const q = (dist - r.r) / 12;
        const off = Math.sin(q * Math.PI) * (1 - Math.abs(q)) * 3.2 * r.s;
        x += (dx / dist) * off;
        y += (dy / dist) * off;
      }
      // and the finger dimples it
      if (fr > 1) {
        const dx = x - finger.x;
        const dy = y - finger.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < fr * 2.4) {
          const q = 1 - dist / (fr * 2.4);
          const off = q * q * 5 * (fr / FINGER);
          x += (dx / dist) * off;
          y += (dy / dist) * off;
        }
      }
      const rad = DOT * 0.5 * Math.sqrt(Math.max(0, d));
      if (rad < 0.35) continue;
      c.moveTo(x + rad, y);
      c.arc(x, y, rad, 0, TAU);
    }
    c.fill();
    c.globalAlpha = 1;
  }

  const BUCKETS = 6;
  const STROKE = [0.35, 0.8, 1, 0.75, 0.3]; // weight along a current line, head to tail
  const pts: Pt[] = [];
  function drawCurrents(tick: number) {
    const lines: Path2D[] = [];
    const glints: Path2D[] = [];
    for (let b = 0; b < BUCKETS; b++) {
      lines.push(new Path2D());
      glints.push(new Path2D());
    }
    const bucket = (a: number) => clamp(Math.floor(a * BUCKETS), 0, BUCKETS - 1);
    for (const p of tracers) {
      const env = Math.sin(Math.PI * clamp(p.age / p.life, 0, 1));
      if (env < 0.05) continue;
      if (p.glint) {
        const s = Math.hypot(p.vx, p.vy) || 1;
        const tx = p.vx / s;
        const ty = p.vy / s;
        const size = 0.8 + hash(p.id, 3) * 0.6;
        const tw = 0.55 + 0.45 * Math.sin(time * 2.6 + p.id);
        const path = glints[bucket(env * tw)];
        for (let k = -2; k <= 2; k++) {
          const j = (hash(p.id, k + 5, tick) - 0.5) * 0.7;
          const x = p.x - ty * k * 2.6 * size - tx * 0.4 * k * k * size + j;
          const y = p.y + tx * k * 2.6 * size - ty * 0.4 * k * k * size - j;
          if (k === -2) path.moveTo(x, y);
          else path.lineTo(x, y);
        }
      } else {
        // The speck's own trail, newest first, cut to this line's length, with a slight sinuous
        // swing across it, and heavier in the middle than at either end, like a brush stroke.
        const L = (40 + hash(p.id, 9) * 55) * clamp(p.sp / V0, 0.45, 1.3);
        const amp = 0.9 + hash(p.id, 11) * 1;
        const phase = hash(p.id, 12) * TAU + time * 1.6;
        pts.length = 0;
        let px = p.x;
        let py = p.y;
        let run = 0;
        const raw: number[] = [px, py, 0];
        for (let i = 0; i < p.hx.length && run < L; i++) {
          run += Math.hypot(p.hx[i] - px, p.hy[i] - py);
          px = p.hx[i];
          py = p.hy[i];
          raw.push(px, py, run);
        }
        const n = raw.length / 3;
        if (n < 3 || run < 6) continue;
        for (let i = 0; i < n; i++) {
          const j0 = Math.max(0, i - 1) * 3;
          const j1 = Math.min(n - 1, i + 1) * 3;
          const dx = raw[j1] - raw[j0];
          const dy = raw[j1 + 1] - raw[j0 + 1];
          const dl = Math.hypot(dx, dy) || 1;
          const along = raw[i * 3 + 2];
          const wave = Math.sin(along * 0.11 + phase) * amp * Math.sin((Math.PI * along) / run);
          pts.push([
            raw[i * 3] - (dy / dl) * wave + (hash(p.id, i, tick) - 0.5) * 0.7,
            raw[i * 3 + 1] + (dx / dl) * wave + (hash(p.id, i + 40, tick) - 0.5) * 0.7,
          ]);
        }
        const a = env * clamp(p.sp / 30, 0.45, 1);
        const segs = STROKE.length;
        for (let k = 0; k < segs; k++) {
          const i0 = Math.floor((k * (pts.length - 1)) / segs);
          const i1 = Math.floor(((k + 1) * (pts.length - 1)) / segs);
          if (i1 <= i0) continue;
          const path = lines[bucket(a * STROKE[k])];
          path.moveTo(pts[i0][0], pts[i0][1]);
          for (let i = i0 + 1; i <= i1; i++) path.lineTo(pts[i][0], pts[i][1]);
        }
      }
    }
    c.lineWidth = 1.2;
    c.strokeStyle = pal.current;
    for (let b = 0; b < BUCKETS; b++) {
      c.globalAlpha = ((b + 0.5) / BUCKETS) * pal.currentAlpha;
      c.stroke(lines[b]);
    }
    c.strokeStyle = pal.glint;
    for (let b = 0; b < BUCKETS; b++) {
      c.globalAlpha = ((b + 0.5) / BUCKETS) * pal.glintAlpha;
      c.stroke(glints[b]);
    }
    c.globalAlpha = 1;
  }

  // a broken cream line just inside each bank, lapping in and out
  function drawFoam() {
    c.strokeStyle = pal.glint;
    c.lineWidth = 1.2;
    c.globalAlpha = pal.glintAlpha * 0.6;
    c.beginPath();
    [left, right].forEach((bank, side) => {
      for (let i = 0; i < bank.length - 1; i++) {
        if (hash(i >> 1, side, 77) < 0.45) continue;
        const p = bank[i];
        const q = bank[i + 1];
        const o0 = 3.2 + 1.3 * Math.sin(time * 1.2 + i * 0.4 + side * 2);
        const o1 = 3.2 + 1.3 * Math.sin(time * 1.2 + (i + 1) * 0.4 + side * 2);
        c.moveTo(p.x - p.nx * o0, p.y - p.ny * o0);
        c.lineTo(q.x - q.nx * o1, q.y - q.ny * o1);
      }
    });
    c.stroke();
    c.globalAlpha = 1;
  }

  function drawRipples(tick: number) {
    for (const r of ripples) {
      if (r.age <= 0) continue;
      const k = r.age / r.life;
      const R = r.rMax * easeOut(k);
      const fade = Math.pow(1 - k, 1.5) * Math.min(1, r.age / 0.06) * r.k;
      [R, R * 0.62].forEach((rr, j) => {
        if (rr < 2) return;
        const a = fade * (j ? 0.55 : 1);
        c.strokeStyle = pal.deep;
        c.lineWidth = 1.1;
        c.globalAlpha = a * 0.35;
        ring(r.x, r.y, rr + 2.2, r.seed * 7 + j + 3, tick, 1.1);
        c.strokeStyle = pal.glint;
        c.lineWidth = 1.5;
        c.globalAlpha = a * pal.glintAlpha;
        ring(r.x, r.y, rr, r.seed * 7 + j, tick, 1.1);
      });
    }
    c.globalAlpha = 1;
  }

  // the water piling up on the upstream side of whatever is in its way
  function bow(o: Body, r: number, tick: number, seed: number, strength: number) {
    const um = Math.hypot(o.ux, o.uy);
    if (um < 4) return;
    const up = Math.atan2(-o.uy, -o.ux);
    const span = 0.9 + Math.min(um, 200) / 400;
    c.strokeStyle = pal.glint;
    c.lineWidth = 1.6;
    c.globalAlpha = pal.glintAlpha * strength * Math.min(1, um / 30);
    ring(o.x, o.y, r + 2.4 + 0.8 * Math.sin(time * 3.1 + seed), seed, tick, 0.9, up - span, up + span);
    c.lineWidth = 1.1;
    c.globalAlpha *= 0.45;
    ring(o.x, o.y, r + 6.5 + 0.8 * Math.sin(time * 2.3 + seed), seed + 1, tick, 1.2, up - span * 0.6, up + span * 0.6);
    c.globalAlpha = 1;
  }

  function drawFinger(tick: number) {
    const fr = finger.r;
    if (fr < 0.8) return;
    const a = fr / FINGER;
    c.strokeStyle = pal.deep;
    c.lineWidth = 1.1;
    c.globalAlpha = 0.3 * a;
    ring(finger.x, finger.y, fr + 2.6, 901, tick, 0.8);
    c.strokeStyle = pal.glint;
    c.lineWidth = 1.6;
    c.globalAlpha = pal.glintAlpha * 0.9 * a;
    ring(finger.x, finger.y, fr, 900, tick, 0.8);
    c.globalAlpha = 1;
    bow(finger, fr, tick, 902, a);
  }

  function poly(pts: Pt[], amp: number, seed: number, tick: number) {
    c.beginPath();
    pts.forEach(([x, y], i) => {
      const jx = x + (hash(seed, i, tick) - 0.5) * amp;
      const jy = y + (hash(seed, i + 30, tick) - 0.5) * amp;
      if (i) c.lineTo(jx, jy);
      else c.moveTo(jx, jy);
    });
    c.closePath();
  }
  function fillPts(pts: Pt[]) {
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  }

  // The boat is drawn side-on, the way a picture map draws its houses and trees, so it reads as a
  // paper boat at a glance; it rocks and lists but never turns over. Leaves lie flat.
  function boatPts(f: Floater) {
    const s = f.size / 34;
    const bob = Math.sin(time * 2.2 + f.seed) * 0.7;
    const ca = Math.cos(f.a);
    const sa = Math.sin(f.a);
    const P = (lx: number, ly: number): Pt => [f.x + (lx * ca - ly * sa) * s, f.y + bob + (lx * sa + ly * ca) * s];
    return {
      hull: [P(-17, -4), P(17, -4), P(11, 5), P(-11, 5)],
      sail: [P(-9, -4), P(0, -20), P(9, -4)],
      shadeHull: [P(0, -4), P(17, -4), P(11, 5), P(0, 5)],
      shadeSail: [P(0, -20), P(9, -4), P(0, -4)],
      crease: [P(0, -20), P(0, 5)] as Pt[],
      mast: [P(0, -20), P(0, -26)] as Pt[],
      flag: [P(0, -26), P(7, -24), P(0, -22)],
      s,
      bob,
    };
  }

  function drawShadows() {
    c.fillStyle = pal.shadow;
    c.globalAlpha = pal.shadowAlpha;
    for (const f of floaters) {
      if (f.away > 0) continue;
      if (f.boat) {
        const b = boatPts(f);
        c.beginPath();
        c.ellipse(f.x + 3, f.y + 6 + b.bob, 16 * b.s, 4.2 * b.s, 0, 0, TAU);
        c.fill();
      } else {
        c.save();
        c.translate(f.x + 2, f.y + 3);
        c.rotate(f.a);
        c.beginPath();
        c.ellipse(0, 0, f.size * 0.5, f.size * 0.17, 0, 0, TAU);
        c.fill();
        c.restore();
      }
    }
    c.globalAlpha = 1;
  }

  function halftone(pts: Pt[], color: string, density: number, cell: number) {
    let x0 = 1e9;
    let y0 = 1e9;
    let x1 = -1e9;
    let y1 = -1e9;
    for (const [x, y] of pts) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
    c.save();
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.clip();
    c.fillStyle = color;
    c.beginPath();
    const rad = cell * 0.5 * Math.sqrt(density);
    for (let y = Math.floor(y0 / cell) * cell; y <= y1; y += cell) {
      for (let x = Math.floor(x0 / cell) * cell; x <= x1; x += cell) {
        c.moveTo(x + rad, y);
        c.arc(x, y, rad, 0, TAU);
      }
    }
    c.fill();
    c.restore();
  }

  function drawBoat(f: Floater, tick: number) {
    const b = boatPts(f);
    c.lineWidth = 1.4;
    c.fillStyle = pal.boat;
    fillPts(b.hull);
    fillPts(b.sail);
    c.globalAlpha = 0.55;
    halftone(b.shadeHull, pal.boatShade, 0.45, 2.6);
    halftone(b.shadeSail, pal.boatShade, 0.3, 2.6);
    c.globalAlpha = 1;
    // the flag, the one spot of colour, pulled back and forth by the breeze
    c.strokeStyle = pal.ink;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(b.mast[0][0], b.mast[0][1]);
    c.lineTo(b.mast[1][0], b.mast[1][1]);
    c.stroke();
    const flap = Math.sin(time * 5 + f.seed) * 1.2;
    c.fillStyle = pal.flag;
    fillPts([b.flag[0], [b.flag[1][0], b.flag[1][1] + flap], b.flag[2]]);
    c.strokeStyle = pal.ink;
    c.lineWidth = 1.4;
    c.globalAlpha = 0.95;
    poly(b.hull, 0.8, f.seed, tick);
    c.stroke();
    poly(b.sail, 0.8, f.seed + 1, tick);
    c.stroke();
    c.lineWidth = 0.9;
    c.globalAlpha = 0.5;
    c.beginPath();
    c.moveTo(b.crease[0][0], b.crease[0][1]);
    c.lineTo(b.crease[1][0], b.crease[1][1]);
    c.stroke();
    // the waterline lapping at the hull
    c.strokeStyle = pal.glint;
    c.lineWidth = 1.4;
    c.globalAlpha = pal.glintAlpha * 0.9;
    const wl = f.y + b.bob + 4.5 * b.s;
    const w = 19 * b.s;
    c.beginPath();
    for (let i = 0; i <= 8; i++) {
      const x = f.x - w + (2 * w * i) / 8;
      const y = wl + Math.sin(i * 1.3 + time * 4) * 0.9;
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
    c.globalAlpha = 1;
  }

  function drawLeaf(f: Floater, tick: number) {
    const L = f.size;
    const w = L * 0.3;
    const ca = Math.cos(f.a);
    const sa = Math.sin(f.a);
    const P = (lx: number, ly: number): Pt => [f.x + lx * ca - ly * sa, f.y + lx * sa + ly * ca];
    const top: Pt[] = [];
    const bot: Pt[] = [];
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      const lx = -L / 2 + L * t;
      const ly = w * Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - 0.25 * t);
      top.push(P(lx, -ly));
      bot.push(P(lx, ly));
    }
    const outline = [...top, ...bot.slice(1, -1).reverse()];
    c.fillStyle = pal.leaves[f.color % pal.leaves.length];
    fillPts(outline);
    c.globalAlpha = 0.45;
    halftone([...bot, P(L / 2, 0), P(-L / 2, 0)], pal.ink, 0.28, 2.4);
    c.globalAlpha = 0.9;
    c.strokeStyle = pal.ink;
    c.lineWidth = 1.1;
    poly(outline, 0.7, f.seed, tick);
    c.stroke();
    c.globalAlpha = 0.6;
    c.lineWidth = 0.9;
    const s0 = P(-L / 2 - 3.5, 0.6);
    const s1 = P(L * 0.36, 0);
    c.beginPath();
    c.moveTo(s0[0], s0[1]);
    c.lineTo(s1[0], s1[1]);
    c.stroke();
    c.globalAlpha = 1;
  }

  function drawDrops() {
    for (const d of drops) {
      const k = d.age / d.life;
      const hop = Math.sin(Math.PI * k);
      const r = 1.3 + hop * 1.4;
      c.fillStyle = pal.shadow;
      c.globalAlpha = pal.shadowAlpha;
      c.beginPath();
      c.arc(d.x + hop * 3, d.y + hop * 5, r * 0.8, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
      c.fillStyle = pal.glint;
      c.beginPath();
      c.arc(d.x, d.y - hop * 6, r, 0, TAU);
      c.fill();
      c.strokeStyle = pal.deep;
      c.lineWidth = 0.8;
      c.globalAlpha = 0.6;
      c.stroke();
      c.globalAlpha = 1;
    }
  }

  function render() {
    if (!live) return;
    const tick = Math.floor(time * BOIL);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    if (under) c.drawImage(under, 0, 0, W, H);
    drawDots();
    c.save();
    c.clip(waterPath);
    drawCurrents(tick);
    drawFoam();
    drawRipples(tick);
    drawShadows();
    c.restore();
    if (over) c.drawImage(over, 0, 0, W, H);
    stones.forEach((s, i) => bow(s, s.r, tick, 700 + i * 3, 1));
    drawFinger(tick);
    for (const f of floaters) {
      if (f.away > 0) continue;
      if (f.boat) drawBoat(f, tick);
      else drawLeaf(f, tick);
    }
    drawDrops();
  }

  // ---- pointer ----
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    const t = e.target instanceof Element ? e.target : null;
    pointer.inside =
      !!t && !!t.closest('main') && !t.closest(INTERACTIVE) && pointer.x >= 0 && pointer.x <= W && pointer.y >= 0 && pointer.y <= H;
  };
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) pointer.inside = false;
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') pointer.inside = false;
  };
  const onBlur = () => {
    pointer.inside = false;
  };
  const onDown = (e: PointerEvent) => {
    if (!live || still || e.button !== 0) return;
    onMove(e);
    if (!pointer.inside) return;
    const { x, y } = pointer;
    for (const f of floaters) {
      if (f.away > 0 || Math.hypot(f.x - x, f.y - (f.boat ? y + 6 : y)) > f.size * 0.55) continue;
      // a tap on something afloat sets it rocking and spinning away from the tap
      const dx = f.x - x || 0.1;
      const dy = f.y - y;
      const d = Math.hypot(dx, dy) || 1;
      f.vx += (dx / d) * 70;
      f.vy += (dy / d) * 70;
      f.va += (dx > 0 ? 1 : -1) * (f.boat ? 2.4 : 5);
      ripple(f.x, f.y, 26, 1.3, 0.7);
      plip(0.8, 0.06);
      return;
    }
    if (!inWater(x, y, 0.97) || stones.some((s) => Math.hypot(x - s.x, y - s.y) < s.r)) return;
    pebble(x, y);
  };

  // ---- loop ----
  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const t = now / 1000;
    const dt = t - last;
    if (dt < 1 / 75) return; // high-refresh screens still draw at 60
    last = t;
    if (!live) return;
    step(Math.min(dt, 1 / 30));
    render();
  };
  const start = () => {
    if (raf || still || document.hidden) return;
    last = performance.now() / 1000;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const onVisibility = () => (document.hidden || !live ? stop() : start());

  const ro = new ResizeObserver(() => {
    layout();
    render();
    // hidden below xl: the loop only runs while there is a stream to draw
    if (!still) onVisibility();
  });
  ro.observe(canvas);
  layout();
  if (still) {
    // one settled frame, drawn once
    for (let i = 0; i < 60; i++) step(1 / 30);
    render();
  } else {
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
  }

  return {
    setDark(dark: boolean) {
      const next = dark ? DARK : LIGHT;
      if (next === pal) return;
      pal = next;
      if (!live) return;
      buildLayers();
      render();
    },
    destroy() {
      stop();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}

// Runs down the right-hand side of every page, from the top of the window to the bottom, in the
// column the shell keeps free for it (reaching 2rem into the page's own padding beside it). It lives in the shell, so going from page to page never
// remounts it: the water carries on and the boat is still where you pushed it. Below xl there is
// no room for it, and nothing runs.
export default function WaterStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isDark = () => document.documentElement.classList.contains('dark');
    const engine = runStream(canvas, isDark(), reduced);
    const mo = new MutationObserver(() => engine.setDark(isDark()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      mo.disconnect();
      engine.destroy();
    };
  }, [reduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0 hidden xl:block"
      style={{ width: 'calc(var(--stream-w) + 2rem)' }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
