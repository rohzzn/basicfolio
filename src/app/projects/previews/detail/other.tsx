'use client';

import React, { useState } from 'react';
import { Frame, WindowBar } from '../shared';

// ── Interactions: click through the experiments ──

const EXPERIMENTS = [
  { id: 'button', label: 'Button' }, { id: 'toggle', label: 'Toggle' },
  { id: 'slider', label: 'Slider' }, { id: 'card', label: 'Card' },
];
export function InteractionsDetail() {
  const [sel, setSel] = useState('button');
  const [on, setOn] = useState(true);
  return (
    <div className="flex h-full flex-col justify-center gap-4 p-6">
      <div className="flex justify-center gap-1.5">
        {EXPERIMENTS.map((e) => (
          <button key={e.id} onClick={() => setSel(e.id)} className={`rounded-md px-2.5 py-1 text-xs transition-colors ${sel === e.id ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{e.label}</button>
        ))}
      </div>
      <div className="flex h-16 items-center justify-center rounded-lg border border-zinc-100 dark:border-neutral-800">
        {sel === 'button' && <button className="rounded bg-zinc-800 px-4 py-1.5 text-xs text-white dark:bg-neutral-200 dark:text-neutral-900">Click me</button>}
        {sel === 'toggle' && (
          <button onClick={() => setOn((o) => !o)} className={`relative h-5 w-9 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-neutral-700'}`}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-4' : 'left-0.5'}`} />
          </button>
        )}
        {sel === 'slider' && <input type="range" className="w-32" />}
        {sel === 'card' && <div className="h-8 w-16 rounded border border-zinc-300 shadow-sm dark:border-neutral-600" />}
      </div>
    </div>
  );
}

// ── Automobile Analytics: click a bar for the figure ──

const SALES = [{ m: 'Jan', v: 4 }, { m: 'Feb', v: 7 }, { m: 'Mar', v: 5 }, { m: 'Apr', v: 9 }, { m: 'May', v: 6 }, { m: 'Jun', v: 11 }, { m: 'Jul', v: 8 }];
export function AutomobileAnalyticsDetail() {
  const [sel, setSel] = useState(SALES[5]);
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <p className="text-center text-sm text-zinc-500 dark:text-neutral-400">{sel.m}: <strong className="dark:text-paper">{sel.v * 120} units</strong></p>
      <div className="flex items-end justify-between gap-2" style={{ height: 90 }}>
        {SALES.map((s) => (
          <button key={s.m} onClick={() => setSel(s)} className="flex flex-1 flex-col items-center gap-1">
            <div className={`w-full rounded-t transition-colors ${sel.m === s.m ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-700/60'}`} style={{ height: `${(s.v / 11) * 100}%` }} />
            <span className="text-[9px] text-zinc-400 dark:text-neutral-500">{s.m}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Smart Agriculture: drag a moisture slider, watch irrigation react ──

export function SmartAgricultureDetail() {
  const [moisture, setMoisture] = useState(55);
  const irrigating = moisture < 40;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="relative h-24 w-10 overflow-hidden rounded-full border-2 border-zinc-300 dark:border-neutral-600">
        <div className="absolute bottom-0 left-0 right-0 bg-emerald-400 transition-all duration-300 dark:bg-emerald-500" style={{ height: `${moisture}%` }} />
      </div>
      <input type="range" min={0} max={100} value={moisture} onChange={(e) => setMoisture(Number(e.target.value))} className="w-40" />
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${irrigating ? 'bg-sky-500' : 'bg-zinc-300 dark:bg-neutral-600'}`} />
        <span className="text-xs font-medium text-zinc-500 dark:text-neutral-400">{irrigating ? 'Pump active — irrigating' : `${moisture}% soil moisture`}</span>
      </div>
    </div>
  );
}

// ── Block Steam Invites: trigger the block toast on demand ──

export function BlockSteamInvitesDetail() {
  const [key, setKey] = useState(0);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: '#1b2838' }}>
      <div key={key} className="w-44 rounded border border-[#2a475e] bg-[#16202d] px-3 py-2" style={{ animation: 'inviteOnce 2.2s ease-out' }}>
        <p className="text-xs text-[#66c0f4]">Game invite</p>
        <p className="text-xs text-zinc-400">from randomuser42</p>
        <p className="mt-1 text-[10px] text-red-400">blocked automatically</p>
      </div>
      <button onClick={() => setKey((k) => k + 1)} className="rounded bg-[#2a475e] px-3 py-1.5 text-xs text-white hover:bg-[#3a5875]">Simulate invite</button>
      <style>{`@keyframes inviteOnce { 0%{ opacity:0; transform: translateY(6px) } 15%{ opacity:1; transform: translateY(0) } 100%{ opacity:1 } }`}</style>
    </div>
  );
}

// ── OverTheWire: a real typeable terminal ──

const OTW_RESPONSES: Record<string, string> = {
  ls: 'readme',
  'ls -la': 'total 24\n-rw-r--r-- 1 bandit0 bandit0 193 readme',
  'cat readme': 'The password for bandit1 is:\nNH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL',
  pwd: '/home/bandit0',
  whoami: 'bandit0',
  help: 'Try: ls, cat readme, pwd, whoami',
};
export function OverTheWireDetail() {
  const [history, setHistory] = useState<{ cmd: string; out: string }[]>([]);
  const [cur, setCur] = useState('');
  const run = () => {
    const cmd = cur.trim(); if (!cmd) return; setCur('');
    const out = OTW_RESPONSES[cmd] ?? `-bash: ${cmd}: command not found`;
    setHistory((h) => [...h.slice(-4), { cmd, out }]);
  };
  return (
    <Frame dark>
      <WindowBar label="bandit0@bandit:~$" dark />
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2 font-mono text-xs">
        <p className="text-zinc-500">Type <span className="text-green-400">help</span> to start.</p>
        {history.map((h, i) => (
          <div key={i}>
            <p className="text-green-400">bandit0@bandit:~$ <span className="text-white">{h.cmd}</span></p>
            <p className="whitespace-pre-line text-zinc-300">{h.out}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 border-t border-zinc-800 px-3 py-1.5">
        <span className="font-mono text-xs text-green-400">$</span>
        <input value={cur} onChange={(e) => setCur(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} className="flex-1 bg-transparent font-mono text-xs text-white focus:outline-none" placeholder="ls" />
      </div>
    </Frame>
  );
}

// ── Discord Mirror: send a message, watch it mirror ──

export function DiscordMirrorDetail() {
  const [syncing, setSyncing] = useState(false);
  const [count, setCount] = useState(0);
  const send = () => { setSyncing(true); setTimeout(() => { setSyncing(false); setCount((c) => c + 1); }, 1200); };
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-sm font-bold text-white">A</div>
        <div className="relative h-px w-14 bg-zinc-300 dark:bg-neutral-600">
          {syncing && <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-indigo-400" style={{ animation: 'mirrorMoveD 1.2s ease-in-out' }} />}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500 text-sm font-bold text-white">B</div>
      </div>
      <p className="text-xs text-zinc-500 dark:text-neutral-400">{count} messages mirrored</p>
      <button onClick={send} disabled={syncing} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">{syncing ? 'Syncing…' : 'Send a message'}</button>
      <style>{`@keyframes mirrorMoveD { 0%{ left:0; opacity:0 } 15%{ opacity:1 } 85%{ opacity:1 } 100%{ left:calc(100% - 8px); opacity:0 } }`}</style>
    </div>
  );
}

// ── GitHub Repo Any Year: pick a year, backdate a commit square ──

const YEARS = [2015, 2018, 2021];
export function GithubAnyYearDetail() {
  const [year, setYear] = useState(2018);
  const cells = Array.from({ length: 91 }, (_, i) => (i * 13) % 5);
  const litIndex = YEARS.indexOf(year) * 20 + 15;
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex justify-center overflow-x-auto">
        <div className="grid grid-flow-col grid-rows-7 gap-0.5">
          {cells.map((v, i) => (
            <div key={i} className={`h-2 w-2 rounded-sm ${i === litIndex ? '' : v === 0 ? 'bg-zinc-100 dark:bg-neutral-800' : v === 1 ? 'bg-emerald-200 dark:bg-emerald-900/50' : v === 2 ? 'bg-emerald-300 dark:bg-emerald-800' : v === 3 ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-500'}`}
              style={i === litIndex ? { backgroundColor: '#10b981' } : undefined} />
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1.5">
        {YEARS.map((y) => (
          <button key={y} onClick={() => setYear(y)} className={`rounded-md px-2.5 py-1 text-xs transition-colors ${year === y ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{y}</button>
        ))}
      </div>
      <code className="text-center text-[10px] text-zinc-400 dark:text-neutral-500">git commit --date=&quot;{year}-06-15&quot;</code>
    </div>
  );
}

// ── Anomaly Detection: hover the line for readouts ──

const TRAFFIC = [12, 14, 13, 15, 16, 14, 13, 52, 15, 14, 16, 13, 48, 14, 15, 16, 13, 14, 56, 15, 14, 13];
export function AnomalyDetectionDetail() {
  const [hov, setHov] = useState<number | null>(null);
  const W = 320, H = 110, pad = 10;
  const max = Math.max(...TRAFFIC);
  const points = TRAFFIC.map((v, i) => `${pad + (i * (W - pad * 2)) / (TRAFFIC.length - 1)},${H - pad - (v / max) * (H - pad * 2)}`).join(' ');
  const anomalies = TRAFFIC.map((v, i) => ({ v, i })).filter((x) => x.v > 40);
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-zinc-400 dark:text-neutral-500">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
        {anomalies.map(({ v, i }) => {
          const x = pad + (i * (W - pad * 2)) / (TRAFFIC.length - 1);
          const y = H - pad - (v / max) * (H - pad * 2);
          return <circle key={i} cx={x} cy={y} r={hov === i ? 5 : 3.5} fill="#ef4444" onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} className="cursor-pointer transition-all" />;
        })}
      </svg>
      <p className="text-center text-xs text-zinc-400 dark:text-neutral-400">{hov !== null ? `${TRAFFIC[hov]} pkts/s — flagged anomaly` : `${anomalies.length} anomalies detected · hover a red dot`}</p>
    </div>
  );
}
