'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { Project } from '@/data/projects';
import { CARD, L } from '../demo-utils';
import { TerminalInstall } from '../shared-widgets';

// 28. Smart Agriculture — sensor dashboard
// ─────────────────────────────────────────────────────────────────────────────

function SmartAgricultureDemo() {
  const [sensors,setSensors]=useState({temp:24.2,hum:68,soil:42,light:780});
  useEffect(()=>{
    const t=setInterval(()=>setSensors(s=>({
      temp:parseFloat((s.temp+(Math.random()-0.5)*0.4).toFixed(1)),
      hum:Math.max(40,Math.min(90,Math.round(s.hum+(Math.random()-0.5)*2))),
      soil:Math.max(20,Math.min(80,Math.round(s.soil+(Math.random()-0.5)*3))),
      light:Math.max(200,Math.min(1200,Math.round(s.light+(Math.random()-0.5)*20))),
    })),2000);
    return ()=>clearInterval(t);
  },[]);
  const items=[
    {label:'Temperature',value:`${sensors.temp}°C`,pct:(sensors.temp/50)*100,color:'bg-orange-500',good:sensors.temp<35},
    {label:'Humidity',value:`${sensors.hum}%`,pct:sensors.hum,color:'bg-blue-500',good:sensors.hum>40&&sensors.hum<80},
    {label:'Soil Moisture',value:`${sensors.soil}%`,pct:sensors.soil,color:'bg-green-500',good:sensors.soil>30&&sensors.soil<70},
    {label:'Light',value:`${sensors.light}lx`,pct:(sensors.light/1200)*100,color:'bg-yellow-500',good:sensors.light>300},
  ];
  return (
    <div className="my-8 not-prose">
      <div className="flex items-center justify-between mb-3"><p className={L} style={{marginBottom:0}}>Live Sensors</p><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/><span className="text-xs text-zinc-400 dark:text-zinc-500">Live</span></div></div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({label,value,pct,color,good})=>(
          <div key={label} className={`${CARD} p-3`}>
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span><span className={`text-xs font-medium ${good?'text-green-500':'text-red-500'}`}>{good?'OK':'!'}</span></div>
            <p className="text-base font-medium dark:text-white mb-2 tabular-nums">{value}</p>
            <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full"><div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{width:`${pct}%`}}/></div>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">Values update every 2 seconds (simulated)</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 29. Automobile Analytics — bar chart
// ─────────────────────────────────────────────────────────────────────────────

const AUTO_DATA=[{brand:'Toyota',sales:1204,color:'bg-red-500'},{brand:'Honda',sales:987,color:'bg-blue-500'},{brand:'Ford',sales:856,color:'bg-indigo-500'},{brand:'Chevrolet',sales:723,color:'bg-green-500'},{brand:'BMW',sales:445,color:'bg-amber-500'}];
function AutomobileAnalyticsDemo() {
  const [hover,setHover]=useState<string|null>(null);
  const max=Math.max(...AUTO_DATA.map(d=>d.sales));
  return (
    <div className="my-8 not-prose">
      <p className={L}>Sales by Brand — Q1 2023</p>
      <div className="space-y-3">
        {AUTO_DATA.map(d=>(
          <div key={d.brand} onMouseEnter={()=>setHover(d.brand)} onMouseLeave={()=>setHover(null)}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-medium transition-colors ${hover===d.brand?'text-zinc-900 dark:text-white':'text-zinc-600 dark:text-zinc-400'}`}>{d.brand}</span>
              <span className="text-zinc-400 dark:text-zinc-500 tabular-nums">{d.sales.toLocaleString()} units</span>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${d.color} ${hover===d.brand?'opacity-100':'opacity-70'}`} style={{width:`${(d.sales/max)*100}%`}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 31. Block Steam Invites — notification demo
// ─────────────────────────────────────────────────────────────────────────────

function BlockSteamDemo() {
  const [visible,setVisible]=useState(false);
  const [blocked,setBlocked]=useState(0);
  const show=()=>{setVisible(true);setTimeout(()=>{setVisible(false);setBlocked(n=>n+1);},1200);};
  return (
    <div className="my-8 not-prose">
      <p className={L}>Script Demo</p>
      <div className="relative h-36 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">Steam friend request received</p>
          <button onClick={show} className="px-4 py-2 text-sm bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors">Simulate invite</button>
          {blocked>0&&<p className="text-xs text-green-500 mt-2">Blocked {blocked} invite{blocked>1?'s':''}</p>}
        </div>
        {visible&&(
          <div className="absolute bottom-3 right-3 bg-zinc-800 rounded-lg p-2.5 text-xs text-white shadow-xl flex items-center gap-2 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">?</div>
            <div className="mr-1"><p className="font-medium">xXFr3ndXx</p><p className="text-zinc-400 text-xs">wants to be friends</p></div>
            <div className="text-red-400 font-bold text-xs bg-zinc-900 px-1.5 py-0.5 rounded">BLOCKED</div>
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">The userscript intercepts and dismisses invite popups automatically</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 32. OverTheWire — terminal challenge
// ─────────────────────────────────────────────────────────────────────────────

const OTW_RESPONSES: Record<string, string> = {
  'ls': 'readme',
  'ls -la': 'total 24\ndrwxr-xr-x  2 bandit0 bandit0 4096 Sep  1 00:00 .\ndrwxr-xr-x 49 root    root   4096 Sep  1 00:00 ..\n-rw-r--r--  1 bandit0 bandit0  193 Sep  1 00:00 readme',
  'cat readme': 'The password for bandit1 is:\n\nNH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL',
  'cat -': '^C',
  'pwd': '/home/bandit0',
  'whoami': 'bandit0',
  'help': 'Try: ls, cat readme, pwd, whoami',
};
function OverTheWireDemo() {
  const [history,setHistory]=useState<{cmd:string;out:string}[]>([]);
  const [cur,setCur]=useState('');
  const [solved,setSolved]=useState(false);
  const ref=useRef<HTMLInputElement>(null);
  useEffect(()=>{ref.current?.focus();},[]);
  const run=()=>{
    const cmd=cur.trim(); setCur('');
    const out=OTW_RESPONSES[cmd]??`-bash: ${cmd}: command not found`;
    setHistory(h=>[...h,{cmd,out}]);
    if(out.includes('NH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL')) setSolved(true);
  };
  return (
    <div className="my-8 not-prose">
      <p className={L}>Bandit Level 0 — try to find the password</p>
      <div className="bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800" onClick={()=>ref.current?.focus()}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
          <div className="flex gap-1.5">{['bg-red-400','bg-yellow-400','bg-green-400'].map(c=><div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`}/>)}</div>
          <span className="text-xs font-mono text-zinc-500">bandit0@bandit:~$</span>
        </div>
        <div className="p-3 font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
          <p className="text-zinc-400">Connected to bandit.labs.overthewire.org. Type <span className="text-green-400">help</span> to start.</p>
          {history.map((h,i)=>(
            <div key={i}>
              <p className="text-green-400">bandit0@bandit:~$ <span className="text-white">{h.cmd}</span></p>
              <p className="text-zinc-300 whitespace-pre-wrap">{h.out}</p>
            </div>
          ))}
          {solved&&<p className="text-green-400 font-bold">🎉 Level 0 solved!</p>}
          <div className="flex items-center gap-1">
            <span className="text-green-400">bandit0@bandit:~$</span>
            <input ref={ref} value={cur} onChange={e=>setCur(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()}
              className="flex-1 bg-transparent text-white outline-none font-mono text-xs" autoComplete="off" spellCheck={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 33. Discord Mirror — channel mapping
// ─────────────────────────────────────────────────────────────────────────────

const MIRROR_MSGS=['Maintenance window tonight at 2AM UTC','v2.3.1 is now live — see changelog','Server will be down for upgrades Friday'];
function DiscordMirrorDemo() {
  const [step,setStep]=useState(0);
  const visible=MIRROR_MSGS.slice(0,step);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Live Mirror Demo</p>
      <div className="grid grid-cols-2 gap-3">
        {['Server A · #announcements','Server B · #announcements'].map((title,si)=>(
          <div key={title} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800"><p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{title}</p></div>
            <div className="p-2 space-y-1.5 min-h-[80px]">
              {visible.map((m,i)=>(
                <div key={i} className="text-xs p-1.5 rounded bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  {si===1&&<span className="text-zinc-400 dark:text-zinc-500 text-xs">[mirrored] </span>}
                  <span className="text-zinc-700 dark:text-zinc-300">{m}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button onClick={()=>setStep(s=>Math.min(s+1,MIRROR_MSGS.length))} disabled={step>=MIRROR_MSGS.length}
          className="px-3 py-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-30">Post message →</button>
        <button onClick={()=>setStep(0)} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Reset</button>
        {step>0&&<p className="text-xs text-zinc-400 dark:text-zinc-500">Message mirrored to Server B in real time</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 34. GitHub Any Year — contribution graph
// ─────────────────────────────────────────────────────────────────────────────

const YEAR_SEEDS: Record<number, number> = {2020:12345,2021:67890,2022:11111,2023:99999,2024:54321,2025:77777};
function cellActive(year: number, i: number): boolean {
  const s=YEAR_SEEDS[year]||42;
  return ((s*(i+1)*2654435761)>>>0)%5 > 2;
}
function GitHubAnyYearDemo() {
  const [year,setYear]=useState(2024);
  const COLS=52,ROWS=7;
  return (
    <div className="my-8 not-prose">
      <p className={L}>Contribution Graph</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.keys(YEAR_SEEDS).map(y=>(
          <button key={y} onClick={()=>setYear(Number(y))}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${year===Number(y)?'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900':'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>{y}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-0.5" style={{gridTemplateColumns:`repeat(${COLS},10px)`}}>
          {Array.from({length:COLS*ROWS}).map((_,i)=>{
            const on=cellActive(year,i);
            return <div key={i} className={`w-2.5 h-2.5 rounded-sm transition-colors duration-300 ${on?'bg-zinc-700 dark:bg-zinc-300':'bg-zinc-100 dark:bg-zinc-800'}`}/>;
          })}
        </div>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">Simulated contribution pattern for {year}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'smart-agriculture') return <SmartAgricultureDemo />;
  if (slug === 'automobile-analytics') return <AutomobileAnalyticsDemo />;
  if (slug === 'block-steam-invites') return <BlockSteamDemo />;
  if (slug === 'overthewire') return <OverTheWireDemo />;
  if (slug === 'discord-mirror') return <DiscordMirrorDemo />;
  if (slug === 'github-any-year') return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<GitHubAnyYearDemo /></>;
  return null;
}

export function GroupWidget({ project }: { project: Project }) {
  return <>{getWidget(project)}</>;
}
