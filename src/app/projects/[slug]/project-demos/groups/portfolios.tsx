'use client';
import React, { useState } from 'react';
import type { Project } from '@/data/projects';
import { CARD, L, useCopy } from '../demo-utils';

// 37–40. Portfolio versions
// ─────────────────────────────────────────────────────────────────────────────

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
      <p className="text-xs text-zinc-400 dark:text-neutral-400 mt-2">Click × to minimize · click the taskbar button to reopen</p>
    </div>
  );
}

function Portfolio3Demo() {
  const sections = ['Intro', 'Work', 'About', 'Contact'];
  const [active, setActive] = useState(0);
  return (
    <div className="my-8 not-prose">
      <p className={L}>One-page scroll sections</p>
      <div className="flex gap-2 mb-3">
        {sections.map((s, i) => (
          <button key={s} onClick={() => setActive(i)} className={`text-xs px-2 py-1 rounded ${active === i ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900' : 'text-zinc-500 border border-zinc-200 dark:border-neutral-700'}`}>{s}</button>
        ))}
      </div>
      <div className={`${CARD} p-6 min-h-[120px] flex items-center justify-center`}>
        <p className="text-sm text-zinc-600 dark:text-neutral-300">Full-viewport {sections[active].toLowerCase()} panel · snap scroll between sections</p>
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
        <button onClick={click} className="px-8 py-3 text-sm font-medium bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl transition-none select-none"
          style={{transform:`scale(${scale})`,transition:'transform 0s'}}>
          Click me
        </button>
        {cnt>0&&<p className="text-xs text-zinc-400 dark:text-neutral-400">Clicked {cnt} time{cnt>1?'s':''} · GSAP used this spring curve throughout</p>}
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
            <div className="w-full aspect-square rounded-lg ring-2 ring-zinc-200 dark:ring-neutral-700 ring-offset-2 dark:ring-offset-neutral-950 group-hover:ring-zinc-400 dark:group-hover:ring-neutral-400 transition-all" style={{backgroundColor:c.hex}}/>
            <span className="text-xs text-zinc-500 dark:text-neutral-400">{copied===c.hex?'✓':c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'portfolio-v4') return <Portfolio4Demo />;
  if (slug === 'portfolio-v3') return <Portfolio3Demo />;
  if (slug === 'portfolio-v2') return <Portfolio2Demo />;
  if (slug === 'portfolio-v1') return <Portfolio1Demo />;
  return null;
}

export function GroupWidget({ project }: { project: Project }) {
  return <>{getWidget(project)}</>;
}
