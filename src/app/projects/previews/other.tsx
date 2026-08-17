'use client';

import React, { useEffect, useState } from 'react';
import { LightFrame, LightWindowBar } from './light';

// ── Interactions: a strip of tiny UI experiment swatches, one active, day counter ──

const EXPERIMENTS = ['button', 'toggle', 'slider', 'card', 'chip', 'badge'] as const;
export function InteractionsPreview() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % EXPERIMENTS.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-2.5">
      <div className="grid flex-1 grid-cols-3 gap-1.5">
        {EXPERIMENTS.map((kind, i) => (
          <div key={kind} className={`flex items-center justify-center rounded-lg border transition-colors ${i === active ? 'border-zinc-300 bg-zinc-50 dark:border-neutral-600 dark:bg-neutral-800' : 'border-zinc-100 dark:border-neutral-800'}`}>
            {kind === 'button' && <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[6px] text-white dark:bg-neutral-200 dark:text-neutral-900">Btn</span>}
            {kind === 'toggle' && <span className={`relative h-2.5 w-5 rounded-full ${i === active ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-neutral-600'}`}><span className={`absolute top-0.5 h-1.5 w-1.5 rounded-full bg-white transition-all ${i === active ? 'left-3' : 'left-0.5'}`} /></span>}
            {kind === 'slider' && <span className="h-1 w-8 rounded-full bg-zinc-200 dark:bg-neutral-700"><span className="block h-1 w-2/3 rounded-full bg-zinc-800 dark:bg-neutral-200" /></span>}
            {kind === 'card' && <span className="h-3 w-6 rounded border border-zinc-300 dark:border-neutral-600" />}
            {kind === 'chip' && <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[6px] text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">chip</span>}
            {kind === 'badge' && <span className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[5px] text-white">3</span>}
          </div>
        ))}
      </div>
      <span className="text-center text-[7px] text-zinc-400 dark:text-neutral-500">day {active + 1} of 7</span>
    </div>
  );
}

// ── Automobile Analytics: sales bar chart with a trend line and peak label ──

const SALES = [{ m: 'Jan', v: 4 }, { m: 'Feb', v: 7 }, { m: 'Mar', v: 5 }, { m: 'Apr', v: 9 }, { m: 'May', v: 6 }, { m: 'Jun', v: 11 }, { m: 'Jul', v: 8 }];
export function AutomobileAnalyticsPreview() {
  const peak = SALES.reduce((a, b) => (b.v > a.v ? b : a));
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[7px] text-zinc-400 dark:text-neutral-500">Units sold</span>
        <span className="text-[7px] font-medium text-blue-500 dark:text-blue-400">peak: {peak.m}</span>
      </div>
      <div className="flex items-end justify-between gap-1.5" style={{ height: 56 }}>
        {SALES.map((s, i) => (
          <div key={i} className={`flex-1 rounded-t ${s.m === peak.m ? 'bg-blue-500 dark:bg-blue-400' : 'bg-blue-300/70 dark:bg-blue-700/50'}`} style={{ height: `${(s.v / 11) * 100}%`, animation: `barGrow 0.8s ease-out ${i * 0.06}s both` }} />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[7px] text-zinc-400 dark:text-neutral-500">
        <span>Jan</span><span>Jul</span>
      </div>
      <style>{`@keyframes barGrow { 0%{ transform: scaleY(0); transform-origin: bottom } 100%{ transform: scaleY(1); transform-origin: bottom } }`}</style>
    </div>
  );
}

// ── Smart Agriculture: soil moisture gauge, weather icon, irrigation state ──

export function SmartAgriculturePreview() {
  const [moisture, setMoisture] = useState(72);
  const [sunny, setSunny] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setMoisture((m) => (m <= 28 ? 78 : m - 6)), 700);
    const id2 = setInterval(() => setSunny((s) => !s), 3200);
    return () => { clearInterval(id); clearInterval(id2); };
  }, []);
  const irrigating = moisture < 40;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
      <span className="text-[12px]">{sunny ? '☀️' : '⛅'}</span>
      <div className="relative h-14 w-6 overflow-hidden rounded-full border-2 border-zinc-300 dark:border-neutral-600">
        <div className="absolute bottom-0 left-0 right-0 bg-emerald-400 transition-all duration-700 dark:bg-emerald-500" style={{ height: `${moisture}%` }} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${irrigating ? 'bg-sky-500' : 'bg-zinc-300 dark:bg-neutral-600'}`} />
        <span className="text-[8px] font-medium text-zinc-500 dark:text-neutral-400">{irrigating ? 'Irrigating' : `${moisture}% moisture`}</span>
      </div>
    </div>
  );
}

// ── Block Steam Invites: cycling usernames, running blocked count ──

const INVITE_USERS = ['randomuser42', 'xX_pro_Xx', 'guest_9981'];
export function BlockSteamInvitesPreview() {
  const [i, setI] = useState(0);
  const [count, setCount] = useState(3);
  useEffect(() => {
    const id = setInterval(() => { setI((v) => (v + 1) % INVITE_USERS.length); setCount((c) => c + 1); }, 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <LightFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
        <div key={i} className="w-32 rounded border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-900" style={{ animation: 'invitePop 2.4s ease-in-out' }}>
          <p className="text-[7px] text-blue-500 dark:text-blue-400">Game invite</p>
          <p className="truncate text-[7px] text-zinc-400 dark:text-neutral-500">from {INVITE_USERS[i]}</p>
        </div>
      </div>
      <div className="border-t border-zinc-100 px-2.5 py-1 text-center text-[7px] text-zinc-400 dark:border-neutral-800 dark:text-neutral-500">{count} blocked this session</div>
      <style>{`@keyframes invitePop { 0%{ opacity:0; transform: translateY(4px) scale(.96) } 12%,55%{ opacity:1; transform: translateY(0) scale(1) } 70%{ opacity:0; transform: scale(.9) } 100%{ opacity:0 } }`}</style>
    </LightFrame>
  );
}

// ── OverTheWire: terminal auto-typing, level progression ──

const OTW_LINES = ['$ ls', 'readme', '$ cat readme', 'password: NH2SXQ...'];
export function OverTheWirePreview() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v + 1) % (OTW_LINES.length + 2)), 900);
    return () => clearInterval(id);
  }, []);
  const solved = n >= OTW_LINES.length;
  return (
    <LightFrame>
      <LightWindowBar label={solved ? 'bandit1@bandit' : 'bandit0@bandit'} />
      <div className="flex-1 space-y-1 px-2.5 py-2 font-mono text-[8px]">
        {OTW_LINES.slice(0, n).map((l, i) => (
          <p key={i} className={l.startsWith('$') ? 'text-emerald-600 dark:text-emerald-500' : l.startsWith('password') ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-500 dark:text-neutral-400'}>{l}</p>
        ))}
      </div>
      <div className="border-t border-zinc-100 px-2.5 py-1 text-[7px] text-zinc-400 dark:border-neutral-800 dark:text-neutral-500">Level {solved ? '1' : '0'} of 34</div>
    </LightFrame>
  );
}

// ── Discord Mirror: three servers, message count badge ──

export function DiscordMirrorPreview() {
  const [count, setCount] = useState(128);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-500 text-[8px] font-bold text-white">A</div>
        <div className="relative h-px w-6 bg-zinc-300 dark:bg-neutral-600">
          <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-indigo-400" style={{ animation: 'mirrorMove 1.8s ease-in-out infinite' }} />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-fuchsia-500 text-[8px] font-bold text-white">B</div>
        <div className="relative h-px w-6 bg-zinc-300 dark:bg-neutral-600">
          <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-fuchsia-400" style={{ animation: 'mirrorMove 1.8s ease-in-out 0.9s infinite' }} />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-500 text-[8px] font-bold text-white">C</div>
      </div>
      <span className="font-mono text-[7px] text-zinc-400 dark:text-neutral-500">{count} messages mirrored</span>
      <style>{`@keyframes mirrorMove { 0%{ left:0; opacity:0 } 15%{ opacity:1 } 85%{ opacity:1 } 100%{ left:calc(100% - 8px); opacity:0 } }`}</style>
    </div>
  );
}

// ── GitHub Repo Any Year Any Day: heatmap, cycling which cell backdates ──

export function GithubAnyYearPreview() {
  const cells = Array.from({ length: 77 }, (_, i) => (i * 13) % 5);
  const [lit, setLit] = useState(40);
  useEffect(() => {
    const id = setInterval(() => setLit((l) => (l + 17) % 77), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="absolute inset-0 flex items-center justify-center px-3">
      <div className="grid grid-flow-col grid-rows-7 gap-0.5">
        {cells.map((v, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-sm transition-colors ${i === lit ? '' : v === 0 ? 'bg-zinc-100 dark:bg-neutral-800' : v === 1 ? 'bg-emerald-200 dark:bg-emerald-900/60' : v === 2 ? 'bg-emerald-300 dark:bg-emerald-800' : v === 3 ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-500'}`}
            style={i === lit ? { backgroundColor: '#10b981', animation: 'ghPulse 1.4s ease-in-out infinite' } : undefined}
          />
        ))}
      </div>
      <style>{`@keyframes ghPulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(16,185,129,.5) } 50%{ box-shadow: 0 0 0 2px rgba(16,185,129,.25) } }`}</style>
    </div>
  );
}

// ── Anomaly Detection: traffic line with a threshold line and anomaly count ──

const TRAFFIC = [12, 14, 13, 15, 16, 14, 13, 52, 15, 14, 16, 13, 48, 14, 15, 16, 13, 14, 56, 15];
export function AnomalyDetectionPreview() {
  const W = 200, H = 70, pad = 6;
  const max = Math.max(...TRAFFIC);
  const threshold = 40;
  const points = TRAFFIC.map((v, i) => `${pad + (i * (W - pad * 2)) / (TRAFFIC.length - 1)},${H - pad - (v / max) * (H - pad * 2)}`).join(' ');
  const thresholdY = H - pad - (threshold / max) * (H - pad * 2);
  const anomalies = TRAFFIC.map((v, i) => ({ v, i })).filter((x) => x.v > threshold);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-[85%] text-zinc-400 dark:text-neutral-500">
        <line x1={pad} y1={thresholdY} x2={W - pad} y2={thresholdY} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
        {anomalies.map(({ v, i }) => {
          const x = pad + (i * (W - pad * 2)) / (TRAFFIC.length - 1);
          const y = H - pad - (v / max) * (H - pad * 2);
          return <circle key={i} cx={x} cy={y} r={3} fill="#ef4444" style={{ animation: 'anomalyPing 1.8s ease-in-out infinite' }} />;
        })}
      </svg>
      <span className="text-[7px] text-red-500 dark:text-red-400">{anomalies.length} anomalies detected</span>
      <style>{`@keyframes anomalyPing { 0%,100%{ r: 2.5 } 50%{ r: 4 } }`}</style>
    </div>
  );
}
