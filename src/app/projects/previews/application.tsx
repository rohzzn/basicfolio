'use client';

import React, { useEffect, useState } from 'react';
import { LightFrame, LightWindowBar, lightDot } from './light';

// ── World Clock: three live-ticking city keys ──

const WC_CITIES = [
  { label: 'NYC', tz: 'America/New_York' },
  { label: 'LON', tz: 'Europe/London' },
  { label: 'TOK', tz: 'Asia/Tokyo' },
];

export function WorldClockPreview() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2 px-3">
      {WC_CITIES.map((c) => {
        const time = now
          ? new Intl.DateTimeFormat('en-GB', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now)
          : '--:--';
        return (
          <div key={c.label} className="flex aspect-square flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white py-3">
            <span className="text-[8px] font-medium uppercase tracking-wide text-zinc-400">{c.label}</span>
            <span className="font-mono text-[13px] font-medium tabular-nums text-zinc-700">{time}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Beam: a recording capture frame with a live REC timer and level meter ──

export function BeamPreview() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s + 1) % 60), 1000);
    return () => clearInterval(id);
  }, []);
  const bars = [6, 10, 14, 9, 16, 7, 12, 5];
  return (
    <LightFrame>
      <div className="flex items-center gap-1.5 border-b border-zinc-100 px-2.5 py-1.5">
        {lightDot('bg-red-400', true)}
        <span className="font-mono text-[9px] font-medium tabular-nums text-zinc-500">
          {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <div className="h-8 w-14 rounded border border-zinc-200" />
      </div>
      <div className="flex items-end justify-center gap-[3px] px-3 pb-2.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-1 rounded-full bg-zinc-300"
            style={{ height: h, animation: `beamBar 1.1s ease-in-out ${i * 0.09}s infinite alternate` }}
          />
        ))}
      </div>
      <style>{`@keyframes beamBar { 0%{ transform: scaleY(0.4); opacity:.5 } 100%{ transform: scaleY(1); opacity:1 } }`}</style>
    </LightFrame>
  );
}

// ── Relay: status rows with uptime history bars ──

const RELAY_MONITORS = [
  { name: 'API Gateway', ms: 142, hist: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: 'Database', ms: 58, hist: [1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: 'Media Server', ms: null, hist: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0] },
];
export function RelayPreview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-3">
      {RELAY_MONITORS.map((m) => (
        <div key={m.name}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {lightDot(m.hist[19] > 0 ? 'bg-emerald-500' : 'bg-red-500', m.hist[19] > 0)}
              <span className="truncate text-[9px] font-medium text-zinc-600">{m.name}</span>
            </div>
            <span className="shrink-0 font-mono text-[8px] text-zinc-400">{m.ms ? `${m.ms}ms` : 'down'}</span>
          </div>
          <div className="flex gap-px">
            {m.hist.map((v, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-sm ${v === 1 ? 'bg-emerald-300' : v === 0.5 ? 'bg-amber-300' : 'bg-red-300'}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Keel: subscription list on a phone-style card ──

const KEEL_SUBS = [
  { n: 'Netflix', icon: '🎬', mo: 15.99, due: true },
  { n: 'Spotify', icon: '🎵', mo: 9.99, due: false },
  { n: 'iCloud+', icon: '☁️', mo: 2.99, due: false },
];
function num(n: number, d: number) { return n.toFixed(d); }
export function KeelPreview() {
  const total = KEEL_SUBS.reduce((s, r) => s + r.mo, 0);
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
        <span className="text-[8px] text-zinc-400">Monthly total</span>
        <span className="font-mono text-[11px] font-semibold tabular-nums text-zinc-800">${num(total, 2)}</span>
      </div>
      <div className="flex-1 divide-y divide-zinc-100">
        {KEEL_SUBS.map((s) => (
          <div key={s.n} className="flex items-center justify-between px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">{s.icon}</span>
              <span className="text-[9px] font-medium text-zinc-700">{s.n}</span>
              {s.due && <span className="h-1 w-1 rounded-full bg-red-500" />}
            </div>
            <span className="font-mono text-[8px] tabular-nums text-zinc-500">${num(s.mo, 2)}</span>
          </div>
        ))}
      </div>
    </LightFrame>
  );
}

// ── ShutTab: browser bar with a site getting blocked ──

export function ShutTabPreview() {
  return (
    <LightFrame>
      <div className="flex items-center gap-1.5 border-b border-zinc-100 px-2 py-1.5">
        <div className="flex gap-1">
          {['bg-red-300', 'bg-yellow-300', 'bg-green-300'].map((c) => <div key={c} className={`h-1.5 w-1.5 rounded-full ${c}`} />)}
        </div>
        <div className="flex-1 truncate rounded bg-zinc-100 px-2 py-0.5 text-center font-mono text-[8px] text-zinc-400">
          twitter.com
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-red-400" style={{ animation: 'shutPulse 2s ease-in-out infinite' }}>
          <div className="h-0.5 w-6 rotate-45 rounded-full bg-red-400" />
        </div>
      </div>
      <div className="border-t border-zinc-100 px-2 py-1.5 text-center text-[8px] text-zinc-400">Blocked</div>
      <style>{`@keyframes shutPulse { 0%,100%{ transform: scale(1); opacity: 1 } 50%{ transform: scale(1.12); opacity: .7 } }`}</style>
    </LightFrame>
  );
}

// ── CS Stats: Steam-style overlay card ──

export function CsStatsPreview() {
  return (
    <LightFrame>
      <div className="flex items-center gap-2 px-3 pt-3">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-700 text-[9px] font-bold text-white">R</div>
        <div className="min-w-0">
          <p className="truncate text-[9px] font-semibold text-zinc-800">Rohan P.</p>
          <p className="truncate text-[7px] text-zinc-400">Playing CS2</p>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2 px-3 py-2.5">
        <div><p className="text-[7px] text-zinc-400">K/D ratio</p><p className="font-mono text-[10px] font-medium text-zinc-800">2.34</p></div>
        <div><p className="text-[7px] text-zinc-400">Win rate</p><p className="font-mono text-[10px] font-medium text-zinc-800">53.2%</p></div>
      </div>
    </LightFrame>
  );
}

// ── Git Time Machine: terminal log ──

const GTM_COMMITS = [
  { hash: 'a3f9c2b', msg: 'feat: add animated transitions' },
  { hash: '8e1d054', msg: 'fix: keyboard navigation' },
  { hash: 'c4b7e12', msg: 'refactor: extract diff renderer' },
];
export function GitTimeMachinePreview() {
  return (
    <LightFrame>
      <LightWindowBar label="git-time-machine" />
      <div className="flex-1 space-y-1 px-2.5 py-2 font-mono text-[8px]">
        {GTM_COMMITS.map((c, i) => (
          <div key={c.hash} className={`flex items-center gap-1.5 rounded px-1 py-0.5 ${i === 0 ? 'bg-zinc-100' : ''}`}>
            <span className="text-zinc-300">{i === 0 ? '●' : '○'}</span>
            <span className="text-amber-600">{c.hash}</span>
            <span className="min-w-0 flex-1 truncate text-zinc-500">{c.msg}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 pt-0.5 text-zinc-400">
          <span>$</span>
          <span className="h-2.5 w-1 bg-zinc-400" style={{ animation: 'blink 1s step-start infinite' }} />
        </div>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
    </LightFrame>
  );
}

// ── Pages (Figma): reorderable page stack ──

const FIGMA_PAGES = ['Onboarding', 'Dashboard', 'Components', 'Icons'];
export function PagesFigmaPreview() {
  return (
    <LightFrame>
      <div className="flex-1 divide-y divide-zinc-100 py-1">
        {FIGMA_PAGES.map((p, i) => (
          <div
            key={p}
            className="flex items-center gap-2 px-2.5 py-1.5"
            style={i === 1 ? { animation: 'figmaLift 2.4s ease-in-out infinite' } : undefined}
          >
            <span className="h-2 w-2 shrink-0 rounded-sm bg-zinc-300" />
            <span className="truncate text-[9px] text-zinc-600">{p}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes figmaLift { 0%,100%{ transform: translateY(0); box-shadow: none } 50%{ transform: translateY(-1.5px); box-shadow: 0 2px 4px rgba(0,0,0,0.08) } }`}</style>
    </LightFrame>
  );
}

// ── Meet: 2x2 video tiles ──

const MEET_PEOPLE = [
  { n: 'R', sharing: true, muted: false },
  { n: 'V', sharing: false, muted: true },
  { n: 'A', sharing: false, muted: false },
  { n: 'P', sharing: false, muted: false },
];
export function MeetPreview() {
  return (
    <div className="absolute inset-2.5 grid grid-cols-2 gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5">
      {MEET_PEOPLE.map((p) => (
        <div key={p.n} className="relative flex items-center justify-center rounded border border-zinc-200 bg-white">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-600 text-[8px] font-bold text-white">{p.n}</div>
          {p.sharing && <span className="absolute right-1 top-1 rounded-sm bg-emerald-100 px-1 text-[6px] font-medium text-emerald-700">share</span>}
          {p.muted && <span className="absolute bottom-1 left-1 text-[7px]">🔇</span>}
        </div>
      ))}
    </div>
  );
}

// ── Ipynb Image Extractor: terminal + extracted thumbnails appearing ──

export function IpynbExtractorPreview() {
  return (
    <LightFrame>
      <LightWindowBar label="analysis.ipynb" />
      <div className="flex flex-1 flex-col justify-center gap-2 px-2.5 py-2">
        <p className="font-mono text-[8px] text-zinc-400">$ ipynb-extract analysis.ipynb</p>
        <div className="grid grid-cols-5 gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded border border-zinc-200 bg-zinc-100"
              style={{ animation: `ipynbPop 3s ease-in-out ${i * 0.3}s infinite` }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes ipynbPop { 0%,20%{ transform: scale(0); opacity:0 } 35%,90%{ transform: scale(1); opacity:1 } 100%{ transform: scale(1); opacity:1 } }`}</style>
    </LightFrame>
  );
}

// ── Scrapetron: terminal with scraped rows scrolling ──

const SCRAPE_ROWS = ['GET /products → 200', 'GET /reviews → 200', 'GET /pricing → 200', 'GET /about → 200', 'GET /faq → 200'];
export function ScrapetronPreview() {
  return (
    <LightFrame>
      <LightWindowBar label="scrapetron" />
      <div className="relative flex-1 overflow-hidden px-2.5 py-2 font-mono text-[7.5px] text-zinc-500">
        <div style={{ animation: 'scrapeScroll 6s linear infinite' }}>
          {[...SCRAPE_ROWS, ...SCRAPE_ROWS].map((r, i) => (
            <p key={i} className="py-0.5"><span className="text-emerald-600">✓</span> {r}</p>
          ))}
        </div>
      </div>
      <style>{`@keyframes scrapeScroll { 0%{ transform: translateY(0) } 100%{ transform: translateY(-50%) } }`}</style>
    </LightFrame>
  );
}

// ── Todo iOS: rounded list with a checking-off task ──

const TODO_ITEMS = [
  { t: 'Design onboarding', done: true },
  { t: 'Set up iCloud sync', done: false, checking: true },
  { t: 'Write unit tests', done: false },
];
export function TodoIosPreview() {
  return (
    <div className="absolute inset-2.5 flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-1.5">
        <span className="text-[9px] font-semibold text-zinc-800">Today</span>
        <span className="text-[8px] text-blue-500">☁ synced</span>
      </div>
      <div className="flex-1 space-y-1.5 px-3 py-2">
        {TODO_ITEMS.map((it) => (
          <div key={it.t} className="flex items-center gap-2">
            <span
              className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${it.done ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300'}`}
              style={it.checking ? { animation: 'todoCheck 2s ease-in-out infinite' } : undefined}
            >
              {it.done && <span className="text-[6px] text-white">✓</span>}
            </span>
            <span className={`text-[8.5px] ${it.done ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>{it.t}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes todoCheck { 0%,60%{ background:transparent; border-color:#d4d4d8 } 75%,100%{ background:#10b981; border-color:#10b981 } }`}</style>
    </div>
  );
}

// ── Zenitsu Bot: Discord embed cycling between commands ──

const BOT_EMBEDS = [
  { cmd: '/daily', title: 'Daily Reward', body: '+50 coins claimed' },
  { cmd: '/roll', title: 'Dice Roll', body: 'You rolled a 4' },
];
export function ZenitsuBotPreview() {
  return (
    <LightFrame>
      <div className="flex items-center gap-1.5 border-b border-zinc-100 px-2.5 py-1.5">
        {lightDot('bg-green-500')}
        <span className="text-[8px] font-medium text-zinc-500"># general</span>
      </div>
      <div className="relative flex-1 px-2.5 py-2">
        {BOT_EMBEDS.map((e, i) => (
          <div
            key={e.cmd}
            className="absolute inset-x-2.5 top-2 flex gap-2"
            style={{ animation: `zenitsuFade 5s ease-in-out ${i * 2.5}s infinite` }}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-600 text-[7px] font-bold text-white">Z</div>
            <div className="min-w-0 flex-1 rounded-r border-l-2 border-zinc-400 bg-zinc-100 px-1.5 py-1">
              <p className="truncate text-[7.5px] font-semibold text-zinc-700">{e.title}</p>
              <p className="truncate text-[7px] text-zinc-500">{e.body}</p>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes zenitsuFade { 0%,4%{ opacity:0; transform: translateY(3px) } 10%,42%{ opacity:1; transform: translateY(0) } 48%,100%{ opacity:0 } }`}</style>
    </LightFrame>
  );
}

// ── Tanoshi: syntax preview using the theme's real colors as accents on a light card ──

export function TanoshiPreview() {
  const rose = '#C97A7A', teal = '#3F7376';
  return (
    <LightFrame>
      <div className="flex gap-1 border-b border-zinc-100 px-2 py-1.5">
        {[rose, teal, '#a1a1aa'].map((c) => <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />)}
      </div>
      <div className="px-2.5 py-2 font-mono text-[8px] leading-[1.7]">
        <p><span style={{ color: teal }}>function </span><span style={{ color: rose }}>tanoshi</span><span className="text-zinc-500">() {'{'}</span></p>
        <p className="pl-2"><span style={{ color: teal }}>return </span><span style={{ color: rose }}>&apos;楽しい&apos;</span></p>
        <p className="text-zinc-500">{'}'}</p>
      </div>
    </LightFrame>
  );
}

// ── Hexr: color grid with a picking crosshair ──

function hslToHex(h: number, s: number, l: number) {
  const ll = l / 100, a = (s / 100) * Math.min(ll, 1 - ll);
  const f = (n: number) => { const k = (n + h / 30) % 12; const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
export function HexrPreview() {
  const swatches = Array.from({ length: 24 }, (_, i) => hslToHex((i % 8) * 45, 55, 55 + Math.floor(i / 8) * 8));
  return (
    <div className="absolute inset-2.5 flex flex-col gap-1.5">
      <div className="grid flex-1 grid-cols-8 gap-0.5 overflow-hidden rounded-md border border-zinc-200">
        {swatches.map((hex, i) => <div key={i} style={{ backgroundColor: hex }} />)}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded border border-zinc-300" style={{ backgroundColor: swatches[10], animation: 'hexrSwap 3s steps(1) infinite' }} />
        <span className="font-mono text-[8px] text-zinc-500" style={{ animation: 'hexrSwap 3s steps(1) infinite' }}>{swatches[10]}</span>
      </div>
      <style>{`@keyframes hexrSwap { 0%,45%{ opacity: 1 } 50%,95%{ opacity: .55 } }`}</style>
    </div>
  );
}

// ── Customer Management: CRM table with status pills ──

const CRM_ROWS = [
  { name: 'Acme Corp', status: 'active' as const },
  { name: 'Nova Retail', status: 'lead' as const },
  { name: 'Blue Widgets', status: 'churned' as const },
];
const CRM_PILL: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  lead: 'bg-amber-100 text-amber-700',
  churned: 'bg-zinc-200 text-zinc-500',
};
export function CustomerManagementPreview() {
  return (
    <LightFrame>
      <div className="flex-1 divide-y divide-zinc-100">
        {CRM_ROWS.map((r) => (
          <div key={r.name} className="flex items-center justify-between px-2.5 py-1.5">
            <span className="truncate text-[8.5px] text-zinc-700">{r.name}</span>
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-medium capitalize ${CRM_PILL[r.status]}`}>{r.status}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-0.5 border-t border-zinc-100 px-2.5 py-2">
        {[5, 8, 6, 10, 9, 13, 11].map((h, i) => <div key={i} className="w-1.5 flex-1 rounded-sm bg-zinc-300" style={{ height: h }} />)}
      </div>
    </LightFrame>
  );
}
