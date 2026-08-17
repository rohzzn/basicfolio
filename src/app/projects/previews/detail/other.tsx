'use client';

import React, { useState } from 'react';
import { Frame, WindowBar } from '../shared';

// ── Interactions: click through the experiments, see a tiny props readout ──

const EXPERIMENTS = [
  { id: 'button', label: 'Button', props: 'variant: primary' },
  { id: 'toggle', label: 'Toggle', props: 'checked: boolean' },
  { id: 'slider', label: 'Slider', props: 'min/max/step' },
  { id: 'card', label: 'Card', props: 'elevation: 1' },
  { id: 'chip', label: 'Chip', props: 'removable: true' },
  { id: 'badge', label: 'Badge', props: 'count: number' },
];
export function InteractionsDetail() {
  const [sel, setSel] = useState('button');
  const [on, setOn] = useState(true);
  const e = EXPERIMENTS.find((x) => x.id === sel)!;
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex flex-wrap justify-center gap-1.5">
        {EXPERIMENTS.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)} className={`rounded-md px-2.5 py-1 text-xs transition-colors ${sel === x.id ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{x.label}</button>
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
        {sel === 'chip' && <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">React <button className="text-blue-400">×</button></span>}
        {sel === 'badge' && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">7</span>}
      </div>
      <p className="text-center font-mono text-[10px] text-zinc-400 dark:text-neutral-500">{e.props}</p>
    </div>
  );
}

// ── Automobile Analytics: click a bar, compare to last year ──

const SALES = [{ m: 'Jan', v: 4, prev: 3 }, { m: 'Feb', v: 7, prev: 6 }, { m: 'Mar', v: 5, prev: 6 }, { m: 'Apr', v: 9, prev: 7 }, { m: 'May', v: 6, prev: 5 }, { m: 'Jun', v: 11, prev: 8 }, { m: 'Jul', v: 8, prev: 9 }];
export function AutomobileAnalyticsDetail() {
  const [sel, setSel] = useState(SALES[5]);
  const [compare, setCompare] = useState(false);
  const total = SALES.reduce((s, r) => s + r.v, 0);
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-neutral-400">{sel.m}: <strong className="dark:text-paper">{sel.v * 120} units</strong></p>
        <button onClick={() => setCompare((c) => !c)} className={`rounded px-2 py-0.5 text-[10px] ${compare ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>vs last year</button>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: 90 }}>
        {SALES.map((s) => (
          <button key={s.m} onClick={() => setSel(s)} className="relative flex flex-1 flex-col items-center gap-1">
            <div className="relative flex w-full items-end" style={{ height: 90 }}>
              {compare && <div className="absolute bottom-0 w-full rounded-t border-2 border-dashed border-zinc-300 dark:border-neutral-600" style={{ height: `${(s.prev / 11) * 100}%` }} />}
              <div className={`relative w-full rounded-t transition-colors ${sel.m === s.m ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-700/60'}`} style={{ height: `${(s.v / 11) * 100}%` }} />
            </div>
            <span className="text-[9px] text-zinc-400 dark:text-neutral-500">{s.m}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-zinc-400 dark:text-neutral-500">{total * 120} total units this year</p>
    </div>
  );
}

// ── Smart Agriculture: two sensors, manual override, event log ──

export function SmartAgricultureDetail() {
  const [moisture, setMoisture] = useState(55);
  const [temp, setTemp] = useState(24);
  const [log, setLog] = useState<string[]>([]);
  const irrigating = moisture < 40;
  const forceIrrigate = () => {
    setMoisture(78);
    setLog((l) => [`Manual irrigation triggered · ${temp}°C`, ...l].slice(0, 3));
  };
  return (
    <div className="flex h-full items-center justify-center gap-6 p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-end gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="relative h-20 w-8 overflow-hidden rounded-full border-2 border-zinc-300 dark:border-neutral-600">
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-400 transition-all duration-300 dark:bg-emerald-500" style={{ height: `${moisture}%` }} />
            </div>
            <span className="text-[9px] text-zinc-400 dark:text-neutral-500">moisture</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="relative h-20 w-8 overflow-hidden rounded-full border-2 border-zinc-300 dark:border-neutral-600">
              <div className="absolute bottom-0 left-0 right-0 bg-orange-400 transition-all duration-300" style={{ height: `${((temp - 10) / 30) * 100}%` }} />
            </div>
            <span className="text-[9px] text-zinc-400 dark:text-neutral-500">{temp}°C</span>
          </div>
        </div>
        <input type="range" min={0} max={100} value={moisture} onChange={(e) => setMoisture(Number(e.target.value))} className="w-32" />
        <input type="range" min={10} max={40} value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-32" />
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${irrigating ? 'bg-sky-500' : 'bg-zinc-300 dark:bg-neutral-600'}`} />
          <span className="text-xs font-medium text-zinc-500 dark:text-neutral-400">{irrigating ? 'Pump active' : 'Idle'}</span>
        </div>
        <button onClick={forceIrrigate} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-neutral-100 dark:text-neutral-900">Force irrigate</button>
      </div>
      <div className="w-32 border-l border-zinc-100 pl-4 dark:border-neutral-800">
        <p className="mb-1.5 text-[10px] font-medium text-zinc-400 dark:text-neutral-500">Event log</p>
        {log.length === 0 && <p className="text-[10px] text-zinc-300 dark:text-neutral-700">No events yet</p>}
        {log.map((l, i) => <p key={i} className="text-[9px] text-zinc-500 dark:text-neutral-400">{l}</p>)}
      </div>
    </div>
  );
}

// ── Block Steam Invites: simulate, mode toggle, blocked-users list ──

export function BlockSteamInvitesDetail() {
  const [key, setKey] = useState(0);
  const [mode, setMode] = useState<'all' | 'spam'>('spam');
  const [blocked, setBlocked] = useState<string[]>([]);
  const names = ['randomuser42', 'xX_pro_Xx', 'guest_9981'];
  const trigger = () => {
    setKey((k) => k + 1);
    const name = names[key % names.length];
    setBlocked((b) => [name, ...b.filter((n) => n !== name)].slice(0, 4));
  };
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3" style={{ backgroundColor: '#1b2838' }}>
      <div className="flex gap-1.5">
        {(['spam', 'all'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded px-2 py-0.5 text-[10px] capitalize ${mode === m ? 'bg-[#66c0f4] text-[#0e1621]' : 'bg-[#2a475e] text-zinc-300'}`}>{m === 'spam' ? 'Spam only' : 'Block all'}</button>
        ))}
      </div>
      <div key={key} className="w-44 rounded border border-[#2a475e] bg-[#16202d] px-3 py-2" style={{ animation: 'inviteOnce 2.2s ease-out' }}>
        <p className="text-xs text-[#66c0f4]">Game invite</p>
        <p className="text-xs text-zinc-400">from {names[key % names.length]}</p>
        <p className="mt-1 text-[10px] text-red-400">blocked automatically</p>
      </div>
      <button onClick={trigger} className="rounded bg-[#2a475e] px-3 py-1.5 text-xs text-white hover:bg-[#3a5875]">Simulate invite</button>
      {blocked.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {blocked.map((n) => <span key={n} className="rounded bg-[#0e1621] px-1.5 py-0.5 text-[9px] text-zinc-400">{n}</span>)}
        </div>
      )}
      <style>{`@keyframes inviteOnce { 0%{ opacity:0; transform: translateY(6px) } 15%{ opacity:1; transform: translateY(0) } 100%{ opacity:1 } }`}</style>
    </div>
  );
}

// ── OverTheWire: a real typeable terminal with level progression + hint ──

const OTW_LEVELS: Record<number, { responses: Record<string, string>; password: string }> = {
  0: {
    responses: { ls: 'readme', 'ls -la': 'total 24\n-rw-r--r-- 1 bandit0 bandit0 193 readme', 'cat readme': 'The password for bandit1 is:\nNH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL', pwd: '/home/bandit0', whoami: 'bandit0', help: 'Try: ls, cat readme, pwd, whoami' },
    password: 'NH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL',
  },
  1: {
    responses: { ls: '-', 'cat -': 'rYRVDyqcf1Iu8Yq7xErClqXguUP3XcT4', pwd: '/home/bandit1', whoami: 'bandit1', help: 'Try: ls, cat -, pwd, whoami' },
    password: 'rYRVDyqcf1Iu8Yq7xErClqXguUP3XcT4',
  },
};
export function OverTheWireDetail() {
  const [level, setLevel] = useState(0);
  const [history, setHistory] = useState<{ cmd: string; out: string }[]>([]);
  const [cur, setCur] = useState('');
  const [showHint, setShowHint] = useState(false);
  const responses = OTW_LEVELS[level].responses;
  const run = () => {
    const cmd = cur.trim(); if (!cmd) return; setCur('');
    const out = responses[cmd] ?? `-bash: ${cmd}: command not found`;
    setHistory((h) => [...h.slice(-4), { cmd, out }]);
    if (out.includes(OTW_LEVELS[level].password) && level < 1) {
      setTimeout(() => { setLevel(1); setHistory([]); setShowHint(false); }, 600);
    }
  };
  return (
    <Frame dark>
      <WindowBar label={`bandit${level}@bandit:~$`} dark />
      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2 font-mono text-xs">
        <p className="text-zinc-500">Level {level} · Type <span className="text-green-400">help</span> to start.</p>
        {history.map((h, i) => (
          <div key={i}>
            <p className="text-green-400">bandit{level}@bandit:~$ <span className="text-white">{h.cmd}</span></p>
            <p className="whitespace-pre-line text-zinc-300">{h.out}</p>
          </div>
        ))}
        {showHint && <p className="text-amber-400">hint: try &quot;{level === 0 ? 'cat readme' : 'cat -'}&quot;</p>}
      </div>
      <div className="flex items-center gap-1.5 border-t border-zinc-800 px-3 py-1.5">
        <span className="font-mono text-xs text-green-400">$</span>
        <input value={cur} onChange={(e) => setCur(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} className="flex-1 bg-transparent font-mono text-xs text-white focus:outline-none" placeholder="ls" />
        <button onClick={() => setShowHint(true)} className="text-[10px] text-zinc-500 hover:text-zinc-300">hint</button>
      </div>
    </Frame>
  );
}

// ── Discord Mirror: type a message, watch it mirror to two servers ──

export function DiscordMirrorDetail() {
  const [syncing, setSyncing] = useState(false);
  const [msgs, setMsgs] = useState<string[]>([]);
  const [draft, setDraft] = useState('gg everyone 🎉');
  const send = () => {
    if (!draft.trim()) return;
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setMsgs((m) => [draft, ...m].slice(0, 3)); setDraft(''); }, 900);
  };
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-sm font-bold text-white">A</div>
        <div className="relative h-px w-14 bg-zinc-300 dark:bg-neutral-600">
          {syncing && <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-indigo-400" style={{ animation: 'mirrorMoveD 0.9s ease-in-out' }} />}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500 text-sm font-bold text-white">B</div>
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} className="w-40 rounded border border-zinc-200 bg-transparent px-2 py-1 text-xs text-zinc-700 focus:outline-none dark:border-neutral-700 dark:text-neutral-300" />
        <button onClick={send} disabled={syncing} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900">{syncing ? '…' : 'Send'}</button>
      </div>
      <div className="w-56 space-y-1">
        {msgs.map((m, i) => <p key={i} className="truncate text-[10px] text-zinc-500 dark:text-neutral-400">→ {m}</p>)}
      </div>
      <style>{`@keyframes mirrorMoveD { 0%{ left:0; opacity:0 } 15%{ opacity:1 } 85%{ opacity:1 } 100%{ left:calc(100% - 8px); opacity:0 } }`}</style>
    </div>
  );
}

// ── GitHub Repo Any Year: pick year AND month, live command preview ──

const YEARS = [2015, 2018, 2021, 2024];
const MONTHS = ['01', '06', '12'];
export function GithubAnyYearDetail() {
  const [year, setYear] = useState(2018);
  const [month, setMonth] = useState('06');
  const cells = Array.from({ length: 91 }, (_, i) => (i * 13) % 5);
  const litIndex = (YEARS.indexOf(year) * 20 + MONTHS.indexOf(month) * 7 + 15) % 91;
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
          <button key={y} onClick={() => setYear(y)} className={`rounded-md px-2 py-1 text-xs transition-colors ${year === y ? 'bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{y}</button>
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {MONTHS.map((m) => (
          <button key={m} onClick={() => setMonth(m)} className={`rounded-md px-2 py-0.5 text-[10px] transition-colors ${month === m ? 'bg-zinc-700 text-white dark:bg-neutral-300 dark:text-neutral-900' : 'bg-zinc-100 text-zinc-400 dark:bg-neutral-800 dark:text-neutral-500'}`}>{m}</button>
        ))}
      </div>
      <code className="text-center text-[10px] text-zinc-400 dark:text-neutral-500">git commit --date=&quot;{year}-{month}-15&quot;</code>
    </div>
  );
}

// ── Anomaly Detection: hover for readouts, adjustable threshold ──

const TRAFFIC = [12, 14, 13, 15, 16, 14, 13, 52, 15, 14, 16, 13, 48, 14, 15, 16, 13, 14, 56, 15, 14, 13];
export function AnomalyDetectionDetail() {
  const [hov, setHov] = useState<number | null>(null);
  const [threshold, setThreshold] = useState(40);
  const W = 320, H = 110, pad = 10;
  const max = Math.max(...TRAFFIC);
  const points = TRAFFIC.map((v, i) => `${pad + (i * (W - pad * 2)) / (TRAFFIC.length - 1)},${H - pad - (v / max) * (H - pad * 2)}`).join(' ');
  const thresholdY = H - pad - (threshold / max) * (H - pad * 2);
  const anomalies = TRAFFIC.map((v, i) => ({ v, i })).filter((x) => x.v > threshold);
  return (
    <div className="flex h-full flex-col justify-center gap-2 p-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-zinc-400 dark:text-neutral-500">
        <line x1={pad} y1={thresholdY} x2={W - pad} y2={thresholdY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
        {anomalies.map(({ v, i }) => {
          const x = pad + (i * (W - pad * 2)) / (TRAFFIC.length - 1);
          const y = H - pad - (v / max) * (H - pad * 2);
          return <circle key={i} cx={x} cy={y} r={hov === i ? 5 : 3.5} fill="#ef4444" onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} className="cursor-pointer transition-all" />;
        })}
      </svg>
      <p className="text-center text-xs text-zinc-400 dark:text-neutral-400">{hov !== null ? `${TRAFFIC[hov]} pkts/s — flagged anomaly` : `${anomalies.length} anomalies detected · hover a red dot`}</p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-[10px] text-zinc-400 dark:text-neutral-500">threshold</span>
        <input type="range" min={20} max={55} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-32" />
        <span className="font-mono text-[10px] text-amber-500">{threshold}</span>
      </div>
    </div>
  );
}
