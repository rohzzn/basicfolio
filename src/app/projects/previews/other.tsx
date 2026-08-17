'use client';

import React, { useEffect, useState } from 'react';
import { LightFrame, LightWindowBar } from './light';

// ── Interactions: a strip of tiny UI experiment swatches, one active ──

const EXPERIMENTS = ['button', 'toggle', 'slider', 'card'] as const;
export function InteractionsPreview() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % EXPERIMENTS.length), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 grid grid-cols-2 gap-2 p-3">
      {EXPERIMENTS.map((kind, i) => (
        <div key={kind} className={`flex items-center justify-center rounded-lg border transition-colors ${i === active ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-100'}`}>
          {kind === 'button' && <span className="rounded bg-zinc-800 px-2 py-0.5 text-[7px] text-white">Button</span>}
          {kind === 'toggle' && <span className={`relative h-3 w-6 rounded-full ${i === active ? 'bg-emerald-500' : 'bg-zinc-300'}`}><span className={`absolute top-0.5 h-2 w-2 rounded-full bg-white transition-all ${i === active ? 'left-3.5' : 'left-0.5'}`} /></span>}
          {kind === 'slider' && <span className="h-1 w-10 rounded-full bg-zinc-200"><span className="block h-1 w-2/3 rounded-full bg-zinc-800" /></span>}
          {kind === 'card' && <span className="h-4 w-8 rounded border border-zinc-300" />}
        </div>
      ))}
    </div>
  );
}

// ── Automobile Analytics: sales bar chart ──

const SALES = [4, 7, 5, 9, 6, 11, 8];
export function AutomobileAnalyticsPreview() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-4">
      <div className="flex items-end justify-between gap-1.5" style={{ height: 56 }}>
        {SALES.map((v, i) => (
          <div key={i} className="flex-1 rounded-t bg-blue-400/80" style={{ height: `${(v / 11) * 100}%`, animation: `barGrow 0.8s ease-out ${i * 0.06}s both` }} />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[7px] text-zinc-400">
        <span>Jan</span><span>Jul</span>
      </div>
      <style>{`@keyframes barGrow { 0%{ transform: scaleY(0); transform-origin: bottom } 100%{ transform: scaleY(1); transform-origin: bottom } }`}</style>
    </div>
  );
}

// ── Smart Agriculture: soil moisture gauge driving irrigation state ──

export function SmartAgriculturePreview() {
  const [moisture, setMoisture] = useState(72);
  useEffect(() => {
    const id = setInterval(() => setMoisture((m) => (m <= 28 ? 78 : m - 6)), 700);
    return () => clearInterval(id);
  }, []);
  const irrigating = moisture < 40;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <div className="relative h-14 w-6 overflow-hidden rounded-full border-2 border-zinc-300">
        <div className="absolute bottom-0 left-0 right-0 bg-emerald-400 transition-all duration-700" style={{ height: `${moisture}%` }} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${irrigating ? 'bg-sky-500' : 'bg-zinc-300'}`} />
        <span className="text-[8px] font-medium text-zinc-500">{irrigating ? 'Irrigating' : `${moisture}% moisture`}</span>
      </div>
    </div>
  );
}

// ── Block Steam Invites: an invite toast getting dismissed on a loop ──

export function BlockSteamInvitesPreview() {
  return (
    <LightFrame>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-32 rounded border border-zinc-200 bg-zinc-50 px-2 py-1.5" style={{ animation: 'invitePop 2.4s ease-in-out infinite' }}>
          <p className="text-[7px] text-blue-500">Game invite</p>
          <p className="truncate text-[7px] text-zinc-400">from randomuser42</p>
        </div>
      </div>
      <style>{`@keyframes invitePop { 0%{ opacity:0; transform: translateY(4px) scale(.96) } 12%,55%{ opacity:1; transform: translateY(0) scale(1) } 70%{ opacity:0; transform: scale(.9) } 100%{ opacity:0 } }`}</style>
    </LightFrame>
  );
}

// ── OverTheWire: terminal auto-typing a command sequence ──

const OTW_LINES = ['$ ls', 'readme', '$ cat readme', 'password: NH2SXQ...'];
export function OverTheWirePreview() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v + 1) % (OTW_LINES.length + 2)), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <LightWindowBar label="bandit0@bandit" />
      <div className="flex-1 space-y-1 px-2.5 py-2 font-mono text-[8px]">
        {OTW_LINES.slice(0, n).map((l, i) => (
          <p key={i} className={l.startsWith('$') ? 'text-emerald-600' : l.startsWith('password') ? 'text-amber-600' : 'text-zinc-500'}>{l}</p>
        ))}
      </div>
    </LightFrame>
  );
}

// ── Discord Mirror: two servers connected by a syncing pulse ──

export function DiscordMirrorPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-500 text-[8px] font-bold text-white">A</div>
      <div className="relative h-px w-8 bg-zinc-300">
        <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-indigo-400" style={{ animation: 'mirrorMove 1.8s ease-in-out infinite' }} />
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-500 text-[8px] font-bold text-white">B</div>
      <style>{`@keyframes mirrorMove { 0%{ left:0; opacity:0 } 15%{ opacity:1 } 85%{ opacity:1 } 100%{ left:calc(100% - 8px); opacity:0 } }`}</style>
    </div>
  );
}

// ── GitHub Repo Any Year Any Day: contribution heatmap with a backdated square lighting up ──

export function GithubAnyYearPreview() {
  const cells = Array.from({ length: 77 }, (_, i) => (i * 13) % 5);
  const litIndex = 40;
  return (
    <div className="absolute inset-0 flex items-center justify-center px-3">
      <div className="grid grid-flow-col grid-rows-7 gap-0.5">
        {cells.map((v, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-sm ${v === 0 ? 'bg-zinc-100' : v === 1 ? 'bg-emerald-200' : v === 2 ? 'bg-emerald-300' : v === 3 ? 'bg-emerald-400' : 'bg-emerald-500'}`}
            style={i === litIndex ? { animation: 'ghPulse 1.6s ease-in-out infinite' } : undefined}
          />
        ))}
      </div>
      <style>{`@keyframes ghPulse { 0%,100%{ background-color: #10b981; box-shadow: 0 0 0 0 rgba(16,185,129,.5) } 50%{ background-color: #34d399; box-shadow: 0 0 0 2px rgba(16,185,129,.25) } }`}</style>
    </div>
  );
}

// ── Anomaly Detection: traffic line with anomaly spikes ──

const TRAFFIC = [12, 14, 13, 15, 16, 14, 13, 52, 15, 14, 16, 13, 48, 14, 15, 16, 13, 14, 56, 15];
export function AnomalyDetectionPreview() {
  const W = 200, H = 70, pad = 6;
  const max = Math.max(...TRAFFIC);
  const points = TRAFFIC.map((v, i) => `${pad + (i * (W - pad * 2)) / (TRAFFIC.length - 1)},${H - pad - (v / max) * (H - pad * 2)}`).join(' ');
  const anomalies = TRAFFIC.map((v, i) => ({ v, i })).filter((x) => x.v > 40);
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-[85%] text-zinc-400">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
        {anomalies.map(({ v, i }) => {
          const x = pad + (i * (W - pad * 2)) / (TRAFFIC.length - 1);
          const y = H - pad - (v / max) * (H - pad * 2);
          return <circle key={i} cx={x} cy={y} r={3} fill="#ef4444" style={{ animation: 'anomalyPing 1.8s ease-in-out infinite' }} />;
        })}
      </svg>
      <style>{`@keyframes anomalyPing { 0%,100%{ r: 2.5 } 50%{ r: 4 } }`}</style>
    </div>
  );
}
