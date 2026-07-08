'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check } from 'lucide-react';
import type { Project } from '@/data/projects';
import { CARD, L } from '../demo-utils';
import { LanguagesLatDemo } from './languages-lat-demo';

// 7. Interactions: micro-interaction demos
// ─────────────────────────────────────────────────────────────────────────────

function InteractionsDemo() {
  const [tab,setTab]=useState<'magnetic'|'ripple'|'scramble'>('magnetic');
  const [offset,setOffset]=useState({x:0,y:0});
  const [ripples,setRipples]=useState<{id:number;x:number;y:number}[]>([]);
  const [text,setText]=useState('');
  const [scrambled,setScrambled]=useState('');
  const btnRef=useRef<HTMLButtonElement>(null);

  const onMouseMove=(e:React.MouseEvent)=>{
    const r=btnRef.current?.getBoundingClientRect();
    if(!r) return;
    setOffset({x:(e.clientX-r.left-r.width/2)*0.3,y:(e.clientY-r.top-r.height/2)*0.3});
  };
  const addRipple=(e:React.MouseEvent<HTMLDivElement>)=>{
    const r=e.currentTarget.getBoundingClientRect();
    const id=Date.now();
    setRipples(rs=>[...rs,{id,x:e.clientX-r.left,y:e.clientY-r.top}]);
    setTimeout(()=>setRipples(rs=>rs.filter(r2=>r2.id!==id)),600);
  };
  const scramble=()=>{
    const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let i=0;
    const tgt=text||'Hello World';
    const run=setInterval(()=>{
      const disp=tgt.split('').map((c,j)=>j<=i?c:chars[Math.floor(Math.random()*chars.length)]).join('');
      setScrambled(disp); i++;
      if(i>=tgt.length) clearInterval(run);
    },40);
  };
  return (
    <div className="my-8 not-prose">
      <div className="flex gap-1 mb-4">
        {(['magnetic','ripple','scramble'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${tab===t?'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900':'bg-zinc-100 dark:bg-neutral-800 text-zinc-500 dark:text-neutral-400'}`}>{t}</button>
        ))}
      </div>
      {tab==='magnetic'&&(
        <div className="flex flex-col items-center py-8" onMouseMove={onMouseMove} onMouseLeave={()=>setOffset({x:0,y:0})}>
          <button ref={btnRef} className="px-6 py-3 text-sm font-medium bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg transition-transform duration-200 ease-out"
            style={{transform:`translate(${offset.x}px,${offset.y}px)`}}>Hover near me</button>
          <p className="text-xs text-zinc-400 dark:text-neutral-400 mt-4">Move your cursor around the button</p>
        </div>
      )}
      {tab==='ripple'&&(
        <div className="relative overflow-hidden h-32 bg-zinc-50 dark:bg-neutral-900 rounded-lg cursor-pointer flex items-center justify-center" onClick={addRipple}>
          {ripples.map(r=>(
            <span key={r.id} className="absolute w-4 h-4 rounded-full bg-zinc-400 dark:bg-neutral-500 opacity-50 animate-ping pointer-events-none" style={{left:r.x-8,top:r.y-8}} />
          ))}
          <p className="text-xs text-zinc-400 dark:text-neutral-400 pointer-events-none">Click anywhere</p>
        </div>
      )}
      {tab==='scramble'&&(
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type something…"
              className="flex-1 px-3 py-2 text-sm border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 placeholder-zinc-400 focus:outline-none" />
            <button onClick={scramble} className="px-3 py-2 text-sm bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg hover:opacity-80">Scramble</button>
          </div>
          {scrambled&&<p className="text-sm font-mono text-zinc-700 dark:text-neutral-300 p-3 bg-zinc-50 dark:bg-neutral-900 rounded-lg">{scrambled}</p>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Margin: typography playground
// ─────────────────────────────────────────────────────────────────────────────

function MarginDemo() {
  const [size,setSize]=useState(16);
  const [lh,setLh]=useState(1.6);
  const [font,setFont]=useState<'serif'|'sans-serif'|'mono'>('serif');
  return (
    <div className="my-8 not-prose">
      <p className={L}>Typography Playground</p>
      <div className={`${CARD} p-4 mb-3`} style={{fontSize:size,lineHeight:lh,fontFamily:font}}>
        <p className="text-zinc-700 dark:text-neutral-300">Books are a uniquely portable magic. A reader lives a thousand lives before he dies. The man who never reads lives only one. Opening a book is like taking a step into another world.</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3"><label className="text-xs text-zinc-400 dark:text-neutral-400 w-20 flex-shrink-0">Size {size}px</label><input type="range" min={12} max={22} value={size} onChange={e=>setSize(Number(e.target.value))} className="flex-1 accent-zinc-700 dark:accent-neutral-300" /></div>
        <div className="flex items-center gap-3"><label className="text-xs text-zinc-400 dark:text-neutral-400 w-20 flex-shrink-0">Leading {lh}</label><input type="range" min={1.2} max={2.2} step={0.1} value={lh} onChange={e=>setLh(Number(e.target.value))} className="flex-1 accent-zinc-700 dark:accent-neutral-300" /></div>
        <div className="flex gap-2">
          {(['serif','sans-serif','mono'] as const).map(f=>(
            <button key={f} onClick={()=>setFont(f)} className={`px-3 py-1.5 text-xs rounded transition-colors ${font===f?'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900':'bg-zinc-100 dark:bg-neutral-800 text-zinc-500 dark:text-neutral-400'}`} style={{fontFamily:f}}>{f}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Contests: countdown timer cards
// ─────────────────────────────────────────────────────────────────────────────

function useCountdown(target: Date) {
  const [diff,setDiff]=useState(target.getTime()-Date.now());
  useEffect(()=>{ const t=setInterval(()=>setDiff(target.getTime()-Date.now()),1000); return ()=>clearInterval(t); },[target]);
  const s=Math.max(0,Math.floor(diff/1000));
  return { h:Math.floor(s/3600), m:Math.floor((s%3600)/60), s:s%60 };
}
function ContestsDemo() {
  const contests=[
    { name:'Codeforces Round 987',platform:'Codeforces',target:new Date(Date.now()+1000*60*60*5+1000*60*23) },
    { name:'LeetCode Weekly 451',platform:'LeetCode',  target:new Date(Date.now()+1000*60*60*22+1000*60*17) },
    { name:'AtCoder ABC 400',    platform:'AtCoder',   target:new Date(Date.now()+1000*60*60*48+1000*60*5) },
  ];
  return (
    <div className="my-8 not-prose">
      <p className={L}>Upcoming Contests</p>
      <div className="space-y-2">
        {contests.map((c,i)=><ContestCard key={i} {...c} />)}
      </div>
    </div>
  );
}
function ContestCard({name,platform,target}:{name:string;platform:string;target:Date}) {
  const {h,m,s}=useCountdown(target);
  return (
    <div className={`${CARD} flex items-center justify-between px-4 py-3`}>
      <div>
        <p className="text-sm font-medium text-zinc-700 dark:text-neutral-300">{name}</p>
        <p className="text-xs text-zinc-400 dark:text-neutral-400">{platform}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono font-medium dark:text-paper tabular-nums">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</p>
        <p className="text-xs text-zinc-400 dark:text-neutral-400">starts in</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// 19. API Clinic: request builder
// ─────────────────────────────────────────────────────────────────────────────

const API_PRESETS=[
  {m:'GET', url:'https://api.github.com/users/Rohan P.',res:'{\n  "login": "Rohan P.",\n  "public_repos": 84,\n  "followers": 47\n}'},
  {m:'GET', url:'https://jsonplaceholder.typicode.com/posts/1',res:'{\n  "userId": 1,\n  "id": 1,\n  "title": "sunt aut facere..."\n}'},
  {m:'POST',url:'https://jsonplaceholder.typicode.com/posts',res:'{\n  "id": 101,\n  "title": "New post"\n}'},
];
function ApiClinicDemo() {
  const [p,setP]=useState(0);
  const [loading,setLoading]=useState(false);
  const [res,setRes]=useState<string|null>(null);
  const send=()=>{ setLoading(true);setRes(null);setTimeout(()=>{setLoading(false);setRes(API_PRESETS[p].res);},700); };
  return (
    <div className="my-8 not-prose">
      <p className={L}>API Demo</p>
      <div className={CARD}>
        <div className="p-3 border-b border-zinc-100 dark:border-neutral-800 flex gap-2">
          {API_PRESETS.map((pr,i)=><button key={i} onClick={()=>{setP(i);setRes(null);}} className={`px-2.5 py-1 text-xs rounded transition-colors ${p===i?'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900':'bg-zinc-100 dark:bg-neutral-800 text-zinc-500 dark:text-neutral-400'}`}>{pr.m}</button>)}
        </div>
        <div className="p-3 border-b border-zinc-100 dark:border-neutral-800 flex gap-2 items-center">
          <span className={`text-xs font-mono font-bold flex-shrink-0 ${API_PRESETS[p].m==='GET'?'text-green-500':'text-blue-500'}`}>{API_PRESETS[p].m}</span>
          <input readOnly value={API_PRESETS[p].url} className="flex-1 text-xs font-mono bg-zinc-50 dark:bg-neutral-800 px-2 py-1.5 rounded border border-zinc-100 dark:border-neutral-700 text-zinc-600 dark:text-neutral-400 min-w-0 truncate" />
          <button onClick={send} disabled={loading} className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded hover:opacity-80 transition-opacity disabled:opacity-50">{loading?'…':'Send'}</button>
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-neutral-900/50 min-h-[80px]">
          {!res&&!loading&&<p className="text-xs text-zinc-400 dark:text-neutral-400">Response will appear here</p>}
          {loading&&<div className="flex gap-1 items-center">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{animationDelay:`${i*150}ms`}}/>)}</div>}
          {res&&<><div className="flex gap-2 mb-2"><span className="text-xs font-mono text-green-500 font-medium">200 OK</span><span className="text-xs text-zinc-400 dark:text-neutral-400">application/json</span></div><pre className="text-xs font-mono text-zinc-600 dark:text-neutral-400 whitespace-pre-wrap">{res}</pre></>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. DSA Roadmap: topic progress
// ─────────────────────────────────────────────────────────────────────────────

const DSA_TOPICS=[{t:'Arrays',d:'Beginner'},{t:'Linked Lists',d:'Beginner'},{t:'Stacks & Queues',d:'Beginner'},{t:'Hash Maps',d:'Intermediate'},{t:'Binary Trees',d:'Intermediate'},{t:'Graphs',d:'Intermediate'},{t:'Heaps',d:'Intermediate'},{t:'Dynamic Programming',d:'Advanced'},{t:'Greedy Algorithms',d:'Advanced'},{t:'Backtracking',d:'Advanced'}];
const DIFF_C={Beginner:'text-green-500',Intermediate:'text-amber-500',Advanced:'text-red-500'};
function DSARoadmapDemo() {
  const [done,setDone]=useState(new Set<string>());
  const toggle=(t:string)=>setDone(s=>{const n=new Set(s);if(n.has(t))n.delete(t);else n.add(t);return n;});
  const pct=Math.round(done.size/DSA_TOPICS.length*100);
  return (
    <div className="my-8 not-prose">
      <div className="flex items-center justify-between mb-3"><p className={L} style={{marginBottom:0}}>Learning Roadmap</p><span className="text-xs text-zinc-400 dark:text-neutral-400">{done.size}/{DSA_TOPICS.length} · {pct}%</span></div>
      <div className="h-1.5 bg-zinc-100 dark:bg-neutral-800 rounded-full mb-4 overflow-hidden"><div className="h-full bg-zinc-700 dark:bg-neutral-300 rounded-full transition-all duration-300" style={{width:`${pct}%`}}/></div>
      <div className="space-y-1.5">
        {DSA_TOPICS.map(({t,d})=>(
          <button key={t} onClick={()=>toggle(t)} className={`w-full flex items-center justify-between px-3 py-2.5 ${CARD} hover:bg-zinc-50 dark:hover:bg-neutral-800/40 transition-colors text-left`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${done.has(t)?'bg-zinc-900 dark:bg-neutral-100 border-zinc-900 dark:border-neutral-100':'border-zinc-300 dark:border-neutral-600'}`}>{done.has(t)&&<Check className="w-2.5 h-2.5 text-white dark:text-neutral-900"/>}</div>
              <span className={`text-sm transition-colors ${done.has(t)?'line-through text-zinc-400 dark:text-neutral-400':'text-zinc-700 dark:text-neutral-300'}`}>{t}</span>
            </div>
            <span className={`text-xs ${DIFF_C[d as keyof typeof DIFF_C]}`}>{d}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. Dekho Car: search & filter
// ─────────────────────────────────────────────────────────────────────────────

const CARS=[{make:'Toyota',type:'Sedan',price:2200},{make:'Toyota',type:'SUV',price:3500},{make:'Honda',type:'Sedan',price:1800},{make:'Honda',type:'SUV',price:2800},{make:'Ford',type:'Truck',price:4200},{make:'BMW',type:'Sedan',price:5500},{make:'BMW',type:'SUV',price:7200},{make:'Hyundai',type:'Hatchback',price:1200},{make:'Hyundai',type:'Sedan',price:1900},{make:'Tesla',type:'SUV',price:6800}];
function DekhoCarDemo() {
  const [make,setMake]=useState('All');
  const [type,setType]=useState('All');
  const makes=['All',...[...new Set(CARS.map(c=>c.make))]];
  const types=['All',...[...new Set(CARS.map(c=>c.type))]];
  const filtered=CARS.filter(c=>(make==='All'||c.make===make)&&(type==='All'||c.type===type));
  return (
    <div className="my-8 not-prose">
      <p className={L}>Car Search: {filtered.length} results</p>
      <div className="flex gap-2 mb-3 flex-wrap">
        <select value={make} onChange={e=>setMake(e.target.value)} className="text-xs px-2.5 py-1.5 border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 focus:outline-none">
          {makes.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <select value={type} onChange={e=>setType(e.target.value)} className="text-xs px-2.5 py-1.5 border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 focus:outline-none">
          {types.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-neutral-800`}>
        {filtered.slice(0,5).map((c,i)=>(
          <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs">
            <span className="text-zinc-700 dark:text-neutral-300 font-medium">{c.make} · {c.type}</span>
            <span className="text-zinc-400 dark:text-neutral-400">₹{c.price.toLocaleString()}/day</span>
          </div>
        ))}
        {filtered.length===0&&<div className="px-4 py-3 text-xs text-zinc-400 dark:text-neutral-400">No cars match filters</div>}
        {filtered.length>5&&<div className="px-4 py-2.5 text-xs text-zinc-400 dark:text-neutral-400">+{filtered.length-5} more</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. QR Generator: live grid pattern
// ─────────────────────────────────────────────────────────────────────────────

function qrHash(text:string,idx:number):boolean {
  let h=0; for(let i=0;i<text.length;i++){h=((h<<5)-h)+text.charCodeAt(i);h=h&h;}
  return ((h*((idx+1)*2654435761))>>>0)>0x7FFFFFFF;
}
const SZ=21;
function QRDemo() {
  const [text,setText]=useState('https://Rohan P..run');
  const cells=useMemo(()=>{
    const g=Array(SZ*SZ).fill(false);
    // finder patterns
    for(let y=0;y<7;y++) for(let x=0;x<7;x++){const e=x===0||x===6||y===0||y===6,inn=x>=2&&x<=4&&y>=2&&y<=4;if(e||inn){g[y*SZ+x]=true;g[y*SZ+(SZ-1-x)]=true;g[(SZ-1-y)*SZ+x]=true;}}
    // separator quiet zone
    for(let i=0;i<8;i++){g[7*SZ+i]=false;g[i*SZ+7]=false;g[7*SZ+(SZ-1-i)]=false;g[(SZ-1-i)*SZ+7]=false;}
    // data modules
    for(let i=0;i<SZ*SZ;i++){const row=Math.floor(i/SZ),col=i%SZ;
      if((row<8&&col<8)||(row<8&&col>=SZ-8)||(row>=SZ-8&&col<8)) continue;
      if(row===6||col===6) continue;
      g[i]=qrHash(text,i);
    }
    return g;
  },[text]);
  return (
    <div className="my-8 not-prose">
      <p className={L}>QR Preview</p>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="inline-grid p-2 bg-white rounded-lg border border-zinc-200 dark:border-neutral-700" style={{gridTemplateColumns:`repeat(${SZ},9px)`,gap:1}}>
          {cells.map((on,i)=><div key={i} style={{width:9,height:9,backgroundColor:on?'#1a1a1a':'#ffffff'}}/>)}
        </div>
        <div className="flex-1">
          <label className="text-xs text-zinc-400 dark:text-neutral-400 block mb-2">Enter URL or text</label>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="https://…"
            className="w-full px-3 py-2 text-sm border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-neutral-700" />
          <p className="text-xs text-zinc-400 dark:text-neutral-400 mt-2">Pattern updates as you type</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. YouTube Thumbnail Downloader
// ─────────────────────────────────────────────────────────────────────────────

function YoutubeThumbnailDemo() {
  const [url,setUrl]=useState('');
  const [vid,setVid]=useState<string|null>(null);
  const extract=(s:string)=>{ const m=s.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/); return m?m[1]:null; };
  const generate=()=>{ const v=extract(url); setVid(v||'dQw4w9WgXcQ'); };
  const quals=[{label:'Max Res',w:1280,h:720,key:'maxresdefault'},{label:'High',w:480,h:360,key:'hqdefault'},{label:'Medium',w:320,h:180,key:'mqdefault'},{label:'Default',w:120,h:90,key:'default'}];
  return (
    <div className="my-8 not-prose">
      <p className={L}>Thumbnail Downloader</p>
      <div className="flex gap-2 mb-4">
        <input value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()} placeholder="https://youtube.com/watch?v=…"
          className="flex-1 px-3 py-2 text-sm border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 placeholder-zinc-400 focus:outline-none" />
        <button onClick={generate} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0">Get</button>
      </div>
      {vid&&(
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quals.map(q=>(
            <a key={q.key} href={`https://img.youtube.com/vi/${vid}/${q.key}.jpg`} target="_blank" rel="noopener noreferrer"
              className="group block border border-zinc-100 dark:border-neutral-800 rounded-lg overflow-hidden hover:border-zinc-400 dark:hover:border-neutral-500 transition-colors">
              <div className="bg-zinc-100 dark:bg-neutral-800 aspect-video flex items-center justify-center text-xs text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-neutral-700 transition-colors">{q.w}×{q.h}</div>
              <div className="px-2 py-1.5 text-xs font-medium text-zinc-600 dark:text-neutral-400">{q.label} ↗</div>
            </a>
          ))}
        </div>
      )}
      {!vid&&<p className="text-xs text-zinc-400 dark:text-neutral-400">Paste a YouTube URL above</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. Customer Management: CRM table
// ─────────────────────────────────────────────────────────────────────────────

const CUSTOMERS=[{name:'Sarah Johnson',company:'TechCorp',status:'Active',value:'$12,400'},{name:'Marcus Lee',company:'StartupXYZ',status:'Active',value:'$8,200'},{name:'Priya Sharma',company:'DataCo',status:'Lead',value:'$3,500'},{name:'James Wilson',company:'RetailInc',status:'Inactive',value:'$1,200'},{name:'Ana Rodriguez',company:'FinTech Ltd',status:'Active',value:'$21,000'},{name:'Kevin Park',company:'CloudBase',status:'Lead',value:'$6,800'}];
function CustomerManagementDemo() {
  const [q,setQ]=useState('');
  const filtered=CUSTOMERS.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.company.toLowerCase().includes(q.toLowerCase()));
  const STATUS={Active:'text-green-600 dark:text-green-400',Lead:'text-amber-600 dark:text-amber-400',Inactive:'text-zinc-400'};
  return (
    <div className="my-8 not-prose">
      <p className={L}>CRM Demo: {filtered.length} customers</p>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search customers or companies…"
        className="w-full mb-3 px-3 py-2 text-sm border border-zinc-100 dark:border-neutral-800 rounded-lg bg-transparent text-zinc-700 dark:text-neutral-300 placeholder-zinc-400 focus:outline-none" />
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-neutral-800`}>
        {filtered.map((c,i)=>(
          <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
            <div><p className="font-medium text-zinc-700 dark:text-neutral-300">{c.name}</p><p className="text-zinc-400 dark:text-neutral-400">{c.company}</p></div>
            <div className="text-right"><p className={`font-medium ${STATUS[c.status as keyof typeof STATUS]}`}>{c.status}</p><p className="text-zinc-500 dark:text-neutral-400">{c.value}</p></div>
          </div>
        ))}
        {filtered.length===0&&<div className="px-4 py-3 text-xs text-zinc-400">No results</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 26. CodeChef MREC: event stats
// ─────────────────────────────────────────────────────────────────────────────

const EVENTS=[{n:'Algorithm Challenge 1.0',p:1100,type:'Contest'},{n:'Hackathon 2.0',p:1100,type:'Hackathon'},{n:'Advanced DSA 2023',p:1100,type:'Contest'},{n:'CP Bootcamp 2022',p:320,type:'Workshop'},{n:'AI Algorithms Workshop',p:310,type:'Workshop'},{n:'Data Science Workshop',p:350,type:'Workshop'},{n:'Git & GitHub',p:1100,type:'Workshop'}];
function CodeChefDemo() {
  const max=Math.max(...EVENTS.map(e=>e.p));
  const TYPE_C={Contest:'bg-blue-500',Hackathon:'bg-purple-500',Workshop:'bg-amber-500'};
  return (
    <div className="my-8 not-prose">
      <p className={L}>Events: {EVENTS.reduce((s,e)=>s+e.p,0).toLocaleString()} total participants</p>
      <div className="space-y-2.5">
        {EVENTS.map(e=>(
          <div key={e.n}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-700 dark:text-neutral-300 truncate mr-2">{e.n}</span>
              <span className="text-zinc-400 dark:text-neutral-400 flex-shrink-0">{e.p.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${TYPE_C[e.type as keyof typeof TYPE_C]}`} style={{width:`${(e.p/max)*100}%`}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 27. MCU Timeline: horizontal scroll
// ─────────────────────────────────────────────────────────────────────────────

const MCU=[{year:2008,t:'Iron Man',phase:1},{year:2008,t:'The Incredible Hulk',phase:1},{year:2010,t:'Iron Man 2',phase:1},{year:2011,t:'Thor',phase:1},{year:2011,t:'Captain America: TFA',phase:1},{year:2012,t:'The Avengers',phase:1},{year:2013,t:'Iron Man 3',phase:2},{year:2013,t:'Thor: The Dark World',phase:2},{year:2014,t:'Captain America: TWS',phase:2},{year:2014,t:'Guardians of the Galaxy',phase:2},{year:2015,t:'Avengers: Age of Ultron',phase:2},{year:2015,t:'Ant-Man',phase:2}];
const PHASE_C:Record<number,string>={1:'border-blue-400 text-blue-700 dark:text-blue-400',2:'border-green-400 text-green-700 dark:text-green-400'};
function MCUTimelineDemo() {
  const [sel,setSel]=useState<number|null>(null);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Interactive Timeline</p>
      <div className="overflow-x-auto pb-3">
        <div className="flex gap-3 w-max">
          {MCU.map((m,i)=>(
            <button key={i} onClick={()=>setSel(sel===i?null:i)}
              className={`flex-shrink-0 w-36 p-3 border-l-2 rounded-r-lg text-left transition-colors ${sel===i?'bg-zinc-100 dark:bg-neutral-800':CARD+' bg-transparent hover:bg-zinc-50 dark:hover:bg-neutral-800/40'} ${PHASE_C[m.phase]}`}>
              <p className="text-xs text-zinc-400 dark:text-neutral-400 mb-1">{m.year} · Phase {m.phase}</p>
              <p className="text-xs font-medium text-zinc-700 dark:text-neutral-300 leading-tight">{m.t}</p>
            </button>
          ))}
        </div>
      </div>
      {sel!==null&&<p className="text-xs text-zinc-500 dark:text-neutral-400 mt-2">{MCU[sel].t} · {MCU[sel].year} · MCU Phase {MCU[sel].phase}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'languages-lat') return <LanguagesLatDemo />;
  if (slug === 'interactions') return <InteractionsDemo />;
  if (slug === 'margin') return <MarginDemo />;
  if (slug === 'contests') return <ContestsDemo />;
  if (slug === 'api-clinic') return <ApiClinicDemo />;
  if (slug === 'dsa-roadmap') return <DSARoadmapDemo />;
  if (slug === 'dekho-car') return <DekhoCarDemo />;
  if (slug === 'qr-generator') return <QRDemo />;
  if (slug === 'youtube-thumbnails') return <YoutubeThumbnailDemo />;
  if (slug === 'customer-management') return <CustomerManagementDemo />;
  if (slug === 'codechef-mrec') return <CodeChefDemo />;
  if (slug === 'mcu-timeline') return <MCUTimelineDemo />;
  return null;
}

export function GroupWidget({ project }: { project: Project }) {
  return <>{getWidget(project)}</>;
}
