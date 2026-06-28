'use client';
import React, { useState } from 'react';
import type { Project } from '@/data/projects';
import { CARD, L, useCopy } from '../demo-utils';

// 37–41. Portfolio versions
// ─────────────────────────────────────────────────────────────────────────────

function Portfolio5Demo() {
  const stats=[{l:'Static pages',v:'68'},{l:'API routes',v:'19'},{l:'Writing posts',v:'18'},{l:'Projects',v:'41'},{l:'Hobbies pages',v:'15'},{l:'Integrations',v:'13'}];
  return (
    <div className="my-8 not-prose">
      <p className={L}>Site Stats</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {stats.map(({l,v})=>(
          <div key={l} className={`${CARD} p-3`}><p className="text-lg font-medium dark:text-white tabular-nums">{v}</p><p className="text-xs text-zinc-400 dark:text-zinc-500">{l}</p></div>
        ))}
      </div>
    </div>
  );
}

function Portfolio4Demo() {
  const [open,setOpen]=useState(true);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Windows 95 Interface</p>
      <div className="bg-teal-600 p-2 rounded-lg min-h-[160px] relative overflow-hidden">
        {open&&(
          <div className="absolute bg-zinc-200 border-2 border-zinc-300 shadow-md rounded-sm" style={{left:16,top:16,minWidth:200}}>
            <div className="flex items-center justify-between bg-blue-800 px-2 py-1">
              <span className="text-white text-xs font-bold">My Projects</span>
              <button onClick={()=>setOpen(false)} className="bg-zinc-300 w-4 h-4 flex items-center justify-center text-black text-xs font-bold hover:bg-zinc-400 leading-none">×</button>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              {['Keel','Tanoshi','ShutTab','Discord Bot','DSA','Wordle'].map(p=>(
                <div key={p} className="flex flex-col items-center gap-1"><div className="w-8 h-8 bg-white border border-zinc-400 flex items-center justify-center text-xs">📁</div><span className="text-xs text-center">{p}</span></div>
              ))}
            </div>
          </div>
        )}
        {!open&&(
          <div className="absolute bottom-2 left-2"><button onClick={()=>setOpen(true)} className="bg-zinc-300 border border-zinc-400 px-3 py-1 text-xs hover:bg-zinc-200">📂 My Projects</button></div>
        )}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">Click × to minimize · click the taskbar button to reopen</p>
    </div>
  );
}

function Portfolio3Demo() {
  const scale=[{size:40,label:'Display',weight:'700'},{size:28,label:'Title'},{size:20,label:'Heading'},{size:16,label:'Body'},{size:14,label:'Small'},{size:12,label:'Caption'}];
  return (
    <div className="my-8 not-prose">
      <p className={L}>Typographic Scale</p>
      <div className="space-y-3 border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
        {scale.map(({size,label,weight})=>(
          <div key={label} className="flex items-baseline gap-4">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 w-14 flex-shrink-0">{label}</span>
            <span className="text-zinc-700 dark:text-zinc-300" style={{fontSize:size,fontWeight:weight||'400',lineHeight:1.2}}>The quick brown fox</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Portfolio2Demo() {
  const [scale,setScale]=useState(1);
  const [cnt,setCnt]=useState(0);
  const click=()=>{
    setCnt(n=>n+1); setScale(0.92);
    setTimeout(()=>setScale(1.08),100);
    setTimeout(()=>setScale(0.96),200);
    setTimeout(()=>setScale(1.03),300);
    setTimeout(()=>setScale(1),400);
  };
  return (
    <div className="my-8 not-prose">
      <p className={L}>Spring Animation</p>
      <div className="flex flex-col items-center py-8 gap-4">
        <button onClick={click} className="px-8 py-3 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl transition-none select-none"
          style={{transform:`scale(${scale})`,transition:'transform 0s'}}>
          Click me
        </button>
        {cnt>0&&<p className="text-xs text-zinc-400 dark:text-zinc-500">Clicked {cnt} time{cnt>1?'s':''} · GSAP used this spring curve throughout</p>}
      </div>
    </div>
  );
}

function Portfolio1Demo() {
  const palette=[{name:'Crimson',hex:'#E63946'},{name:'Midnight',hex:'#1D3557'},{name:'Sky',hex:'#457B9D'},{name:'Frost',hex:'#A8DADC'},{name:'Ivory',hex:'#F1FAEE'},{name:'Shadow',hex:'#252832'}];
  const {copied,copy}=useCopy();
  return (
    <div className="my-8 not-prose">
      <p className={L}>Original Color Palette</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {palette.map(c=>(
          <button key={c.hex} onClick={()=>copy(c.hex,c.hex)} className="group flex flex-col items-center gap-1.5">
            <div className="w-full aspect-square rounded-lg ring-2 ring-zinc-200 dark:ring-zinc-700 ring-offset-2 dark:ring-offset-zinc-950 group-hover:ring-zinc-400 dark:group-hover:ring-zinc-400 transition-all" style={{backgroundColor:c.hex}}/>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{copied===c.hex?'✓':c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'portfolio-v5') return <Portfolio5Demo />;
  if (slug === 'portfolio-v4') return <Portfolio4Demo />;
  if (slug === 'portfolio-v3') return <Portfolio3Demo />;
  if (slug === 'portfolio-v2') return <Portfolio2Demo />;
  if (slug === 'portfolio-v1') return <Portfolio1Demo />;
  return null;
}

export function GroupWidget({ project }: { project: Project }) {
  return <>{getWidget(project)}</>;
}
