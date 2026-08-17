'use client';

import React, { useState } from 'react';
import { Frame } from '../shared';

// ── Mac: click a dock icon to open a window ──

const DOCK_APPS = [
  { c: '#60a5fa', label: 'Finder' }, { c: '#34d399', label: 'Notes' }, { c: '#f472b6', label: 'Photos' },
  { c: '#fbbf24', label: 'Mail' }, { c: '#a78bfa', label: 'Terminal' },
];
export function MacDetail() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="relative flex h-full flex-col justify-end bg-gradient-to-b from-sky-300 to-sky-500 dark:from-slate-700 dark:to-slate-900">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-white/30 px-3 py-1 text-xs text-white backdrop-blur-sm">
        <span>{open ?? 'Finder'}</span><span>12:47 PM</span>
      </div>
      {open && (
        <div className="absolute left-1/2 top-1/2 w-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-white/40 bg-white/90 shadow-xl backdrop-blur">
          <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1"><span className="h-2 w-2 rounded-full bg-red-400" /><span className="h-2 w-2 rounded-full bg-yellow-400" /><span className="h-2 w-2 rounded-full bg-green-400" /></div>
          <div className="flex h-16 items-center justify-center text-xs text-zinc-500">{open}</div>
        </div>
      )}
      <div className="mx-auto mb-3 flex items-end gap-2 rounded-xl bg-white/25 px-3 py-1.5 backdrop-blur-sm">
        {DOCK_APPS.map((a) => (
          <button key={a.label} onClick={() => setOpen(a.label)} className="h-6 w-6 rounded-[7px] transition-transform hover:-translate-y-1" style={{ backgroundColor: a.c }} title={a.label} />
        ))}
      </div>
    </div>
  );
}

// ── Quire: click a line to edit it, draw a signature ──

const QUIRE_LINES = ['Invoice #2291', 'Total due: $1,240.00', 'Payment terms: Net 30', 'Signed, Rohan Pothuru'];
export function QuireDetail() {
  const [editing, setEditing] = useState(1);
  const [signed, setSigned] = useState(false);
  return (
    <Frame>
      <div className="flex-1 space-y-2.5 px-6 py-5">
        {QUIRE_LINES.map((l, i) => (
          <button key={i} onClick={() => setEditing(i)} className={`block w-full rounded px-1.5 py-1 text-left text-sm transition-colors ${editing === i ? 'bg-blue-50 text-zinc-800 ring-1 ring-blue-300 dark:bg-blue-900/30 dark:text-paper dark:ring-blue-700' : 'text-zinc-500 hover:bg-zinc-50 dark:text-neutral-400 dark:hover:bg-neutral-800/40'}`}>{l}</button>
        ))}
        <button onClick={() => setSigned((s) => !s)} className="mt-2 block">
          {signed ? (
            <svg width="70" height="24" viewBox="0 0 70 24" className="text-zinc-700 dark:text-neutral-300"><path d="M2 18 Q12 4 22 18 T42 18 T64 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          ) : (
            <span className="text-xs text-blue-500 underline">Click to sign</span>
          )}
        </button>
      </div>
    </Frame>
  );
}

// ── Still Flying: click a spacecraft for its readout ──

const CRAFT = [
  { name: 'Voyager 1', r: 33, color: '#f59e0b', dist: '166 AU' },
  { name: 'New Horizons', r: 24, color: '#34d399', dist: '58 AU' },
  { name: 'ISS', r: 10, color: '#60a5fa', dist: 'LEO' },
];
export function SpaceDetail() {
  const [sel, setSel] = useState(CRAFT[0]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-zinc-950">
      <div className="relative flex h-32 w-32 items-center justify-center">
        {CRAFT.map((c) => <span key={c.name} className="absolute rounded-full border border-zinc-700" style={{ width: c.r * 2, height: c.r * 2 }} />)}
        <span className="absolute h-2 w-2 rounded-full bg-amber-300" />
        {CRAFT.map((c) => (
          <button
            key={c.name}
            onClick={() => setSel(c)}
            className="absolute h-2 w-2 rounded-full transition-transform hover:scale-150"
            style={{ backgroundColor: c.color, top: `calc(50% - ${c.r}px)`, left: '50%' }}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-400">{sel.name} · {sel.dist} from Earth</p>
    </div>
  );
}

// ── Languages: click an era for a fact ──

const ERAS = [
  { e: '2020 CE', fact: 'Over 7,000 living languages recorded' },
  { e: '1440 CE', fact: 'Gutenberg printing press spreads literacy' },
  { e: '1200 BCE', fact: 'Phoenician alphabet begins spreading by trade' },
  { e: '3200 BCE', fact: 'Cuneiform: the earliest known writing system' },
];
export function LanguagesLatDetail() {
  const [sel, setSel] = useState(0);
  return (
    <div className="flex h-full items-center px-8">
      <div className="relative w-full">
        <div className="absolute bottom-0 left-1.5 top-0 w-px bg-zinc-200 dark:bg-neutral-700" />
        <div className="space-y-4">
          {ERAS.map((e, i) => (
            <button key={e.e} onClick={() => setSel(i)} className="flex items-center gap-3 text-left">
              <span className={`relative z-10 h-3 w-3 rounded-full border-2 transition-colors ${i === sel ? 'border-zinc-800 bg-zinc-800 dark:border-paper dark:bg-paper' : 'border-zinc-300 bg-white dark:border-neutral-600 dark:bg-neutral-950'}`} />
              <span className={`font-mono text-xs ${i === sel ? 'font-medium text-zinc-800 dark:text-paper' : 'text-zinc-400 dark:text-neutral-500'}`}>{e.e}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 max-w-[220px] pl-6 text-xs text-zinc-500 dark:text-neutral-400">{ERAS[sel].fact}</p>
      </div>
    </div>
  );
}

// ── Margin: minimal reader with a settings reveal ──

export function MarginDetail() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const scale = { sm: 0.85, md: 1, lg: 1.2 }[size];
  return (
    <div className="group flex h-full flex-col justify-center gap-2.5 px-10">
      <div className="h-1 rounded bg-zinc-300 dark:bg-neutral-600" style={{ width: `${33 * scale}%` }} />
      {[100, 100, 80, 100, 65].map((w, i) => (
        <div key={i} className="rounded bg-zinc-200 dark:bg-neutral-800" style={{ width: `${w}%`, height: 3 * scale }} />
      ))}
      <div className="mt-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <button key={s} onClick={() => setSize(s)} className={`h-5 w-5 rounded-full text-[9px] ${size === s ? 'bg-zinc-800 text-white dark:bg-neutral-200 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-400 dark:bg-neutral-800'}`}>A</button>
        ))}
      </div>
    </div>
  );
}

// ── Contests: click a day to see its event ──

const CONTEST_DAYS: Record<number, string> = { 4: 'Codeforces Round 921', 9: 'LeetCode Weekly 380', 15: 'AtCoder Beginner 340', 22: 'HackerRank Sprint' };
export function ContestsDetail() {
  const [sel, setSel] = useState(4);
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, i) => (
          <button key={i} onClick={() => CONTEST_DAYS[i] && setSel(i)} className={`flex aspect-square items-center justify-center rounded text-[10px] transition-colors ${CONTEST_DAYS[i] ? (sel === i ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300') : 'text-zinc-300 dark:text-neutral-700'}`}>{i + 1}</button>
        ))}
      </div>
      <p className="text-center text-xs text-zinc-500 dark:text-neutral-400">{CONTEST_DAYS[sel] ?? 'Pick a highlighted day'}</p>
    </div>
  );
}

// ── API Clinic: real method + send ──

export function ApiClinicDetail() {
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const send = () => { setLoading(true); setSent(false); setTimeout(() => { setLoading(false); setSent(true); }, 500); };
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex gap-1.5">
        {(['GET', 'POST'] as const).map((m) => (
          <button key={m} onClick={() => setMethod(m)} className={`rounded px-2 py-1 text-[10px] font-bold transition-colors ${method === m ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{m}</button>
        ))}
        <span className="flex-1 truncate self-center rounded border border-zinc-200 px-2 py-1 font-mono text-xs text-zinc-500 dark:border-neutral-700 dark:text-neutral-400">/api/users/42</span>
        <button onClick={send} disabled={loading} className="rounded bg-zinc-900 px-2.5 py-1 text-[10px] text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">{loading ? '…' : 'Send'}</button>
      </div>
      {sent && <span className="self-start rounded bg-emerald-100 px-2 py-1 font-mono text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">200 OK · 84ms</span>}
    </div>
  );
}

// ── DSA Roadmap: click a node to toggle done ──

export function DsaRoadmapDetail() {
  const [nodes, setNodes] = useState([true, true, false, false, false]);
  const toggle = (i: number) => setNodes((n) => n.map((v, j) => (j === i ? !v : v)));
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center">
        {nodes.map((done, i) => (
          <React.Fragment key={i}>
            <button onClick={() => toggle(i)} className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-zinc-400 dark:border-neutral-600 dark:text-neutral-500'}`}>{done ? '✓' : i + 1}</button>
            {i < nodes.length - 1 && <span className={`h-0.5 w-6 ${done ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-neutral-700'}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ── CodeChef MREC: click a row to spotlight ──

const LEADERBOARD = [{ n: 'Priya R.', s: 2840 }, { n: 'Rohan P.', s: 2715 }, { n: 'Alex M.', s: 2603 }, { n: 'Nina K.', s: 2490 }];
export function CodechefMrecDetail() {
  const [sel, setSel] = useState('Priya R.');
  return (
    <div className="flex h-full flex-col justify-center p-6">
      <p className="mb-2 text-center text-xs text-zinc-500 dark:text-neutral-400">Chapter Contest · 1,024 joined</p>
      <div className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-100 dark:divide-neutral-800 dark:border-neutral-800">
        {LEADERBOARD.map((r, i) => (
          <button key={r.n} onClick={() => setSel(r.n)} className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors ${sel === r.n ? 'bg-zinc-50 dark:bg-neutral-800/50' : ''}`}>
            <span className="w-4 text-xs font-bold text-zinc-400">{i + 1}</span>
            <span className="flex-1 text-xs text-zinc-700 dark:text-neutral-300">{r.n}</span>
            <span className="font-mono text-xs text-zinc-400 dark:text-neutral-500">{r.s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Dekho Car: step through booking states ──

const BOOKING_STATES = ['Pending', 'Confirmed', 'Active', 'Returned'];
export function DekhoCarDetail() {
  const [i, setI] = useState(0);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <span className="text-3xl">🚗</span>
      <div className="flex w-56 items-center justify-between">
        {BOOKING_STATES.map((s, si) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <span className={`h-2 w-2 rounded-full transition-colors ${si <= i ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-neutral-700'}`} />
            <span className={`text-[9px] ${si === i ? 'font-semibold text-zinc-700 dark:text-neutral-200' : 'text-zinc-400 dark:text-neutral-500'}`}>{s}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setI((v) => (v + 1) % BOOKING_STATES.length)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-neutral-100 dark:text-neutral-900">Advance booking</button>
    </div>
  );
}

// ── QR Generator: type text, generate a pattern from it ──

function textToCells(text: string) {
  let seed = 0;
  for (const ch of text) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  return Array.from({ length: 49 }, (_, i) => {
    const corner = (i < 21 && i % 7 < 3) || (i % 49 >= 28 && i % 7 < 3) || (i % 7 >= 4 && i < 21);
    return corner ? 1 : (i * 7 + seed) % 5 === 0 ? 1 : 0;
  });
}
export function QrGeneratorDetail() {
  const [text, setText] = useState('rohan.run');
  const cells = textToCells(text);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="grid grid-cols-7 gap-[2px] rounded bg-white p-2.5">
        {cells.map((v, i) => <span key={i} className={`h-2.5 w-2.5 ${v ? 'bg-zinc-900' : 'bg-white'}`} />)}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} className="w-40 rounded-lg border border-zinc-200 bg-transparent px-2.5 py-1.5 text-center text-xs text-zinc-700 focus:outline-none dark:border-neutral-700 dark:text-neutral-300" />
    </div>
  );
}

// ── YouTube Thumbnail Downloader: fetch resolutions ──

export function YoutubeThumbnailsDetail() {
  const [fetched, setFetched] = useState(false);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex aspect-video w-40 items-center justify-center rounded-md bg-zinc-800">
        <span className="flex h-6 w-9 items-center justify-center rounded-[6px] bg-red-600"><span className="ml-0.5 h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-white" /></span>
      </div>
      {!fetched ? (
        <button onClick={() => setFetched(true)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-neutral-100 dark:text-neutral-900">Fetch thumbnail</button>
      ) : (
        <div className="flex gap-1.5">
          {['maxres', 'hq', 'mq', 'default'].map((r) => <span key={r} className="rounded bg-zinc-100 px-2 py-1 text-[10px] text-zinc-600 dark:bg-neutral-800 dark:text-neutral-400">{r}.jpg</span>)}
        </div>
      )}
    </div>
  );
}

// ── MCU Timeline: click a block for the title ──

const MCU_MOVIES = [
  { c: '#1e3a8a', t: 'Captain America: The First Avenger', y: 1943 },
  { c: '#7c2d12', t: 'Captain Marvel', y: 1995 },
  { c: '#166534', t: 'Iron Man', y: 2010 },
  { c: '#581c87', t: 'The Avengers', y: 2012 },
  { c: '#9a3412', t: 'Avengers: Infinity War', y: 2018 },
];
export function McuTimelineDetail() {
  const [sel, setSel] = useState(2);
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex items-end justify-center gap-1.5">
        {MCU_MOVIES.map((m, i) => (
          <button key={m.t} onClick={() => setSel(i)} className="rounded-sm transition-all" style={{ backgroundColor: m.c, width: 20, height: i === sel ? 56 : 36 }} />
        ))}
      </div>
      <p className="text-center text-xs text-zinc-500 dark:text-neutral-400">{MCU_MOVIES[sel].t} · set {MCU_MOVIES[sel].y}</p>
    </div>
  );
}

// ── Portfolio v4: click taskbar apps to open windows ──

export function PortfolioV4Detail() {
  const [openApps, setOpenApps] = useState<string[]>(['About.exe']);
  const toggle = (app: string) => setOpenApps((a) => (a.includes(app) ? a.filter((x) => x !== app) : [...a, app]));
  return (
    <div className="flex h-full flex-col justify-end p-3" style={{ backgroundColor: '#008080' }}>
      <div className="relative mb-2 flex-1">
        {openApps.map((app, i) => (
          <div key={app} className="absolute w-28 border border-black bg-[#c0c0c0]" style={{ left: 8 + i * 18, top: 8 + i * 14, boxShadow: '1px 1px 0 #fff inset, -1px -1px 0 #808080 inset' }}>
            <div className="flex items-center justify-between bg-[#000080] px-1 py-0.5 text-[9px] text-white"><span>{app}</span><button onClick={() => toggle(app)} className="bg-[#c0c0c0] px-1 text-black">×</button></div>
            <div className="h-10" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 border-t-2 border-white bg-[#c0c0c0] px-1 py-1">
        <span className="rounded-sm border border-black bg-[#c0c0c0] px-1.5 py-0.5 text-[9px] font-bold">Start</span>
        {['About.exe', 'Work', 'Contact'].map((app) => (
          <button key={app} onClick={() => toggle(app)} className={`border border-black px-1.5 py-0.5 text-[9px] ${openApps.includes(app) ? 'bg-white' : 'bg-[#c0c0c0]'}`}>{app}</button>
        ))}
      </div>
    </div>
  );
}

// ── Portfolio v3: minimal hero with a scroll reveal ──

export function PortfolioV3Detail() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <span className="text-xl font-medium tracking-tight text-zinc-800 dark:text-paper">Rohan</span>
      <span className="text-xs text-zinc-400 dark:text-neutral-500">Software Engineer</span>
      {revealed ? (
        <p className="mt-3 max-w-[200px] text-center text-xs text-zinc-500 dark:text-neutral-400">Building things that are useful, fast, and a little bit fun.</p>
      ) : (
        <button onClick={() => setRevealed(true)} className="mt-3 text-zinc-300 hover:text-zinc-500 dark:text-neutral-600">↓</button>
      )}
    </div>
  );
}

// ── Portfolio v2: replay the GSAP-style stagger ──

export function PortfolioV2Detail() {
  const [key, setKey] = useState(0);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div key={key} className="flex flex-col items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2 rounded bg-zinc-300 dark:bg-neutral-600" style={{ width: 90 - i * 18, animation: `v2RevealD 0.6s ease-out ${i * 0.12}s both` }} />
        ))}
      </div>
      <button onClick={() => setKey((k) => k + 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/40">Replay animation</button>
      <style>{`@keyframes v2RevealD { 0%{ transform: translateY(10px); opacity:0 } 100%{ transform: translateY(0); opacity:1 } }`}</style>
    </div>
  );
}

// ── Portfolio v1: cycle anime-pastel themes ──

const V1_THEMES = [
  { from: 'from-pink-200', via: 'via-purple-200', to: 'to-indigo-200', text: 'text-purple-700' },
  { from: 'from-rose-200', via: 'via-fuchsia-200', to: 'to-violet-200', text: 'text-fuchsia-700' },
  { from: 'from-sky-200', via: 'via-indigo-200', to: 'to-purple-200', text: 'text-indigo-700' },
];
export function PortfolioV1Detail() {
  const [i, setI] = useState(0);
  const t = V1_THEMES[i];
  return (
    <button onClick={() => setI((v) => (v + 1) % V1_THEMES.length)} className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br ${t.from} ${t.via} ${t.to} dark:from-pink-900/40 dark:via-purple-900/40 dark:to-indigo-900/40`}>
      <span className="text-lg">✦</span>
      <span className={`text-sm font-semibold ${t.text} dark:text-purple-300`}>Rohan.dev</span>
      <span className="text-[10px] text-zinc-500/70 dark:text-neutral-500">click to change theme</span>
    </button>
  );
}
