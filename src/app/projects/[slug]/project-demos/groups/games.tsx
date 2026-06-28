'use client';
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw } from 'lucide-react';
import type { Project } from '@/data/projects';
import { CARD, L } from '../demo-utils';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Dock Poker — deal & evaluate a 5-card hand
// ─────────────────────────────────────────────────────────────────────────────

const SUITS = ['♠','♥','♦','♣'], RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
function dealHand() {
  const deck = SUITS.flatMap(s => RANKS.map(r => ({ r, s, red: s === '♥' || s === '♦' })));
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck.slice(0, 5);
}
function rankHand(hand: { r: string; s: string }[]): string {
  const rv: Record<string, number> = { A:14,K:13,Q:12,J:11,'10':10,9:9,8:8,7:7,6:6,5:5,4:4,3:3,2:2 };
  const vals = hand.map(c => rv[c.r]).sort((a,b) => b-a);
  const suits = hand.map(c => c.s);
  const flush = new Set(suits).size === 1;
  const straight = vals.every((v,i) => i === 0 || vals[i-1] - v === 1) || (vals[0]===14 && vals[1]===5 && vals[2]===4 && vals[3]===3 && vals[4]===2);
  const counts: Record<number, number> = {};
  vals.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  const groups = Object.values(counts).sort((a,b) => b-a);
  if (flush && straight && vals[0] === 14) return 'Royal Flush 🏆';
  if (flush && straight) return 'Straight Flush';
  if (groups[0] === 4) return 'Four of a Kind';
  if (groups[0] === 3 && groups[1] === 2) return 'Full House';
  if (flush) return 'Flush';
  if (straight) return 'Straight';
  if (groups[0] === 3) return 'Three of a Kind';
  if (groups[0] === 2 && groups[1] === 2) return 'Two Pair';
  if (groups[0] === 2) return 'One Pair';
  return 'High Card';
}
function DockPokerDemo() {
  const [hand, setHand] = useState<ReturnType<typeof dealHand>>([]);
  const [best, setBest] = useState('');
  const deal = () => { const h = dealHand(); setHand(h); setBest(rankHand(h)); };
  return (
    <div className="my-8 not-prose">
      <p className={L}>Deal a Hand</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {hand.map((c, i) => (
          <div key={i} className={`w-12 h-18 border-2 rounded-lg flex flex-col items-center justify-center p-2 ${CARD} ${c.red ? 'text-red-500 border-red-200 dark:border-red-900' : 'dark:text-white border-zinc-200 dark:border-zinc-700'}`}
            style={{ minHeight: 72 }}>
            <span className="text-xs font-bold leading-none">{c.r}</span>
            <span className="text-lg leading-none">{c.s}</span>
          </div>
        ))}
        {hand.length === 0 && <p className="text-sm text-zinc-400 dark:text-zinc-500 self-center">No cards dealt yet</p>}
      </div>
      {best && <p className="text-sm font-medium dark:text-white mb-4">{best}</p>}
      <button onClick={deal} className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity">
        <RefreshCcw className="w-3.5 h-3.5" />{hand.length ? 'Deal Again' : 'Deal Hand'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Catan Online — dice probability visualizer
// ─────────────────────────────────────────────────────────────────────────────

const CATAN_PROB: Record<number,{ways:number;pct:string}> = {
  2:{ways:1,pct:'2.8%'}, 3:{ways:2,pct:'5.6%'}, 4:{ways:3,pct:'8.3%'}, 5:{ways:4,pct:'11.1%'},
  6:{ways:5,pct:'13.9%'}, 7:{ways:6,pct:'16.7%'}, 8:{ways:5,pct:'13.9%'}, 9:{ways:4,pct:'11.1%'},
  10:{ways:3,pct:'8.3%'}, 11:{ways:2,pct:'5.6%'}, 12:{ways:1,pct:'2.8%'}
};
function CatanProbabilityDemo() {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Dice Probability</p>
      <div className="flex gap-2 flex-wrap mb-3">
        {Object.entries(CATAN_PROB).map(([n, d]) => {
          const num = Number(n); const hot = num === 6 || num === 8;
          return (
            <button key={n} onClick={() => setSel(sel === num ? null : num)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg border transition-colors ${sel === num ? 'bg-zinc-900 dark:bg-zinc-100 border-transparent text-white dark:text-zinc-900' : `${CARD} hover:bg-zinc-50 dark:hover:bg-zinc-800/40`}`}>
              <span className={`text-sm font-bold ${hot && sel !== num ? 'text-red-500' : ''}`}>{n}</span>
              <div className="flex gap-0.5 mt-1">{Array.from({length:d.ways}).map((_,i) => <div key={i} className="w-1 h-1 rounded-full bg-current opacity-60" />)}</div>
            </button>
          );
        })}
      </div>
      {sel && (
        <div className="text-sm text-zinc-600 dark:text-zinc-400 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
          Rolling <strong className="dark:text-white">{sel}</strong> — {CATAN_PROB[sel].ways} of 36 combinations — probability: <strong className="dark:text-white">{CATAN_PROB[sel].pct}</strong>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Wordle — mini playable game
// ─────────────────────────────────────────────────────────────────────────────

const W_LIST = ['stack','codes','pixel','craft','build','debug','bytes','shell','react','swift','query','frame','array','class','input','loops','scope','token','patch','merge'];
const W_TARGET = 'STACK';
type GS = 'correct'|'present'|'absent'|'empty';
function evalGuess(w:string,t:string):GS[] {
  const r:GS[]=Array(5).fill('absent'), ta=t.split('');
  w.split('').forEach((c,i)=>{ if(c===ta[i]){r[i]='correct';ta[i]='#'; }});
  w.split('').forEach((c,i)=>{ if(r[i]==='correct') return; const j=ta.indexOf(c); if(j!==-1){r[i]='present';ta[j]='#';} });
  return r;
}
const GC:Record<GS,string> = {
  correct:'bg-green-500 border-green-500 text-white',
  present:'bg-amber-400 border-amber-400 text-white',
  absent:'bg-zinc-500 dark:bg-zinc-600 border-zinc-500 text-white',
  empty:'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-transparent',
};
function MiniWordle() {
  const [rows,setRows]=useState<{w:string;s:GS[]}[]>([]);
  const [cur,setCur]=useState('');
  const [done,setDone]=useState(false); const [won,setWon]=useState(false); const [err,setErr]=useState('');
  const ref=useRef<HTMLInputElement>(null);
  useEffect(()=>{ref.current?.focus();},[]);
  const submit=()=>{
    if(cur.length!==5){setErr('5 letters needed');return;}
    if(!W_LIST.includes(cur.toLowerCase())){setErr('Not in word list');return;}
    const s=evalGuess(cur,W_TARGET),nr=[...rows,{w:cur,s}];
    setRows(nr);setCur('');setErr('');
    if(s.every(x=>x==='correct')){setWon(true);setDone(true);}
    else if(nr.length>=4) setDone(true);
  };
  const reset=()=>{setRows([]);setCur('');setDone(false);setWon(false);setErr('');setTimeout(()=>ref.current?.focus(),50);};
  const grid=Array.from({length:4},(_,i)=>{
    if(i<rows.length) return rows[i];
    if(i===rows.length&&!done) return {w:cur.padEnd(5),s:Array(5).fill('empty') as GS[]};
    return {w:'     ',s:Array(5).fill('empty') as GS[]};
  });
  return (
    <div className="my-8 not-prose">
      <p className={L}>Try the game</p>
      <div className="flex flex-col items-center gap-3">
        <div className="space-y-1.5">
          {grid.map((row,ri)=>(
            <div key={ri} className="flex gap-1.5">
              {Array.from({length:5}).map((_,ci)=>{
                const ch=row.w[ci]??''; const st=ri<rows.length?row.s[ci]:'empty';
                return <div key={ci} className={`w-10 h-10 border-2 rounded flex items-center justify-center text-xs font-bold uppercase transition-all duration-300 ${GC[st]} ${ri===rows.length&&!done&&ci<cur.length?'border-zinc-500 scale-105':''}`} style={{transitionDelay:ri<rows.length?`${ci*60}ms`:'0ms'}}>{ch.trim()}</div>;
              })}
            </div>
          ))}
        </div>
        {err&&<p className="text-xs text-red-500">{err}</p>}
        {!done?(
          <div className="flex gap-2">
            <input ref={ref} value={cur} onChange={e=>{setCur(e.target.value.replace(/[^a-zA-Z]/g,'').slice(0,5).toUpperCase());setErr('');}} onKeyDown={e=>{if(e.key==='Enter')submit();}}
              className="font-mono text-sm uppercase text-center w-28 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 tracking-widest"
              placeholder="GUESS" maxLength={5} />
            <button onClick={submit} disabled={cur.length!==5} className="px-4 py-2 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg disabled:opacity-30 hover:opacity-80 transition-opacity">Enter</button>
          </div>
        ):(
          <div className="text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{won?`Got it in ${rows.length}!`:`The word was ${W_TARGET}`}</p>
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"><RefreshCcw className="w-3 h-3"/>play again</button>
          </div>
        )}
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{4-rows.length} guess{4-rows.length!==1?'es':''} left · valid: {W_LIST.slice(0,5).join(', ')}…</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Pokedex — type effectiveness chart
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_DATA: Record<string,{strong:string[];weak:string[];immune:string[]}> = {
  Fire:     {strong:['Grass','Ice','Bug','Steel'],      weak:['Water','Rock','Ground'],      immune:[]},
  Water:    {strong:['Fire','Rock','Ground'],            weak:['Electric','Grass'],           immune:[]},
  Grass:    {strong:['Water','Rock','Ground'],           weak:['Fire','Ice','Flying','Bug'],  immune:[]},
  Electric: {strong:['Water','Flying'],                  weak:['Ground'],                     immune:['Ground']},
  Ice:      {strong:['Grass','Ground','Flying','Dragon'],weak:['Fire','Rock','Steel'],         immune:[]},
  Psychic:  {strong:['Fighting','Poison'],               weak:['Bug','Dark','Ghost'],          immune:[]},
  Dragon:   {strong:['Dragon'],                          weak:['Ice','Dragon','Fairy'],        immune:[]},
  Dark:     {strong:['Ghost','Psychic'],                 weak:['Fighting','Bug','Fairy'],      immune:[]},
  Steel:    {strong:['Ice','Rock','Fairy'],              weak:['Fire','Fighting','Ground'],    immune:['Poison']},
  Fairy:    {strong:['Fighting','Dragon','Dark'],        weak:['Poison','Steel'],              immune:['Dragon']},
  Fighting: {strong:['Normal','Ice','Rock','Dark','Steel'],weak:['Flying','Psychic','Fairy'],   immune:[]},
  Rock:     {strong:['Fire','Ice','Flying','Bug'],       weak:['Water','Grass','Fighting','Ground','Steel'],immune:[]},
};
const TYPE_COLORS: Record<string,string> = {
  Fire:'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  Water:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Grass:'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Electric:'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500',
  Ice:'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  Psychic:'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  Dragon:'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  Dark:'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
  Steel:'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400',
  Fairy:'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  Fighting:'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  Rock:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-600',
};
function PokedexTypeDemo() {
  const [sel,setSel]=useState<string|null>(null);
  const d=sel?TYPE_DATA[sel]:null;
  return (
    <div className="my-8 not-prose">
      <p className={L}>Type Effectiveness</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.keys(TYPE_DATA).map(t=>(
          <button key={t} onClick={()=>setSel(sel===t?null:t)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${sel===t?'ring-2 ring-zinc-900 dark:ring-zinc-100':''} ${TYPE_COLORS[t]||'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{t}</button>
        ))}
      </div>
      {d&&(
        <div className="space-y-2 text-sm">
          <div className="flex gap-2 items-start"><span className="text-zinc-400 dark:text-zinc-500 text-xs w-20 flex-shrink-0 pt-0.5">Strong vs</span><div className="flex flex-wrap gap-1">{d.strong.map(t=><span key={t} className={`px-2 py-0.5 text-xs rounded ${TYPE_COLORS[t]||'bg-zinc-100 dark:bg-zinc-800'}`}>{t}</span>)}</div></div>
          <div className="flex gap-2 items-start"><span className="text-zinc-400 dark:text-zinc-500 text-xs w-20 flex-shrink-0 pt-0.5">Weak to</span><div className="flex flex-wrap gap-1">{d.weak.map(t=><span key={t} className={`px-2 py-0.5 text-xs rounded ${TYPE_COLORS[t]||'bg-zinc-100 dark:bg-zinc-800'}`}>{t}</span>)}</div></div>
          {d.immune.length>0&&<div className="flex gap-2 items-start"><span className="text-zinc-400 dark:text-zinc-500 text-xs w-20 flex-shrink-0 pt-0.5">Immune to</span><div className="flex flex-wrap gap-1">{d.immune.map(t=><span key={t} className={`px-2 py-0.5 text-xs rounded ${TYPE_COLORS[t]||'bg-zinc-100 dark:bg-zinc-800'}`}>{t}</span>)}</div></div>}
        </div>
      )}
      {!sel&&<p className="text-xs text-zinc-400 dark:text-zinc-500">Click a type to see matchups</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Pokemon Platformer — keyboard + mini map
// ─────────────────────────────────────────────────────────────────────────────

function PokemonKeyDemo() {
  const [pressed,setPressed]=useState<Set<string>>(new Set());
  const [pos,setPos]=useState({x:7,y:5});
  const cols=15,rows=10;
  useEffect(()=>{
    const dn=(e:KeyboardEvent)=>{
      const k=e.key; setPressed(s=>new Set([...s,k]));
      setPos(p=>{
        if(k==='ArrowUp'||k==='w') return {x:p.x,y:Math.max(0,p.y-1)};
        if(k==='ArrowDown'||k==='s') return {x:p.x,y:Math.min(rows-1,p.y+1)};
        if(k==='ArrowLeft'||k==='a') return {x:Math.max(0,p.x-1),y:p.y};
        if(k==='ArrowRight'||k==='d') return {x:Math.min(cols-1,p.x+1),y:p.y};
        return p;
      });
    };
    const up=(e:KeyboardEvent)=>setPressed(s=>{const n=new Set(s);n.delete(e.key);return n;});
    window.addEventListener('keydown',dn); window.addEventListener('keyup',up);
    return ()=>{window.removeEventListener('keydown',dn);window.removeEventListener('keyup',up);};
  },[]);
  const move=(dir:string)=>{
    setPressed(new Set([dir])); setTimeout(()=>setPressed(new Set()),200);
    setPos(p=>{
      if(dir==='ArrowUp') return {x:p.x,y:Math.max(0,p.y-1)};
      if(dir==='ArrowDown') return {x:p.x,y:Math.min(rows-1,p.y+1)};
      if(dir==='ArrowLeft') return {x:Math.max(0,p.x-1),y:p.y};
      if(dir==='ArrowRight') return {x:Math.min(cols-1,p.x+1),y:p.y};
      return p;
    });
  };
  const kb=(k:string)=>pressed.has(k)?'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 scale-95':'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
  return (
    <div className="my-8 not-prose">
      <p className={L}>Movement Demo</p>
      <div className="grid mb-3 gap-px bg-zinc-200 dark:bg-zinc-700 rounded-lg overflow-hidden" style={{gridTemplateColumns:`repeat(${cols},1fr)`}}>
        {Array.from({length:cols*rows}).map((_,i)=>{
          const x=i%cols,y=Math.floor(i/cols);
          return <div key={i} className={`aspect-square ${x===pos.x&&y===pos.y?'bg-red-500':'bg-zinc-50 dark:bg-zinc-900'}`} />;
        })}
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1"><button onClick={()=>move('ArrowUp')} className={`w-9 h-9 rounded text-sm font-bold transition-all ${kb('ArrowUp')}`}>↑</button></div>
        <div className="flex gap-1">
          <button onClick={()=>move('ArrowLeft')} className={`w-9 h-9 rounded text-sm font-bold transition-all ${kb('ArrowLeft')}`}>←</button>
          <button onClick={()=>move('ArrowDown')} className={`w-9 h-9 rounded text-sm font-bold transition-all ${kb('ArrowDown')}`}>↓</button>
          <button onClick={()=>move('ArrowRight')} className={`w-9 h-9 rounded text-sm font-bold transition-all ${kb('ArrowRight')}`}>→</button>
        </div>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 text-center">Arrow keys or click buttons to move the red pixel</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Greed Island Dex — card search
// ─────────────────────────────────────────────────────────────────────────────

const GI_CARDS = ['Accompany','Beautify','Blue Planet','Clone','Copy','Cure','Dark Hole','Dice','Ecstasy','Eden','Embalm','Experiment','Fake','Free Time','Gold Dust','Green Planet','Guidemap','Herb','Holy Blade','Kamaitachi','Kite','Land Hexapod','Magnetic Force','Miniature Rose','Mobility Tablet','Ohana','Old Card','Patch of Forest','Patch of Ocean','Piece of Fortress','Planet','Rebirth','Return','Ring','Risky Dice','Six Sided Poem','Space Needle','Spider Cider','Sword of Truth','Trace','Transfer','Tree of Plenty','Ultra Wizard','Unmarked Envelope','Wild Card'];
function GreedIslandDemo() {
  const [q,setQ]=useState('');
  const filtered=GI_CARDS.filter(c=>c.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="my-8 not-prose">
      <p className={L}>Card Catalog — {filtered.length} of {GI_CARDS.length} cards</p>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search cards…"
        className="w-full mb-3 px-3 py-2 text-sm border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700" />
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-zinc-800 max-h-48 overflow-y-auto`}>
        {filtered.slice(0,12).map(c=>(
          <div key={c} className="px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-zinc-700 dark:text-zinc-300">{c}</span>
            <span className="text-zinc-400 dark:text-zinc-500 font-mono">GI-{String(GI_CARDS.indexOf(c)+1).padStart(3,'0')}</span>
          </div>
        ))}
        {filtered.length>12&&<div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">+{filtered.length-12} more</div>}
        {filtered.length===0&&<div className="px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500">No cards found</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'dock-poker') return <DockPokerDemo />;
  if (slug === 'catan-online') return <CatanProbabilityDemo />;
  if (slug === 'wordle') return <MiniWordle />;
  if (slug === 'pokedex') return <PokedexTypeDemo />;
  if (slug === 'pokemon-platformer') return <PokemonKeyDemo />;
  if (slug === 'greed-island-dex') return <GreedIslandDemo />;
  return null;
}

export function GroupWidget({ project }: { project: Project }) {
  return <>{getWidget(project)}</>;
}
