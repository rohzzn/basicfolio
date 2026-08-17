'use client';

import React, { useEffect, useState } from 'react';
import { LightFrame, LightWindowBar, lightDot } from './light';

// ── World Clock: six live-ticking city keys with day/night tint ──

const WC_CITIES = [
  { label: 'NYC', tz: 'America/New_York' },
  { label: 'LON', tz: 'Europe/London' },
  { label: 'TOK', tz: 'Asia/Tokyo' },
  { label: 'SYD', tz: 'Australia/Sydney' },
];
export function WorldClockPreview() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 grid grid-cols-2 gap-1.5 p-2.5">
      {WC_CITIES.map((c) => {
        const parts = now
          ? new Intl.DateTimeFormat('en-GB', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now)
          : null;
        const time = parts ? `${parts[0].value}:${parts[2].value}` : '--:--';
        const hour = parts ? Number(parts[0].value) : 12;
        const isNight = hour < 6 || hour >= 19;
        const sec = parts ? Number(parts[4].value) : 0;
        return (
          <div key={c.label} className={`relative flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg border py-2 ${isNight ? 'border-zinc-300 bg-zinc-100 dark:border-neutral-700 dark:bg-neutral-800' : 'border-zinc-200 bg-white dark:border-neutral-800 dark:bg-neutral-950'}`}>
            <svg className="absolute right-1 top-1 h-3 w-3 -rotate-90 opacity-40" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={`${(sec / 60) * 50.2} 50.2`} className="text-zinc-400 dark:text-neutral-500" />
            </svg>
            <span className="text-[7px] font-medium uppercase tracking-wide text-zinc-400 dark:text-neutral-500">{c.label}</span>
            <span className="font-mono text-[11px] font-medium tabular-nums text-zinc-700 dark:text-neutral-300">{time}</span>
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
    const id = setInterval(() => setSecs((s) => (s + 1) % 3600), 1000);
    return () => clearInterval(id);
  }, []);
  const bars = [6, 10, 14, 9, 16, 7, 12, 5, 11, 8];
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-2.5 py-1.5 dark:border-neutral-800">
        <span className="flex items-center gap-1.5">
          {lightDot('bg-red-400', true)}
          <span className="font-mono text-[9px] font-medium tabular-nums text-zinc-500 dark:text-neutral-400">
            {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
          </span>
        </span>
        <span className="text-[6.5px] text-zinc-400 dark:text-neutral-500">1080p · 30fps</span>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative h-10 w-16 rounded border-2 border-dashed border-zinc-300 dark:border-neutral-600">
          <span className="absolute -left-0.5 -top-0.5 h-1.5 w-1.5 border-l border-t border-zinc-400 dark:border-neutral-500" />
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 border-r border-t border-zinc-400 dark:border-neutral-500" />
          <span className="absolute -bottom-0.5 -left-0.5 h-1.5 w-1.5 border-b border-l border-zinc-400 dark:border-neutral-500" />
          <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 border-b border-r border-zinc-400 dark:border-neutral-500" />
        </div>
      </div>
      <div className="flex items-end justify-center gap-[2.5px] px-3 pb-2.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-1 rounded-full bg-zinc-300 dark:bg-neutral-600"
            style={{ height: h, animation: `beamBar 1.1s ease-in-out ${i * 0.08}s infinite alternate` }}
          />
        ))}
      </div>
      <style>{`@keyframes beamBar { 0%{ transform: scaleY(0.4); opacity:.5 } 100%{ transform: scaleY(1); opacity:1 } }`}</style>
    </LightFrame>
  );
}

// ── Relay: status rows with uptime history bars and an overall % ──

const RELAY_MONITORS = [
  { name: 'API Gateway', ms: 142, hist: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: 'Database', ms: 58, hist: [1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1,1,1,1] },
  { name: 'Media Server', ms: null, hist: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0] },
];
export function RelayPreview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-3">
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-[7px] font-medium uppercase tracking-wide text-zinc-400 dark:text-neutral-500">Status</span>
        <span className="font-mono text-[8px] text-emerald-600 dark:text-emerald-500">99.2% uptime</span>
      </div>
      {RELAY_MONITORS.map((m) => (
        <div key={m.name}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {lightDot(m.hist[19] > 0 ? 'bg-emerald-500' : 'bg-red-500', m.hist[19] > 0)}
              <span className="truncate text-[9px] font-medium text-zinc-600 dark:text-neutral-400">{m.name}</span>
            </div>
            <span className="shrink-0 font-mono text-[8px] text-zinc-400 dark:text-neutral-500">{m.ms ? `${m.ms}ms` : 'down'}</span>
          </div>
          <div className="flex gap-px">
            {m.hist.map((v, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-sm ${v === 1 ? 'bg-emerald-300 dark:bg-emerald-700' : v === 0.5 ? 'bg-amber-300 dark:bg-amber-700' : 'bg-red-300 dark:bg-red-800'}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Keel: subscription list on a phone-style card with renewal badge ──

const KEEL_SUBS = [
  { n: 'Netflix', icon: '🎬', mo: 15.99, due: true },
  { n: 'Spotify', icon: '🎵', mo: 9.99, due: false },
  { n: 'iCloud+', icon: '☁️', mo: 2.99, due: false },
  { n: 'GitHub Pro', icon: '🐙', mo: 4.0, due: false },
];
function num(n: number, d: number) { return n.toFixed(d); }
export function KeelPreview() {
  const total = KEEL_SUBS.reduce((s, r) => s + r.mo, 0);
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2 dark:border-neutral-800">
        <div>
          <span className="text-[8px] text-zinc-400 dark:text-neutral-500">Monthly total</span>
          <p className="font-mono text-[11px] font-semibold tabular-nums text-zinc-800 dark:text-paper">${num(total, 2)}</p>
        </div>
        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[6.5px] font-medium text-red-600 dark:bg-red-900/40 dark:text-red-300">1 due soon</span>
      </div>
      <div className="flex-1 divide-y divide-zinc-100 dark:divide-neutral-800">
        {KEEL_SUBS.map((s) => (
          <div key={s.n} className="flex items-center justify-between px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">{s.icon}</span>
              <span className="text-[9px] font-medium text-zinc-700 dark:text-neutral-300">{s.n}</span>
              {s.due && <span className="h-1 w-1 rounded-full bg-red-500" />}
            </div>
            <span className="font-mono text-[8px] tabular-nums text-zinc-500 dark:text-neutral-400">${num(s.mo, 2)}</span>
          </div>
        ))}
      </div>
    </LightFrame>
  );
}

// ── ShutTab: browser bar cycling through several blocked sites ──

const SHUT_SITES = ['twitter.com', 'reddit.com', 'youtube.com'];
export function ShutTabPreview() {
  const [i, setI] = useState(0);
  const [count, setCount] = useState(1);
  useEffect(() => {
    const id = setInterval(() => { setI((v) => (v + 1) % SHUT_SITES.length); setCount((c) => c + 1); }, 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <div className="flex items-center gap-1.5 border-b border-zinc-100 px-2 py-1.5 dark:border-neutral-800">
        <div className="flex gap-1">
          {['bg-red-300', 'bg-yellow-300', 'bg-green-300'].map((c) => <div key={c} className={`h-1.5 w-1.5 rounded-full ${c} dark:opacity-70`} />)}
        </div>
        <div className="flex-1 truncate rounded bg-zinc-100 px-2 py-0.5 text-center font-mono text-[8px] text-zinc-400 dark:bg-neutral-800 dark:text-neutral-500">
          {SHUT_SITES[i]}
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-red-400 dark:border-red-500" style={{ animation: 'shutPulse 1.8s ease-in-out infinite' }}>
          <div className="h-0.5 w-6 rotate-45 rounded-full bg-red-400 dark:bg-red-500" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-100 px-2 py-1.5 dark:border-neutral-800">
        <span className="text-[8px] text-zinc-400 dark:text-neutral-500">Blocked</span>
        <span className="font-mono text-[8px] text-zinc-500 dark:text-neutral-400">{count} today</span>
      </div>
      <style>{`@keyframes shutPulse { 0%,100%{ transform: scale(1); opacity: 1 } 50%{ transform: scale(1.12); opacity: .7 } }`}</style>
    </LightFrame>
  );
}

// ── CS Stats: Steam-style overlay card with a rank badge ──

export function CsStatsPreview() {
  return (
    <LightFrame>
      <div className="flex items-center gap-2 px-3 pt-3">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-700 text-[9px] font-bold text-white dark:bg-neutral-300 dark:text-neutral-900">R</div>
        <div className="min-w-0">
          <p className="truncate text-[9px] font-semibold text-zinc-800 dark:text-paper">Rohan P.</p>
          <p className="truncate text-[7px] text-zinc-400 dark:text-neutral-500">Playing CS2</p>
        </div>
        <span className="ml-auto rounded bg-amber-100 px-1 py-0.5 text-[6px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">LEM</span>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2 px-3 py-2.5">
        <div><p className="text-[7px] text-zinc-400 dark:text-neutral-500">K/D</p><p className="font-mono text-[10px] font-medium text-zinc-800 dark:text-paper">2.34</p></div>
        <div><p className="text-[7px] text-zinc-400 dark:text-neutral-500">Win%</p><p className="font-mono text-[10px] font-medium text-zinc-800 dark:text-paper">53.2</p></div>
        <div><p className="text-[7px] text-zinc-400 dark:text-neutral-500">HS%</p><p className="font-mono text-[10px] font-medium text-zinc-800 dark:text-paper">47.8</p></div>
      </div>
    </LightFrame>
  );
}

// ── Git Time Machine: terminal log, cursor walking through commits ──

const GTM_COMMITS = [
  { hash: 'a3f9c2b', msg: 'feat: add animated transitions' },
  { hash: '8e1d054', msg: 'fix: keyboard navigation' },
  { hash: 'c4b7e12', msg: 'refactor: extract diff renderer' },
];
export function GitTimeMachinePreview() {
  const [sel, setSel] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSel((s) => (s + 1) % GTM_COMMITS.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <LightWindowBar label="git-time-machine · main" />
      <div className="flex-1 space-y-1 px-2.5 py-2 font-mono text-[8px]">
        {GTM_COMMITS.map((c, i) => (
          <div key={c.hash} className={`flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors ${i === sel ? 'bg-zinc-100 dark:bg-neutral-800' : ''}`}>
            <span className="text-zinc-300 dark:text-neutral-600">{i === sel ? '●' : '○'}</span>
            <span className="text-amber-600 dark:text-amber-500">{c.hash}</span>
            <span className="min-w-0 flex-1 truncate text-zinc-500 dark:text-neutral-400">{c.msg}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 pt-0.5 text-zinc-400 dark:text-neutral-500">
          <span>$</span>
          <span className="h-2.5 w-1 bg-zinc-400 dark:bg-neutral-500" style={{ animation: 'blink 1s step-start infinite' }} />
        </div>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
    </LightFrame>
  );
}

// ── Pages (Figma): reorderable page stack, colored tags, cycling lift ──

const FIGMA_PAGES = [
  { n: 'Onboarding', c: '#a78bfa' }, { n: 'Dashboard', c: '#60a5fa' },
  { n: 'Components', c: '#34d399' }, { n: 'Icons', c: '#fbbf24' },
];
export function PagesFigmaPreview() {
  const [lifted, setLifted] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLifted((l) => (l + 1) % FIGMA_PAGES.length), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-2.5 py-1 dark:border-neutral-800">
        <span className="text-[7px] text-zinc-400 dark:text-neutral-500">Pages</span>
        <span className="text-[7px] text-zinc-400 dark:text-neutral-500">{FIGMA_PAGES.length}</span>
      </div>
      <div className="flex-1 divide-y divide-zinc-100 py-1 dark:divide-neutral-800">
        {FIGMA_PAGES.map((p, i) => (
          <div
            key={p.n}
            className="flex items-center gap-2 px-2.5 py-1.5 transition-transform"
            style={i === lifted ? { animation: 'figmaLift 1.6s ease-in-out' } : undefined}
          >
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: p.c }} />
            <span className="truncate text-[9px] text-zinc-600 dark:text-neutral-400">{p.n}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes figmaLift { 0%,100%{ transform: translateY(0); box-shadow: none } 50%{ transform: translateY(-1.5px); box-shadow: 0 2px 4px rgba(0,0,0,0.08) } }`}</style>
    </LightFrame>
  );
}

// ── Meet: 2x2 video tiles with a call timer and rotating speaker highlight ──

const MEET_PEOPLE = [
  { n: 'R', sharing: true, muted: false },
  { n: 'V', sharing: false, muted: true },
  { n: 'A', sharing: false, muted: false },
  { n: 'P', sharing: false, muted: false },
];
export function MeetPreview() {
  const [secs, setSecs] = useState(72);
  const [speaking, setSpeaking] = useState(2);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    const id2 = setInterval(() => setSpeaking((s) => (s + 1) % MEET_PEOPLE.length), 1500);
    return () => { clearInterval(id); clearInterval(id2); };
  }, []);
  return (
    <div className="absolute inset-2.5 flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="grid flex-1 grid-cols-2 gap-1.5">
        {MEET_PEOPLE.map((p, i) => (
          <div key={p.n} className={`relative flex items-center justify-center rounded border bg-white transition-colors dark:bg-neutral-950 ${i === speaking ? 'border-emerald-400 dark:border-emerald-600' : 'border-zinc-200 dark:border-neutral-800'}`}>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-600 text-[8px] font-bold text-white dark:bg-neutral-300 dark:text-neutral-900">{p.n}</div>
            {p.sharing && <span className="absolute right-1 top-1 rounded-sm bg-emerald-100 px-1 text-[6px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">share</span>}
            {p.muted && <span className="absolute bottom-1 left-1 text-[7px]">🔇</span>}
          </div>
        ))}
      </div>
      <div className="text-center font-mono text-[7px] text-zinc-400 dark:text-neutral-500">{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')} elapsed</div>
    </div>
  );
}

// ── Ipynb Image Extractor: terminal + extracted thumbnails with a counter ──

export function IpynbExtractorPreview() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c + 1) % 6), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <LightWindowBar label="analysis.ipynb" />
      <div className="flex flex-1 flex-col justify-center gap-1.5 px-2.5 py-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[7.5px] text-zinc-400 dark:text-neutral-500">$ ipynb-extract</p>
          <p className="font-mono text-[7px] text-zinc-500 dark:text-neutral-400">{Math.min(count, 5)}/5</p>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded border border-zinc-200 bg-zinc-100 dark:border-neutral-700 dark:bg-neutral-800"
              style={{ animation: `ipynbPop 3s ease-in-out ${i * 0.3}s infinite` }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes ipynbPop { 0%,20%{ transform: scale(0); opacity:0 } 35%,90%{ transform: scale(1); opacity:1 } 100%{ transform: scale(1); opacity:1 } }`}</style>
    </LightFrame>
  );
}

// ── Scrapetron: terminal with scraped rows scrolling and a running count ──

const SCRAPE_ROWS = ['GET /products → 200', 'GET /reviews → 200', 'GET /pricing → 200', 'GET /about → 200', 'GET /faq → 200'];
export function ScrapetronPreview() {
  const [count, setCount] = useState(240);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <LightWindowBar label="scrapetron" />
      <div className="relative flex-1 overflow-hidden px-2.5 py-2 font-mono text-[7.5px] text-zinc-500 dark:text-neutral-400">
        <div style={{ animation: 'scrapeScroll 6s linear infinite' }}>
          {[...SCRAPE_ROWS, ...SCRAPE_ROWS].map((r, i) => (
            <p key={i} className="py-0.5"><span className="text-emerald-600 dark:text-emerald-500">✓</span> {r}</p>
          ))}
        </div>
      </div>
      <div className="border-t border-zinc-100 px-2.5 py-1 text-right font-mono text-[7px] text-zinc-400 dark:border-neutral-800 dark:text-neutral-500">{count} rows scraped</div>
      <style>{`@keyframes scrapeScroll { 0%{ transform: translateY(0) } 100%{ transform: translateY(-50%) } }`}</style>
    </LightFrame>
  );
}

// ── Todo iOS: rounded list with a progress bar and cycling check ──

const TODO_ITEMS = ['Design onboarding', 'Set up iCloud sync', 'Write unit tests', 'App Store screenshots'];
export function TodoIosPreview() {
  const [doneCount, setDoneCount] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setDoneCount((d) => (d % TODO_ITEMS.length) + 1), 1300);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-2.5 flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-1.5 dark:border-neutral-800">
        <span className="text-[9px] font-semibold text-zinc-800 dark:text-paper">Today</span>
        <span className="text-[8px] text-blue-500 dark:text-blue-400">☁ synced</span>
      </div>
      <div className="flex-1 space-y-1.5 px-3 py-2">
        {TODO_ITEMS.map((t, i) => {
          const done = i < doneCount;
          const checking = i === doneCount - 1;
          return (
            <div key={t} className="flex items-center gap-2">
              <span
                className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-full border transition-colors ${done ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300 dark:border-neutral-600'}`}
                style={checking ? { animation: 'todoCheck 1.3s ease-in-out' } : undefined}
              >
                {done && <span className="text-[6px] text-white">✓</span>}
              </span>
              <span className={`text-[8.5px] ${done ? 'text-zinc-400 line-through dark:text-neutral-500' : 'text-zinc-700 dark:text-neutral-300'}`}>{t}</span>
            </div>
          );
        })}
      </div>
      <div className="h-0.5 w-full bg-zinc-100 dark:bg-neutral-800">
        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(doneCount / TODO_ITEMS.length) * 100}%` }} />
      </div>
      <style>{`@keyframes todoCheck { 0%,40%{ background:transparent; border-color:#d4d4d8 } 60%,100%{ background:#10b981; border-color:#10b981 } }`}</style>
    </div>
  );
}

// ── Zenitsu Bot: Discord embed cycling with a typing indicator ──

const BOT_EMBEDS = [
  { cmd: '/daily', title: 'Daily Reward', body: '+50 coins claimed' },
  { cmd: '/roll', title: 'Dice Roll', body: 'You rolled a 4' },
  { cmd: '/trivia', title: 'Trivia Time', body: 'V8 was written in?' },
];
export function ZenitsuBotPreview() {
  return (
    <LightFrame>
      <div className="flex items-center gap-1.5 border-b border-zinc-100 px-2.5 py-1.5 dark:border-neutral-800">
        {lightDot('bg-green-500')}
        <span className="text-[8px] font-medium text-zinc-500 dark:text-neutral-400"># general</span>
      </div>
      <div className="relative flex-1 px-2.5 py-2">
        {BOT_EMBEDS.map((e, i) => (
          <div
            key={e.cmd}
            className="absolute inset-x-2.5 top-2 flex gap-2"
            style={{ animation: `zenitsuFade 5.4s ease-in-out ${i * 1.8}s infinite` }}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-600 text-[7px] font-bold text-white dark:bg-neutral-300 dark:text-neutral-900">Z</div>
            <div className="min-w-0 flex-1 rounded-r border-l-2 border-zinc-400 bg-zinc-100 px-1.5 py-1 dark:border-neutral-600 dark:bg-neutral-800">
              <p className="truncate text-[7.5px] font-semibold text-zinc-700 dark:text-neutral-300">{e.title}</p>
              <p className="truncate text-[7px] text-zinc-500 dark:text-neutral-400">{e.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 border-t border-zinc-100 px-2.5 py-1 dark:border-neutral-800">
        {BOT_EMBEDS.map((e) => <span key={e.cmd} className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[6px] text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400">{e.cmd}</span>)}
      </div>
      <style>{`@keyframes zenitsuFade { 0%,2%{ opacity:0; transform: translateY(3px) } 8%,30%{ opacity:1; transform: translateY(0) } 36%,100%{ opacity:0 } }`}</style>
    </LightFrame>
  );
}

// ── Tanoshi: syntax preview with line numbers and a blinking cursor ──

export function TanoshiPreview() {
  const rose = '#C97A7A', teal = '#3F7376';
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-2 py-1.5 dark:border-neutral-800">
        <div className="flex gap-1">
          {[rose, teal, '#a1a1aa'].map((c) => <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />)}
        </div>
        <span className="font-mono text-[6.5px] text-zinc-400 dark:text-neutral-500">utils.ts</span>
      </div>
      <div className="flex-1 px-2.5 py-2 font-mono text-[8px] leading-[1.7]">
        <p><span className="mr-1.5 select-none text-zinc-300 dark:text-neutral-700">1</span><span style={{ color: teal }}>function </span><span style={{ color: rose }}>tanoshi</span><span className="text-zinc-500 dark:text-neutral-400">() {'{'}</span></p>
        <p><span className="mr-1.5 select-none text-zinc-300 dark:text-neutral-700">2</span><span className="pl-2" style={{ color: teal }}>return </span><span style={{ color: rose }}>&apos;楽しい&apos;</span><span className="ml-0.5 inline-block h-2.5 w-1 bg-zinc-500 dark:bg-neutral-400" style={{ animation: 'blink 1s step-start infinite' }} /></p>
        <p><span className="mr-1.5 select-none text-zinc-300 dark:text-neutral-700">3</span><span className="text-zinc-500 dark:text-neutral-400">{'}'}</span></p>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
    </LightFrame>
  );
}

// ── Hexr: color grid with a crosshair that sweeps and reads hex ──

function hslToHex(h: number, s: number, l: number) {
  const ll = l / 100, a = (s / 100) * Math.min(ll, 1 - ll);
  const f = (n: number) => { const k = (n + h / 30) % 12; const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
export function HexrPreview() {
  const [idx, setIdx] = useState(10);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 7) % 24), 900);
    return () => clearInterval(id);
  }, []);
  const swatches = Array.from({ length: 24 }, (_, i) => hslToHex((i % 8) * 45, 55, 55 + Math.floor(i / 8) * 8));
  return (
    <div className="absolute inset-2.5 flex flex-col gap-1.5">
      <div className="relative grid flex-1 grid-cols-8 gap-0.5 overflow-hidden rounded-md border border-zinc-200 dark:border-neutral-800">
        {swatches.map((hex, i) => (
          <div key={i} className="relative" style={{ backgroundColor: hex }}>
            {i === idx && <span className="absolute inset-0 ring-2 ring-inset ring-white" />}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded border border-zinc-300 dark:border-neutral-600" style={{ backgroundColor: swatches[idx] }} />
        <span className="font-mono text-[8px] text-zinc-500 dark:text-neutral-400">{swatches[idx]}</span>
      </div>
    </div>
  );
}

// ── Customer Management: CRM table with status pills and revenue total ──

const CRM_ROWS = [
  { name: 'Acme Corp', status: 'active' as const, mrr: 2400 },
  { name: 'Nova Retail', status: 'lead' as const, mrr: 0 },
  { name: 'Blue Widgets', status: 'churned' as const, mrr: 0 },
];
const CRM_PILL: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  lead: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  churned: 'bg-zinc-200 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400',
};
export function CustomerManagementPreview() {
  const total = CRM_ROWS.reduce((s, r) => s + r.mrr, 0);
  return (
    <LightFrame>
      <div className="flex items-center justify-between border-b border-zinc-100 px-2.5 py-1.5 dark:border-neutral-800">
        <span className="text-[7px] text-zinc-400 dark:text-neutral-500">MRR</span>
        <span className="font-mono text-[9px] font-semibold text-zinc-700 dark:text-neutral-300">${total.toLocaleString()}</span>
      </div>
      <div className="flex-1 divide-y divide-zinc-100 dark:divide-neutral-800">
        {CRM_ROWS.map((r) => (
          <div key={r.name} className="flex items-center justify-between px-2.5 py-1.5">
            <span className="truncate text-[8.5px] text-zinc-700 dark:text-neutral-300">{r.name}</span>
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-medium capitalize ${CRM_PILL[r.status]}`}>{r.status}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-0.5 border-t border-zinc-100 px-2.5 py-2 dark:border-neutral-800">
        {[5, 8, 6, 10, 9, 13, 11].map((h, i) => <div key={i} className="w-1.5 flex-1 rounded-sm bg-zinc-300 dark:bg-neutral-600" style={{ height: h }} />)}
      </div>
    </LightFrame>
  );
}
