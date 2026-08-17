'use client';

import React, { useEffect, useState } from 'react';
import { LightFrame } from './light';

// ── Mac: a browser desktop — menu bar, dock, and a floating window ──

const DOCK_APPS = [
  { c: '#60a5fa', shape: 'rounded-[6px]' },
  { c: '#34d399', shape: 'rounded-full' },
  { c: '#f472b6', shape: 'rounded-[6px]' },
  { c: '#fbbf24', shape: 'rounded-full' },
  { c: '#a78bfa', shape: 'rounded-[6px]' },
];
export function MacPreview() {
  const [clock, setClock] = useState('12:47');
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(`${String(d.getHours() % 12 || 12)}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 15000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col justify-end overflow-hidden border border-zinc-200 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:border-neutral-800 dark:from-neutral-800 dark:to-neutral-900">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-zinc-200 bg-white/70 px-2 py-0.5 text-[6px] text-zinc-500 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-400">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-neutral-400" />
          Finder
        </span>
        <span>{clock}</span>
      </div>
      <div
        className="absolute left-3 top-4 w-16 overflow-hidden rounded border border-white/60 bg-white/90 shadow-sm dark:border-neutral-700 dark:bg-neutral-950/90"
        style={{ animation: 'macWinFloat 5s ease-in-out infinite' }}
      >
        <div className="flex gap-0.5 bg-zinc-100 px-1 py-0.5 dark:bg-neutral-900">
          {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => <span key={c} className={`h-1 w-1 rounded-full ${c}`} />)}
        </div>
        <div className="space-y-0.5 p-1">
          <div className="h-0.5 w-full rounded bg-zinc-300 dark:bg-neutral-700" />
          <div className="h-0.5 w-3/4 rounded bg-zinc-300 dark:bg-neutral-700" />
        </div>
      </div>
      <div className="mx-auto mb-2 flex items-end gap-1.5 rounded-lg border border-white/60 bg-white/80 px-2 py-1 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
        {DOCK_APPS.map((a, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 ${a.shape}`}
            style={{ backgroundColor: a.c, animation: `dockBounce 2.4s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
      <style>{`
        @keyframes dockBounce { 0%,80%,100%{ transform: translateY(0) } 90%{ transform: translateY(-4px) } }
        @keyframes macWinFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-2px) } }
      `}</style>
    </div>
  );
}

// ── Quire: PDF page — toolbar, thumbnails, in-place edit, signature ──

export function QuirePreview() {
  return (
    <LightFrame>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-6 flex-col items-center gap-1 border-r border-zinc-100 bg-zinc-50 py-2 dark:border-neutral-800 dark:bg-neutral-900">
          <span className="h-4 w-3 rounded-[2px] border border-zinc-400 bg-white dark:border-neutral-500 dark:bg-neutral-950" />
          <span className="h-4 w-3 rounded-[2px] border border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/40" />
          <span className="h-4 w-3 rounded-[2px] border border-zinc-200 bg-white dark:border-neutral-700 dark:bg-neutral-950" />
        </div>
        <div className="flex-1 space-y-1.5 px-3 py-2.5">
          <div className="h-1 w-3/4 rounded bg-zinc-200 dark:bg-neutral-700" />
          <div className="h-1 w-full rounded bg-zinc-200 dark:bg-neutral-700" />
          <div className="relative h-1 w-5/6 rounded bg-blue-200 dark:bg-blue-900/50">
            <span className="absolute -right-1 top-1/2 h-2.5 w-px -translate-y-1/2 bg-blue-500" style={{ animation: 'quireCaret 1s step-start infinite' }} />
          </div>
          <div className="h-1 w-2/3 rounded bg-zinc-200 dark:bg-neutral-700" />
          <div className="h-1 w-1/2 rounded bg-zinc-200 dark:bg-neutral-700" />
          <div className="pt-1.5">
            <svg width="34" height="12" viewBox="0 0 34 12" className="text-zinc-400 dark:text-neutral-500">
              <path d="M1 8 Q6 2 11 8 T21 8 T31 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-zinc-100 px-2 py-1 dark:border-neutral-800">
        {['T', '🖊', '🖼'].map((icon) => (
          <span key={icon} className="flex h-4 w-4 items-center justify-center rounded text-[7px] text-zinc-400 dark:text-neutral-500">{icon}</span>
        ))}
        <span className="ml-auto text-[7px] text-zinc-400 dark:text-neutral-500">1 / 3</span>
      </div>
      <style>{`@keyframes quireCaret { 50% { opacity: 0 } }`}</style>
    </LightFrame>
  );
}

// ── Still Flying: orbit rings, a starfield, and drifting spacecraft ──

const STARS = Array.from({ length: 14 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 100, s: (i % 3) + 1 }));
export function SpacePreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden border border-zinc-200 bg-zinc-50 dark:border-neutral-800 dark:bg-neutral-900">
      {STARS.map((s, i) => (
        <span key={i} className="absolute rounded-full bg-zinc-400/60 dark:bg-neutral-500/60" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s }} />
      ))}
      <div className="relative flex h-24 w-24 items-center justify-center">
        {[9, 15, 22, 30, 40].map((r) => (
          <span key={r} className="absolute rounded-full border border-zinc-200 dark:border-neutral-700" style={{ width: r * 2, height: r * 2 }} />
        ))}
        <span className="absolute h-2 w-2 rounded-full bg-amber-500" style={{ boxShadow: '0 0 6px rgba(245,158,11,0.5)' }} />
        <span className="absolute h-1 w-1 rounded-full bg-sky-500 dark:bg-sky-400" style={{ animation: 'orbit1 3.5s linear infinite', top: 9 - 1, left: '50%' }} />
        <span className="absolute h-1 w-1 rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ animation: 'orbit2 5.5s linear infinite reverse', top: 15 - 1, left: '50%' }} />
        <span className="absolute h-[3px] w-[3px] rounded-full bg-zinc-500 dark:bg-neutral-400" style={{ animation: 'orbit3 8s linear infinite', top: 22 - 1.5, left: '50%' }} />
        <span className="absolute h-1 w-1 rounded-full bg-red-500 dark:bg-red-400" style={{ animation: 'orbit4 12s linear infinite reverse', top: 30 - 1, left: '50%' }} />
      </div>
      <style>{`
        @keyframes orbit1 { from{ transform: rotate(0deg) translateX(9px) rotate(0deg) } to{ transform: rotate(360deg) translateX(9px) rotate(-360deg) } }
        @keyframes orbit2 { from{ transform: rotate(0deg) translateX(15px) rotate(0deg) } to{ transform: rotate(360deg) translateX(15px) rotate(-360deg) } }
        @keyframes orbit3 { from{ transform: rotate(0deg) translateX(22px) rotate(0deg) } to{ transform: rotate(360deg) translateX(22px) rotate(-360deg) } }
        @keyframes orbit4 { from{ transform: rotate(0deg) translateX(30px) rotate(0deg) } to{ transform: rotate(360deg) translateX(30px) rotate(-360deg) } }
      `}</style>
    </div>
  );
}

// ── Languages: a timeline auto-scrubbing back through history with facts ──

const ERAS = [
  { e: '2020 CE', fact: '7,000+ living languages' },
  { e: '1440 CE', fact: 'Printing press spreads literacy' },
  { e: '1200 BCE', fact: 'Phoenician alphabet spreads' },
  { e: '3200 BCE', fact: 'Cuneiform: earliest writing' },
];
export function LanguagesLatPreview() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ERAS.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex items-center px-4">
      <div className="relative w-full">
        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-zinc-200 dark:bg-neutral-700" />
        <div className="space-y-3">
          {ERAS.map((era, ei) => (
            <div key={era.e} className="flex items-center gap-2">
              <span className={`relative z-10 h-3 w-3 rounded-full border-2 transition-colors duration-500 ${ei === i ? 'border-zinc-700 bg-zinc-700 dark:border-paper dark:bg-paper' : 'border-zinc-300 bg-white dark:border-neutral-600 dark:bg-neutral-950'}`} />
              <span className={`font-mono text-[8px] transition-colors duration-500 ${ei === i ? 'font-medium text-zinc-800 dark:text-paper' : 'text-zinc-400 dark:text-neutral-500'}`}>{era.e}</span>
            </div>
          ))}
        </div>
        <p className="mt-1.5 pl-5 text-[7px] text-zinc-400 transition-opacity dark:text-neutral-500">{ERAS[i].fact}</p>
      </div>
    </div>
  );
}

// ── Margin: minimal reading page with a slow reading highlight and progress ──

const MARGIN_LINES = [100, 100, 80, 100, 65, 100, 90];
export function MarginPreview() {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLine((l) => (l + 1) % MARGIN_LINES.length), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-8">
      <div className="mb-1 h-1 w-1/3 rounded bg-zinc-300 dark:bg-neutral-600" />
      {MARGIN_LINES.map((w, i) => (
        <div key={i} className={`h-[3px] rounded transition-colors duration-500 ${i === line ? 'bg-blue-300 dark:bg-blue-800' : 'bg-zinc-200 dark:bg-neutral-800'}`} style={{ width: `${w}%` }} />
      ))}
      <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-neutral-800">
        <div className="h-full bg-zinc-400 transition-all duration-700 dark:bg-neutral-500" style={{ width: `${((line + 1) / MARGIN_LINES.length) * 100}%` }} />
      </div>
    </div>
  );
}

// ── Contests: calendar with per-platform colored events and a countdown ──

const CONTEST_DOTS: Record<number, string> = { 4: 'bg-red-500', 9: 'bg-amber-500', 15: 'bg-blue-500', 22: 'bg-violet-500' };
export function ContestsPreview() {
  const [secs, setSecs] = useState(3 * 3600 + 42 * 60);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s <= 0 ? 3 * 3600 : s - 60)), 1500);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-2.5 py-1.5 dark:border-neutral-800">
        <span className="text-[8px] font-medium text-zinc-600 dark:text-neutral-400">Next: {h}h {m}m</span>
        <span className="relative flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[6px] text-white" style={{ animation: 'bellRing 2.5s ease-in-out infinite' }}>4</span>
      </div>
      <div className="grid flex-1 grid-cols-7 gap-1 p-2">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} className={`flex aspect-square items-center justify-center rounded-sm text-[6px] ${CONTEST_DOTS[i] ? `${CONTEST_DOTS[i]} text-white` : 'text-zinc-300 dark:text-neutral-700'}`}>
            {CONTEST_DOTS[i] ? '' : '·'}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-zinc-100 px-2.5 py-1 dark:border-neutral-800">
        {[['bg-red-500', 'CF'], ['bg-amber-500', 'LC'], ['bg-blue-500', 'AC'], ['bg-violet-500', 'HR']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-0.5 text-[6px] text-zinc-400 dark:text-neutral-500"><span className={`h-1 w-1 rounded-full ${c}`} />{l}</span>
        ))}
      </div>
      <style>{`@keyframes bellRing { 0%,80%,100%{ transform: rotate(0) } 85%{ transform: rotate(-12deg) } 90%{ transform: rotate(10deg) } 95%{ transform: rotate(-6deg) } }`}</style>
    </LightFrame>
  );
}

// ── API Clinic: request builder with a real-looking JSON response ──

const API_STEPS = ['idle', 'sending', 'done'] as const;
export function ApiClinicPreview() {
  const [step, setStep] = useState<typeof API_STEPS[number]>('idle');
  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => API_STEPS[(API_STEPS.indexOf(s) + 1) % API_STEPS.length]);
    }, 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <div className="flex items-center gap-1 border-b border-zinc-100 px-2 py-1.5 dark:border-neutral-800">
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[7px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">GET</span>
        <span className="min-w-0 flex-1 truncate font-mono text-[7.5px] text-zinc-500 dark:text-neutral-400">/api/users/42</span>
        {step === 'sending' && <span className="h-1.5 w-1.5 animate-spin rounded-full border border-zinc-300 border-t-zinc-600 dark:border-neutral-600 dark:border-t-neutral-300" />}
      </div>
      <div className="flex-1 px-2.5 py-2 font-mono text-[7px] leading-[1.6]">
        {step === 'done' ? (
          <>
            <p className="text-emerald-600 dark:text-emerald-500">200 OK · 84ms</p>
            <p className="text-zinc-400 dark:text-neutral-500">{'{'}</p>
            <p className="pl-2 text-zinc-500 dark:text-neutral-400">&quot;id&quot;: <span className="text-amber-600 dark:text-amber-400">42</span>,</p>
            <p className="pl-2 text-zinc-500 dark:text-neutral-400">&quot;name&quot;: <span className="text-blue-600 dark:text-blue-400">&quot;Rohan&quot;</span></p>
            <p className="text-zinc-400 dark:text-neutral-500">{'}'}</p>
          </>
        ) : (
          <p className="text-zinc-300 dark:text-neutral-600">waiting for response…</p>
        )}
      </div>
    </LightFrame>
  );
}

// ── DSA Roadmap: labeled topics with a progress readout ──

const ROADMAP_NODES = [
  { label: 'Arrays', done: true },
  { label: 'Trees', done: true },
  { label: 'Graphs', done: true },
  { label: 'DP', done: false },
  { label: 'Systems', done: false },
];
export function DsaRoadmapPreview() {
  const doneCount = ROADMAP_NODES.filter((n) => n.done).length;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-2">
      <div className="flex items-center">
        {ROADMAP_NODES.map((n, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-0.5">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 text-[7px] font-bold ${n.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-zinc-400 dark:border-neutral-600 dark:text-neutral-500'}`}>
                {n.done ? '✓' : i + 1}
              </span>
              <span className="text-[5.5px] text-zinc-400 dark:text-neutral-500">{n.label}</span>
            </div>
            {i < ROADMAP_NODES.length - 1 && <span className={`mb-2.5 h-0.5 w-3 ${n.done ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-neutral-700'}`} />}
          </React.Fragment>
        ))}
      </div>
      <span className="text-[7px] text-zinc-400 dark:text-neutral-500">{doneCount}/{ROADMAP_NODES.length} topics complete</span>
    </div>
  );
}

// ── CodeChef MREC: leaderboard with a live-ish score tick ──

const LEADERBOARD = [
  { n: 'Priya R.', s: 2840, d: 'up' as const },
  { n: 'Rohan P.', s: 2715, d: 'same' as const },
  { n: 'Alex M.', s: 2603, d: 'down' as const },
];
export function CodechefMrecPreview() {
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-2.5 py-1.5 dark:border-neutral-800">
        <span className="text-[8px] font-medium text-zinc-600 dark:text-neutral-400">Chapter Contest</span>
        <span className="flex items-center gap-1 text-[6px] text-emerald-600 dark:text-emerald-500"><span className="h-1 w-1 rounded-full bg-emerald-500" style={{ animation: 'ghPulse2 1.6s ease-in-out infinite' }} />live</span>
      </div>
      <div className="flex-1 divide-y divide-zinc-100 dark:divide-neutral-800">
        {LEADERBOARD.map((r, i) => (
          <div key={r.n} className="flex items-center gap-2 px-2.5 py-1">
            <span className="w-3 text-[7px] font-bold text-zinc-400 dark:text-neutral-500">{i + 1}</span>
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-200 text-[6px] font-bold text-zinc-600 dark:bg-neutral-700 dark:text-neutral-300">{r.n[0]}</span>
            <span className="min-w-0 flex-1 truncate text-[8px] text-zinc-700 dark:text-neutral-300">{r.n}</span>
            <span className={`text-[6px] ${r.d === 'up' ? 'text-emerald-500' : r.d === 'down' ? 'text-red-500' : 'text-zinc-300 dark:text-neutral-600'}`}>{r.d === 'up' ? '▲' : r.d === 'down' ? '▼' : '–'}</span>
            <span className="font-mono text-[7px] text-zinc-400 dark:text-neutral-500">{r.s}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-100 px-2.5 py-1 text-[6px] text-zinc-400 dark:border-neutral-800 dark:text-neutral-500">1,024 participants</div>
      <style>{`@keyframes ghPulse2 { 0%,100%{ opacity: 1 } 50%{ opacity: .3 } }`}</style>
    </LightFrame>
  );
}

// ── Dekho Car: booking stepper with a live price readout ──

const BOOKING_STATES = [
  { s: 'Pending', price: '$0' },
  { s: 'Confirmed', price: '$142' },
  { s: 'Active', price: '$142' },
  { s: 'Returned', price: '$142' },
];
export function DekhoCarPreview() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % BOOKING_STATES.length), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3">
      <div className="flex items-center gap-2">
        <span className="text-[16px]">🚗</span>
        <span className="font-mono text-[10px] font-semibold text-zinc-700 dark:text-neutral-300">{BOOKING_STATES[i].price}</span>
      </div>
      <div className="flex w-full items-center justify-between">
        {BOOKING_STATES.map((s, si) => (
          <div key={s.s} className="flex flex-1 flex-col items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full transition-colors ${si <= i ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-neutral-700'}`} />
            <span className={`text-[6px] transition-colors ${si === i ? 'font-semibold text-zinc-700 dark:text-neutral-300' : 'text-zinc-400 dark:text-neutral-500'}`}>{s.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── QR Generator: cycling through real preset payloads ──

const QR_PRESETS = ['rohan.run', 'hi@rohan.run', 'wifi:HomeNet'];
function seedFromText(text: string) {
  let seed = 0;
  for (const ch of text) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  return seed;
}
export function QrGeneratorPreview() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % QR_PRESETS.length), 2200);
    return () => clearInterval(id);
  }, []);
  const seed = seedFromText(QR_PRESETS[i]);
  const cells = Array.from({ length: 49 }, (_, c) => {
    const corner = (c < 21 && c % 7 < 3) || (c % 49 >= 28 && c % 7 < 3) || (c % 7 >= 4 && c < 21);
    return corner ? 1 : ((c * 7 + seed) % 5 === 0 ? 1 : 0);
  });
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
      <div className="grid grid-cols-7 gap-[1.5px] rounded border border-zinc-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-950">
        {cells.map((v, ci) => <span key={ci} className={`h-1.5 w-1.5 ${v ? 'bg-zinc-800 dark:bg-neutral-200' : 'bg-white dark:bg-neutral-950'}`} />)}
      </div>
      <span className="font-mono text-[7px] text-zinc-400 dark:text-neutral-500">{QR_PRESETS[i]}</span>
    </div>
  );
}

// ── YouTube Thumbnail Downloader: URL bar + a resolution grabbing ──

export function YoutubeThumbnailsPreview() {
  const [grabbed, setGrabbed] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setGrabbed((g) => !g), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4">
      <div className="w-full truncate rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-center font-mono text-[6px] text-zinc-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-500">
        youtube.com/watch?v=dQw4w9WgXcQ
      </div>
      <div className="relative flex aspect-video w-3/4 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 dark:border-neutral-800 dark:bg-neutral-800">
        <span className="flex h-4 w-6 items-center justify-center rounded-[4px] bg-red-500">
          <span className="ml-0.5 h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-white" />
        </span>
        <span
          className={`absolute -bottom-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white transition-colors ${grabbed ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-neutral-600'}`}
        >
          {grabbed ? '✓' : '↓'}
        </span>
      </div>
      <span className="text-[6px] text-zinc-400 dark:text-neutral-500">{grabbed ? 'maxresdefault.jpg saved' : 'fetching thumbnail…'}</span>
    </div>
  );
}

// ── MCU Timeline: phase-colored blocks with year labels ──

const MCU_ERA = [
  { c: '#1e3a8a', y: '1943' }, { c: '#1e3a8a', y: '1995' }, { c: '#166534', y: '2010' },
  { c: '#166534', y: '2011' }, { c: '#581c87', y: '2012' }, { c: '#9a3412', y: '2018' },
];
export function McuTimelinePreview() {
  const [hi, setHi] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHi((h) => (h + 1) % MCU_ERA.length), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3">
      <div className="flex items-end justify-center gap-1">
        {MCU_ERA.map((m, i) => (
          <div
            key={i}
            className="rounded-sm transition-all duration-300"
            style={{ backgroundColor: m.c, opacity: i === hi ? 1 : 0.45, width: 14, height: i === hi ? 40 : 28 }}
          />
        ))}
      </div>
      <span className="font-mono text-[7px] text-zinc-400 dark:text-neutral-500">{MCU_ERA[hi].y} · story order</span>
    </div>
  );
}

// ── Portfolio v4: Win95 desktop with a blinking cursor and CRT glow ──

export function PortfolioV4Preview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-end overflow-hidden border border-zinc-200 bg-zinc-100 p-2 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="absolute right-3 top-3 flex flex-col items-center gap-0.5">
        <span className="h-3 w-3 rounded-sm bg-zinc-400 dark:bg-neutral-600" />
        <span className="text-[5px] text-zinc-500 dark:text-neutral-400">My PC</span>
      </div>
      <div className="mb-2 flex gap-2">
        <div className="w-16 border border-zinc-400 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-950" style={{ animation: 'winOpen 4s ease-in-out infinite' }}>
          <div className="bg-zinc-600 px-1 py-0.5 text-[6px] text-white dark:bg-neutral-700">About.exe</div>
          <div className="flex items-center gap-0.5 p-1">
            <span className="text-[6px] text-zinc-600 dark:text-neutral-300">Hi, I&apos;m R</span>
            <span className="h-2 w-px bg-zinc-600 dark:bg-neutral-300" style={{ animation: 'blink 1s step-start infinite' }} />
          </div>
        </div>
        <div className="w-14 translate-y-1 border border-zinc-400 bg-white shadow-sm dark:border-neutral-600 dark:bg-neutral-950">
          <div className="bg-zinc-600 px-1 py-0.5 text-[6px] text-white dark:bg-neutral-700">Work</div>
        </div>
      </div>
      <div className="flex items-center gap-1 border-t border-zinc-300 bg-white px-1 py-0.5 dark:border-neutral-700 dark:bg-neutral-950">
        <span className="rounded-sm border border-zinc-300 bg-zinc-100 px-1 text-[6px] font-bold text-zinc-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">Start</span>
      </div>
      <style>{`
        @keyframes winOpen { 0%,90%,100%{ transform: scale(1) } 95%{ transform: scale(1.03) } }
        @keyframes blink { 50% { opacity: 0 } }
      `}</style>
    </div>
  );
}

// ── Portfolio v3: typography-first hero with section dots ──

export function PortfolioV3Preview() {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDot((d) => (d + 1) % 3), 1300);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
      <span className="text-[13px] font-medium tracking-tight text-zinc-800 dark:text-paper">Rohan</span>
      <span className="text-[8px] text-zinc-400 dark:text-neutral-500">Software Engineer</span>
      <div className="mt-2 flex gap-1">
        {[0, 1, 2].map((d) => <span key={d} className={`h-1 w-1 rounded-full transition-colors ${d === dot ? 'bg-zinc-600 dark:bg-neutral-300' : 'bg-zinc-200 dark:bg-neutral-700'}`} />)}
      </div>
    </div>
  );
}

// ── Portfolio v2: GSAP-style staggered reveal, more elements, cursor trail ──

export function PortfolioV2Preview() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 overflow-hidden">
      <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-neutral-700" style={{ animation: 'v2Reveal 2.6s ease-out 0s infinite' }} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-1.5 rounded bg-zinc-300 dark:bg-neutral-600"
          style={{ width: 40 - i * 8, animation: `v2Reveal 2.6s ease-out ${0.25 + i * 0.2}s infinite` }}
        />
      ))}
      <div className="mt-1 h-2.5 w-10 rounded-full border border-zinc-300 dark:border-neutral-600" style={{ animation: 'v2Reveal 2.6s ease-out 0.9s infinite' }} />
      <span className="absolute h-2 w-2 rounded-full bg-blue-300 dark:bg-blue-500" style={{ animation: 'v2Cursor 2.6s ease-in-out infinite' }} />
      <style>{`
        @keyframes v2Reveal { 0%{ transform: translateY(6px); opacity:0 } 15%,80%{ transform: translateY(0); opacity:1 } 100%{ transform: translateY(0); opacity:1 } }
        @keyframes v2Cursor { 0%{ transform: translate(-22px,14px) } 35%{ transform: translate(16px,-4px) } 70%{ transform: translate(4px,10px) } 100%{ transform: translate(-22px,14px) } }
      `}</style>
    </div>
  );
}

// ── Portfolio v1: anime-inspired, twinkling stars, cycling accent ──

const V1_STARS = [{ x: 30, y: 25, d: 0 }, { x: 70, y: 30, d: 0.4 }, { x: 50, y: 65, d: 0.8 }, { x: 20, y: 60, d: 1.2 }];
export function PortfolioV1Preview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden border border-zinc-200 bg-zinc-50 dark:border-neutral-800 dark:bg-neutral-900">
      {V1_STARS.map((s, i) => (
        <span key={i} className="absolute text-[8px] text-zinc-300 dark:text-neutral-600" style={{ left: `${s.x}%`, top: `${s.y}%`, animation: `v1Twinkle 2.4s ease-in-out ${s.d}s infinite` }}>✦</span>
      ))}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[14px] text-zinc-400 dark:text-neutral-500" style={{ animation: 'v1Twinkle 2s ease-in-out infinite' }}>✦</span>
        <span className="text-[9px] font-semibold text-zinc-700 dark:text-neutral-300">Rohan.dev</span>
      </div>
      <style>{`@keyframes v1Twinkle { 0%,100%{ opacity:.35; transform: scale(.85) rotate(0) } 50%{ opacity:1; transform: scale(1.1) rotate(15deg) } }`}</style>
    </div>
  );
}
