'use client';

import React, { useEffect, useState } from 'react';
import { Frame, WindowBar, dot } from '../shared';

// ── World Clock: six cities, real 12/24h toggle, bigger keys ──

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
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6">
      <div className="grid grid-cols-3 gap-2.5">
        {WC_CITIES.map((c) => {
          const parts = now
            ? new Intl.DateTimeFormat('en-US', { timeZone: c.tz, hour: 'numeric', minute: '2-digit', hourCycle: format === '24' ? 'h23' : 'h12' }).format(now)
            : '--:--';
          return (
            <div key={c.label} className="flex flex-col items-center gap-1 rounded-lg bg-zinc-900 py-4">
              <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">{c.label}</span>
              <span className="font-mono text-[19px] font-medium tabular-nums" style={{ color: c.accent }}>{parts}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-1.5">
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
  );
}

// ── Beam: start/stop a real recording timer ──

export function BeamDetail() {
  const [recording, setRecording] = useState(true);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);
  const bars = [6, 14, 9, 18, 7, 16, 5, 12, 8, 15];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950 p-6">
      <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
        {recording ? dot('bg-red-500', true) : <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />}
        <span className="font-mono text-sm font-medium tabular-nums text-zinc-200">
          {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
        </span>
      </div>
      <div className="flex h-10 items-end justify-center gap-1">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-zinc-600"
            style={recording ? { height: h * 1.6, animation: `beamBarD 1.1s ease-in-out ${i * 0.08}s infinite alternate` } : { height: 4 }}
          />
        ))}
      </div>
      <button
        onClick={() => setRecording((r) => !r)}
        className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${recording ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' : 'bg-zinc-100 text-zinc-900 hover:opacity-90'}`}
      >
        {recording ? 'Stop recording' : 'Start recording'}
      </button>
      <style>{`@keyframes beamBarD { 0%{ transform: scaleY(0.35) } 100%{ transform: scaleY(1) } }`}</style>
    </div>
  );
}

// ── Relay: click a monitor to expand history, simulate an incident ──

const RELAY_BASE = [
  { name: 'API Gateway', ms: 142 },
  { name: 'Database', ms: 58 },
  { name: 'Media Server', ms: 210 },
  { name: 'Edge Cache', ms: 22 },
];
export function RelayDetail() {
  const [down, setDown] = useState<string | null>(null);
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-600 dark:text-neutral-300">{RELAY_BASE.length - (down ? 1 : 0)}/{RELAY_BASE.length} monitors up</span>
        <button onClick={() => setDown((d) => (d ? null : 'Media Server'))} className="rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] text-white hover:opacity-85 dark:bg-neutral-100 dark:text-neutral-900">
          {down ? 'Resolve incident' : 'Simulate incident'}
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-hidden">
        {RELAY_BASE.map((m) => {
          const isDown = m.name === down;
          const hist = Array.from({ length: 36 }, (_, i) => (isDown && i >= 33 ? 0 : 1));
          return (
            <div key={m.name}>
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
            </div>
          );
        })}
      </div>
      <code className="mt-3 block text-[10px] text-zinc-400 dark:text-neutral-500">docker run ghcr.io/rohzzn/relay</code>
    </div>
  );
}

// ── Keel: full subscription list, real monthly/annual toggle and removal ──

const KEEL_ALL = [
  { n: 'Netflix', icon: '🎬', mo: 15.99 },
  { n: 'Spotify', icon: '🎵', mo: 9.99 },
  { n: 'iCloud+', icon: '☁️', mo: 2.99 },
  { n: 'GitHub Pro', icon: '🐙', mo: 4.0 },
  { n: 'Duolingo', icon: '🦜', mo: 6.99 },
];
export function KeelDetail() {
  const [annual, setAnnual] = useState(false);
  const [subs, setSubs] = useState(KEEL_ALL);
  const total = subs.reduce((s, r) => s + (annual ? r.mo * 12 : r.mo), 0);
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-64 overflow-hidden rounded-xl border border-zinc-200 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-neutral-800">
          <div>
            <p className="text-[10px] text-zinc-400 dark:text-neutral-500">{annual ? 'Annual' : 'Monthly'} total</p>
            <p className="text-lg font-semibold tabular-nums dark:text-paper">${total.toFixed(2)}</p>
          </div>
          <button onClick={() => setAnnual((a) => !a)} className={`rounded-full px-2.5 py-1 text-[10px] transition-colors ${annual ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>
            {annual ? 'Annual' : 'Monthly'}
          </button>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
          {subs.map((s) => (
            <div key={s.n} className="group flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2"><span>{s.icon}</span><span className="text-xs font-medium text-zinc-700 dark:text-neutral-300">{s.n}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums dark:text-paper">${(annual ? s.mo * 12 : s.mo).toFixed(2)}</span>
                <button onClick={() => setSubs((ss) => ss.filter((r) => r.n !== s.n))} className="text-zinc-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100 dark:text-neutral-600">×</button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-zinc-50 px-4 py-1.5 text-center text-[10px] text-zinc-400 dark:bg-neutral-800/40 dark:text-neutral-500">{subs.length} subscriptions</div>
      </div>
    </div>
  );
}

// ── ShutTab: block a real site you type in ──

export function ShutTabDetail() {
  const [sites, setSites] = useState([
    { domain: 'twitter.com', blocked: true },
    { domain: 'reddit.com', blocked: true },
    { domain: 'youtube.com', blocked: false },
  ]);
  const [adding, setAdding] = useState('');
  const toggle = (d: string) => setSites((s) => s.map((x) => (x.domain === d ? { ...x, blocked: !x.blocked } : x)));
  const add = () => {
    const d = adding.trim().replace(/^https?:\/\//, '').split('/')[0];
    if (d && !sites.find((s) => s.domain === d)) setSites((s) => [...s, { domain: d, blocked: true }]);
    setAdding('');
  };
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-64 overflow-hidden rounded-xl border border-zinc-200 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/60">
          <span className="text-xs font-semibold text-zinc-700 dark:text-neutral-300">ShutTab</span>
          <span className="text-[10px] text-zinc-400">{sites.filter((s) => s.blocked).length} blocked</span>
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

// ── CS Stats: click to reveal the full injected overlay ──

export function CsStatsDetail() {
  const [show, setShow] = useState(false);
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-900 p-6">
      <div className="w-64">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">R</div>
          <div><p className="text-sm font-semibold text-white">Rohan P.</p><p className="text-xs text-zinc-400">Online · Playing CS2</p></div>
        </div>
        <button onClick={() => setShow((s) => !s)} className="w-full rounded border border-zinc-600 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700">
          {show ? 'Hide CS2 Stats ↑' : 'Show CS2 Stats ↓'}
        </button>
        {show && (
          <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-zinc-900/80 p-3">
            {[['Hours played', '2,847'], ['K/D ratio', '2.34'], ['Win rate', '53.2%'], ['Headshot %', '47.8%']].map(([k, v]) => (
              <div key={k}><p className="text-[10px] text-zinc-500">{k}</p><p className="text-sm font-medium text-white">{v}</p></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Git Time Machine: click a commit to check it out ──

const GTM_COMMITS = [
  { hash: 'a3f9c2b', msg: 'feat: add animated transitions', diff: '+ transition-panel.ts' },
  { hash: '8e1d054', msg: 'fix: keyboard navigation in tree', diff: '~ tree-view.tsx' },
  { hash: 'c4b7e12', msg: 'refactor: extract diff renderer', diff: '+ diff-renderer.ts' },
  { hash: '2a9f831', msg: 'feat: add branch selector', diff: '+ branch-select.tsx' },
];
export function GitTimeMachineDetail() {
  const [sel, setSel] = useState(GTM_COMMITS[0].hash);
  const s = GTM_COMMITS.find((c) => c.hash === sel)!;
  return (
    <Frame dark>
      <WindowBar label="git time machine" dark />
      <div className="flex-1 space-y-1 overflow-hidden p-4 font-mono text-xs">
        {GTM_COMMITS.map((c, i) => (
          <button key={c.hash} onClick={() => setSel(c.hash)} className={`flex w-full items-center gap-3 rounded px-2 py-1.5 text-left transition-colors ${sel === c.hash ? 'bg-zinc-800' : 'hover:bg-zinc-900'}`}>
            <span className="text-zinc-600">{i === 0 ? '●' : '○'}</span>
            <span className="text-amber-400">{c.hash}</span>
            <span className="min-w-0 flex-1 truncate text-zinc-300">{c.msg}</span>
          </button>
        ))}
        <div className="mt-2 border-t border-zinc-800 pt-2">
          <p className="text-zinc-500">commit {s.hash}</p>
          <p className="text-green-400">{s.diff}</p>
        </div>
      </div>
    </Frame>
  );
}

// ── Pages (Figma): real reordering ──

export function PagesFigmaDetail() {
  const [pages, setPages] = useState(['Onboarding', 'Dashboard', 'Settings', 'Components', 'Icons', 'Prototype']);
  const mv = (i: number, dir: -1 | 1) => {
    const n = [...pages]; const j = i + dir;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]]; setPages(n);
  };
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-64 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-neutral-800 dark:border-neutral-800">
        {pages.map((p, i) => (
          <div key={p} className="group flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2"><span className="text-[10px] text-zinc-400">{String(i + 1).padStart(2, '0')}</span><span className="text-sm text-zinc-700 dark:text-neutral-300">{p}</span></div>
            <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => mv(i, -1)} disabled={i === 0} className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 disabled:opacity-20 dark:hover:bg-neutral-800">↑</button>
              <button onClick={() => mv(i, 1)} disabled={i === pages.length - 1} className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 disabled:opacity-20 dark:hover:bg-neutral-800">↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Meet: mute/remove participants for real ──

const PARTICIPANTS = [{ n: 'Rohan P.', you: true }, { n: 'Vanshita M.', you: false }, { n: 'Alex M.', you: false }, { n: 'Priya R.', you: false }];
export function MeetDetail() {
  const [muted, setMuted] = useState<Set<string>>(new Set());
  const [left, setLeft] = useState<Set<string>>(new Set());
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
              </div>
              {!p.you && (
                <button onClick={() => setLeft((l) => new Set([...l, p.n]))} className="absolute right-1 top-1 rounded bg-zinc-900/70 px-1 text-[9px] text-zinc-300 opacity-0 hover:bg-red-600 hover:text-white group-hover:opacity-100" style={{ opacity: 1 }}>×</button>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => setMuted((m) => { const n = new Set(m); if (n.has('Rohan P.')) n.delete('Rohan P.'); else n.add('Rohan P.'); return n; })}
            className={`rounded px-3 py-1.5 text-xs transition-colors ${muted.has('Rohan P.') ? 'bg-red-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            {muted.has('Rohan P.') ? 'Unmute' : 'Mute'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ipynb Extractor: type a filename, extract on demand ──

const CELL_COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#fbbf24', '#fb7185', '#22d3ee'];
export function IpynbExtractorDetail() {
  const [file, setFile] = useState('analysis.ipynb');
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const run = () => {
    if (!file || busy) return;
    setBusy(true); setImages([]);
    setTimeout(() => { setBusy(false); setImages(CELL_COLORS); }, 800);
  };
  return (
    <Frame dark>
      <WindowBar label={file || 'notebook.ipynb'} dark />
      <div className="flex flex-1 flex-col justify-center gap-3 p-5">
        <div className="flex gap-2">
          <input value={file} onChange={(e) => setFile(e.target.value)} className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none" />
          <button onClick={run} disabled={busy} className="rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 disabled:opacity-50">{busy ? '…' : 'Extract'}</button>
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-6 gap-1.5">
            {images.map((c, i) => <div key={i} className="aspect-square rounded" style={{ backgroundColor: c }} />)}
          </div>
        )}
      </div>
    </Frame>
  );
}

// ── Scrapetron: type a URL, scrape on demand ──

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
  const run = () => { setLoading(true); setDone(false); setTimeout(() => { setLoading(false); setDone(true); }, 700); };
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 font-mono text-sm text-zinc-700 focus:outline-none dark:border-neutral-800 dark:text-neutral-300" />
        <button onClick={run} disabled={loading} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:opacity-85 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">{loading ? '…' : 'Scrape'}</button>
      </div>
      {done && (
        <div className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-200 dark:divide-neutral-800 dark:border-neutral-800">
          <div className="flex justify-between bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500 dark:bg-neutral-800/40 dark:text-neutral-400"><span>Scraped {url}</span><span className="text-green-500">200 OK</span></div>
          {MOCK_SCRAPED.map((r) => (
            <div key={r.selector} className="px-3 py-2 text-xs">
              <div className="mb-0.5 flex justify-between"><code className="text-amber-600 dark:text-amber-400">{r.selector}</code><span className="text-zinc-400">{r.count} found</span></div>
              <p className="truncate text-zinc-500 dark:text-neutral-500">{r.sample}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Todo iOS: check off real tasks ──

export function TodoIosDetail() {
  const [items, setItems] = useState([
    { t: 'Design onboarding screens', done: true },
    { t: 'Implement CoreData model', done: true },
    { t: 'Set up iCloud sync', done: false },
    { t: 'Write unit tests', done: false },
    { t: 'App Store screenshots', done: false },
  ]);
  const toggle = (t: string) => setItems((its) => its.map((it) => (it.t === t ? { ...it, done: !it.done } : it)));
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2 dark:border-neutral-800">
          <span className="text-sm font-semibold dark:text-paper">Today</span>
          <span className="text-[10px] text-blue-500">☁ synced</span>
        </div>
        <div className="space-y-2 px-4 py-3">
          {items.map((it) => (
            <button key={it.t} onClick={() => toggle(it.t)} className="flex w-full items-center gap-2 text-left">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${it.done ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300 dark:border-neutral-600'}`}>
                {it.done && <span className="text-[9px] text-white">✓</span>}
              </span>
              <span className={`text-xs ${it.done ? 'text-zinc-400 line-through dark:text-neutral-500' : 'text-zinc-700 dark:text-neutral-300'}`}>{it.t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Zenitsu Bot: click a command to see the bot respond ──

const BOT_RES: Record<string, { title: string; body: string; color: string }> = {
  '/balance': { title: 'Your Balance', body: '💰 1,250 coins · +50 today', color: '#FAB387' },
  '/daily': { title: 'Daily Reward', body: '✅ +50 claimed · next in 23h', color: '#A6E3A1' },
  '/trivia': { title: 'Trivia Time', body: 'V8 was originally written in?', color: '#89B4FA' },
  '/roll': { title: 'Dice Roll', body: '🎲 You rolled a 4', color: '#CBA6F7' },
};
export function ZenitsuBotDetail() {
  const [msgs, setMsgs] = useState<string[]>([]);
  const send = (cmd: string) => setMsgs((m) => [...m.slice(-3), cmd]);
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-2 flex items-center gap-1.5 border-b border-zinc-100 pb-2 dark:border-neutral-800">
        {dot('bg-green-500')}<span className="text-xs font-medium text-zinc-500 dark:text-neutral-400"># general</span>
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

// ── Tanoshi: real color palette (click to copy) + language toggle ──

const TANOSHI_COLORS = [
  { name: 'Background', hex: '#32302F' }, { name: 'Foreground', hex: '#D2B9B5' }, { name: 'Rose', hex: '#E89E9E' }, { name: 'Teal', hex: '#458588' },
];
const TS_LINES = ['function tanoshi() {', "  return 'calm'", '}'];
const PY_LINES = ['def tanoshi():', "    return 'calm'"];
export function TanoshiDetail() {
  const [lang, setLang] = useState<'ts' | 'py'>('ts');
  const [copied, setCopied] = useState<string | null>(null);
  const bg = '#32302F', fg = '#D2B9B5', rose = '#E89E9E', teal = '#458588';
  const copy = (hex: string) => { navigator.clipboard?.writeText(hex).catch(() => {}); setCopied(hex); setTimeout(() => setCopied(null), 1200); };
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6">
      <div className="grid grid-cols-4 gap-2">
        {TANOSHI_COLORS.map((c) => (
          <button key={c.hex} onClick={() => copy(c.hex)} className="flex flex-col items-center gap-1 rounded-lg border border-zinc-100 p-2 hover:bg-zinc-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40">
            <span className="h-6 w-6 rounded" style={{ backgroundColor: c.hex }} />
            <span className="text-[9px] text-zinc-500 dark:text-neutral-400">{copied === c.hex ? 'copied!' : c.name}</span>
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: bg }}>
          <div className="flex gap-1">{(['ts', 'py'] as const).map((l) => <button key={l} onClick={() => setLang(l)} className="text-[10px] font-mono" style={{ color: lang === l ? rose : '#6C7086' }}>{l === 'ts' ? 'TS' : 'PY'}</button>)}</div>
        </div>
        <pre className="p-3 font-mono text-xs leading-6" style={{ backgroundColor: bg }}>
          {(lang === 'ts' ? TS_LINES : PY_LINES).map((l, i) => (
            <div key={i}><span style={{ color: teal }}>{l.split(' ')[0]} </span><span style={{ color: fg }}>{l.split(' ').slice(1).join(' ')}</span></div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ── Hexr: hover to preview, click to copy ──

function hslToHex(h: number, s: number, l: number) {
  const ll = l / 100, a = (s / 100) * Math.min(ll, 1 - ll);
  const f = (n: number) => { const k = (n + h / 30) % 12; const c = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
export function HexrDetail() {
  const [hov, setHov] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const swatches = Array.from({ length: 80 }, (_, i) => hslToHex((i % 10) * 36, 70, 30 + Math.floor(i / 10) * 8));
  const copy = (hex: string) => { navigator.clipboard?.writeText(hex).catch(() => {}); setCopied(hex); setTimeout(() => setCopied(null), 1200); };
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="grid grid-cols-10 gap-0.5 overflow-hidden rounded-lg">
        {swatches.map((hex, i) => (
          <button key={i} className="aspect-square transition-transform hover:z-10 hover:scale-110" style={{ backgroundColor: hex }} onMouseEnter={() => setHov(hex)} onMouseLeave={() => setHov(null)} onClick={() => copy(hex)} title={hex} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        {(hov || copied) && <div className="h-5 w-5 rounded border border-zinc-200 dark:border-neutral-700" style={{ backgroundColor: hov || copied! }} />}
        <span className="font-mono text-xs text-zinc-500 dark:text-neutral-400">{copied ? `${copied} copied!` : hov || 'Hover to preview · click to copy'}</span>
      </div>
    </div>
  );
}

// ── Customer Management: click a row to see status change ──

const CRM_FULL = [
  { name: 'Acme Corp', status: 'active' as const, mrr: 2400 },
  { name: 'Nova Retail', status: 'lead' as const, mrr: 0 },
  { name: 'Blue Widgets', status: 'churned' as const, mrr: 0 },
  { name: 'Summit Labs', status: 'active' as const, mrr: 1800 },
];
const CRM_PILL: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  lead: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  churned: 'bg-zinc-200 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400',
};
export function CustomerManagementDetail() {
  const [sel, setSel] = useState(CRM_FULL[0].name);
  const row = CRM_FULL.find((r) => r.name === sel)!;
  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex-1 divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-100 dark:divide-neutral-800 dark:border-neutral-800">
        {CRM_FULL.map((r) => (
          <button key={r.name} onClick={() => setSel(r.name)} className={`flex w-full items-center justify-between px-3 py-2 text-left transition-colors ${sel === r.name ? 'bg-zinc-50 dark:bg-neutral-800/50' : ''}`}>
            <span className="text-xs text-zinc-700 dark:text-neutral-300">{r.name}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium capitalize ${CRM_PILL[r.status]}`}>{r.status}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-neutral-800/40 dark:text-neutral-400">
        {row.name} · {row.mrr > 0 ? `$${row.mrr}/mo` : 'no active revenue'}
      </div>
    </div>
  );
}
