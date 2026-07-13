"use client";

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { WeatherKind } from './useWeather';

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = (range: [number, number]) => rand(range[0], range[1]);

interface RainLayerCfg {
  count: number;
  len: [number, number];
  speed: [number, number];
  alpha: number;
  lw: number;
}
interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
}
interface RainLayer {
  cfg: RainLayerCfg;
  drops: Drop[];
}

interface SnowLayerCfg {
  count: number;
  size: [number, number];
  speed: [number, number];
  alpha: number;
  dots: boolean;
}
interface Flake {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  phaseSpeed: number;
  sway: number;
  rot: number;
  rotSpeed: number;
  variant: number;
}
interface SnowLayer {
  cfg: SnowLayerCfg;
  flakes: Flake[];
}

interface CloudForm {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  alpha: number;
  sprite: HTMLCanvasElement | null;
}

interface Star {
  fx: number;
  fy: number;
  size: number;
  base: number;
  amp: number;
  phase: number;
  speed: number;
  bright: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  ux: number;
  uy: number;
  speed: number;
  life: number;
  maxLife: number;
}

interface Streak {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
  phase: number;
  bow: number;
}
interface Speck {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

interface Ray {
  entryT: number;
  len: number;
  beamW: number;
  phase: number;
  speed: number;
  jitter: number;
}

interface Bolt {
  pts: number[][];
  branch: number[][];
  age: number;
}

const WeatherEffects = ({ kind }: { kind: WeatherKind }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const desktop = window.matchMedia('(min-width: 768px)');
    // Effects are desktop-only and respect reduced motion, even if mounted.
    if (
      !desktop.matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    // The atmosphere lives in the right-side margin. A long dissolve at the
    // band's left edge lets it breathe toward the content without ever
    // reading as a cropped rectangle.
    let bandX = 0;
    let bandW = 0;
    let fadeW = 0;
    const computeBand = () => {
      bandW = Math.min(Math.max(width * 0.38, 400), 680, width);
      bandX = width - bandW;
      fadeW = Math.min(260, bandW * 0.45);
    };
    computeBand();

    const isDark = () => document.documentElement.classList.contains('dark');
    let dark = isDark();
    // neutral gray carries every effect except night, where a desaturated
    // indigo dusk gives the sky depth
    const toneFor = () => (dark ? '229, 229, 229' : '82, 82, 91');
    const nightToneFor = () => (dark ? '150, 160, 212' : '82, 90, 142');
    let tone = toneFor();
    let nightTone = nightToneFor();

    // --- pre-rendered sprites ----------------------------------------------

    const makeDotSprite = () => {
      const s = 32;
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const cc = c.getContext('2d');
      if (cc) {
        const g = cc.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, `rgba(${tone}, 1)`);
        g.addColorStop(0.5, `rgba(${tone}, 0.55)`);
        g.addColorStop(1, `rgba(${tone}, 0)`);
        cc.fillStyle = g;
        cc.fillRect(0, 0, s, s);
      }
      return c;
    };

    // small star: crisp core, tight halo — no smudge
    const makeStarSprite = () => {
      const s = 32;
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const cc = c.getContext('2d');
      if (cc) {
        const g = cc.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, `rgba(${tone}, 1)`);
        g.addColorStop(0.3, `rgba(${tone}, 0.9)`);
        g.addColorStop(0.55, `rgba(${tone}, 0.25)`);
        g.addColorStop(1, `rgba(${tone}, 0)`);
        cc.fillStyle = g;
        cc.fillRect(0, 0, s, s);
      }
      return c;
    };

    // bright star: four-point sparkle with gradient arms
    const makeSparkleSprite = () => {
      const s = 48;
      const m = s / 2;
      const arm = s * 0.46;
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const cc = c.getContext('2d');
      if (cc) {
        cc.lineCap = 'round';
        const vertical = cc.createLinearGradient(0, m - arm, 0, m + arm);
        vertical.addColorStop(0, `rgba(${tone}, 0)`);
        vertical.addColorStop(0.5, `rgba(${tone}, 1)`);
        vertical.addColorStop(1, `rgba(${tone}, 0)`);
        cc.strokeStyle = vertical;
        cc.lineWidth = 1.8;
        cc.beginPath();
        cc.moveTo(m, m - arm);
        cc.lineTo(m, m + arm);
        cc.stroke();
        const horizontal = cc.createLinearGradient(m - arm, 0, m + arm, 0);
        horizontal.addColorStop(0, `rgba(${tone}, 0)`);
        horizontal.addColorStop(0.5, `rgba(${tone}, 1)`);
        horizontal.addColorStop(1, `rgba(${tone}, 0)`);
        cc.strokeStyle = horizontal;
        cc.beginPath();
        cc.moveTo(m - arm, m);
        cc.lineTo(m + arm, m);
        cc.stroke();
        const core = cc.createRadialGradient(m, m, 0, m, m, s * 0.16);
        core.addColorStop(0, `rgba(${tone}, 1)`);
        core.addColorStop(1, `rgba(${tone}, 0)`);
        cc.fillStyle = core;
        cc.fillRect(0, 0, s, s);
      }
      return c;
    };

    const makeGlowSprite = () => {
      const s = 512;
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const cc = c.getContext('2d');
      if (cc) {
        const g = cc.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        g.addColorStop(0, `rgba(${tone}, 0.5)`);
        g.addColorStop(0.5, `rgba(${tone}, 0.18)`);
        g.addColorStop(1, `rgba(${tone}, 0)`);
        cc.fillStyle = g;
        cc.fillRect(0, 0, s, s);
      }
      return c;
    };

    // sunbeam: a wide wedge, faded along its length AND across its width,
    // so it has no hard edge on any side
    const makeRaySprite = () => {
      const w = 256;
      const h = 64;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const cc = c.getContext('2d');
      if (cc) {
        const lenGrad = cc.createLinearGradient(0, 0, w, 0);
        lenGrad.addColorStop(0, `rgba(${tone}, 0.9)`);
        lenGrad.addColorStop(0.65, `rgba(${tone}, 0.35)`);
        lenGrad.addColorStop(1, `rgba(${tone}, 0)`);
        cc.fillStyle = lenGrad;
        cc.beginPath();
        cc.moveTo(0, h / 2);
        cc.lineTo(w, h * 0.06);
        cc.lineTo(w, h * 0.94);
        cc.closePath();
        cc.fill();
        const edgeGrad = cc.createLinearGradient(0, 0, 0, h);
        edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        edgeGrad.addColorStop(0.35, 'rgba(0, 0, 0, 1)');
        edgeGrad.addColorStop(0.65, 'rgba(0, 0, 0, 1)');
        edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        cc.globalCompositeOperation = 'destination-in';
        cc.fillStyle = edgeGrad;
        cc.fillRect(0, 0, w, h);
        cc.globalCompositeOperation = 'source-over';
      }
      return c;
    };

    // six-armed snowflake crystal with side branches
    const makeFlakeSprite = () => {
      const s = 64;
      const m = s / 2;
      const armLen = s * 0.4;
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const cc = c.getContext('2d');
      if (cc) {
        cc.strokeStyle = `rgba(${tone}, 0.95)`;
        cc.lineWidth = 2.4;
        cc.lineCap = 'round';
        const branchAt = rand(0.45, 0.62);
        const branchLen = armLen * rand(0.26, 0.36);
        for (let i = 0; i < 6; i++) {
          cc.save();
          cc.translate(m, m);
          cc.rotate((i * Math.PI) / 3);
          cc.beginPath();
          cc.moveTo(0, 0);
          cc.lineTo(0, -armLen);
          const by = -armLen * branchAt;
          cc.moveTo(0, by);
          cc.lineTo(branchLen * 0.7, by - branchLen * 0.7);
          cc.moveTo(0, by);
          cc.lineTo(-branchLen * 0.7, by - branchLen * 0.7);
          cc.stroke();
          cc.restore();
        }
        cc.fillStyle = `rgba(${tone}, 0.95)`;
        cc.beginPath();
        cc.arc(m, m, 1.6, 0, Math.PI * 2);
        cc.fill();
      }
      return c;
    };

    // The moon as it looks tonight: illuminated fraction and orientation
    // computed from the real lunar cycle, drawn illustrated — lit shape,
    // faint dark side, a few craters, soft halo.
    const makeMoonSprite = () => {
      const s = 150;
      const m = s / 2;
      const r = s * 0.24;
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const cc = c.getContext('2d');
      if (cc) {
        const synodic = 29.530588853;
        const epochDays = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
        let age = (Date.now() / 86400000 - epochDays) % synodic;
        if (age < 0) age += synodic;
        const waxing = age <= synodic / 2;
        const mAge = waxing ? age : synodic - age;
        const p = (Math.PI * mAge) / (synodic / 2);
        const cosp = Math.cos(p);
        const rx = Math.abs(cosp) * r;

        cc.save();
        cc.translate(m, m);
        // waxing lights the right side, waning the left — mirror for waning
        if (!waxing) cc.scale(-1, 1);
        cc.fillStyle = `rgba(${tone}, 0.06)`;
        cc.beginPath();
        cc.arc(0, 0, r, 0, Math.PI * 2);
        cc.fill();
        cc.strokeStyle = `rgba(${tone}, 0.22)`;
        cc.lineWidth = 1;
        cc.stroke();
        // lit region: limb on the right, terminator curve back up
        cc.fillStyle = `rgba(${tone}, 0.8)`;
        cc.beginPath();
        cc.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
        cc.ellipse(0, 0, rx, r, 0, Math.PI / 2, -Math.PI / 2, cosp > 0);
        cc.fill();
        // craters: slightly erased spots, only on the lit shape
        cc.save();
        cc.clip();
        cc.globalCompositeOperation = 'destination-out';
        cc.fillStyle = 'rgba(0, 0, 0, 0.3)';
        const craters: [number, number, number][] = [
          [r * 0.35, -r * 0.25, r * 0.18],
          [r * 0.1, r * 0.35, r * 0.14],
          [r * 0.5, r * 0.18, r * 0.1],
          [-r * 0.2, -r * 0.5, r * 0.12],
        ];
        for (const [cx2, cy2, cr2] of craters) {
          cc.beginPath();
          cc.arc(cx2, cy2, cr2, 0, Math.PI * 2);
          cc.fill();
        }
        cc.restore();
        cc.restore();
        cc.globalCompositeOperation = 'destination-over';
        // halo is a ring AROUND the disc, not a wash over it
        const halo = cc.createRadialGradient(m, m, r * 1.05, m, m, m);
        halo.addColorStop(0, `rgba(${tone}, 0.16)`);
        halo.addColorStop(1, `rgba(${tone}, 0)`);
        cc.fillStyle = halo;
        cc.fillRect(0, 0, s, s);
        cc.globalCompositeOperation = 'source-over';
      }
      return c;
    };

    // Cumulus cloud: ONE unified silhouette — a rounded base bar with a big
    // central dome and two shoulder domes, heavily overlapping so they fuse
    // into a single mass, then softened with a blur. Reads as the iconic
    // cloud shape without looking like a sticker.
    const makeCloudSprite = (w: number, h: number) => {
      const margin = Math.ceil(h * 0.5);
      const c = document.createElement('canvas');
      c.width = Math.ceil(w) + margin * 2;
      c.height = Math.ceil(h) + margin * 2;
      const cc = c.getContext('2d');
      if (cc) {
        const bottomY = margin + h * 0.95;
        const rb = h * 0.2;
        const x0 = margin + w * 0.16;
        const x1 = margin + w * 0.84;
        cc.fillStyle = `rgba(${tone}, 0.55)`;
        if ('filter' in cc) cc.filter = 'blur(6px)';
        cc.beginPath();
        cc.rect(x0, bottomY - rb * 2, x1 - x0, rb * 2);
        const dome = (cx: number, cy: number, cr: number) => {
          cc.moveTo(cx + cr, cy);
          cc.arc(cx, cy, cr, 0, Math.PI * 2);
        };
        dome(x0, bottomY - rb, rb);
        dome(x1, bottomY - rb, rb);
        dome(
          margin + w * rand(0.47, 0.53),
          bottomY - rb - h * 0.3,
          h * rand(0.38, 0.45)
        );
        dome(
          margin + w * rand(0.27, 0.33),
          bottomY - rb - h * 0.14,
          h * rand(0.24, 0.3)
        );
        dome(
          margin + w * rand(0.67, 0.73),
          bottomY - rb - h * 0.12,
          h * rand(0.22, 0.28)
        );
        cc.fill();
        if ('filter' in cc) cc.filter = 'none';
      }
      return c;
    };

    // Fog: a single very wide, very soft haze layer — banks of these
    // stacked at different heights read as drifting mist strata.
    const makeFogSprite = (w: number, h: number) => {
      const margin = Math.ceil(h * 0.5);
      const c = document.createElement('canvas');
      c.width = Math.ceil(w) + margin * 2;
      c.height = Math.ceil(h) + margin * 2;
      const cc = c.getContext('2d');
      if (cc) {
        const rx = w / 2;
        const ry = h / 2;
        cc.save();
        cc.translate(margin + rx, margin + ry);
        cc.scale(1, ry / rx);
        const g = cc.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, `rgba(${tone}, 0.35)`);
        g.addColorStop(0.7, `rgba(${tone}, 0.18)`);
        g.addColorStop(1, `rgba(${tone}, 0)`);
        cc.fillStyle = g;
        cc.fillRect(-rx, -rx, rx * 2, rx * 2);
        cc.restore();
      }
      return c;
    };

    let dotSprite = makeDotSprite();
    let starSprite = makeStarSprite();
    let sparkleSprite = makeSparkleSprite();
    let glowSprite = makeGlowSprite();
    let moonSprite = makeMoonSprite();
    let raySprite = makeRaySprite();
    let flakeSprites = [makeFlakeSprite(), makeFlakeSprite(), makeFlakeSprite()];

    // --- particle state ------------------------------------------------------

    const rainLayers: RainLayer[] = [];
    if (kind === 'rain' || kind === 'drizzle' || kind === 'thunder') {
      const cfgs: RainLayerCfg[] =
        kind === 'drizzle'
          ? [
              { count: 30, len: [4, 7], speed: [150, 210], alpha: 0.12, lw: 1 },
              { count: 22, len: [7, 10], speed: [220, 290], alpha: 0.17, lw: 1 },
            ]
          : [
              {
                count: kind === 'thunder' ? 36 : 32,
                len: [7, 11],
                speed: [280, 360],
                alpha: 0.1,
                lw: 1,
              },
              {
                count: kind === 'thunder' ? 28 : 24,
                len: [12, 17],
                speed: [430, 530],
                alpha: 0.15,
                lw: 1,
              },
              {
                count: kind === 'thunder' ? 20 : 17,
                len: [18, 26],
                speed: [600, 730],
                alpha: 0.21,
                lw: 1.5,
              },
            ];
      for (const cfg of cfgs) {
        rainLayers.push({
          cfg,
          drops: Array.from({ length: cfg.count }, () => ({
            x: rand(bandX - 40, width + 40),
            y: rand(0, height),
            len: pick(cfg.len),
            speed: pick(cfg.speed),
          })),
        });
      }
    }

    const snowLayers: SnowLayer[] = [];
    if (kind === 'snow') {
      const cfgs: SnowLayerCfg[] = [
        { count: 16, size: [1.2, 2], speed: [12, 20], alpha: 0.18, dots: true },
        { count: 14, size: [4, 6], speed: [22, 32], alpha: 0.32, dots: false },
        { count: 10, size: [6, 9], speed: [34, 48], alpha: 0.45, dots: false },
      ];
      for (const cfg of cfgs) {
        snowLayers.push({
          cfg,
          flakes: Array.from({ length: cfg.count }, () => ({
            x: rand(bandX, width),
            y: rand(0, height),
            size: pick(cfg.size),
            speed: pick(cfg.speed),
            phase: rand(0, Math.PI * 2),
            phaseSpeed: rand(0.4, 0.9),
            sway: rand(10, 26),
            rot: rand(0, Math.PI * 2),
            rotSpeed: rand(-0.7, 0.7),
            variant: Math.floor(Math.random() * 3),
          })),
        });
      }
    }

    const clouds: CloudForm[] = [];
    if (kind === 'clouds') {
      // staggered lanes: spaced along the band at separate heights so
      // clouds never pile into one dark clump
      for (let i = 0; i < 3; i++) {
        const w = rand(300, 440);
        clouds.push({
          x: bandX + (i / 3) * (bandW + w) - w + rand(-40, 40),
          y: (0.06 + i * 0.13 + rand(-0.02, 0.02)) * height,
          w,
          h: w * rand(0.3, 0.4),
          speed: rand(5, 11),
          alpha: rand(0.35, 0.5),
          sprite: null,
        });
      }
    }
    if (kind === 'fog') {
      for (let i = 0; i < 5; i++) {
        const w = bandW * rand(0.9, 1.3);
        clouds.push({
          x: rand(bandX - w, width),
          y: rand(0.35, 0.85) * height,
          w,
          h: rand(60, 110),
          speed: rand(3, 8),
          alpha: rand(0.3, 0.45),
          sprite: null,
        });
      }
    }
    const cloudSpriteMaker = kind === 'fog' ? makeFogSprite : makeCloudSprite;
    for (const cl of clouds) cl.sprite = cloudSpriteMaker(cl.w, cl.h);

    const rebuildSprites = () => {
      dotSprite = makeDotSprite();
      starSprite = makeStarSprite();
      sparkleSprite = makeSparkleSprite();
      glowSprite = makeGlowSprite();
      moonSprite = makeMoonSprite();
      raySprite = makeRaySprite();
      flakeSprites = [makeFlakeSprite(), makeFlakeSprite(), makeFlakeSprite()];
      for (const cl of clouds) cl.sprite = cloudSpriteMaker(cl.w, cl.h);
    };
    const themeObserver = new MutationObserver(() => {
      dark = isDark();
      tone = toneFor();
      nightTone = nightToneFor();
      rebuildSprites();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const stars: Star[] = [];
    let shoot: ShootingStar | null = null;
    let nextShoot = rand(4, 10);
    if (kind === 'clear-night') {
      for (let i = 0; i < 40; i++) {
        const bright = Math.random() < 0.25;
        stars.push({
          fx: Math.random(),
          fy: Math.random() * 0.85,
          size: bright ? rand(5, 9) : rand(1.4, 2.2),
          base: bright ? 0.45 : 0.3,
          amp: bright ? 0.35 : 0.25,
          phase: rand(0, Math.PI * 2),
          speed: rand(0.4, 1.4),
          bright,
        });
      }
    }

    // broad parallel shafts slanting in from beyond the top edge — the
    // light source itself stays offscreen, only the falling rays are seen
    const rays: Ray[] = [];
    if (kind === 'clear-day') {
      const entries = [0.35, 0.7, 1.02];
      for (const t of entries) {
        rays.push({
          entryT: t + rand(-0.04, 0.04),
          len: height * rand(1.05, 1.35),
          beamW: rand(170, 260),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.08, 0.16),
          jitter: rand(-0.015, 0.015),
        });
      }
    }

    const streaks: Streak[] = [];
    const specks: Speck[] = [];
    if (kind === 'wind') {
      for (let i = 0; i < 10; i++) {
        streaks.push({
          x: rand(bandX - 220, width),
          y: rand(0.05, 0.95) * height,
          len: rand(90, 220),
          speed: rand(150, 300),
          alpha: rand(0.12, 0.2),
          phase: rand(0, Math.PI * 2),
          bow: rand(4, 12),
        });
      }
      for (let i = 0; i < 8; i++) {
        specks.push({
          x: rand(bandX, width),
          y: rand(0, height),
          size: rand(1, 1.8),
          speed: rand(60, 130),
          phase: rand(0, Math.PI * 2),
        });
      }
    }

    // lightning: an actual jagged bolt with a glow pass and flicker envelope
    let bolt: Bolt | null = null;
    let nextBolt = rand(3, 8);
    const makeBolt = (): Bolt => {
      let x = bandX + bandW * rand(0.5, 0.85);
      let y = -10;
      const segs = 7 + Math.floor(Math.random() * 3);
      const totalLen = height * rand(0.45, 0.65);
      const pts: number[][] = [[x, y]];
      for (let i = 0; i < segs; i++) {
        y += (totalLen / segs) * rand(0.7, 1.3);
        x += rand(-30, 26);
        if (x < bandX + fadeW * 0.8) x = bandX + fadeW * 0.8 + rand(0, 24);
        pts.push([x, y]);
      }
      const branch: number[][] = [];
      const forkIdx = 2 + Math.floor(Math.random() * 2);
      let [bx, by] = pts[forkIdx];
      branch.push([bx, by]);
      for (let i = 0; i < 3; i++) {
        by += (totalLen / segs) * rand(0.5, 0.9);
        bx += rand(-34, 6);
        if (bx < bandX + fadeW * 0.8) bx = bandX + fadeW * 0.8 + rand(0, 24);
        branch.push([bx, by]);
      }
      return { pts, branch, age: 0 };
    };
    // strike → dark flicker → afterglow, all within ~half a second
    const boltEnv = (age: number) =>
      age < 0.07
        ? 1
        : age < 0.13
          ? 0.1
          : age < 0.24
            ? 0.9
            : Math.max(0, Math.exp(-(age - 0.24) * 7));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      computeBand();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const strokePath = (pts: number[][]) => {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    };

    // --- render loop --------------------------------------------------------

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const master = Math.min(1, elapsed / 1.2);
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = master;

      if (rainLayers.length > 0) {
        for (const layer of rainLayers) {
          ctx.strokeStyle = `rgba(${tone}, ${layer.cfg.alpha})`;
          ctx.lineWidth = layer.cfg.lw;
          ctx.beginPath();
          for (const d of layer.drops) {
            d.y += d.speed * dt;
            d.x += d.speed * 0.16 * dt;
            if (d.y - d.len > height) {
              d.y = rand(-40, -d.len);
              d.x = rand(bandX - 40, width + 40);
            }
            if (d.x - d.len * 0.16 > width + 40) d.x = bandX - 40;
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x - d.len * 0.16, d.y - d.len);
          }
          ctx.stroke();
        }
      }

      if (kind === 'thunder') {
        nextBolt -= dt;
        if (!bolt && nextBolt <= 0) {
          bolt = makeBolt();
          nextBolt = rand(6, 14);
        }
        if (bolt) {
          bolt.age += dt;
          const env = boltEnv(bolt.age);
          if (bolt.age > 0.8) {
            bolt = null;
          } else if (env > 0.01) {
            // sky glow around the strike origin
            const [ox] = bolt.pts[0];
            const gs = bandW * 1.1;
            ctx.globalAlpha = 0.2 * env * master;
            ctx.drawImage(glowSprite, ox - gs / 2, -gs * 0.55, gs, gs);
            ctx.globalAlpha = master;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // glow pass
            ctx.strokeStyle = `rgba(${tone}, ${0.12 * env})`;
            ctx.lineWidth = 9;
            strokePath(bolt.pts);
            ctx.lineWidth = 6;
            strokePath(bolt.branch);
            // bright core
            ctx.strokeStyle = `rgba(${tone}, ${0.7 * env})`;
            ctx.lineWidth = 1.8;
            strokePath(bolt.pts);
            ctx.strokeStyle = `rgba(${tone}, ${0.5 * env})`;
            ctx.lineWidth = 1.2;
            strokePath(bolt.branch);
          }
        }
      }

      if (snowLayers.length > 0) {
        for (const layer of snowLayers) {
          ctx.globalAlpha = layer.cfg.alpha * master;
          for (const f of layer.flakes) {
            f.phase += f.phaseSpeed * dt;
            f.rot += f.rotSpeed * dt;
            f.y += f.speed * dt;
            f.x += 6 * dt;
            if (f.y - f.size > height) {
              f.y = -f.size * 2;
              f.x = rand(bandX, width);
            }
            if (f.x - f.sway - f.size > width) f.x = bandX - f.size - f.sway;
            const dx = f.x + Math.sin(f.phase) * f.sway;
            if (layer.cfg.dots) {
              ctx.drawImage(
                dotSprite,
                dx - f.size,
                f.y - f.size,
                f.size * 2,
                f.size * 2
              );
            } else {
              ctx.save();
              ctx.translate(dx, f.y);
              ctx.rotate(f.rot);
              ctx.drawImage(
                flakeSprites[f.variant],
                -f.size,
                -f.size,
                f.size * 2,
                f.size * 2
              );
              ctx.restore();
            }
          }
        }
        ctx.globalAlpha = master;
      }

      if (clouds.length > 0) {
        // ambient wash anchored to a corner — elliptical, so it dissolves in
        // every direction instead of cropping at an edge
        ctx.save();
        if (kind === 'clouds') {
          ctx.translate(width * 1.02, -height * 0.06);
          ctx.scale(1, 0.7);
          const r = bandW * 1.5;
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
          g.addColorStop(0, `rgba(${tone}, 0.09)`);
          g.addColorStop(1, `rgba(${tone}, 0)`);
          ctx.fillStyle = g;
          ctx.fillRect(-r, -r, r * 2, r * 2);
        } else {
          ctx.translate(width * 0.94, height * 1.08);
          ctx.scale(1, 0.5);
          const r = bandW * 1.5;
          const a = 0.16 + 0.04 * Math.sin(elapsed * 0.22);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
          g.addColorStop(0, `rgba(${tone}, ${a})`);
          g.addColorStop(1, `rgba(${tone}, 0)`);
          ctx.fillStyle = g;
          ctx.fillRect(-r, -r, r * 2, r * 2);
        }
        ctx.restore();

        for (const cl of clouds) {
          cl.x += cl.speed * dt;
          if (cl.x > width + 60) cl.x = bandX - cl.w - 60;
          if (cl.sprite) {
            ctx.globalAlpha = cl.alpha * master;
            const bob = Math.sin(elapsed * 0.05 + cl.y) * 4;
            ctx.drawImage(cl.sprite, cl.x, cl.y + bob);
          }
        }
        ctx.globalAlpha = master;
      }

      if (kind === 'clear-day') {
        // ambient warmth bleeding in from beyond the top-right corner
        ctx.save();
        ctx.translate(width * 1.05, -height * 0.18);
        ctx.scale(1, 0.85);
        const r = bandW * 1.4;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, `rgba(${tone}, 0.12)`);
        g.addColorStop(1, `rgba(${tone}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.restore();
        // parallel shafts falling in from offscreen — no visible source
        for (const ray of rays) {
          const dir =
            Math.PI * 0.72 +
            ray.jitter +
            Math.sin(elapsed * 0.03 + ray.phase) * 0.008;
          const a = Math.max(
            0.04,
            0.12 + 0.05 * Math.sin(elapsed * ray.speed + ray.phase)
          );
          const ex =
            bandX +
            ray.entryT * bandW +
            Math.sin(elapsed * 0.05 + ray.phase) * 14;
          const back = 240;
          const ax = ex - Math.cos(dir) * back;
          const ay = -Math.sin(dir) * back;
          ctx.save();
          ctx.translate(ax, ay);
          ctx.rotate(dir);
          ctx.globalAlpha = a * master;
          ctx.drawImage(raySprite, 0, -ray.beamW / 2, ray.len, ray.beamW);
          ctx.restore();
        }
        ctx.globalAlpha = master;
      }

      if (kind === 'clear-night') {
        // night sky: an elliptical dusk anchored top-right, moon, crisp stars
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(1, 0.9);
        const r = bandW * 1.6;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, `rgba(${nightTone}, ${dark ? 0.1 : 0.17})`);
        g.addColorStop(1, `rgba(${nightTone}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.restore();

        const moonSize = 150;
        ctx.drawImage(
          moonSprite,
          bandX + bandW * 0.62 - moonSize / 2,
          height * 0.14 - moonSize / 2,
          moonSize,
          moonSize
        );

        for (const st of stars) {
          const tw = 0.5 + 0.5 * Math.sin(st.phase + elapsed * st.speed);
          ctx.globalAlpha = (st.base + st.amp * tw) * master;
          const x = bandX + st.fx * bandW;
          const y = st.fy * height;
          if (st.bright) {
            const sz = st.size * (0.85 + 0.3 * tw);
            ctx.drawImage(sparkleSprite, x - sz, y - sz, sz * 2, sz * 2);
          } else {
            ctx.drawImage(
              starSprite,
              x - st.size,
              y - st.size,
              st.size * 2,
              st.size * 2
            );
          }
        }
        ctx.globalAlpha = master;

        nextShoot -= dt;
        if (!shoot && nextShoot <= 0) {
          const ang = rand(Math.PI * 0.15, Math.PI * 0.3);
          shoot = {
            x: bandX + rand(0.05, 0.55) * bandW,
            y: rand(0.05, 0.3) * height,
            ux: Math.cos(ang),
            uy: Math.sin(ang),
            speed: rand(500, 750),
            life: 0,
            maxLife: rand(0.5, 0.8),
          };
          nextShoot = rand(14, 30);
        }
        if (shoot) {
          shoot.life += dt;
          shoot.x += shoot.ux * shoot.speed * dt;
          shoot.y += shoot.uy * shoot.speed * dt;
          const p = shoot.life / shoot.maxLife;
          if (p >= 1) {
            shoot = null;
          } else {
            const a = Math.sin(Math.PI * p) * 0.5;
            const tail = 110;
            const tx = shoot.x - shoot.ux * tail;
            const ty = shoot.y - shoot.uy * tail;
            const g2 = ctx.createLinearGradient(tx, ty, shoot.x, shoot.y);
            g2.addColorStop(0, `rgba(${tone}, 0)`);
            g2.addColorStop(1, `rgba(${tone}, ${a})`);
            ctx.strokeStyle = g2;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(shoot.x, shoot.y);
            ctx.stroke();
          }
        }
      }

      if (kind === 'wind') {
        ctx.lineWidth = 1;
        for (const s of streaks) {
          s.x += s.speed * dt;
          if (s.x - s.len > width) {
            s.x = bandX - s.len;
            s.y = rand(0.05, 0.95) * height;
          }
          const yw = s.y + Math.sin(elapsed * 0.7 + s.phase) * 10;
          const g = ctx.createLinearGradient(s.x - s.len, 0, s.x, 0);
          g.addColorStop(0, `rgba(${tone}, 0)`);
          g.addColorStop(1, `rgba(${tone}, ${s.alpha})`);
          ctx.strokeStyle = g;
          ctx.beginPath();
          ctx.moveTo(s.x - s.len, yw + s.bow);
          ctx.quadraticCurveTo(s.x - s.len / 2, yw - s.bow, s.x, yw);
          ctx.stroke();
        }
        ctx.globalAlpha = 0.15 * master;
        for (const sp of specks) {
          sp.x += sp.speed * dt;
          if (sp.x - sp.size > width) {
            sp.x = bandX - sp.size;
            sp.y = rand(0, height);
          }
          const y = sp.y + Math.sin(elapsed * 1.2 + sp.phase) * 6;
          ctx.drawImage(
            dotSprite,
            sp.x - sp.size,
            y - sp.size,
            sp.size * 2,
            sp.size * 2
          );
        }
        ctx.globalAlpha = master;
      }

      // Long dissolve toward the content column — nothing ever crops.
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-in';
      const bandMask = ctx.createLinearGradient(bandX, 0, bandX + fadeW, 0);
      bandMask.addColorStop(0, 'rgba(0, 0, 0, 0)');
      bandMask.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = bandMask;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onMediaChange = (e: MediaQueryListEvent) => {
      cancelAnimationFrame(raf);
      if (e.matches) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    desktop.addEventListener('change', onMediaChange);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      desktop.removeEventListener('change', onMediaChange);
      themeObserver.disconnect();
    };
  }, [kind]);

  // Portal to <body>: inside the bottom-controls container the canvas joins
  // that container's stacking context and paints over the icons themselves.
  // At the document root, z-30 keeps it under the z-40 sidebar and controls.
  if (typeof document === 'undefined') return null;
  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden md:block"
    />,
    document.body
  );
};

export default WeatherEffects;
