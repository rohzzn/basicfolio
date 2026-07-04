'use client';
import React, { useState } from 'react';
import type { Project } from '@/data/projects';
import { CARD, L, useCopy } from '../demo-utils';
import { CommandList, TerminalInstall } from '../shared-widgets';
import { BeamDemo } from '../beam-demo';

// 10. Keel: React Native subscription tracker
// ─────────────────────────────────────────────────────────────────────────────

const KEEL_SUBS=[{n:'Netflix',icon:'🎬',mo:15.99},{n:'Spotify',icon:'🎵',mo:9.99},{n:'iCloud+',icon:'☁️',mo:2.99},{n:'GitHub Pro',icon:'🐙',mo:4.00},{n:'Duolingo',icon:'🦜',mo:6.99}];
function KeelDemo() {
  const [annual,setAnnual]=useState(false);
  const [subs,setSubs]=useState(KEEL_SUBS);
  const total=subs.reduce((s,r)=>s+(annual?r.mo*12:r.mo),0);
  const savings=KEEL_SUBS.reduce((s,r)=>s+r.mo*2,0);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Subscription Tracker</p>
      <div className={`${CARD} max-w-xs`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-neutral-800">
          <div>
            <p className="text-xs text-zinc-400 dark:text-neutral-400">{annual?'Annual':'Monthly'} total</p>
            <p className="text-xl font-semibold dark:text-paper tabular-nums">${total.toFixed(2)}</p>
            {annual&&<p className="text-xs text-green-500">Saving ${savings.toFixed(2)}/yr vs monthly</p>}
          </div>
          <button onClick={()=>setAnnual(a=>!a)} className={`text-xs px-2.5 py-1 rounded-full transition-colors ${annual?'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900':'bg-zinc-100 dark:bg-neutral-800 text-zinc-500 dark:text-neutral-400'}`}>{annual?'Annual':'Monthly'}</button>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
          {subs.map(s=>(
            <div key={s.n} className="flex items-center justify-between px-4 py-2.5 group">
              <div className="flex items-center gap-2"><span>{s.icon}</span><span className="text-xs font-medium text-zinc-700 dark:text-neutral-300">{s.n}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums dark:text-paper">${(annual?s.mo*12:s.mo).toFixed(2)}</span>
                <button onClick={()=>setSubs(ss=>ss.filter(r=>r.n!==s.n))} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all text-sm leading-none">×</button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 bg-zinc-50 dark:bg-neutral-800/40 text-xs text-zinc-400 dark:text-neutral-400 text-center">{subs.length} subscriptions · hover to remove</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Todo iOS: kanban board
// ─────────────────────────────────────────────────────────────────────────────

type KStatus='todo'|'doing'|'done';
const INIT_TASKS=[{id:1,t:'Design onboarding screens',s:'todo' as KStatus},{id:2,t:'Implement CoreData model',s:'todo' as KStatus},{id:3,t:'Set up iCloud sync',s:'doing' as KStatus},{id:4,t:'Write unit tests',s:'doing' as KStatus},{id:5,t:'App Store screenshots',s:'done' as KStatus},{id:6,t:'Submit for review',s:'done' as KStatus}];
const COLS:{s:KStatus;label:string}[]=[{s:'todo',label:'To Do'},{s:'doing',label:'Doing'},{s:'done',label:'Done'}];
function TodoKanbanDemo() {
  const [tasks,setTasks]=useState(INIT_TASKS);
  const move=(id:number,to:KStatus)=>setTasks(ts=>ts.map(t=>t.id===id?{...t,s:to}:t));
  return (
    <div className="my-8 not-prose">
      <p className={L}>Task Board</p>
      <div className="grid grid-cols-3 gap-2">
        {COLS.map(col=>(
          <div key={col.s} className="bg-zinc-50 dark:bg-neutral-800/40 rounded-lg p-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-neutral-400 mb-2 px-1">{col.label} <span className="text-zinc-400 dark:text-neutral-400">({tasks.filter(t=>t.s===col.s).length})</span></p>
            <div className="space-y-1.5">
              {tasks.filter(t=>t.s===col.s).map(t=>(
                <div key={t.id} className="bg-white dark:bg-neutral-900 border border-zinc-100 dark:border-neutral-700 rounded-md p-2 text-xs text-zinc-600 dark:text-neutral-400 cursor-pointer hover:border-zinc-300 dark:hover:border-neutral-500 transition-colors"
                  onClick={()=>{
                    const idx=COLS.findIndex(c=>c.s===t.s);
                    if(idx<COLS.length-1) move(t.id,COLS[idx+1].s);
                    else move(t.id,COLS[0].s);
                  }}>
                  {t.t}<p className="text-zinc-400 dark:text-neutral-400 mt-0.5">click → move</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. ShutTab: blocker demo (EXISTING, kept)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SITES=[{domain:'twitter.com',blocked:true},{domain:'reddit.com',blocked:true},{domain:'youtube.com',blocked:false},{domain:'instagram.com',blocked:false}];
function ShutTabDemo() {
  const [sites,setSites]=useState(DEFAULT_SITES);
  const [adding,setAdding]=useState('');
  const toggle=(domain:string)=>setSites(s=>s.map(s2=>s2.domain===domain?{...s2,blocked:!s2.blocked}:s2));
  const add=()=>{ const d=adding.trim().replace(/^https?:\/\//,'').split('/')[0]; if(d&&!sites.find(s=>s.domain===d)) setSites(s=>[...s,{domain:d,blocked:true}]); setAdding(''); };
  return (
    <div className="my-8 not-prose">
      <p className={L}>Extension Demo</p>
      <div className={`${CARD} max-w-xs`}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-neutral-800/60 border-b border-zinc-100 dark:border-neutral-800">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-zinc-800 dark:bg-neutral-200 flex items-center justify-center"><span className="text-white dark:text-neutral-900 text-xs font-bold">S</span></div><span className="text-xs font-semibold text-zinc-700 dark:text-neutral-300">ShutTab</span></div>
          <span className="text-xs text-zinc-400">{sites.filter(s=>s.blocked).length} blocked</span>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
          {sites.map(s=>(
            <div key={s.domain} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs font-mono text-zinc-700 dark:text-neutral-300">{s.domain}</span>
              <button
                type="button"
                role="switch"
                aria-checked={s.blocked}
                aria-label={s.blocked ? `Unblock ${s.domain}` : `Block ${s.domain}`}
                onClick={() => toggle(s.domain)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 ${s.blocked ? 'bg-red-500' : 'bg-green-500'}`}
              >
                <span
                  className={`pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ease-out will-change-transform ${s.blocked ? 'translate-x-0' : 'translate-x-4'}`}
                />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 px-4 py-3 border-t border-zinc-100 dark:border-neutral-800">
          <input value={adding} onChange={e=>setAdding(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="site.com" className="flex-1 text-xs font-mono px-2 py-1.5 border border-zinc-200 dark:border-neutral-700 rounded bg-transparent text-zinc-700 dark:text-neutral-300 placeholder-zinc-400 focus:outline-none" />
          <button onClick={add} className="text-xs px-2.5 py-1.5 bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded hover:opacity-80">+ Block</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Relay: uptime monitoring demo
// ─────────────────────────────────────────────────────────────────────────────

function RelayDemo() {
  const [down, setDown] = useState(true);
  const monitors = [
    { name: 'API Gateway', ms: 142, up: true },
    { name: 'Database', ms: 58, up: true },
    { name: 'Media Server', ms: null as number | null, up: !down },
  ];
  const up = monitors.filter(m => m.up).length;
  const segs = (recentDown: boolean) =>
    Array.from({ length: 40 }, (_, i) =>
      i >= 38 && recentDown ? 'bg-red-400' : i >= 36 && recentDown ? 'bg-amber-400' : 'bg-emerald-400/80'
    );
  return (
    <div className="my-8 not-prose">
      <p className={L}>Interactive Preview</p>
      <div className={`${CARD} max-w-sm`}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-neutral-800/60 border-b border-zinc-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-neutral-300">Relay</span>
          </div>
          <span className="text-xs text-zinc-400">{up}/{monitors.length} up</span>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
          {monitors.map(m => (
            <div key={m.name} className="px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.up ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-medium text-zinc-700 dark:text-neutral-300 truncate">{m.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {m.ms != null && <span className="text-xs font-mono text-zinc-400">{m.ms}ms</span>}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.up ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                    {m.up ? 'Up' : 'Down'}
                  </span>
                </div>
              </div>
              <div className="flex gap-px h-2">
                {segs(!m.up).map((c, i) => (
                  <div key={i} className={`flex-1 rounded-sm ${c}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-zinc-100 dark:border-neutral-800 flex items-center justify-between gap-3">
          <code className="text-[10px] font-mono text-zinc-400 truncate">docker run ghcr.io/rohzzn/relay</code>
          <button
            type="button"
            onClick={() => setDown(d => !d)}
            className="text-xs px-2.5 py-1.5 bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded hover:opacity-80 flex-shrink-0"
          >
            {down ? 'Resolve' : 'Simulate down'}
          </button>
        </div>
      </div>
      <p className="text-xs text-zinc-400 dark:text-neutral-400 mt-3">Toggle a monitor: admin dashboard and status page stay in sync in the real app</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. CS Stats: Steam overlay
// ─────────────────────────────────────────────────────────────────────────────

function CSStatsDemo() {
  const [show,setShow]=useState(false);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Extension Demo</p>
      <div className={`${CARD} max-w-sm`}>
        <div className="p-4 bg-gradient-to-b from-zinc-800 to-zinc-900">
          <div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">R</div><div><p className="text-sm font-semibold text-white">Rohan P.</p><p className="text-xs text-zinc-400">Online · Playing CS2</p></div></div>
          <button onClick={()=>setShow(s=>!s)} className="w-full py-1.5 text-xs rounded border border-zinc-600 text-zinc-300 hover:bg-zinc-700 transition-colors">{show?'Hide CS2 Stats ↑':'Show CS2 Stats ↓'}</button>
        </div>
        {show&&(
          <div className="p-4 bg-zinc-900 border-t border-zinc-700 grid grid-cols-2 gap-3">
            {[['Hours played','2,847'],['K/D ratio','2.34'],['Win rate','53.2%'],['Headshot %','47.8%'],['Current rank','Legendary Eagle Master'],['Matches','1,204']].map(([k,v])=>(
              <div key={k}><p className="text-xs text-zinc-500 mb-0.5">{k}</p><p className="text-sm font-medium text-white">{v}</p></div>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-400 dark:text-neutral-400 mt-3">Click to toggle the stats overlay the extension injects</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Zenitsu Bot: Discord chat demo
// ─────────────────────────────────────────────────────────────────────────────

const BOT_RES: Record<string,{title:string;body:string;color:string}> = {
  '/balance':{title:'Your Balance',body:'💰 1,250 Zenitsu Coins\n📈 Earned today: +50',color:'#FAB387'},
  '/daily':  {title:'Daily Reward',body:'✅ +50 💰 claimed!\n⏰ Next reward in 23h 59m',color:'#A6E3A1'},
  '/trivia': {title:'Trivia Time',body:'Which language was V8 originally written in?\n\nA) JavaScript  B) Rust  C) C++  D) Go',color:'#89B4FA'},
  '/roll':   {title:'Dice Roll',body:'🎲 You rolled a 4 on a 6-sided die',color:'#CBA6F7'},
};
function ZenitsuBotDemo() {
  const [msgs,setMsgs]=useState<{cmd:string;ts:string}[]>([]);
  const send=(cmd:string)=>{ const ts=new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}); setMsgs(m=>[...m.slice(-4),{cmd,ts}]); };
  return (
    <div className="my-8 not-prose">
      <p className={L}>Bot Demo</p>
      <div className={CARD}>
        <div className="px-4 py-2.5 bg-zinc-100 dark:bg-neutral-800/60 border-b border-zinc-100 dark:border-neutral-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"/><span className="text-xs font-medium text-zinc-600 dark:text-neutral-400"># general</span></div>
        <div className="bg-zinc-50 dark:bg-neutral-900 min-h-[160px] p-4 space-y-3">
          {msgs.length===0&&<p className="text-xs text-zinc-400 dark:text-neutral-400 italic">Click a command to see the bot respond</p>}
          {msgs.map((m,i)=>{ const r=BOT_RES[m.cmd]; return (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">Z</div>
              <div className="min-w-0"><div className="flex items-baseline gap-2 mb-1"><span className="text-xs font-semibold text-zinc-800 dark:text-neutral-200">Zenitsu Bot</span><span className="text-xs text-zinc-400">{m.ts}</span></div>
              <div className="border-l-4 rounded-r-lg p-2.5 bg-zinc-100 dark:bg-neutral-800" style={{borderColor:r.color}}><p className="text-xs font-semibold mb-1" style={{color:r.color}}>{r.title}</p><p className="text-xs text-zinc-600 dark:text-neutral-400 whitespace-pre-line">{r.body}</p></div></div>
            </div>
          );})}
        </div>
        <div className="px-4 py-3 border-t border-zinc-100 dark:border-neutral-800 flex flex-wrap gap-2 bg-zinc-50/50 dark:bg-neutral-900/50">
          {Object.keys(BOT_RES).map(cmd=><button key={cmd} onClick={()=>send(cmd)} className="px-3 py-1.5 text-xs font-mono bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 rounded-md hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-colors">{cmd}</button>)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Tanoshi: color palette + syntax preview
// ─────────────────────────────────────────────────────────────────────────────

function TanoshiColorPalette({ colors }: { colors: NonNullable<Project['colors']> }) {
  const { copied, copy } = useCopy();
  const unique = [...new Map(colors.map(c => [c.hex, c])).values()];
  return (
    <div className="my-8 not-prose">
      <p className={L}>Color Palette</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {unique.map(c => (
          <button key={c.hex + c.name} onClick={() => copy(c.hex, c.hex)}
            className="group flex items-center gap-3 p-3 border border-zinc-100 dark:border-neutral-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-neutral-800/40 transition-colors text-left">
            <div className="w-8 h-8 rounded-md flex-shrink-0 ring-1 ring-zinc-200 dark:ring-neutral-700 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950 group-hover:ring-2 transition-all" style={{ backgroundColor: c.hex }} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-700 dark:text-neutral-300 truncate">{c.name}</p>
              <p className="text-xs font-mono text-zinc-400 dark:text-neutral-400">{copied === c.hex ? <span className="text-green-500">copied!</span> : c.hex}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

type Tok=[string,'kw'|'fn'|'ty'|'str'|'cm'|'co'|'fg'];
const TS_CODE:Tok[][]=[
  [['// Formats a duration to human-readable form','cm']],
  [['function ','kw'],['formatDuration','fn'],['(ms: ','fg'],['number','ty'],['): ','fg'],['string','ty'],[' {','fg']],
  [['  if ','kw'],['(ms < ','fg'],['1_000','co'],[') ','fg'],['return ','kw'],['`${ms}ms`','str']],
  [['  if ','kw'],['(ms < ','fg'],['60_000','co'],[') ','fg'],['return ','kw'],['`${(ms/1000).toFixed(1)}s`','str']],
  [['  const ','kw'],['mins ','fg'],['= Math.floor(ms / ','fg'],['60_000','co'],[')','fg']],
  [['  const ','kw'],['secs ','fg'],['= Math.floor((ms % ','fg'],['60_000','co'],[') / ','fg'],['1_000','co'],[')','fg']],
  [['  return ','kw'],['`${mins}m ${secs}s`','str']],
  [['}','fg']],
];
const PY_CODE:Tok[][]=[
  [['# Formats a duration to human-readable form','cm']],
  [['def ','kw'],['format_duration','fn'],['(ms: ','fg'],['int','ty'],[') -> ','fg'],['str','ty'],[':','fg']],
  [['    if ','kw'],['ms < ','fg'],['1_000','co'],[': return ','fg'],['f"{ms}ms"','str']],
  [['    if ','kw'],['ms < ','fg'],['60_000','co'],[': return ','fg'],['f"{ms/1000:.1f}s"','str']],
  [['    mins = ms // ','fg'],['60_000','co']],
  [['    secs = (ms % ','fg'],['60_000','co'],[') // ','fg'],['1_000','co']],
  [['    return ','kw'],['f"{mins}m {secs}s"','str']],
];
function TanoshiSyntaxPreview({ colors }:{ colors: NonNullable<Project['colors']> }) {
  const [lang,setLang]=useState<'ts'|'py'>('ts');
  const cm=Object.fromEntries(colors.map(c=>[c.role,c.hex]));
  const p:Record<string,string>={kw:cm['Keywords & control flow']||'#89B4FA',fn:cm['Function names']||'#FAB387',ty:cm['Types & classes']||'#CBA6F7',str:cm['String literals']||'#A6E3A1',cm:cm['Comments']||'#6C7086',co:cm['Constants & numbers']||'#F9E2AF',fg:cm['Default text']||'#CDD6F4'};
  const bg=cm['Editor background']||'#161622';
  const lines=lang==='ts'?TS_CODE:PY_CODE;
  return (
    <div className="my-8 not-prose">
      <div className="flex items-center justify-between mb-3">
        <p className={L} style={{marginBottom:0}}>Syntax Preview</p>
        <div className="flex gap-1">{(['ts','py'] as const).map(l=><button key={l} onClick={()=>setLang(l)} className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${lang===l?'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900':'text-zinc-400 dark:text-neutral-400 hover:text-zinc-700 dark:hover:text-neutral-300'}`}>{l==='ts'?'TypeScript':'Python'}</button>)}</div>
      </div>
      <div className="rounded-lg overflow-hidden border border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800" style={{ backgroundColor: bg }}>
          <div className="flex gap-1.5">{[p.str, p.kw, p.fg].map(c => <div key={c} className="h-2.5 w-2.5 rounded-full opacity-90 ring-1 ring-black/10" style={{ backgroundColor: c }} />)}</div>
          <span className="text-xs font-mono" style={{color:p.cm}}>{lang==='ts'?'utils.ts':'utils.py'}</span>
        </div>
        <pre className="p-4 overflow-x-auto text-xs leading-6 font-mono" style={{backgroundColor:bg}}>
          {lines.map((line,li)=>(
            <div key={li} className="flex"><span className="select-none mr-4 text-right" style={{color:p.cm,minWidth:'1.5rem'}}>{li+1}</span><span>{line.map(([text,type],ti)=><span key={ti} style={{color:p[type]}}>{text}</span>)}</span></div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. Pages (Figma): reorderable page list
// ─────────────────────────────────────────────────────────────────────────────

const INIT_PAGES=['Onboarding','Dashboard','Settings','Components','Icons','Prototype','Archive'];
function PagesReorderDemo() {
  const [pages,setPages]=useState(INIT_PAGES);
  const [adding,setAdding]=useState('');
  const mv=(i:number,dir:-1|1)=>{
    const n=[...pages]; const j=i+dir;
    if(j<0||j>=n.length) return;
    [n[i],n[j]]=[n[j],n[i]]; setPages(n);
  };
  return (
    <div className="my-8 not-prose">
      <p className={L}>Page Manager</p>
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-neutral-800 mb-3`}>
        {pages.map((p,i)=>(
          <div key={p} className="flex items-center justify-between px-4 py-2.5 group">
            <div className="flex items-center gap-2"><span className="text-zinc-400 dark:text-neutral-400 text-xs select-none">{String(i+1).padStart(2,'0')}</span><span className="text-sm text-zinc-700 dark:text-neutral-300">{p}</span></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={()=>mv(i,-1)} disabled={i===0} className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-neutral-800 disabled:opacity-20 transition-colors text-xs">↑</button>
              <button onClick={()=>mv(i,1)} disabled={i===pages.length-1} className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-neutral-800 disabled:opacity-20 transition-colors text-xs">↓</button>
              <button onClick={()=>setPages(pp=>pp.filter((_,j)=>j!==i))} className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors text-xs">×</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2"><input value={adding} onChange={e=>setAdding(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&adding.trim()){setPages(pp=>[...pp,adding.trim()]);setAdding('');}}} placeholder="New page name…" className="flex-1 px-3 py-2 text-sm border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 placeholder-zinc-400 focus:outline-none" /><button onClick={()=>{if(adding.trim()){setPages(pp=>[...pp,adding.trim()]);setAdding('');}}} className="px-3 py-2 text-sm bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg hover:opacity-80">Add</button></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Meet: video call room
// ─────────────────────────────────────────────────────────────────────────────

const PARTICIPANTS=[{n:'Rohan P.',you:true},{n:'Vanshita M.',you:false},{n:'Alex M.',you:false},{n:'Priya R.',you:false}];
function MeetDemo() {
  const [muted,setMuted]=useState<Set<string>>(new Set());
  const [left,setLeft]=useState<Set<string>>(new Set());
  const active=PARTICIPANTS.filter(p=>!left.has(p.n));
  return (
    <div className="my-8 not-prose">
      <p className={L}>Video Call</p>
      <div className="bg-zinc-900 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {active.map(p=>(
            <div key={p.n} className="relative aspect-video bg-zinc-800 rounded-md flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">{p.n[0]}</div>
              <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
                <span className="text-white text-xs">{p.n}{p.you&&' (you)'}</span>
                {muted.has(p.n)&&<span className="text-red-400 text-xs">🔇</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={()=>setMuted(m=>{const n=new Set(m);if(n.has('Rohan P.'))n.delete('Rohan P.');else n.add('Rohan P.');return n;})}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${muted.has('Rohan P.')?'bg-red-500 text-white':'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
            {muted.has('Rohan P.')?'Unmute':'Mute'}
          </button>
          {active.filter(p=>!p.you).map(p=>(
            <button key={p.n} onClick={()=>setLeft(l=>new Set([...l,p.n]))} className="px-3 py-1.5 rounded text-xs bg-zinc-700 text-zinc-300 hover:bg-red-600 hover:text-white transition-colors">Remove {p.n.split(' ')[0]}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-400 dark:text-neutral-400 mt-2">Mute yourself or remove participants</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. Git Time Machine: commit browser
// ─────────────────────────────────────────────────────────────────────────────

const GTM_COMMITS=[{hash:'a3f9c2b',msg:'feat: add animated transitions',time:'2h'},{hash:'8e1d054',msg:'fix: keyboard navigation in tree',time:'1d'},{hash:'c4b7e12',msg:'refactor: extract diff renderer',time:'3d'},{hash:'2a9f831',msg:'feat: add branch selector',time:'5d'},{hash:'f10cc3e',msg:'init: project setup',time:'1w'}];
function GitTimeMachineDemo() {
  const [sel,setSel]=useState<string|null>(null);
  const s=GTM_COMMITS.find(c=>c.hash===sel);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Interactive Preview</p>
      <div className={`${CARD} bg-zinc-950`}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
          <div className="flex gap-1.5">{['bg-red-400','bg-yellow-400','bg-green-400'].map(c=><div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`}/>)}</div>
          <span className="text-xs font-mono text-zinc-500">git time machine</span>
        </div>
        <div className="p-3 font-mono text-xs">
          <p className="text-zinc-500 mb-3">$ gtm: 5 commits on main</p>
          {GTM_COMMITS.map((c,i)=>(
            <button key={c.hash} onClick={()=>setSel(sel===c.hash?null:c.hash)}
              className={`w-full flex items-center gap-3 px-2 py-1.5 rounded transition-colors text-left ${sel===c.hash?'bg-zinc-700':'hover:bg-zinc-900'}`}>
              <span className="text-zinc-600">{i===0?'●':'○'}</span>
              <span className="text-amber-400">{c.hash}</span>
              <span className="text-zinc-300 flex-1 min-w-0 truncate">{c.msg}</span>
              <span className="text-zinc-600">{c.time}</span>
            </button>
          ))}
          {s&&<div className="mt-3 pt-3 border-t border-zinc-800 space-y-1"><p className="text-zinc-500">commit {s.hash}</p><p className="text-green-400">+ {s.msg}</p><p className="text-zinc-600 mt-2">[Enter to checkout · q to quit]</p></div>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// 21. Hexr: color picker grid
// ─────────────────────────────────────────────────────────────────────────────

function hslToHex(h:number,s:number,l:number):string {
  const ll=l/100, a=s/100*Math.min(ll,1-ll);
  const f=(n:number)=>{const k=(n+h/30)%12;const c=ll-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};
  return `#${f(0)}${f(8)}${f(4)}`;
}
function HexrDemo() {
  const [hov,setHov]=useState<string|null>(null);
  const {copied,copy}=useCopy();
  const swatches=Array.from({length:60},(_,i)=>{
    const h=(i%10)*36, l=30+Math.floor(i/10)*8;
    return hslToHex(h,70,l);
  });
  return (
    <div className="my-8 not-prose">
      <p className={L}>Color Picker</p>
      <div className="grid grid-cols-10 gap-0.5 rounded-lg overflow-hidden mb-3">
        {swatches.map((hex,i)=>(
          <button key={i} className="aspect-square transition-transform hover:scale-110 relative z-0 hover:z-10 rounded-sm"
            style={{backgroundColor:hex}}
            onMouseEnter={()=>setHov(hex)} onMouseLeave={()=>setHov(null)}
            onClick={()=>copy(hex,hex)} title={hex} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        {hov&&<div className="w-6 h-6 rounded border border-zinc-200 dark:border-neutral-700" style={{backgroundColor:hov}}/>}
        <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">{copied?`${copied} copied!`:hov||'Hover to preview · click to copy'}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// 30. Anomaly Detection: traffic SVG chart
// ─────────────────────────────────────────────────────────────────────────────

const TRAFFIC=[12,14,13,15,16,14,13,52,15,14,16,13,48,14,15,16,13,14,56,15,14,13,16,15];
function AnomalyDetectionDemo() {
  const [hov,setHov]=useState<number|null>(null);
  const W=320,H=100,pad=10;
  const max=Math.max(...TRAFFIC),min=0;
  const points=TRAFFIC.map((v,i)=>`${pad+i*(W-pad*2)/(TRAFFIC.length-1)},${H-pad-(v-min)/(max-min)*(H-pad*2)}`).join(' ');
  const anomalies=TRAFFIC.map((v,i)=>({v,i,anm:v>40})).filter(x=>x.anm);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Network Traffic: Anomaly Detection</p>
      <div className={`${CARD} p-4`}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:100}}>
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400 dark:text-neutral-400"/>
          {anomalies.map(({v,i})=>{ const x=pad+i*(W-pad*2)/(TRAFFIC.length-1),y=H-pad-(v-min)/(max-min)*(H-pad*2);
            return <circle key={i} cx={x} cy={y} r={hov===i?5:3.5} fill="#ef4444" onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} className="cursor-pointer transition-all"/>;
          })}
          {hov!==null&&TRAFFIC[hov]>40&&(
            <text x={pad+hov*(W-pad*2)/(TRAFFIC.length-1)} y={H-pad-(TRAFFIC[hov]-min)/(max-min)*(H-pad*2)-8} textAnchor="middle" fontSize="9" fill="#ef4444">{TRAFFIC[hov]} pkts/s</text>
          )}
        </svg>
        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 dark:text-neutral-400">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/>{anomalies.length} anomalies detected</div>
          <span>hover red dots for details</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// 35. Scrapetron: URL scraper mock
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_SCRAPED=[{selector:'h1',count:1,sample:'Home: Rohan P. Pothuru'},{selector:'p',count:12,sample:'Software engineer and CS grad student...'},{selector:'a',count:47,sample:'LinkedIn, GitHub, Resume...'},{selector:'img',count:3,sample:'profile.png, project-keel.png...'}];
function ScrapetronDemo() {
  const [url,setUrl]=useState('https://Rohan P..run');
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const run=()=>{setLoading(true);setDone(false);setTimeout(()=>{setLoading(false);setDone(true);},900);};
  return (
    <div className="my-8 not-prose">
      <p className={L}>Scraper Demo</p>
      <div className="flex gap-2 mb-3"><input value={url} onChange={e=>setUrl(e.target.value)} className="flex-1 px-3 py-2 text-sm font-mono border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 placeholder-zinc-400 focus:outline-none" placeholder="https://…" /><button onClick={run} disabled={loading} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg hover:opacity-80 disabled:opacity-50">{loading?'…':'Scrape'}</button></div>
      {done&&(
        <div className={`${CARD} divide-y divide-zinc-100 dark:divide-neutral-800`}>
          <div className="px-4 py-2 bg-zinc-50 dark:bg-neutral-800/40 text-xs text-zinc-500 dark:text-neutral-400 flex justify-between"><span>Scraped {url}</span><span className="text-green-500">200 OK</span></div>
          {MOCK_SCRAPED.map(r=>(
            <div key={r.selector} className="px-4 py-2.5 text-xs">
              <div className="flex justify-between mb-0.5"><code className="text-amber-600 dark:text-amber-400">{r.selector}</code><span className="text-zinc-400">{r.count} found</span></div>
              <p className="text-zinc-500 dark:text-neutral-500 truncate">{r.sample}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 36. Ipynb Image Extractor: notebook extraction
// ─────────────────────────────────────────────────────────────────────────────

const CELL_COLORS=['bg-blue-200 dark:bg-blue-900/40','bg-green-200 dark:bg-green-900/40','bg-purple-200 dark:bg-purple-900/40','bg-amber-200 dark:bg-amber-900/40','bg-rose-200 dark:bg-rose-900/40'];
function IpynbDemo() {
  const [file,setFile]=useState('');
  const [extracting,setExtracting]=useState(false);
  const [images,setImages]=useState<string[]>([]);
  const run=()=>{
    if(!file) return;
    setExtracting(true);setImages([]);
    setTimeout(()=>{ setExtracting(false); setImages(CELL_COLORS); },1000);
  };
  return (
    <div className="my-8 not-prose">
      <p className={L}>Image Extractor Demo</p>
      <div className="flex gap-2 mb-3">
        <input value={file} onChange={e=>setFile(e.target.value)} placeholder="analysis.ipynb" className="flex-1 px-3 py-2 text-sm font-mono border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 placeholder-zinc-400 focus:outline-none" />
        <button onClick={run} disabled={extracting||!file} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg hover:opacity-80 disabled:opacity-50">{extracting?'…':'Extract'}</button>
      </div>
      {images.length>0&&(
        <>
          <p className="text-xs text-zinc-400 dark:text-neutral-400 mb-2">{images.length} images extracted to ./images/</p>
          <div className="grid grid-cols-5 gap-2">
            {images.map((c,i)=>(
              <div key={i} className={`aspect-square rounded-lg ${c} flex items-center justify-center text-xs text-zinc-500 dark:text-neutral-400`}>img_{i+1}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'beam') return <BeamDemo />;
  if (slug === 'keel') return <KeelDemo />;
  if (slug === 'relay') return <RelayDemo />;
  if (slug === 'todo-ios') return <TodoKanbanDemo />;
  if (slug === 'shuttab') return <ShutTabDemo />;
  if (slug === 'cs-stats') return <CSStatsDemo />;
  if (slug === 'zenitsu-bot') return <>{p.commands && <ZenitsuBotDemo />}{p.commands && <CommandList commands={p.commands} label="Bot Commands" />}</>;
  if (p.colors?.length) return <>{<TanoshiColorPalette colors={p.colors} />}<TanoshiSyntaxPreview colors={p.colors} /></>;
  if (slug === 'hexr') return <HexrDemo />;
  if (slug === 'pages-figma') return <PagesReorderDemo />;
  if (slug === 'meet') return <MeetDemo />;
  if (slug === 'git-time-machine') return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<GitTimeMachineDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'scrapetron') return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<ScrapetronDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'ipynb-extractor') return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<IpynbDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'anomaly-detection') return <AnomalyDetectionDemo />;
  if (p.install) return <>{<TerminalInstall install={p.install} packageType={p.packageType} />}{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  return null;
}

export function GroupWidget({ project }: { project: Project }) {
  return <>{getWidget(project)}</>;
}
