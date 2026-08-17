'use client';

import React, { useEffect, useState } from 'react';
import { LightFrame } from './light';

// ── Mac: a browser desktop with a bouncing dock ──

export function MacPreview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-end border border-zinc-200 bg-zinc-100">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-zinc-200 bg-white/70 px-2 py-0.5 text-[6px] text-zinc-500">
        <span>Finder</span><span>12:47</span>
      </div>
      <div className="mx-auto mb-2 flex items-end gap-1.5 rounded-lg border border-zinc-200 bg-white/80 px-2 py-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="h-3.5 w-3.5 rounded-[5px] bg-zinc-400"
            style={{ animation: `dockBounce 2.4s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
      <style>{`@keyframes dockBounce { 0%,80%,100%{ transform: translateY(0) } 90%{ transform: translateY(-4px) } }`}</style>
    </div>
  );
}

// ── Quire: PDF page with an in-place text edit ──

export function QuirePreview() {
  return (
    <LightFrame>
      <div className="flex-1 space-y-1.5 px-4 py-3">
        <div className="h-1 w-3/4 rounded bg-zinc-200" />
        <div className="h-1 w-full rounded bg-zinc-200" />
        <div className="relative h-1 w-5/6 rounded bg-blue-200">
          <span className="absolute -right-1 top-1/2 h-2.5 w-px -translate-y-1/2 bg-blue-500" style={{ animation: 'quireCaret 1s step-start infinite' }} />
        </div>
        <div className="h-1 w-2/3 rounded bg-zinc-200" />
        <div className="pt-2">
          <svg width="34" height="12" viewBox="0 0 34 12" className="text-zinc-400">
            <path d="M1 8 Q6 2 11 8 T21 8 T31 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <style>{`@keyframes quireCaret { 50% { opacity: 0 } }`}</style>
    </LightFrame>
  );
}

// ── Still Flying: orbit rings with spacecraft dots ──

export function SpacePreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center border border-zinc-200 bg-zinc-50">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {[10, 16, 24, 33].map((r) => (
          <span key={r} className="absolute rounded-full border border-zinc-200" style={{ width: r * 2, height: r * 2 }} />
        ))}
        <span className="absolute h-1.5 w-1.5 rounded-full bg-amber-500" />
        <span className="absolute h-1 w-1 rounded-full bg-zinc-500" style={{ animation: 'orbit1 4s linear infinite', top: 10 - 1, left: '50%' }} />
        <span className="absolute h-1 w-1 rounded-full bg-zinc-500" style={{ animation: 'orbit2 6.5s linear infinite reverse', top: 16 - 1, left: '50%' }} />
        <span className="absolute h-1 w-1 rounded-full bg-zinc-500" style={{ animation: 'orbit3 9s linear infinite', top: 24 - 1, left: '50%' }} />
      </div>
      <style>{`
        @keyframes orbit1 { from{ transform: rotate(0deg) translateX(10px) rotate(0deg) } to{ transform: rotate(360deg) translateX(10px) rotate(-360deg) } }
        @keyframes orbit2 { from{ transform: rotate(0deg) translateX(16px) rotate(0deg) } to{ transform: rotate(360deg) translateX(16px) rotate(-360deg) } }
        @keyframes orbit3 { from{ transform: rotate(0deg) translateX(24px) rotate(0deg) } to{ transform: rotate(360deg) translateX(24px) rotate(-360deg) } }
      `}</style>
    </div>
  );
}

// ── Languages: a timeline scrolling back through history ──

const ERAS = ['2020 CE', '1440 CE', '1200 BCE', '3200 BCE'];
export function LanguagesLatPreview() {
  return (
    <div className="absolute inset-0 flex items-center px-4">
      <div className="relative w-full">
        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-zinc-200" />
        <div className="space-y-3">
          {ERAS.map((e, i) => (
            <div key={e} className="flex items-center gap-2">
              <span className={`relative z-10 h-3 w-3 rounded-full border-2 ${i === 0 ? 'border-zinc-700 bg-zinc-700' : 'border-zinc-300 bg-white'}`} />
              <span className="font-mono text-[8px] text-zinc-500">{e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Margin: minimal reading page, nothing competing with the text ──

export function MarginPreview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-8">
      <div className="h-1 w-1/3 rounded bg-zinc-300" />
      <div className="h-[3px] w-full rounded bg-zinc-200" />
      <div className="h-[3px] w-full rounded bg-zinc-200" />
      <div className="h-[3px] w-4/5 rounded bg-zinc-200" />
      <div className="h-[3px] w-full rounded bg-zinc-200" />
      <div className="h-[3px] w-2/3 rounded bg-zinc-200" />
    </div>
  );
}

// ── Contests: calendar with events and a pulsing notification bell ──

export function ContestsPreview() {
  const dots = new Set([4, 9, 15, 22]);
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-2.5 py-1.5">
        <span className="text-[8px] font-medium text-zinc-600">This week</span>
        <span className="relative flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[6px] text-white" style={{ animation: 'bellRing 2s ease-in-out infinite' }}>3</span>
      </div>
      <div className="grid flex-1 grid-cols-7 gap-1 p-2">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} className={`flex aspect-square items-center justify-center rounded-sm text-[6px] ${dots.has(i) ? 'bg-blue-500 text-white' : 'text-zinc-300'}`}>
            {dots.has(i) ? '' : '·'}
          </span>
        ))}
      </div>
      <style>{`@keyframes bellRing { 0%,80%,100%{ transform: rotate(0) } 85%{ transform: rotate(-12deg) } 90%{ transform: rotate(10deg) } 95%{ transform: rotate(-6deg) } }`}</style>
    </LightFrame>
  );
}

// ── API Clinic: request builder with a response status arriving ──

export function ApiClinicPreview() {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setSent((s) => !s), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <div className="flex items-center gap-1 border-b border-zinc-100 px-2 py-1.5">
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[7px] font-bold text-emerald-700">GET</span>
        <span className="min-w-0 flex-1 truncate font-mono text-[7.5px] text-zinc-500">/api/users/42</span>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <span className={`rounded px-2 py-1 font-mono text-[9px] font-medium transition-opacity duration-300 ${sent ? 'bg-emerald-100 text-emerald-700 opacity-100' : 'opacity-0'}`}>
          200 OK · 84ms
        </span>
      </div>
    </LightFrame>
  );
}

// ── DSA Roadmap: connected checkpoint tree ──

const ROADMAP_NODES = [{ done: true }, { done: true }, { done: true }, { done: false }, { done: false }];
export function DsaRoadmapPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center">
        {ROADMAP_NODES.map((n, i) => (
          <React.Fragment key={i}>
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 text-[7px] font-bold ${n.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-zinc-400'}`}>
              {n.done ? '✓' : i + 1}
            </span>
            {i < ROADMAP_NODES.length - 1 && <span className={`h-0.5 w-4 ${n.done ? 'bg-emerald-500' : 'bg-zinc-200'}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── CodeChef MREC: contest leaderboard ──

const LEADERBOARD = [{ n: 'Priya R.', s: 2840 }, { n: 'Rohan P.', s: 2715 }, { n: 'Alex M.', s: 2603 }];
export function CodechefMrecPreview() {
  return (
    <LightFrame>
      <div className="border-b border-zinc-100 px-2.5 py-1.5 text-[8px] font-medium text-zinc-600">Chapter Contest · 1,024 joined</div>
      <div className="flex-1 divide-y divide-zinc-100">
        {LEADERBOARD.map((r, i) => (
          <div key={r.n} className="flex items-center gap-2 px-2.5 py-1">
            <span className="w-3 text-[7px] font-bold text-zinc-400">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-[8px] text-zinc-700">{r.n}</span>
            <span className="font-mono text-[7px] text-zinc-400">{r.s}</span>
          </div>
        ))}
      </div>
    </LightFrame>
  );
}

// ── Dekho Car: booking state-machine stepper ──

const BOOKING_STATES = ['Pending', 'Confirmed', 'Active', 'Returned'];
export function DekhoCarPreview() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % BOOKING_STATES.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-3">
      <span className="text-[16px]">🚗</span>
      <div className="flex w-full items-center justify-between">
        {BOOKING_STATES.map((s, si) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full transition-colors ${si <= i ? 'bg-blue-500' : 'bg-zinc-200'}`} />
            <span className={`text-[6px] transition-colors ${si === i ? 'font-semibold text-zinc-700' : 'text-zinc-400'}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── QR Generator: pixel grid that regenerates ──

export function QrGeneratorPreview() {
  const [seed, setSeed] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setSeed((s) => s + 1), 2200);
    return () => clearInterval(id);
  }, []);
  const cells = Array.from({ length: 49 }, (_, i) => {
    const corner = (i < 21 && i % 7 < 3) || (i % 49 >= 28 && i % 7 < 3) || (i % 7 >= 4 && i < 21);
    return corner ? 1 : ((i * 7 + seed * 13) % 5 === 0 ? 1 : 0);
  });
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="grid grid-cols-7 gap-[1.5px] rounded border border-zinc-200 bg-white p-2">
        {cells.map((v, i) => <span key={i} className={`h-1.5 w-1.5 ${v ? 'bg-zinc-800' : 'bg-white'}`} />)}
      </div>
    </div>
  );
}

// ── YouTube Thumbnail Downloader: thumbnail with a download pulse ──

export function YoutubeThumbnailsPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex aspect-video w-3/4 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100">
        <span className="flex h-4 w-6 items-center justify-center rounded-[4px] bg-red-500">
          <span className="ml-0.5 h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-white" />
        </span>
        <span
          className="absolute -bottom-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white"
          style={{ animation: 'ytDownload 2s ease-in-out infinite' }}
        >
          ↓
        </span>
      </div>
      <style>{`@keyframes ytDownload { 0%,60%{ transform: translateY(0); opacity: .5 } 80%{ transform: translateY(2px); opacity: 1 } 100%{ transform: translateY(0); opacity: .5 } }`}</style>
    </div>
  );
}

// ── MCU Timeline: horizontal strip of era blocks, one highlighted ──

export function McuTimelinePreview() {
  const [hi, setHi] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHi((h) => (h + 1) % 6), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={`rounded-sm transition-all duration-300 ${i === hi ? 'bg-zinc-600' : 'bg-zinc-300'}`}
          style={{ width: 14, height: i === hi ? 40 : 28 }}
        />
      ))}
    </div>
  );
}

// ── Portfolio v4: Win95 desktop with draggable windows ──

export function PortfolioV4Preview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-end border border-zinc-200 bg-zinc-100 p-2">
      <div className="mb-2 flex gap-2">
        <div className="w-16 border border-zinc-400 bg-white shadow-sm">
          <div className="bg-zinc-600 px-1 py-0.5 text-[6px] text-white">About.exe</div>
        </div>
        <div className="w-14 translate-y-1 border border-zinc-400 bg-white shadow-sm">
          <div className="bg-zinc-600 px-1 py-0.5 text-[6px] text-white">Work</div>
        </div>
      </div>
      <div className="flex items-center gap-1 border-t border-zinc-300 bg-white px-1 py-0.5">
        <span className="rounded-sm border border-zinc-300 bg-zinc-100 px-1 text-[6px] font-bold text-zinc-600">Start</span>
      </div>
    </div>
  );
}

// ── Portfolio v3: typography-first, whitespace as the design ──

export function PortfolioV3Preview() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
      <span className="text-[13px] font-medium tracking-tight text-zinc-800">Rohan</span>
      <span className="text-[8px] text-zinc-400">Software Engineer</span>
      <span className="mt-2 text-zinc-300" style={{ animation: 'v3ArrowBob 1.6s ease-in-out infinite' }}>↓</span>
      <style>{`@keyframes v3ArrowBob { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(3px) } }`}</style>
    </div>
  );
}

// ── Portfolio v2: GSAP-style staggered reveal with a cursor trail ──

export function PortfolioV2Preview() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-1.5 rounded bg-zinc-300"
          style={{ width: 40 - i * 8, animation: `v2Reveal 2.2s ease-out ${i * 0.2}s infinite` }}
        />
      ))}
      <span className="absolute h-2 w-2 rounded-full bg-blue-300" style={{ animation: 'v2Cursor 2.2s ease-in-out infinite' }} />
      <style>{`
        @keyframes v2Reveal { 0%{ transform: translateY(6px); opacity:0 } 25%,80%{ transform: translateY(0); opacity:1 } 100%{ transform: translateY(0); opacity:1 } }
        @keyframes v2Cursor { 0%{ transform: translate(-20px,10px) } 50%{ transform: translate(18px,-6px) } 100%{ transform: translate(-20px,10px) } }
      `}</style>
    </div>
  );
}

// ── Portfolio v1: anime-inspired first portfolio ──

export function PortfolioV1Preview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center border border-zinc-200 bg-zinc-50">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[14px] text-zinc-400" style={{ animation: 'v1Twinkle 2s ease-in-out infinite' }}>✦</span>
        <span className="text-[9px] font-semibold text-zinc-700">Rohan.dev</span>
      </div>
      <style>{`@keyframes v1Twinkle { 0%,100%{ opacity:.5; transform: scale(.9) rotate(0) } 50%{ opacity:1; transform: scale(1.1) rotate(15deg) } }`}</style>
    </div>
  );
}
