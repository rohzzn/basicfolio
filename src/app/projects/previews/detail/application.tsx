'use client';

import React, { useEffect, useState } from 'react';
import { Frame, WindowBar, dot } from '../shared';

// ── World Clock: six cities, 12/24h toggle, pin a city, per-key alarm ──

const WC_CITIES = [
  { label: 'New York', tz: 'America/New_York', accent: '#ff9f45' },
  { label: 'London', tz: 'Europe/London', accent: '#5ac8fa' },
  { label: 'Tokyo', tz: 'Asia/Tokyo', accent: '#34c759' },
  { label: 'Hyderabad', tz: 'Asia/Kolkata', accent: '#ff6b6b' },
  { label: 'Sydney', tz: 'Australia/Sydney', accent: '#bf5af2' },
  { label: 'Los Angeles', tz: 'America/Los_Angeles', accent: '#ffd60a' },
];
export function WorldClockDetail() {
  const [now, setNow] = useState<Date | null>(null);
  const [format, setFormat] = useState<'24' | '12'>('24');
  const [pinned, setPinned] = useState('New York');
  const [alarms, setAlarms] = useState<Set<string>>(new Set(['Tokyo']));
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const toggleAlarm = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlarms((a) => { const n = new Set(a); if (n.has(label)) n.delete(label); else n.add(label); return n; });
  };
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="grid grid-cols-3 gap-2">
        {WC_CITIES.map((c) => {
          const parts = now
            ? new Intl.DateTimeFormat('en-US', { timeZone: c.tz, hour: 'numeric', minute: '2-digit', hourCycle: format === '24' ? 'h23' : 'h12' }).format(now)
            : '--:--';
          const isPinned = pinned === c.label;
          return (
            <button
              key={c.label}
              onClick={() => setPinned(c.label)}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg bg-zinc-900 py-3 transition-all ${isPinned ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950' : ''}`}
              style={isPinned ? { boxShadow: `0 0 0 2px ${c.accent}` } : undefined}
            >
              <button onClick={(e) => toggleAlarm(c.label, e)} className="absolute right-1 top-1 text-[9px]" aria-label="toggle alarm">
                {alarms.has(c.label) ? '🔔' : '🔕'}
              </button>
              <span className="text-[8px] font-medium uppercase tracking-wide text-zinc-500">{c.label.split(' ')[0]}</span>
              <span className="font-mono text-[15px] font-medium tabular-nums" style={{ color: c.accent }}>{parts}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-500 dark:text-neutral-400">Pinned: <strong className="text-zinc-700 dark:text-neutral-200">{pinned}</strong> · {alarms.size} alarm{alarms.size !== 1 ? 's' : ''} set</span>
        <div className="flex gap-1.5">
          {(['24', '12'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${format === f ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-700 dark:bg-neutral-800 dark:text-neutral-400'}`}
            >
              {f}-hour
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Beam: record → pause → stop, resolution picker, growing file size ──

const BEAM_RES = ['720p', '1080p', '4K'];
export function BeamDetail() {
  const [state, setState] = useState<'recording' | 'paused' | 'stopped'>('recording');
  const [secs, setSecs] = useState(0);
  const [res, setRes] = useState('1080p');
  useEffect(() => {
    if (state !== 'recording') return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);
  const mb = (secs * (res === '4K' ? 2.4 : res === '1080p' ? 0.9 : 0.4)).toFixed(1);
  const bars = [6, 14, 9, 18, 7, 16, 5, 12, 8, 15];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950 p-6">
      <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
        {state === 'recording' ? dot('bg-red-500', true) : state === 'paused' ? <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />}
        <span className="font-mono text-sm font-medium tabular-nums text-zinc-200">
          {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-zinc-500">· {mb} MB</span>
      </div>
      <div className="flex h-10 items-end justify-center gap-1">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-zinc-600"
            style={state === 'recording' ? { height: h * 1.6, animation: `beamBarD 1.1s ease-in-out ${i * 0.08}s infinite alternate` } : { height: 4 }}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        {BEAM_RES.map((r) => (
          <button key={r} onClick={() => setRes(r)} className={`rounded px-2 py-0.5 text-[10px] ${res === r ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>{r}</button>
        ))}
      </div>
      <div className="flex gap-2">
        {state !== 'stopped' && (
          <button onClick={() => setState((s) => (s === 'recording' ? 'paused' : 'recording'))} className="rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/30">
            {state === 'recording' ? 'Pause' : 'Resume'}
          </button>
        )}
        <button
          onClick={() => setState((s) => (s === 'stopped' ? 'recording' : 'stopped'))}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${state === 'stopped' ? 'bg-zinc-100 text-zinc-900 hover:opacity-90' : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'}`}
        >
          {state === 'stopped' ? 'Start recording' : 'Stop'}
        </button>
      </div>
      <style>{`@keyframes beamBarD { 0%{ transform: scaleY(0.35) } 100%{ transform: scaleY(1) } }`}</style>
    </div>
  );
}

// ── Relay: click a monitor to inspect it, simulate an incident, notify channels ──

const RELAY_BASE = [
  { name: 'API Gateway', ms: 142 },
  { name: 'Database', ms: 58 },
  { name: 'Media Server', ms: 210 },
  { name: 'Edge Cache', ms: 22 },
];
const NOTIFY_CHANNELS = ['Email', 'Slack', 'SMS'];
export function RelayDetail() {
  const [down, setDown] = useState<string | null>(null);
  const [sel, setSel] = useState('API Gateway');
  const [channels, setChannels] = useState<Set<string>>(new Set(['Email', 'Slack']));
  const toggleChannel = (c: string) => setChannels((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-600 dark:text-neutral-300">{RELAY_BASE.length - (down ? 1 : 0)}/{RELAY_BASE.length} monitors up</span>
        <button onClick={() => setDown((d) => (d ? null : 'Media Server'))} className="rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] text-white hover:opacity-85 dark:bg-neutral-100 dark:text-neutral-900">
          {down ? 'Resolve incident' : 'Simulate incident'}
        </button>
      </div>
      <div className="flex-1 space-y-2.5 overflow-hidden">
        {RELAY_BASE.map((m) => {
          const isDown = m.name === down;
          const hist = Array.from({ length: 36 }, (_, i) => (isDown && i >= 33 ? 0 : 1));
          return (
            <button key={m.name} onClick={() => setSel(m.name)} className={`w-full rounded-md p-1.5 text-left transition-colors ${sel === m.name ? 'bg-zinc-50 dark:bg-neutral-800/50' : ''}`}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {dot(isDown ? 'bg-red-500' : 'bg-emerald-500', !isDown)}
                  <span className="text-xs font-medium text-zinc-700 dark:text-neutral-300">{m.name}</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 dark:text-neutral-500">{isDown ? 'down' : `${m.ms}ms`}</span>
              </div>
              <div className="flex gap-px">
                {hist.map((v, i) => <div key={i} className={`h-2 flex-1 rounded-sm ${v ? 'bg-emerald-400/80' : 'bg-red-400'}`} />)}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-neutral-800">
        <span className="text-[10px] text-zinc-400 dark:text-neutral-500">Notify via</span>
        <div className="flex gap-1">
          {NOTIFY_CHANNELS.map((c) => (
            <button key={c} onClick={() => toggleChannel(c)} className={`rounded px-1.5 py-0.5 text-[9px] ${channels.has(c) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-zinc-100 text-zinc-400 dark:bg-neutral-800 dark:text-neutral-500'}`}>{c}</button>
          ))}
        </div>
      </div>
      <code className="mt-2 block text-[10px] text-zinc-400 dark:text-neutral-500">docker run ghcr.io/rohzzn/relay</code>
    </div>
  );
}

// ── Keel: full subscription list, add/remove, category filter, annual toggle ──

const KEEL_ALL = [
  { n: 'Netflix', icon: '🎬', mo: 15.99, cat: 'Entertainment' },
  { n: 'Spotify', icon: '🎵', mo: 9.99, cat: 'Entertainment' },
  { n: 'iCloud+', icon: '☁️', mo: 2.99, cat: 'Utilities' },
  { n: 'GitHub Pro', icon: '🐙', mo: 4.0, cat: 'Work' },
  { n: 'Duolingo', icon: '🦜', mo: 6.99, cat: 'Learning' },
];
const KEEL_CATS = ['All', 'Entertainment', 'Work', 'Utilities', 'Learning'];
export function KeelDetail() {
  const [annual, setAnnual] = useState(false);
  const [subs, setSubs] = useState(KEEL_ALL);
  const [cat, setCat] = useState('All');
  const shown = cat === 'All' ? subs : subs.filter((s) => s.cat === cat);
  const total = shown.reduce((s, r) => s + (annual ? r.mo * 12 : r.mo), 0);
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-72 overflow-hidden rounded-xl border border-zinc-200 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-neutral-800">
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-neutral-500">{annual ? 'Annual' : 'Monthly'} total</p>
            <p className="text-lg font-semibold tabular-nums dark:text-paper">${total.toFixed(2)}</p>
          </div>
          <button onClick={() => setAnnual((a) => !a)} className={`rounded-full px-2.5 py-1 text-[10px] transition-colors ${annual ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>
            {annual ? 'Annual' : 'Monthly'}
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 px-3 py-1.5 dark:border-neutral-800">
          {KEEL_CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] ${cat === c ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{c}</button>
          ))}
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
          {shown.map((s) => (
            <div key={s.n} className="group flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2"><span>{s.icon}</span><span className="text-xs font-medium text-zinc-700 dark:text-neutral-300">{s.n}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums dark:text-paper">${(annual ? s.mo * 12 : s.mo).toFixed(2)}</span>
                <button onClick={() => setSubs((ss) => ss.filter((r) => r.n !== s.n))} className="text-zinc-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100 dark:text-neutral-600">×</button>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="px-4 py-3 text-center text-[10px] text-zinc-400 dark:text-neutral-500">No subscriptions in this category</p>}
        </div>
        <div className="bg-zinc-50 px-4 py-1.5 text-center text-[10px] text-zinc-400 dark:bg-neutral-800/40 dark:text-neutral-500">{subs.length} subscriptions total</div>
      </div>
    </div>
  );
}

// ── ShutTab: block a real site, schedule always/work-hours, live counter ──

export function ShutTabDetail() {
  const [sites, setSites] = useState([
    { domain: 'twitter.com', blocked: true },
    { domain: 'reddit.com', blocked: true },
    { domain: 'youtube.com', blocked: false },
  ]);
  const [adding, setAdding] = useState('');
  const [schedule, setSchedule] = useState<'always' | 'work'>('work');
  const [blockedToday, setBlockedToday] = useState(14);
  const toggle = (d: string) => {
    setSites((s) => s.map((x) => (x.domain === d ? { ...x, blocked: !x.blocked } : x)));
    setBlockedToday((c) => c + 1);
  };
  const add = () => {
    const d = adding.trim().replace(/^https?:\/\//, '').split('/')[0];
    if (d && !sites.find((s) => s.domain === d)) setSites((s) => [...s, { domain: d, blocked: true }]);
    setAdding('');
  };
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-72 overflow-hidden rounded-xl border border-zinc-200 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/60">
          <span className="text-xs font-semibold text-zinc-700 dark:text-neutral-300">ShutTab</span>
          <span className="text-[10px] text-zinc-400">{blockedToday} blocked today</span>
        </div>
        <div className="flex gap-1 border-b border-zinc-100 px-3 py-1.5 dark:border-neutral-800">
          {(['work', 'always'] as const).map((s) => (
            <button key={s} onClick={() => setSchedule(s)} className={`rounded-full px-2 py-0.5 text-[9px] capitalize ${schedule === s ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{s === 'work' ? 'Work hours' : 'Always'}</button>
          ))}
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
          {sites.map((s) => (
            <div key={s.domain} className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-xs text-zinc-700 dark:text-neutral-300">{s.domain}</span>
              <button
                role="switch"
                aria-checked={s.blocked}
                onClick={() => toggle(s.domain)}
                className={`relative h-5 w-9 rounded-full transition-colors ${s.blocked ? 'bg-red-500' : 'bg-green-500'}`}
              >
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${s.blocked ? 'translate-x-0' : 'translate-x-4'}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 border-t border-zinc-100 px-3 py-2 dark:border-neutral-800">
          <input value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="site.com" className="flex-1 rounded border border-zinc-200 bg-transparent px-2 py-1 font-mono text-[11px] text-zinc-700 placeholder-zinc-400 focus:outline-none dark:border-neutral-700 dark:text-neutral-300" />
          <button onClick={add} className="rounded bg-zinc-900 px-2 py-1 text-[10px] text-white dark:bg-neutral-100 dark:text-neutral-900">+ Block</button>
        </div>
      </div>
    </div>
  );
}

// ── CS Stats: toggle the overlay, switch between games, rank progress ──

const CS_GAMES = {
  CS2: { rank: 'Legendary Eagle', pct: 68, stats: [['Hours played', '2,847'], ['K/D ratio', '2.34'], ['Win rate', '53.2%'], ['Headshot %', '47.8%']] },
  Valorant: { rank: 'Immortal 1', pct: 41, stats: [['Hours played', '1,204'], ['K/D ratio', '1.68'], ['Win rate', '58.1%'], ['Headshot %', '31.4%']] },
};
export function CsStatsDetail() {
  const [show, setShow] = useState(false);
  const [game, setGame] = useState<keyof typeof CS_GAMES>('CS2');
  const g = CS_GAMES[game];
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900 p-6">
      <div className="w-72">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">R</div>
          <div><p className="text-sm font-semibold text-white">Rohan P.</p><p className="text-xs text-zinc-400">Online · Playing {game}</p></div>
        </div>
        <div className="mb-2 flex gap-1.5">
          {(Object.keys(CS_GAMES) as (keyof typeof CS_GAMES)[]).map((k) => (
            <button key={k} onClick={() => setGame(k)} className={`rounded px-2 py-0.5 text-[10px] ${game === k ? 'bg-white text-zinc-900' : 'bg-zinc-700 text-zinc-300'}`}>{k}</button>
          ))}
        </div>
        <button onClick={() => setShow((s) => !s)} className="w-full rounded border border-zinc-600 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700">
          {show ? 'Hide stats ↑' : 'Show stats ↓'}
        </button>
        {show && (
          <div className="mt-3 rounded-lg bg-zinc-900/80 p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span>{g.rank}</span><span>{g.pct}% to next rank</span>
            </div>
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-zinc-700"><div className="h-full rounded-full bg-amber-400" style={{ width: `${g.pct}%` }} /></div>
            <div className="grid grid-cols-2 gap-3">
              {g.stats.map(([k, v]) => (
                <div key={k}><p className="text-[10px] text-zinc-500">{k}</p><p className="text-sm font-medium text-white">{v}</p></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Git Time Machine: branch selector, click commit for diff + checkout ──

const GTM_BRANCHES = {
  main: [
    { hash: 'a3f9c2b', msg: 'feat: add animated transitions', diff: '+ transition-panel.ts' },
    { hash: '8e1d054', msg: 'fix: keyboard navigation in tree', diff: '~ tree-view.tsx' },
    { hash: 'c4b7e12', msg: 'refactor: extract diff renderer', diff: '+ diff-renderer.ts' },
  ],
  dev: [
    { hash: '9f2e881', msg: 'wip: branch comparison view', diff: '+ branch-diff.tsx' },
    { hash: '1c7ab34', msg: 'feat: add branch selector', diff: '+ branch-select.tsx' },
  ],
};
export function GitTimeMachineDetail() {
  const [branch, setBranch] = useState<keyof typeof GTM_BRANCHES>('main');
  const commits = GTM_BRANCHES[branch];
  const [sel, setSel] = useState(commits[0].hash);
  const [checkedOut, setCheckedOut] = useState<string | null>(null);
  const s = commits.find((c) => c.hash === sel) ?? commits[0];
  useEffect(() => { setSel(GTM_BRANCHES[branch][0].hash); setCheckedOut(null); }, [branch]);
  return (
    <Frame dark>
      <WindowBar label={`git time machine · ${branch}`} dark />
      <div className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-1.5">
        {(Object.keys(GTM_BRANCHES) as (keyof typeof GTM_BRANCHES)[]).map((b) => (
          <button key={b} onClick={() => setBranch(b)} className={`rounded px-2 py-0.5 text-[10px] ${branch === b ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>{b}</button>
        ))}
      </div>
      <div className="flex-1 space-y-1 overflow-hidden p-4 font-mono text-xs">
        {commits.map((c, i) => (
          <button key={c.hash} onClick={() => setSel(c.hash)} className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-left transition-colors ${sel === c.hash ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}>
            <span className="text-zinc-600">{i === 0 ? '●' : '○'}</span>
            <span className="text-amber-400">{c.hash}</span>
            <span className="min-w-0 flex-1 truncate text-zinc-300">{c.msg}</span>
            {checkedOut === c.hash && <span className="shrink-0 rounded bg-emerald-900/50 px-1 text-[9px] text-emerald-400">HEAD</span>}
          </button>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-2">
          <div>
            <p className="text-zinc-500">commit {s.hash}</p>
            <p className="text-green-400">{s.diff}</p>
          </div>
          <button onClick={() => setCheckedOut(s.hash)} className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-900">Checkout</button>
        </div>
      </div>
    </Frame>
  );
}

// ── Pages (Figma): reorder, add, delete, color tags ──

const PAGE_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#f87171'];
export function PagesFigmaDetail() {
  const [pages, setPages] = useState([
    { n: 'Onboarding', c: PAGE_COLORS[0] }, { n: 'Dashboard', c: PAGE_COLORS[1] }, { n: 'Settings', c: PAGE_COLORS[2] },
    { n: 'Components', c: PAGE_COLORS[3] }, { n: 'Icons', c: PAGE_COLORS[4] },
  ]);
  const [adding, setAdding] = useState('');
  const mv = (i: number, dir: -1 | 1) => {
    const n = [...pages]; const j = i + dir;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]]; setPages(n);
  };
  const add = () => {
    if (!adding.trim()) return;
    setPages((p) => [...p, { n: adding.trim(), c: PAGE_COLORS[p.length % PAGE_COLORS.length] }]);
    setAdding('');
  };
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-72">
        <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-neutral-800 dark:border-neutral-800">
          {pages.map((p, i) => (
            <div key={p.n} className="group flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.c }} />
                <span className="text-[10px] text-zinc-400">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm text-zinc-700 dark:text-neutral-300">{p.n}</span>
              </div>
              <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => mv(i, -1)} disabled={i === 0} className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 disabled:opacity-20 dark:hover:bg-neutral-800">↑</button>
                <button onClick={() => mv(i, 1)} disabled={i === pages.length - 1} className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 disabled:opacity-20 dark:hover:bg-neutral-800">↓</button>
                <button onClick={() => setPages((pp) => pp.filter((x) => x.n !== p.n))} className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-neutral-800">×</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          <input value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="New page…" className="flex-1 rounded border border-zinc-200 bg-transparent px-2 py-1 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none dark:border-neutral-700 dark:text-neutral-300" />
          <button onClick={add} className="rounded bg-zinc-900 px-2 py-1 text-[10px] text-white dark:bg-neutral-100 dark:text-neutral-900">+ Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Meet: mute/remove, raise hand, screen share toggle ──

const PARTICIPANTS = [{ n: 'Rohan P.', you: true }, { n: 'Vanshita M.', you: false }, { n: 'Alex M.', you: false }, { n: 'Priya R.', you: false }];
export function MeetDetail() {
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [left, setLeft] = useState<Set<string>>(new Set());
  const [handRaised, setHandRaised] = useState(false);
  const [sharing, setSharing] = useState(false);
  const active = PARTICIPANTS.filter((p) => !left.has(p.n));
  return (
    <div className="flex h-full items-center justify-center bg-zinc-900 p-5">
      <div className="w-72">
        <div className="mb-3 grid grid-cols-2 gap-2">
          {active.map((p) => (
            <div key={p.n} className="relative flex aspect-video items-center justify-center rounded-md bg-zinc-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-bold text-white">{p.n[0]}</div>
              <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
                <span className="text-[10px] text-white">{p.n}{p.you && ' (you)'}</span>
                {muted.has(p.n) && <span className="text-[10px] text-red-400">🔇</span>}
                {p.you && handRaised && <span className="text-[10px]">✋</span>}
                {p.you && sharing && <span className="rounded-sm bg-emerald-500/90 px-1 text-[8px] text-white">sharing</span>}
              </div>
              {!p.you && (
                <button onClick={() => setLeft((l) => new Set([...l, p.n]))} className="absolute right-1 top-1 rounded bg-zinc-900/70 px-1 text-[9px] text-zinc-300 hover:bg-red-600 hover:text-white">×</button>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setMuted((m) => { const n = new Set(m); if (n.has('Rohan P.')) n.delete('Rohan P.'); else n.add('Rohan P.'); return n; })}
            className={`rounded px-2.5 py-1.5 text-xs transition-colors ${muted.has('Rohan P.') ? 'bg-red-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            {muted.has('Rohan P.') ? 'Unmute' : 'Mute'}
          </button>
          <button onClick={() => setHandRaised((h) => !h)} className={`rounded px-2.5 py-1.5 text-xs transition-colors ${handRaised ? 'bg-amber-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>✋ Raise hand</button>
          <button onClick={() => setSharing((s) => !s)} className={`rounded px-2.5 py-1.5 text-xs transition-colors ${sharing ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>Share screen</button>
        </div>
      </div>
    </div>
  );
}

// ── Ipynb Extractor: filename, format picker, progress bar, extract ──

const CELL_COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#fb7185', '#22d3ee'];
export function IpynbExtractorDetail() {
  const [file, setFile] = useState('analysis.ipynb');
  const [format, setFormat] = useState<'PNG' | 'JPG'>('PNG');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const run = () => {
    if (!file || busy) return;
    setBusy(true); setImages([]); setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); setBusy(false); setImages(CELL_COLORS); return 100; }
        return p + 20;
      });
    }, 150);
  };
  return (
    <Frame dark>
      <WindowBar label={file || 'notebook.ipynb'} dark />
      <div className="flex flex-1 flex-col justify-center gap-3 p-5">
        <div className="flex gap-2">
          <input value={file} onChange={(e) => setFile(e.target.value)} className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none" />
          <div className="flex gap-1">
            {(['PNG', 'JPG'] as const).map((f) => (
              <button key={f} onClick={() => setFormat(f)} className={`rounded px-1.5 text-[10px] ${format === f ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>{f}</button>
            ))}
          </div>
          <button onClick={run} disabled={busy} className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 disabled:opacity-50">{busy ? `${progress}%` : 'Extract'}</button>
        </div>
        {busy && <div className="h-1 overflow-hidden rounded-full bg-zinc-800"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} /></div>}
        {images.length > 0 && (
          <div className="grid grid-cols-6 gap-1.5">
            {images.map((c, i) => <div key={i} className="aspect-square rounded" style={{ backgroundColor: c }} title={`img_${i + 1}.${format.toLowerCase()}`} />)}
          </div>
        )}
      </div>
    </Frame>
  );
}

// ── Scrapetron: URL, custom selector, export format, scrape ──

const MOCK_SCRAPED = [
  { selector: 'h1', count: 1, sample: 'Home: Rohan P. Pothuru' },
  { selector: 'p', count: 12, sample: 'Software engineer and CS grad student...' },
  { selector: 'a', count: 47, sample: 'LinkedIn, GitHub, Resume...' },
  { selector: 'img', count: 3, sample: 'profile.png, project-keel.png...' },
];
export function ScrapetronDetail() {
  const [url, setUrl] = useState('https://rohan.run');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [exportFmt, setExportFmt] = useState<'JSON' | 'CSV'>('JSON');
  const run = () => { setLoading(true); setDone(false); setTimeout(() => { setLoading(false); setDone(true); }, 700); };
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 font-mono text-sm text-zinc-700 focus:outline-none dark:border-neutral-800 dark:text-neutral-300" />
        <button onClick={run} disabled={loading} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-85 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">{loading ? '…' : 'Scrape'}</button>
      </div>
      {done && (
        <>
          <div className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 dark:divide-neutral-800 dark:border-neutral-800">
            <div className="flex justify-between bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500 dark:bg-neutral-800/40 dark:text-neutral-400"><span>Scraped {url}</span><span className="text-green-500">200 OK</span></div>
            {MOCK_SCRAPED.map((r) => (
              <div key={r.selector} className="px-3 py-2 text-xs">
                <div className="mb-0.5 flex justify-between"><code className="text-amber-600 dark:text-amber-400">{r.selector}</code><span className="text-zinc-400">{r.count} found</span></div>
                <p className="truncate text-zinc-500 dark:text-neutral-500">{r.sample}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {(['JSON', 'CSV'] as const).map((f) => (
                <button key={f} onClick={() => setExportFmt(f)} className={`rounded px-2 py-0.5 text-[10px] ${exportFmt === f ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{f}</button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-neutral-500">export.{exportFmt.toLowerCase()}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Todo iOS: check off, add task, due-date badges ──

export function TodoIosDetail() {
  const [items, setItems] = useState([
    { t: 'Design onboarding screens', done: true, due: null as string | null },
    { t: 'Implement CoreData model', done: true, due: null as string | null },
    { t: 'Set up iCloud sync', done: false, due: 'Today' },
    { t: 'Write unit tests', done: false, due: 'Tomorrow' },
    { t: 'App Store screenshots', done: false, due: null },
  ]);
  const [adding, setAdding] = useState('');
  const toggle = (t: string) => setItems((its) => its.map((it) => (it.t === t ? { ...it, done: !it.done } : it)));
  const add = () => {
    if (!adding.trim()) return;
    setItems((its) => [...its, { t: adding.trim(), done: false, due: null }]);
    setAdding('');
  };
  const doneCount = items.filter((i) => i.done).length;
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2 dark:border-neutral-800">
          <span className="text-sm font-semibold dark:text-paper">Today · {doneCount}/{items.length}</span>
          <span className="text-[10px] text-blue-500">☁ synced</span>
        </div>
        <div className="max-h-40 space-y-2 overflow-y-auto px-4 py-3">
          {items.map((it) => (
            <div key={it.t} className="flex items-center gap-2">
              <button onClick={() => toggle(it.t)} className="flex flex-1 items-center gap-2 text-left">
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${it.done ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300 dark:border-neutral-600'}`}>
                  {it.done && <span className="text-[9px] text-white">✓</span>}
                </span>
                <span className={`text-xs ${it.done ? 'text-zinc-400 line-through dark:text-neutral-500' : 'text-zinc-700 dark:text-neutral-300'}`}>{it.t}</span>
              </button>
              {it.due && <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">{it.due}</span>}
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 border-t border-zinc-100 px-3 py-2 dark:border-neutral-800">
          <input value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="New task…" className="flex-1 rounded border border-zinc-200 bg-transparent px-2 py-1 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none dark:border-neutral-700 dark:text-neutral-300" />
          <button onClick={add} className="rounded bg-zinc-900 px-2 py-1 text-[10px] text-white dark:bg-neutral-100 dark:text-neutral-900">+</button>
        </div>
      </div>
    </div>
  );
}

// ── Zenitsu Bot: click a command, clear chat, more commands ──

const BOT_RES: Record<string, { title: string; body: string; color: string }> = {
  '/balance': { title: 'Your Balance', body: '💰 1,250 coins · +50 today', color: '#FAB387' },
  '/daily': { title: 'Daily Reward', body: '✅ +50 claimed · next in 23h', color: '#A6E3A1' },
  '/trivia': { title: 'Trivia Time', body: 'V8 was originally written in?', color: '#89B4FA' },
  '/roll': { title: 'Dice Roll', body: '🎲 You rolled a 4', color: '#CBA6F7' },
  '/kick': { title: 'Moderation', body: '🔨 spammer#0420 was kicked', color: '#F38BA8' },
};
export function ZenitsuBotDetail() {
  const [msgs, setMsgs] = useState<string[]>([]);
  const send = (cmd: string) => setMsgs((m) => [...m.slice(-3), cmd]);
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-2 flex items-center justify-between border-b border-zinc-100 pb-2 dark:border-neutral-800">
        <span className="flex items-center gap-1.5">{dot('bg-green-500')}<span className="text-xs font-medium text-zinc-500 dark:text-neutral-400"># general</span></span>
        <button onClick={() => setMsgs([])} className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-neutral-300">Clear</button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {msgs.length === 0 && <p className="text-xs italic text-zinc-400 dark:text-neutral-500">Click a command below</p>}
        {msgs.map((cmd, i) => {
          const r = BOT_RES[cmd];
          return (
            <div key={i} className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-[10px] font-bold text-white">Z</div>
              <div className="min-w-0 rounded-r border-l-2 bg-zinc-100 px-2 py-1 dark:bg-neutral-800" style={{ borderColor: r.color }}>
                <p className="text-xs font-semibold" style={{ color: r.color }}>{r.title}</p>
                <p className="text-xs text-zinc-600 dark:text-neutral-400">{r.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-2 dark:border-neutral-800">
        {Object.keys(BOT_RES).map((cmd) => (
          <button key={cmd} onClick={() => send(cmd)} className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-600 hover:bg-zinc-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700">{cmd}</button>
        ))}
      </div>
    </div>
  );
}

// ── Tanoshi: full role-based palette (click to copy), language toggle ──

const TANOSHI_PALETTE = [
  { role: 'Keywords', hex: '#458588' }, { role: 'Functions', hex: '#E89E9E' },
  { role: 'Strings', hex: '#E89E9E' }, { role: 'Comments', hex: '#6C7086' },
  { role: 'Constants', hex: '#E89E9E' }, { role: 'Background', hex: '#32302F' },
  { role: 'Foreground', hex: '#D2B9B5' }, { role: 'Types', hex: '#458588' },
];
const TS_LINES = ['function tanoshi() {', "  return 'calm'", '}'];
const PY_LINES = ['def tanoshi():', "    return 'calm'"];
const GO_LINES = ['func tanoshi() string {', '    return "calm"', '}'];
export function TanoshiDetail() {
  const [lang, setLang] = useState<'ts' | 'py' | 'go'>('ts');
  const [copied, setCopied] = useState<string | null>(null);
  const bg = '#32302F', fg = '#D2B9B5', rose = '#E89E9E', teal = '#458588';
  const copy = (hex: string) => { navigator.clipboard?.writeText(hex).catch(() => {}); setCopied(hex); setTimeout(() => setCopied(null), 1200); };
  const lines = lang === 'ts' ? TS_LINES : lang === 'py' ? PY_LINES : GO_LINES;
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6">
      <div className="grid grid-cols-4 gap-2">
        {TANOSHI_PALETTE.map((c, i) => (
          <button key={c.role + i} onClick={() => copy(c.hex)} className="flex flex-col items-center gap-1 rounded-lg border border-zinc-100 p-1.5 hover:bg-zinc-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40">
            <span className="h-5 w-5 rounded border border-black/10" style={{ backgroundColor: c.hex }} />
            <span className="text-[8px] text-zinc-500 dark:text-neutral-400">{copied === c.hex ? 'copied!' : c.role}</span>
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: bg }}>
          <div className="flex gap-1.5">{(['ts', 'py', 'go'] as const).map((l) => <button key={l} onClick={() => setLang(l)} className="text-[10px] font-mono" style={{ color: lang === l ? rose : '#6C7086' }}>{l.toUpperCase()}</button>)}</div>
        </div>
        <pre className="p-3 font-mono text-xs leading-6" style={{ backgroundColor: bg }}>
          {lines.map((l, i) => (
            <div key={i}><span style={{ color: teal }}>{l.split(' ')[0]} </span><span style={{ color: fg }}>{l.split(' ').slice(1).join(' ')}</span></div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ── Hexr: hover to preview, click to copy, format toggle, history ──

function hslToHex(h: number, s: number, l: number) {
  const ll = l / 100, a = (s / 100) * Math.min(ll, 1 - ll);
  const f = (n: number) => { const k = (n + h / 30) % 12; const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}
export function HexrDetail() {
  const [hov, setHov] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [fmt, setFmt] = useState<'HEX' | 'RGB'>('HEX');
  const [history, setHistory] = useState<string[]>([]);
  const swatches = Array.from({ length: 80 }, (_, i) => hslToHex((i % 10) * 36, 70, 30 + Math.floor(i / 10) * 8));
  const copy = (hex: string) => {
    const value = fmt === 'HEX' ? hex : hexToRgb(hex);
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(hex);
    setHistory((h) => [hex, ...h.filter((x) => x !== hex)].slice(0, 6));
    setTimeout(() => setCopied(null), 1200);
  };
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="grid grid-cols-10 gap-0.5 overflow-hidden rounded-lg">
        {swatches.map((hex, i) => (
          <button key={i} className="aspect-square transition-transform hover:z-10 hover:scale-110" style={{ backgroundColor: hex }} onMouseEnter={() => setHov(hex)} onMouseLeave={() => setHov(null)} onClick={() => copy(hex)} title={hex} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(hov || copied) && <div className="h-5 w-5 rounded border border-zinc-200 dark:border-neutral-700" style={{ backgroundColor: hov || copied! }} />}
          <span className="font-mono text-xs text-zinc-500 dark:text-neutral-400">{copied ? `${fmt === 'HEX' ? copied : hexToRgb(copied)} copied!` : hov ? (fmt === 'HEX' ? hov : hexToRgb(hov)) : 'Hover to preview · click to copy'}</span>
        </div>
        <div className="flex gap-1">
          {(['HEX', 'RGB'] as const).map((f) => (
            <button key={f} onClick={() => setFmt(f)} className={`rounded px-1.5 py-0.5 text-[9px] ${fmt === f ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-400 dark:bg-neutral-800 dark:text-neutral-500'}`}>{f}</button>
          ))}
        </div>
      </div>
      {history.length > 0 && (
        <div className="flex items-center gap-1.5 border-t border-zinc-100 pt-2 dark:border-neutral-800">
          <span className="text-[9px] text-zinc-400 dark:text-neutral-500">Recent:</span>
          {history.map((h) => <span key={h} className="h-3.5 w-3.5 rounded border border-zinc-200 dark:border-neutral-700" style={{ backgroundColor: h }} title={h} />)}
        </div>
      )}
    </div>
  );
}

// ── Customer Management: click a row, change status, search ──

const CRM_FULL = [
  { name: 'Acme Corp', status: 'active' as const, mrr: 2400 },
  { name: 'Nova Retail', status: 'lead' as const, mrr: 0 },
  { name: 'Blue Widgets', status: 'churned' as const, mrr: 0 },
  { name: 'Summit Labs', status: 'active' as const, mrr: 1800 },
  { name: 'Orbit Inc', status: 'lead' as const, mrr: 0 },
];
const CRM_STATUSES = ['lead', 'active', 'churned'] as const;
const CRM_PILL: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  lead: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  churned: 'bg-zinc-200 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400',
};
export function CustomerManagementDetail() {
  const [rows, setRows] = useState(CRM_FULL);
  const [sel, setSel] = useState(CRM_FULL[0].name);
  const [query, setQuery] = useState('');
  const shown = rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  const row = rows.find((r) => r.name === sel) ?? rows[0];
  const setStatus = (status: typeof CRM_STATUSES[number]) => setRows((rs) => rs.map((r) => (r.name === sel ? { ...r, status } : r)));
  return (
    <div className="flex h-full flex-col p-5">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search accounts…" className="mb-2 rounded border border-zinc-200 bg-transparent px-2 py-1 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none dark:border-neutral-700 dark:text-neutral-300" />
      <div className="flex-1 divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-100 dark:divide-neutral-800 dark:border-neutral-800">
        {shown.map((r) => (
          <button key={r.name} onClick={() => setSel(r.name)} className={`flex w-full items-center justify-between px-3 py-2 text-left transition-colors ${sel === r.name ? 'bg-zinc-50 dark:bg-neutral-800/50' : ''}`}>
            <span className="text-xs text-zinc-700 dark:text-neutral-300">{r.name}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium capitalize ${CRM_PILL[r.status]}`}>{r.status}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-neutral-800/40">
        <span className="text-xs text-zinc-500 dark:text-neutral-400">{row.name} · {row.mrr > 0 ? `$${row.mrr}/mo` : 'no revenue'}</span>
        <div className="flex gap-1">
          {CRM_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded px-1.5 py-0.5 text-[9px] capitalize ${row.status === s ? CRM_PILL[s] : 'text-zinc-300 dark:text-neutral-600'}`}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
