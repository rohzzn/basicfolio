'use client';

import React, { useEffect, useState } from 'react';
import { Frame } from '../shared';

// ── Mac: multiple windows, click-to-front, each with real content, live clock ──

const DOCK_APPS = [
  { c: '#60a5fa', label: 'Finder' }, { c: '#34d399', label: 'Notes' }, { c: '#f472b6', label: 'Photos' },
  { c: '#fbbf24', label: 'Mail' }, { c: '#a78bfa', label: 'Terminal' },
];
const WINDOW_CONTENT: Record<string, React.ReactNode> = {
  Finder: <div className="grid grid-cols-4 gap-2 p-3">{['📁 Projects', '📁 Photos', '📄 resume.pdf', '📁 Music'].map((f) => <div key={f} className="flex flex-col items-center gap-1 text-[9px] text-zinc-600 dark:text-neutral-300"><span className="text-lg">{f.split(' ')[0]}</span>{f.split(' ')[1]}</div>)}</div>,
  Notes: <div className="p-3 text-xs text-zinc-700 dark:text-neutral-300"><p className="mb-1 font-semibold">Today</p><p className="text-zinc-500 dark:text-neutral-400">Ship the Mac desktop demo. Add drag support next.</p></div>,
  Photos: <div className="grid grid-cols-3 gap-1 p-2">{['#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#f87171'].map((c, i) => <div key={i} className="aspect-square rounded" style={{ backgroundColor: c, opacity: 0.7 }} />)}</div>,
  Mail: <div className="divide-y divide-zinc-100 text-xs dark:divide-neutral-800">{['Vanshita — lunch?', 'GitHub — new star', 'Vercel — deployed'].map((m) => <div key={m} className="px-3 py-1.5 text-zinc-600 dark:text-neutral-300">{m}</div>)}</div>,
  Terminal: <div className="bg-zinc-950 p-3 font-mono text-[10px] text-emerald-400">$ whoami<br />rohan<br />$ █</div>,
};
export function MacDetail() {
  const [windows, setWindows] = useState<string[]>(['Finder']);
  const [front, setFront] = useState('Finder');
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const open = (app: string) => {
    setWindows((w) => (w.includes(app) ? w : [...w, app]));
    setFront(app);
  };
  const close = (app: string) => {
    setWindows((w) => w.filter((x) => x !== app));
  };
  const time = clock.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <div className="relative flex h-full flex-col justify-end overflow-hidden bg-gradient-to-b from-sky-300 to-sky-500 dark:from-slate-700 dark:to-slate-900">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-white/30 px-3 py-1 text-xs text-white backdrop-blur-sm">
        <span className="font-medium">{front}</span><span>{time}</span>
      </div>
      {windows.map((app, i) => (
        <div
          key={app}
          onMouseDown={() => setFront(app)}
          className="absolute w-52 overflow-hidden rounded-lg border border-white/40 bg-white/95 shadow-xl backdrop-blur dark:bg-neutral-900/95"
          style={{ left: 24 + i * 20, top: 20 + i * 18, zIndex: front === app ? 20 : 10 }}
        >
          <div className="flex items-center justify-between bg-zinc-100 px-2 py-1 dark:bg-neutral-800">
            <div className="flex gap-1">
              <button onClick={() => close(app)} className="h-2 w-2 rounded-full bg-red-400 hover:bg-red-500" aria-label={`Close ${app}`} />
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="h-2 w-2 rounded-full bg-green-400" />
            </div>
            <span className="text-[9px] text-zinc-500 dark:text-neutral-400">{app}</span>
            <span className="w-2" />
          </div>
          <div className="max-h-28 overflow-hidden">{WINDOW_CONTENT[app]}</div>
        </div>
      ))}
      <div className="relative z-30 mx-auto mb-3 flex items-end gap-2 rounded-xl bg-white/25 px-3 py-1.5 backdrop-blur-sm">
        {DOCK_APPS.map((a) => (
          <button key={a.label} onClick={() => open(a.label)} className="h-6 w-6 rounded-[7px] transition-transform hover:-translate-y-1" style={{ backgroundColor: a.c }} title={a.label} />
        ))}
      </div>
    </div>
  );
}

// ── Quire: page thumbnails, toolbar, in-place edit, signature ──

const QUIRE_PAGES = [
  ['Invoice #2291', 'Total due: $1,240.00', 'Payment terms: Net 30'],
  ['Line items', '3x Design consult — $400', '1x Development — $840'],
  ['Signature', 'Signed, Rohan Pothuru', 'Date: 08/17/2026'],
];
const QUIRE_TOOLS = ['Text', 'Sign', 'Image', 'Fill'];
export function QuireDetail() {
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(0);
  const [tool, setTool] = useState('Text');
  const [signed, setSigned] = useState(false);
  return (
    <Frame>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-14 flex-col gap-2 border-r border-zinc-100 bg-zinc-50 p-2 dark:border-neutral-800 dark:bg-neutral-900">
          {QUIRE_PAGES.map((_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`h-12 rounded border text-[8px] font-medium ${page === i ? 'border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'border-zinc-200 bg-white text-zinc-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-500'}`}>
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-2.5 px-6 py-5">
          {QUIRE_PAGES[page].map((l, i) => (
            <button key={i} onClick={() => setEditing(i)} className={`block w-full rounded px-1.5 py-1 text-left text-sm transition-colors ${editing === i ? 'bg-blue-50 text-zinc-800 ring-1 ring-blue-300 dark:bg-blue-900/30 dark:text-paper dark:ring-blue-700' : 'text-zinc-500 hover:bg-zinc-50 dark:text-neutral-400 dark:hover:bg-neutral-800/40'}`}>{l}</button>
          ))}
          {page === 2 && (
            <button onClick={() => setSigned((s) => !s)} className="mt-2 block">
              {signed ? (
                <svg width="70" height="24" viewBox="0 0 70 24" className="text-zinc-700 dark:text-neutral-300"><path d="M2 18 Q12 4 22 18 T42 18 T64 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              ) : (
                <span className="text-xs text-blue-500 underline">Click to sign</span>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 border-t border-zinc-100 px-2 py-1.5 dark:border-neutral-800">
        {QUIRE_TOOLS.map((t) => (
          <button key={t} onClick={() => setTool(t)} className={`rounded px-2 py-1 text-[10px] ${tool === t ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-zinc-500 hover:bg-zinc-100 dark:text-neutral-400 dark:hover:bg-neutral-800'}`}>{t}</button>
        ))}
        <span className="ml-auto text-[10px] text-zinc-400 dark:text-neutral-500">{page + 1} / {QUIRE_PAGES.length}</span>
      </div>
    </Frame>
  );
}

// ── Still Flying: more craft, mission clock, a stats panel ──

const CRAFT = [
  { name: 'Voyager 1', r: 46, color: '#f59e0b', dist: '166 AU', speed: '17 km/s', launched: 1977 },
  { name: 'New Horizons', r: 36, color: '#34d399', dist: '58 AU', speed: '14.5 km/s', launched: 2006 },
  { name: 'Parker Solar Probe', r: 22, color: '#f87171', dist: '0.06 AU', speed: '190 km/s', launched: 2018 },
  { name: 'ISS', r: 14, color: '#60a5fa', dist: 'LEO', speed: '7.66 km/s', launched: 1998 },
];
export function SpaceDetail() {
  const [sel, setSel] = useState(CRAFT[0]);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-zinc-950 py-4">
      <div className="relative flex h-40 w-40 items-center justify-center">
        {CRAFT.map((c) => (
          <span
            key={c.name}
            className={`absolute rounded-full border ${sel.name === c.name ? 'border-zinc-500' : 'border-zinc-800'}`}
            style={{ width: c.r * 2, height: c.r * 2 }}
          />
        ))}
        <span className="absolute h-2.5 w-2.5 rounded-full bg-amber-300" style={{ boxShadow: '0 0 8px rgba(252,211,77,0.6)' }} />
        {CRAFT.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setSel(c)}
            className="absolute h-2 w-2 rounded-full transition-transform hover:scale-150"
            style={{ backgroundColor: c.color, animation: `spaceOrbit${i} ${8 + i * 4}s linear infinite`, top: `calc(50% - ${c.r}px)`, left: '50%' }}
          />
        ))}
      </div>
      <div className="w-48 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-center">
        <p className="text-xs font-medium text-white">{sel.name}</p>
        <div className="mt-1 grid grid-cols-3 gap-1 text-[9px] text-zinc-400">
          <span>{sel.dist}</span><span>{sel.speed}</span><span>since {sel.launched}</span>
        </div>
      </div>
      <p className="font-mono text-[9px] text-zinc-600">mission clock T+{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</p>
      <style>{`
        @keyframes spaceOrbit0 { from{ transform: rotate(0deg) translateX(46px) rotate(0deg) } to{ transform: rotate(360deg) translateX(46px) rotate(-360deg) } }
        @keyframes spaceOrbit1 { from{ transform: rotate(90deg) translateX(36px) rotate(-90deg) } to{ transform: rotate(450deg) translateX(36px) rotate(-450deg) } }
        @keyframes spaceOrbit2 { from{ transform: rotate(180deg) translateX(22px) rotate(-180deg) } to{ transform: rotate(540deg) translateX(22px) rotate(-540deg) } }
        @keyframes spaceOrbit3 { from{ transform: rotate(270deg) translateX(14px) rotate(-270deg) } to{ transform: rotate(630deg) translateX(14px) rotate(-630deg) } }
      `}</style>
    </div>
  );
}

// ── Languages: more eras, a zoom/scale indicator ──

const ERAS = [
  { e: '2020 CE', fact: 'Over 7,000 living languages recorded', scale: '1x' },
  { e: '1440 CE', fact: 'Gutenberg printing press spreads literacy', scale: '30x' },
  { e: '1200 BCE', fact: 'Phoenician alphabet begins spreading by trade', scale: '160x' },
  { e: '1800 BCE', fact: 'Proto-Sinaitic script, ancestor of most alphabets', scale: '190x' },
  { e: '3200 BCE', fact: 'Cuneiform: the earliest known writing system', scale: '260x' },
];
export function LanguagesLatDetail() {
  const [sel, setSel] = useState(0);
  return (
    <div className="flex h-full items-center justify-between px-8">
      <div className="relative">
        <div className="absolute bottom-0 left-1.5 top-0 w-px bg-zinc-200 dark:bg-neutral-700" />
        <div className="space-y-3.5">
          {ERAS.map((e, i) => (
            <button key={e.e} onClick={() => setSel(i)} className="flex items-center gap-3 text-left">
              <span className={`relative z-10 h-3 w-3 rounded-full border-2 transition-colors ${i === sel ? 'border-zinc-800 bg-zinc-800 dark:border-paper dark:bg-paper' : 'border-zinc-300 bg-white dark:border-neutral-600 dark:bg-neutral-950'}`} />
              <span className={`font-mono text-xs ${i === sel ? 'font-medium text-zinc-800 dark:text-paper' : 'text-zinc-400 dark:text-neutral-500'}`}>{e.e}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-[180px] text-right">
        <p className="text-xs text-zinc-600 dark:text-neutral-300">{ERAS[sel].fact}</p>
        <p className="mt-2 font-mono text-[10px] text-zinc-400 dark:text-neutral-500">zoom {ERAS[sel].scale}</p>
      </div>
    </div>
  );
}

// ── Margin: reading pane with theme toggle and page progress ──

const MARGIN_THEMES = {
  light: { bg: 'bg-white', text: 'text-zinc-700', bar: 'bg-zinc-200' },
  sepia: { bg: 'bg-amber-50', text: 'text-amber-900', bar: 'bg-amber-200' },
  dark: { bg: 'bg-zinc-900', text: 'text-zinc-300', bar: 'bg-zinc-700' },
};
export function MarginDetail() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [theme, setTheme] = useState<keyof typeof MARGIN_THEMES>('light');
  const [page, setPage] = useState(3);
  const scale = { sm: 0.85, md: 1, lg: 1.2 }[size];
  const t = MARGIN_THEMES[theme];
  return (
    <div className={`group flex h-full flex-col justify-center gap-2.5 px-10 transition-colors ${t.bg}`}>
      <p className={`mb-1 text-[10px] uppercase tracking-wide ${t.text} opacity-60`}>Chapter 3</p>
      <div className={`h-1 rounded ${t.bar}`} style={{ width: `${33 * scale}%` }} />
      {[100, 100, 80, 100, 65].map((w, i) => (
        <div key={i} className={`rounded ${t.bar}`} style={{ width: `${w}%`, height: 3 * scale }} />
      ))}
      <div className="mt-3 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex gap-1.5">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`h-5 w-5 rounded-full text-[9px] ${size === s ? 'bg-zinc-800 text-white dark:bg-neutral-200 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-400 dark:bg-neutral-800'}`}>A</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(Object.keys(MARGIN_THEMES) as (keyof typeof MARGIN_THEMES)[]).map((k) => (
            <button key={k} onClick={() => setTheme(k)} className={`h-4 w-4 rounded-full border ${theme === k ? 'border-blue-500' : 'border-zinc-300'} ${MARGIN_THEMES[k].bg}`} title={k} />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input type="range" min={1} max={12} value={page} onChange={(e) => setPage(Number(e.target.value))} className="flex-1" />
        <span className={`font-mono text-[9px] ${t.text} opacity-60`}>{page}/12</span>
      </div>
    </div>
  );
}

// ── Contests: platform colors, notification toggle, upcoming list ──

const CONTEST_EVENTS = [
  { d: 4, name: 'Codeforces Round 921', color: 'bg-red-500' },
  { d: 9, name: 'LeetCode Weekly 380', color: 'bg-amber-500' },
  { d: 15, name: 'AtCoder Beginner 340', color: 'bg-blue-500' },
  { d: 22, name: 'HackerRank Sprint', color: 'bg-violet-500' },
];
export function ContestsDetail() {
  const [sel, setSel] = useState(4);
  const [notify, setNotify] = useState(true);
  const selEvent = CONTEST_EVENTS.find((e) => e.d === sel);
  return (
    <div className="flex h-full items-center justify-between px-6">
      <div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => {
            const ev = CONTEST_EVENTS.find((e) => e.d === i);
            return (
              <button key={i} onClick={() => ev && setSel(i)} className={`flex aspect-square h-6 w-6 items-center justify-center rounded text-[10px] transition-colors ${ev ? `${ev.color} text-white ${sel === i ? 'ring-2 ring-offset-1 ring-zinc-400' : ''}` : 'text-zinc-300 dark:text-neutral-700'}`}>{i + 1}</button>
            );
          })}
        </div>
      </div>
      <div className="w-40">
        <p className="text-sm font-medium text-zinc-700 dark:text-neutral-200">{selEvent?.name ?? 'Pick a day'}</p>
        <button onClick={() => setNotify((n) => !n)} className="mt-3 flex items-center gap-2 text-xs">
          <span className={`relative h-4 w-7 rounded-full transition-colors ${notify ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-neutral-700'}`}><span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${notify ? 'left-3.5' : 'left-0.5'}`} /></span>
          <span className="text-zinc-500 dark:text-neutral-400">Notify me</span>
        </button>
        <div className="mt-3 space-y-1">
          {CONTEST_EVENTS.map((e) => (
            <div key={e.name} className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-neutral-400"><span className={`h-1.5 w-1.5 rounded-full ${e.color}`} />{e.name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── API Clinic: methods, real JSON body, request history ──

const API_ROUTES: Record<string, { status: string; body: string }> = {
  GET: { status: '200 OK · 84ms', body: '{ "id": 42, "name": "Rohan" }' },
  POST: { status: '201 Created · 112ms', body: '{ "id": 43, "created": true }' },
  PUT: { status: '200 OK · 97ms', body: '{ "id": 42, "updated": true }' },
  DELETE: { status: '204 No Content · 41ms', body: '' },
};
export function ApiClinicDetail() {
  const [method, setMethod] = useState<keyof typeof API_ROUTES>('GET');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ method: string; status: string }[]>([]);
  const [result, setResult] = useState<{ status: string; body: string } | null>(null);
  const send = () => {
    setLoading(true); setResult(null);
    setTimeout(() => {
      setLoading(false);
      const r = API_ROUTES[method];
      setResult(r);
      setHistory((h) => [{ method, status: r.status }, ...h].slice(0, 4));
    }, 500);
  };
  return (
    <div className="flex h-full gap-4 p-6">
      <div className="flex-1">
        <div className="flex gap-1.5">
          {(Object.keys(API_ROUTES) as (keyof typeof API_ROUTES)[]).map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={`rounded px-2 py-1 text-[10px] font-bold transition-colors ${method === m ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{m}</button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="flex-1 truncate rounded border border-zinc-200 px-2 py-1 font-mono text-xs text-zinc-500 dark:border-neutral-700 dark:text-neutral-400">/api/users/42</span>
          <button onClick={send} disabled={loading} className="rounded bg-zinc-900 px-2.5 py-1 text-[10px] text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">{loading ? '…' : 'Send'}</button>
        </div>
        {result && (
          <div className="mt-3 rounded-lg border border-zinc-100 p-2 dark:border-neutral-800">
            <p className="mb-1 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{result.status}</p>
            {result.body && <pre className="font-mono text-[10px] text-zinc-500 dark:text-neutral-400">{result.body}</pre>}
          </div>
        )}
      </div>
      <div className="w-28 shrink-0 border-l border-zinc-100 pl-3 dark:border-neutral-800">
        <p className="mb-1.5 text-[9px] font-medium text-zinc-400 dark:text-neutral-500">History</p>
        <div className="space-y-1">
          {history.length === 0 && <p className="text-[9px] text-zinc-300 dark:text-neutral-700">No requests yet</p>}
          {history.map((h, i) => (
            <div key={i} className="text-[9px] text-zinc-500 dark:text-neutral-400"><span className="font-bold">{h.method}</span> {h.status.split(' ')[0]}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DSA Roadmap: labeled topics, toggle done, percent complete ──

const DSA_TOPICS = ['Arrays', 'Trees', 'Graphs', 'DP', 'Systems'];
export function DsaRoadmapDetail() {
  const [nodes, setNodes] = useState([true, true, false, false, false]);
  const toggle = (i: number) => setNodes((n) => n.map((v, j) => (j === i ? !v : v)));
  const pct = Math.round((nodes.filter(Boolean).length / nodes.length) * 100);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex items-center">
        {nodes.map((done, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => toggle(i)} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 text-zinc-400 dark:border-neutral-600 dark:text-neutral-500'}`}>{done ? '✓' : i + 1}</button>
              <span className="text-[9px] text-zinc-500 dark:text-neutral-400">{DSA_TOPICS[i]}</span>
            </div>
            {i < nodes.length - 1 && <span className={`mb-4 h-0.5 w-8 ${done ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-neutral-700'}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex w-48 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-neutral-800">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-xs text-zinc-500 dark:text-neutral-400">{pct}%</span>
      </div>
    </div>
  );
}

// ── CodeChef MREC: more rows, avatars, rank-change flash on select ──

const LEADERBOARD = [
  { n: 'Priya R.', s: 2840 }, { n: 'Rohan P.', s: 2715 }, { n: 'Alex M.', s: 2603 },
  { n: 'Nina K.', s: 2490 }, { n: 'Sam T.', s: 2402 }, { n: 'Jae P.', s: 2355 },
];
export function CodechefMrecDetail() {
  const [sel, setSel] = useState('Priya R.');
  const selRow = LEADERBOARD.find((r) => r.n === sel)!;
  const rank = LEADERBOARD.findIndex((r) => r.n === sel) + 1;
  return (
    <div className="flex h-full flex-col p-6">
      <p className="mb-2 text-center text-xs text-zinc-500 dark:text-neutral-400">Chapter Contest · 1,024 joined</p>
      <div className="flex-1 divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-100 dark:divide-neutral-800 dark:border-neutral-800">
        {LEADERBOARD.map((r, i) => (
          <button key={r.n} onClick={() => setSel(r.n)} className={`flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors ${sel === r.n ? 'bg-zinc-50 dark:bg-neutral-800/50' : ''}`}>
            <span className="w-4 text-xs font-bold text-zinc-400">{i + 1}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-bold text-zinc-600 dark:bg-neutral-700 dark:text-neutral-300">{r.n[0]}</span>
            <span className="flex-1 text-xs text-zinc-700 dark:text-neutral-300">{r.n}</span>
            <span className="font-mono text-xs text-zinc-400 dark:text-neutral-500">{r.s}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-zinc-400 dark:text-neutral-500">{selRow.n} is ranked #{rank} of {LEADERBOARD.length} shown</p>
    </div>
  );
}

// ── Dekho Car: booking stepper with dates, confirmation code, reset ──

const BOOKING_STATES = ['Pending', 'Confirmed', 'Active', 'Returned'];
export function DekhoCarDetail() {
  const [i, setI] = useState(0);
  const code = 'DK-4471';
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <span className="text-3xl">🚗</span>
      <div className="flex gap-3 text-[10px] text-zinc-500 dark:text-neutral-400">
        <span>Pickup Aug 20</span><span>·</span><span>Return Aug 24</span>
      </div>
      <div className="flex w-56 items-center justify-between">
        {BOOKING_STATES.map((s, si) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <span className={`h-2 w-2 rounded-full transition-colors ${si <= i ? 'bg-blue-500' : 'bg-zinc-200 dark:bg-neutral-700'}`} />
            <span className={`text-[9px] ${si === i ? 'font-semibold text-zinc-700 dark:text-neutral-200' : 'text-zinc-400 dark:text-neutral-500'}`}>{s}</span>
          </div>
        ))}
      </div>
      {i >= 1 && <p className="font-mono text-[10px] text-zinc-400 dark:text-neutral-500">confirmation {code}</p>}
      <div className="flex gap-2">
        <button onClick={() => setI((v) => Math.min(v + 1, BOOKING_STATES.length - 1))} disabled={i === BOOKING_STATES.length - 1} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900">Advance booking</button>
        <button onClick={() => setI(0)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 dark:border-neutral-700 dark:text-neutral-400">Reset</button>
      </div>
    </div>
  );
}

// ── QR Generator: format selector, size, download feedback ──

const QR_FORMATS = ['URL', 'Text', 'WiFi', 'vCard'];
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
  const [format, setFormat] = useState('URL');
  const [size, setSize] = useState(256);
  const [saved, setSaved] = useState(false);
  const cells = textToCells(text + format);
  const download = () => { setSaved(true); setTimeout(() => setSaved(false), 1500); };
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex gap-1">
        {QR_FORMATS.map((f) => (
          <button key={f} onClick={() => setFormat(f)} className={`rounded px-2 py-0.5 text-[10px] ${format === f ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{f}</button>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[2px] rounded bg-white p-2.5">
        {cells.map((v, i) => <span key={i} className={`h-2.5 w-2.5 ${v ? 'bg-zinc-900' : 'bg-white'}`} />)}
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} className="w-40 rounded-lg border border-zinc-200 bg-transparent px-2.5 py-1.5 text-center text-xs text-zinc-700 focus:outline-none dark:border-neutral-700 dark:text-neutral-300" />
      <div className="flex items-center gap-2">
        <input type="range" min={128} max={512} step={64} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24" />
        <span className="font-mono text-[10px] text-zinc-400 dark:text-neutral-500">{size}px</span>
        <button onClick={download} className="rounded bg-zinc-900 px-2 py-1 text-[10px] text-white dark:bg-neutral-100 dark:text-neutral-900">{saved ? 'Saved!' : 'Download'}</button>
      </div>
    </div>
  );
}

// ── YouTube Thumbnail Downloader: URL input, resolutions with sizes ──

const YT_RESOLUTIONS = [
  { r: 'maxresdefault', size: '1280×720', kb: '92 KB' },
  { r: 'hqdefault', size: '480×360', kb: '24 KB' },
  { r: 'mqdefault', size: '320×180', kb: '11 KB' },
  { r: 'default', size: '120×90', kb: '3 KB' },
];
export function YoutubeThumbnailsDetail() {
  const [url, setUrl] = useState('youtube.com/watch?v=dQw4w9WgXcQ');
  const [fetched, setFetched] = useState(false);
  const [selected, setSelected] = useState(0);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <input value={url} onChange={(e) => { setUrl(e.target.value); setFetched(false); }} className="w-56 rounded border border-zinc-200 bg-transparent px-2 py-1 text-center font-mono text-[10px] text-zinc-600 focus:outline-none dark:border-neutral-700 dark:text-neutral-300" />
      <div className="relative flex aspect-video w-40 items-center justify-center rounded-md bg-zinc-800">
        <span className="flex h-6 w-9 items-center justify-center rounded-[6px] bg-red-600"><span className="ml-0.5 h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-white" /></span>
      </div>
      {!fetched ? (
        <button onClick={() => setFetched(true)} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-neutral-100 dark:text-neutral-900">Fetch thumbnail</button>
      ) : (
        <div className="w-56 space-y-1">
          {YT_RESOLUTIONS.map((res, i) => (
            <button key={res.r} onClick={() => setSelected(i)} className={`flex w-full items-center justify-between rounded px-2 py-1 text-[10px] transition-colors ${selected === i ? 'bg-zinc-100 dark:bg-neutral-800' : ''}`}>
              <span className="text-zinc-600 dark:text-neutral-400">{res.r}.jpg</span>
              <span className="text-zinc-400 dark:text-neutral-500">{res.size} · {res.kb}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MCU Timeline: more movies, phase grouping, order toggle ──

const MCU_MOVIES = [
  { c: '#1e3a8a', t: 'Captain America: The First Avenger', y: 1943, phase: 1 },
  { c: '#1e3a8a', t: 'Captain Marvel', y: 1995, phase: 3 },
  { c: '#166534', t: 'Iron Man 2', y: 2010, phase: 1 },
  { c: '#166534', t: 'Thor', y: 2011, phase: 1 },
  { c: '#581c87', t: 'The Avengers', y: 2012, phase: 1 },
  { c: '#581c87', t: 'Guardians of the Galaxy', y: 2014, phase: 2 },
  { c: '#9a3412', t: 'Avengers: Infinity War', y: 2018, phase: 3 },
  { c: '#9a3412', t: 'Avengers: Endgame', y: 2023, phase: 3 },
];
const PHASE_COLOR: Record<number, string> = { 1: '#1e3a8a', 2: '#166534', 3: '#9a3412' };
export function McuTimelineDetail() {
  const [sel, setSel] = useState(4);
  const [order, setOrder] = useState<'story' | 'release'>('story');
  const list = order === 'story' ? MCU_MOVIES : [...MCU_MOVIES].sort((a, b) => a.y - b.y);
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex justify-center gap-1.5">
        {(['story', 'release'] as const).map((o) => (
          <button key={o} onClick={() => setOrder(o)} className={`rounded px-2 py-0.5 text-[10px] capitalize ${order === o ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{o} order</button>
        ))}
      </div>
      <div className="flex items-end justify-center gap-1">
        {list.map((m) => (
          <button key={m.t} onClick={() => setSel(MCU_MOVIES.indexOf(m))} className="rounded-sm transition-all" style={{ backgroundColor: m.c, width: 16, height: sel === MCU_MOVIES.indexOf(m) ? 52 : 32 }} title={m.t} />
        ))}
      </div>
      <p className="text-center text-xs text-zinc-500 dark:text-neutral-400">{MCU_MOVIES[sel].t} · {MCU_MOVIES[sel].y}</p>
      <div className="flex justify-center gap-3 text-[9px] text-zinc-400 dark:text-neutral-500">
        {[1, 2, 3].map((p) => <span key={p} className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PHASE_COLOR[p] }} />Phase {p}</span>)}
      </div>
    </div>
  );
}

// ── Portfolio v4: multi-window desktop with distinct content, drag-to-front ──

const V4_CONTENT: Record<string, React.ReactNode> = {
  'About.exe': <div className="p-1.5 text-[9px] text-black">Hi, I&apos;m Rohan. Software engineer who likes retro UIs.</div>,
  Work: <div className="grid grid-cols-3 gap-1 p-1.5">{['📁', '📁', '📄'].map((f, i) => <span key={i} className="text-center text-[10px]">{f}</span>)}</div>,
  Contact: <div className="space-y-1 p-1.5 text-[8px] text-black"><div className="border border-zinc-400 bg-white px-1">name@rohan.run</div><button className="border border-black bg-[#c0c0c0] px-1">Send</button></div>,
};
export function PortfolioV4Detail() {
  const [openApps, setOpenApps] = useState<string[]>(['About.exe']);
  const [front, setFront] = useState('About.exe');
  const toggle = (app: string) => {
    setOpenApps((a) => (a.includes(app) ? a.filter((x) => x !== app) : [...a, app]));
    setFront(app);
  };
  return (
    <div className="flex h-full flex-col justify-end p-3" style={{ backgroundColor: '#008080' }}>
      <div className="relative mb-2 flex-1">
        {openApps.map((app, i) => (
          <div
            key={app}
            onMouseDown={() => setFront(app)}
            className="absolute w-32 border border-black bg-[#c0c0c0]"
            style={{ left: 8 + i * 22, top: 8 + i * 16, boxShadow: '1px 1px 0 #fff inset, -1px -1px 0 #808080 inset', zIndex: front === app ? 10 : 1 }}
          >
            <div className="flex items-center justify-between bg-[#000080] px-1 py-0.5 text-[9px] text-white"><span>{app}</span><button onClick={() => toggle(app)} className="bg-[#c0c0c0] px-1 text-black">×</button></div>
            <div className="min-h-[40px]">{V4_CONTENT[app]}</div>
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

// ── Portfolio v3: a real 3-step minimal reveal journey ──

const V3_STEPS = [
  'Building things that are useful, fast, and a little bit fun.',
  'Currently: subscription trackers, uptime monitors, screen recorders.',
  'Say hi — hi@rohan.run',
];
export function PortfolioV3Detail() {
  const [step, setStep] = useState(-1);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <span className="text-xl font-medium tracking-tight text-zinc-800 dark:text-paper">Rohan</span>
      <span className="text-xs text-zinc-400 dark:text-neutral-500">Software Engineer</span>
      {step >= 0 && <p className="mt-3 max-w-[220px] text-center text-xs text-zinc-500 dark:text-neutral-400">{V3_STEPS[step]}</p>}
      <button
        onClick={() => setStep((s) => (s + 1) % V3_STEPS.length)}
        className="mt-3 text-zinc-300 transition-transform hover:translate-y-0.5 hover:text-zinc-500 dark:text-neutral-600"
      >
        ↓
      </button>
    </div>
  );
}

// ── Portfolio v2: staggered reveal across sections, cursor visits each ──

const V2_SECTIONS = ['Hero', 'Projects', 'Contact'];
export function PortfolioV2Detail() {
  const [key, setKey] = useState(0);
  const [section, setSection] = useState(0);
  const replay = () => { setKey((k) => k + 1); setSection((s) => (s + 1) % V2_SECTIONS.length); };
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex gap-3 text-[10px] text-zinc-400 dark:text-neutral-500">
        {V2_SECTIONS.map((s, i) => <span key={s} className={i === section ? 'font-semibold text-zinc-700 dark:text-neutral-200' : ''}>{s}</span>)}
      </div>
      <div key={key} className="flex flex-col items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2 rounded bg-zinc-300 dark:bg-neutral-600" style={{ width: 90 - i * 18, animation: `v2RevealD 0.6s ease-out ${i * 0.12}s both` }} />
        ))}
      </div>
      <button onClick={replay} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/40">Next section</button>
      <style>{`@keyframes v2RevealD { 0%{ transform: translateY(10px); opacity:0 } 100%{ transform: translateY(0); opacity:1 } }`}</style>
    </div>
  );
}

// ── Portfolio v1: more themes, each with its own motif ──

const V1_THEMES = [
  { from: 'from-pink-200', via: 'via-purple-200', to: 'to-indigo-200', text: 'text-purple-700', motif: '✦', name: 'Sakura' },
  { from: 'from-rose-200', via: 'via-fuchsia-200', to: 'to-violet-200', text: 'text-fuchsia-700', motif: '🌸', name: 'Blossom' },
  { from: 'from-sky-200', via: 'via-indigo-200', to: 'to-purple-200', text: 'text-indigo-700', motif: '🌙', name: 'Yozora' },
  { from: 'from-amber-200', via: 'via-orange-200', to: 'to-rose-200', text: 'text-orange-700', motif: '☀️', name: 'Natsu' },
];
export function PortfolioV1Detail() {
  const [i, setI] = useState(0);
  const t = V1_THEMES[i];
  return (
    <button onClick={() => setI((v) => (v + 1) % V1_THEMES.length)} className={`flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br ${t.from} ${t.via} ${t.to} dark:from-pink-900/40 dark:via-purple-900/40 dark:to-indigo-900/40`}>
      <span className="text-2xl">{t.motif}</span>
      <span className={`text-sm font-semibold ${t.text} dark:text-purple-300`}>Rohan.dev</span>
      <span className="text-[10px] text-zinc-500/70 dark:text-neutral-500">{t.name} theme · click to change</span>
    </button>
  );
}
