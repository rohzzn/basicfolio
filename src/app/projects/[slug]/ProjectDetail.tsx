"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Copy, Check, ExternalLink, Github, RefreshCcw } from 'lucide-react';
import type { Project } from '@/data/projects';

// ─────────────────────────────────────────────────────────────────────────────
// Shared utils
// ─────────────────────────────────────────────────────────────────────────────

function useCopy(ms = 1400) {
  const [id, setId] = useState('');
  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setId(key); setTimeout(() => setId(''), ms);
  };
  return { copied: id, copy };
}

const L = 'text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3';
const CARD = 'border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden';

// ─────────────────────────────────────────────────────────────────────────────
// Layout widgets
// ─────────────────────────────────────────────────────────────────────────────


function LinksSection({ links }: { links: Project['links'] }) {
  const gh = links.find(l => l.label === 'GitHub');
  const rest = links.filter(l => l.label !== 'GitHub');
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
      {rest.map(l => (
        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />{l.label}
        </a>
      ))}
      {gh && (
        <a href={gh.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <Github className="w-3.5 h-3.5" />Source
        </a>
      )}
    </div>
  );
}

function Highlights({ items }: { items: string[] }) {
  return (
    <div className="mt-8">
      <p className={L}>Highlights</p>
      <ul className="space-y-2">
        {items.map((h, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500 flex-shrink-0 mt-[7px]" />{h}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
// 7. Interactions — micro-interaction demos
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
            className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${tab===t?'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900':'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>{t}</button>
        ))}
      </div>
      {tab==='magnetic'&&(
        <div className="flex flex-col items-center py-8" onMouseMove={onMouseMove} onMouseLeave={()=>setOffset({x:0,y:0})}>
          <button ref={btnRef} className="px-6 py-3 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg transition-transform duration-200 ease-out"
            style={{transform:`translate(${offset.x}px,${offset.y}px)`}}>Hover near me</button>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">Move your cursor around the button</p>
        </div>
      )}
      {tab==='ripple'&&(
        <div className="relative overflow-hidden h-32 bg-zinc-50 dark:bg-zinc-900 rounded-lg cursor-pointer flex items-center justify-center" onClick={addRipple}>
          {ripples.map(r=>(
            <span key={r.id} className="absolute w-4 h-4 rounded-full bg-zinc-400 dark:bg-zinc-500 opacity-50 animate-ping pointer-events-none" style={{left:r.x-8,top:r.y-8}} />
          ))}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 pointer-events-none">Click anywhere</p>
        </div>
      )}
      {tab==='scramble'&&(
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type something…"
              className="flex-1 px-3 py-2 text-sm border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none" />
            <button onClick={scramble} className="px-3 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80">Scramble</button>
          </div>
          {scrambled&&<p className="text-sm font-mono text-zinc-700 dark:text-zinc-300 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">{scrambled}</p>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Margin — typography playground
// ─────────────────────────────────────────────────────────────────────────────

function MarginDemo() {
  const [size,setSize]=useState(16);
  const [lh,setLh]=useState(1.6);
  const [font,setFont]=useState<'serif'|'sans-serif'|'mono'>('serif');
  return (
    <div className="my-8 not-prose">
      <p className={L}>Typography Playground</p>
      <div className={`${CARD} p-4 mb-3`} style={{fontSize:size,lineHeight:lh,fontFamily:font}}>
        <p className="text-zinc-700 dark:text-zinc-300">Books are a uniquely portable magic. A reader lives a thousand lives before he dies. The man who never reads lives only one. Opening a book is like taking a step into another world.</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3"><label className="text-xs text-zinc-400 dark:text-zinc-500 w-20 flex-shrink-0">Size {size}px</label><input type="range" min={12} max={22} value={size} onChange={e=>setSize(Number(e.target.value))} className="flex-1 accent-zinc-700 dark:accent-zinc-300" /></div>
        <div className="flex items-center gap-3"><label className="text-xs text-zinc-400 dark:text-zinc-500 w-20 flex-shrink-0">Leading {lh}</label><input type="range" min={1.2} max={2.2} step={0.1} value={lh} onChange={e=>setLh(Number(e.target.value))} className="flex-1 accent-zinc-700 dark:accent-zinc-300" /></div>
        <div className="flex gap-2">
          {(['serif','sans-serif','mono'] as const).map(f=>(
            <button key={f} onClick={()=>setFont(f)} className={`px-3 py-1.5 text-xs rounded transition-colors ${font===f?'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900':'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`} style={{fontFamily:f}}>{f}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Contests — countdown timer cards
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
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{name}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{platform}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-mono font-medium dark:text-white tabular-nums">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">starts in</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Keel — subscription billing tracker
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{annual?'Annual':'Monthly'} total</p>
            <p className="text-xl font-semibold dark:text-white tabular-nums">${total.toFixed(2)}</p>
            {annual&&<p className="text-xs text-green-500">Saving ${savings.toFixed(2)}/yr vs monthly</p>}
          </div>
          <button onClick={()=>setAnnual(a=>!a)} className={`text-xs px-2.5 py-1 rounded-full transition-colors ${annual?'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900':'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>{annual?'Annual':'Monthly'}</button>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {subs.map(s=>(
            <div key={s.n} className="flex items-center justify-between px-4 py-2.5 group">
              <div className="flex items-center gap-2"><span>{s.icon}</span><span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{s.n}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums dark:text-white">${(annual?s.mo*12:s.mo).toFixed(2)}</span>
                <button onClick={()=>setSubs(ss=>ss.filter(r=>r.n!==s.n))} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all text-sm leading-none">×</button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-400 dark:text-zinc-500 text-center">{subs.length} subscriptions · hover to remove</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Todo iOS — kanban board
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
          <div key={col.s} className="bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-2">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 px-1">{col.label} <span className="text-zinc-400 dark:text-zinc-600">({tasks.filter(t=>t.s===col.s).length})</span></p>
            <div className="space-y-1.5">
              {tasks.filter(t=>t.s===col.s).map(t=>(
                <div key={t.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 rounded-md p-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-500 transition-colors"
                  onClick={()=>{
                    const idx=COLS.findIndex(c=>c.s===t.s);
                    if(idx<COLS.length-1) move(t.id,COLS[idx+1].s);
                    else move(t.id,COLS[0].s);
                  }}>
                  {t.t}<p className="text-zinc-400 dark:text-zinc-600 mt-0.5">click → move</p>
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
// 12. ShutTab — blocker demo (EXISTING, kept)
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
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center"><span className="text-white dark:text-zinc-900 text-xs font-bold">S</span></div><span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">ShutTab</span></div>
          <span className="text-xs text-zinc-400">{sites.filter(s=>s.blocked).length} blocked</span>
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {sites.map(s=>(
            <div key={s.domain} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">{s.domain}</span>
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
        <div className="flex gap-2 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <input value={adding} onChange={e=>setAdding(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()} placeholder="site.com" className="flex-1 text-xs font-mono px-2 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none" />
          <button onClick={add} className="text-xs px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:opacity-80">+ Block</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. CS Stats — Steam overlay
// ─────────────────────────────────────────────────────────────────────────────

function CSStatsDemo() {
  const [show,setShow]=useState(false);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Extension Demo</p>
      <div className={`${CARD} max-w-sm`}>
        <div className="p-4 bg-gradient-to-b from-zinc-800 to-zinc-900">
          <div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">R</div><div><p className="text-sm font-semibold text-white">rohzzn</p><p className="text-xs text-zinc-400">Online · Playing CS2</p></div></div>
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
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">Click to toggle the stats overlay the extension injects</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Zenitsu Bot — Discord chat demo
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
        <div className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"/><span className="text-xs font-medium text-zinc-600 dark:text-zinc-400"># general</span></div>
        <div className="bg-zinc-50 dark:bg-zinc-900 min-h-[160px] p-4 space-y-3">
          {msgs.length===0&&<p className="text-xs text-zinc-400 dark:text-zinc-500 italic">Click a command to see the bot respond</p>}
          {msgs.map((m,i)=>{ const r=BOT_RES[m.cmd]; return (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">Z</div>
              <div className="min-w-0"><div className="flex items-baseline gap-2 mb-1"><span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Zenitsu Bot</span><span className="text-xs text-zinc-400">{m.ts}</span></div>
              <div className="border-l-4 rounded-r-lg p-2.5 bg-zinc-100 dark:bg-zinc-800" style={{borderColor:r.color}}><p className="text-xs font-semibold mb-1" style={{color:r.color}}>{r.title}</p><p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-line">{r.body}</p></div></div>
            </div>
          );})}
        </div>
        <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          {Object.keys(BOT_RES).map(cmd=><button key={cmd} onClick={()=>send(cmd)} className="px-3 py-1.5 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">{cmd}</button>)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. Tanoshi — color palette + syntax preview
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
            className="group flex items-center gap-3 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors text-left">
            <div className="w-8 h-8 rounded-md flex-shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 group-hover:ring-2 transition-all" style={{ backgroundColor: c.hex }} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{c.name}</p>
              <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{copied === c.hex ? <span className="text-green-500">copied!</span> : c.hex}</p>
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
        <div className="flex gap-1">{(['ts','py'] as const).map(l=><button key={l} onClick={()=>setLang(l)} className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${lang===l?'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900':'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>{l==='ts'?'TypeScript':'Python'}</button>)}</div>
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
// 16. Pages (Figma) — reorderable page list
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
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-zinc-800 mb-3`}>
        {pages.map((p,i)=>(
          <div key={p} className="flex items-center justify-between px-4 py-2.5 group">
            <div className="flex items-center gap-2"><span className="text-zinc-400 dark:text-zinc-600 text-xs select-none">{String(i+1).padStart(2,'0')}</span><span className="text-sm text-zinc-700 dark:text-zinc-300">{p}</span></div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={()=>mv(i,-1)} disabled={i===0} className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20 transition-colors text-xs">↑</button>
              <button onClick={()=>mv(i,1)} disabled={i===pages.length-1} className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20 transition-colors text-xs">↓</button>
              <button onClick={()=>setPages(pp=>pp.filter((_,j)=>j!==i))} className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs">×</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2"><input value={adding} onChange={e=>setAdding(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&adding.trim()){setPages(pp=>[...pp,adding.trim()]);setAdding('');}}} placeholder="New page name…" className="flex-1 px-3 py-2 text-sm border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none" /><button onClick={()=>{if(adding.trim()){setPages(pp=>[...pp,adding.trim()]);setAdding('');}}} className="px-3 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80">Add</button></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. Meet — video call room
// ─────────────────────────────────────────────────────────────────────────────

const PARTICIPANTS=[{n:'rohzzn',you:true},{n:'Sarah K.',you:false},{n:'Alex M.',you:false},{n:'Priya R.',you:false}];
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
          <button onClick={()=>setMuted(m=>{const n=new Set(m);if(n.has('rohzzn'))n.delete('rohzzn');else n.add('rohzzn');return n;})}
            className={`px-3 py-1.5 rounded text-xs transition-colors ${muted.has('rohzzn')?'bg-red-500 text-white':'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}>
            {muted.has('rohzzn')?'Unmute':'Mute'}
          </button>
          {active.filter(p=>!p.you).map(p=>(
            <button key={p.n} onClick={()=>setLeft(l=>new Set([...l,p.n]))} className="px-3 py-1.5 rounded text-xs bg-zinc-700 text-zinc-300 hover:bg-red-600 hover:text-white transition-colors">Remove {p.n.split(' ')[0]}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">Mute yourself or remove participants</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. Git Time Machine — commit browser
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
          <p className="text-zinc-500 mb-3">$ gtm — 5 commits on main</p>
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
// 19. API Clinic — request builder
// ─────────────────────────────────────────────────────────────────────────────

const API_PRESETS=[
  {m:'GET', url:'https://api.github.com/users/rohzzn',res:'{\n  "login": "rohzzn",\n  "public_repos": 84,\n  "followers": 47\n}'},
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
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex gap-2">
          {API_PRESETS.map((pr,i)=><button key={i} onClick={()=>{setP(i);setRes(null);}} className={`px-2.5 py-1 text-xs rounded transition-colors ${p===i?'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900':'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>{pr.m}</button>)}
        </div>
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex gap-2 items-center">
          <span className={`text-xs font-mono font-bold flex-shrink-0 ${API_PRESETS[p].m==='GET'?'text-green-500':'text-blue-500'}`}>{API_PRESETS[p].m}</span>
          <input readOnly value={API_PRESETS[p].url} className="flex-1 text-xs font-mono bg-zinc-50 dark:bg-zinc-800 px-2 py-1.5 rounded border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 min-w-0 truncate" />
          <button onClick={send} disabled={loading} className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded hover:opacity-80 transition-opacity disabled:opacity-50">{loading?'…':'Send'}</button>
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 min-h-[80px]">
          {!res&&!loading&&<p className="text-xs text-zinc-400 dark:text-zinc-500">Response will appear here</p>}
          {loading&&<div className="flex gap-1 items-center">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{animationDelay:`${i*150}ms`}}/>)}</div>}
          {res&&<><div className="flex gap-2 mb-2"><span className="text-xs font-mono text-green-500 font-medium">200 OK</span><span className="text-xs text-zinc-400 dark:text-zinc-500">application/json</span></div><pre className="text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{res}</pre></>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. DSA Roadmap — topic progress
// ─────────────────────────────────────────────────────────────────────────────

const DSA_TOPICS=[{t:'Arrays',d:'Beginner'},{t:'Linked Lists',d:'Beginner'},{t:'Stacks & Queues',d:'Beginner'},{t:'Hash Maps',d:'Intermediate'},{t:'Binary Trees',d:'Intermediate'},{t:'Graphs',d:'Intermediate'},{t:'Heaps',d:'Intermediate'},{t:'Dynamic Programming',d:'Advanced'},{t:'Greedy Algorithms',d:'Advanced'},{t:'Backtracking',d:'Advanced'}];
const DIFF_C={Beginner:'text-green-500',Intermediate:'text-amber-500',Advanced:'text-red-500'};
function DSARoadmapDemo() {
  const [done,setDone]=useState(new Set<string>());
  const toggle=(t:string)=>setDone(s=>{const n=new Set(s);if(n.has(t))n.delete(t);else n.add(t);return n;});
  const pct=Math.round(done.size/DSA_TOPICS.length*100);
  return (
    <div className="my-8 not-prose">
      <div className="flex items-center justify-between mb-3"><p className={L} style={{marginBottom:0}}>Learning Roadmap</p><span className="text-xs text-zinc-400 dark:text-zinc-500">{done.size}/{DSA_TOPICS.length} · {pct}%</span></div>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden"><div className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full transition-all duration-300" style={{width:`${pct}%`}}/></div>
      <div className="space-y-1.5">
        {DSA_TOPICS.map(({t,d})=>(
          <button key={t} onClick={()=>toggle(t)} className={`w-full flex items-center justify-between px-3 py-2.5 ${CARD} hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors text-left`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${done.has(t)?'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100':'border-zinc-300 dark:border-zinc-600'}`}>{done.has(t)&&<Check className="w-2.5 h-2.5 text-white dark:text-zinc-900"/>}</div>
              <span className={`text-sm transition-colors ${done.has(t)?'line-through text-zinc-400 dark:text-zinc-600':'text-zinc-700 dark:text-zinc-300'}`}>{t}</span>
            </div>
            <span className={`text-xs ${DIFF_C[d as keyof typeof DIFF_C]}`}>{d}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. Hexr — color picker grid
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
        {hov&&<div className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700" style={{backgroundColor:hov}}/>}
        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{copied?`${copied} copied!`:hov||'Hover to preview · click to copy'}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. Dekho Car — search & filter
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
      <p className={L}>Car Search — {filtered.length} results</p>
      <div className="flex gap-2 mb-3 flex-wrap">
        <select value={make} onChange={e=>setMake(e.target.value)} className="text-xs px-2.5 py-1.5 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 focus:outline-none">
          {makes.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <select value={type} onChange={e=>setType(e.target.value)} className="text-xs px-2.5 py-1.5 border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 focus:outline-none">
          {types.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-zinc-800`}>
        {filtered.slice(0,5).map((c,i)=>(
          <div key={i} className="flex items-center justify-between px-4 py-2.5 text-xs">
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{c.make} · {c.type}</span>
            <span className="text-zinc-400 dark:text-zinc-500">₹{c.price.toLocaleString()}/day</span>
          </div>
        ))}
        {filtered.length===0&&<div className="px-4 py-3 text-xs text-zinc-400 dark:text-zinc-500">No cars match filters</div>}
        {filtered.length>5&&<div className="px-4 py-2.5 text-xs text-zinc-400 dark:text-zinc-500">+{filtered.length-5} more</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. QR Generator — live grid pattern
// ─────────────────────────────────────────────────────────────────────────────

function qrHash(text:string,idx:number):boolean {
  let h=0; for(let i=0;i<text.length;i++){h=((h<<5)-h)+text.charCodeAt(i);h=h&h;}
  return ((h*((idx+1)*2654435761))>>>0)>0x7FFFFFFF;
}
const SZ=21;
function QRDemo() {
  const [text,setText]=useState('https://rohan.run');
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
        <div className="inline-grid p-2 bg-white rounded-lg border border-zinc-200 dark:border-zinc-700" style={{gridTemplateColumns:`repeat(${SZ},9px)`,gap:1}}>
          {cells.map((on,i)=><div key={i} style={{width:9,height:9,backgroundColor:on?'#1a1a1a':'#ffffff'}}/>)}
        </div>
        <div className="flex-1">
          <label className="text-xs text-zinc-400 dark:text-zinc-500 block mb-2">Enter URL or text</label>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="https://…"
            className="w-full px-3 py-2 text-sm border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700" />
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">Pattern updates as you type</p>
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
          className="flex-1 px-3 py-2 text-sm border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none" />
        <button onClick={generate} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0">Get</button>
      </div>
      {vid&&(
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quals.map(q=>(
            <a key={q.key} href={`https://img.youtube.com/vi/${vid}/${q.key}.jpg`} target="_blank" rel="noopener noreferrer"
              className="group block border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
              <div className="bg-zinc-100 dark:bg-zinc-800 aspect-video flex items-center justify-center text-xs text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">{q.w}×{q.h}</div>
              <div className="px-2 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">{q.label} ↗</div>
            </a>
          ))}
        </div>
      )}
      {!vid&&<p className="text-xs text-zinc-400 dark:text-zinc-500">Paste a YouTube URL above</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. Customer Management — CRM table
// ─────────────────────────────────────────────────────────────────────────────

const CUSTOMERS=[{name:'Sarah Johnson',company:'TechCorp',status:'Active',value:'$12,400'},{name:'Marcus Lee',company:'StartupXYZ',status:'Active',value:'$8,200'},{name:'Priya Sharma',company:'DataCo',status:'Lead',value:'$3,500'},{name:'James Wilson',company:'RetailInc',status:'Inactive',value:'$1,200'},{name:'Ana Rodriguez',company:'FinTech Ltd',status:'Active',value:'$21,000'},{name:'Kevin Park',company:'CloudBase',status:'Lead',value:'$6,800'}];
function CustomerManagementDemo() {
  const [q,setQ]=useState('');
  const filtered=CUSTOMERS.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.company.toLowerCase().includes(q.toLowerCase()));
  const STATUS={Active:'text-green-600 dark:text-green-400',Lead:'text-amber-600 dark:text-amber-400',Inactive:'text-zinc-400'};
  return (
    <div className="my-8 not-prose">
      <p className={L}>CRM Demo — {filtered.length} customers</p>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search customers or companies…"
        className="w-full mb-3 px-3 py-2 text-sm border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none" />
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-zinc-800`}>
        {filtered.map((c,i)=>(
          <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
            <div><p className="font-medium text-zinc-700 dark:text-zinc-300">{c.name}</p><p className="text-zinc-400 dark:text-zinc-500">{c.company}</p></div>
            <div className="text-right"><p className={`font-medium ${STATUS[c.status as keyof typeof STATUS]}`}>{c.status}</p><p className="text-zinc-500 dark:text-zinc-400">{c.value}</p></div>
          </div>
        ))}
        {filtered.length===0&&<div className="px-4 py-3 text-xs text-zinc-400">No results</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 26. CodeChef MREC — event stats
// ─────────────────────────────────────────────────────────────────────────────

const EVENTS=[{n:'Algorithm Challenge 1.0',p:1100,type:'Contest'},{n:'Hackathon 2.0',p:1100,type:'Hackathon'},{n:'Advanced DSA 2023',p:1100,type:'Contest'},{n:'CP Bootcamp 2022',p:320,type:'Workshop'},{n:'AI Algorithms Workshop',p:310,type:'Workshop'},{n:'Data Science Workshop',p:350,type:'Workshop'},{n:'Git & GitHub',p:1100,type:'Workshop'}];
function CodeChefDemo() {
  const max=Math.max(...EVENTS.map(e=>e.p));
  const TYPE_C={Contest:'bg-blue-500',Hackathon:'bg-purple-500',Workshop:'bg-amber-500'};
  return (
    <div className="my-8 not-prose">
      <p className={L}>Events — {EVENTS.reduce((s,e)=>s+e.p,0).toLocaleString()} total participants</p>
      <div className="space-y-2.5">
        {EVENTS.map(e=>(
          <div key={e.n}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-700 dark:text-zinc-300 truncate mr-2">{e.n}</span>
              <span className="text-zinc-400 dark:text-zinc-500 flex-shrink-0">{e.p.toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${TYPE_C[e.type as keyof typeof TYPE_C]}`} style={{width:`${(e.p/max)*100}%`}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 27. MCU Timeline — horizontal scroll
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
              className={`flex-shrink-0 w-36 p-3 border-l-2 rounded-r-lg text-left transition-colors ${sel===i?'bg-zinc-100 dark:bg-zinc-800':CARD+' bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40'} ${PHASE_C[m.phase]}`}>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">{m.year} · Phase {m.phase}</p>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-tight">{m.t}</p>
            </button>
          ))}
        </div>
      </div>
      {sel!==null&&<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{MCU[sel].t} · {MCU[sel].year} · MCU Phase {MCU[sel].phase}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
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
// 30. Anomaly Detection — traffic SVG chart
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
      <p className={L}>Network Traffic — Anomaly Detection</p>
      <div className={`${CARD} p-4`}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{height:100}}>
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400 dark:text-zinc-500"/>
          {anomalies.map(({v,i})=>{ const x=pad+i*(W-pad*2)/(TRAFFIC.length-1),y=H-pad-(v-min)/(max-min)*(H-pad*2);
            return <circle key={i} cx={x} cy={y} r={hov===i?5:3.5} fill="#ef4444" onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} className="cursor-pointer transition-all"/>;
          })}
          {hov!==null&&TRAFFIC[hov]>40&&(
            <text x={pad+hov*(W-pad*2)/(TRAFFIC.length-1)} y={H-pad-(TRAFFIC[hov]-min)/(max-min)*(H-pad*2)-8} textAnchor="middle" fontSize="9" fill="#ef4444">{TRAFFIC[hov]} pkts/s</text>
          )}
        </svg>
        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/>{anomalies.length} anomalies detected</div>
          <span>hover red dots for details</span>
        </div>
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
// 35. Scrapetron — URL scraper mock
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_SCRAPED=[{selector:'h1',count:1,sample:'Home — Rohan Pothuru'},{selector:'p',count:12,sample:'Software engineer and CS grad student...'},{selector:'a',count:47,sample:'LinkedIn, GitHub, Resume...'},{selector:'img',count:3,sample:'profile.png, project-keel.png...'}];
function ScrapetronDemo() {
  const [url,setUrl]=useState('https://rohan.run');
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const run=()=>{setLoading(true);setDone(false);setTimeout(()=>{setLoading(false);setDone(true);},900);};
  return (
    <div className="my-8 not-prose">
      <p className={L}>Scraper Demo</p>
      <div className="flex gap-2 mb-3"><input value={url} onChange={e=>setUrl(e.target.value)} className="flex-1 px-3 py-2 text-sm font-mono border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none" placeholder="https://…" /><button onClick={run} disabled={loading} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 disabled:opacity-50">{loading?'…':'Scrape'}</button></div>
      {done&&(
        <div className={`${CARD} divide-y divide-zinc-100 dark:divide-zinc-800`}>
          <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-500 dark:text-zinc-400 flex justify-between"><span>Scraped {url}</span><span className="text-green-500">200 OK</span></div>
          {MOCK_SCRAPED.map(r=>(
            <div key={r.selector} className="px-4 py-2.5 text-xs">
              <div className="flex justify-between mb-0.5"><code className="text-amber-600 dark:text-amber-400">{r.selector}</code><span className="text-zinc-400">{r.count} found</span></div>
              <p className="text-zinc-500 dark:text-zinc-500 truncate">{r.sample}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 36. Ipynb Image Extractor — notebook extraction
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
        <input value={file} onChange={e=>setFile(e.target.value)} placeholder="analysis.ipynb" className="flex-1 px-3 py-2 text-sm font-mono border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none" />
        <button onClick={run} disabled={extracting||!file} className="px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 disabled:opacity-50">{extracting?'…':'Extract'}</button>
      </div>
      {images.length>0&&(
        <>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">{images.length} images extracted to ./images/</p>
          <div className="grid grid-cols-5 gap-2">
            {images.map((c,i)=>(
              <div key={i} className={`aspect-square rounded-lg ${c} flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400`}>img_{i+1}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Terminal install (npm/pip projects)
// ─────────────────────────────────────────────────────────────────────────────

function TerminalInstall({ install, packageType }: { install: string; packageType?: string }) {
  const { copied, copy } = useCopy();
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0; const t = setInterval(() => { i++; setTyped(install.slice(0, i)); if (i >= install.length) { clearInterval(t); setDone(true); } }, 28);
    return () => clearInterval(t);
  }, [install]);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Install</p>
      <div className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-1.5">{['bg-red-400','bg-yellow-400','bg-green-400'].map(c=><div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`}/>)}</div>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600">{packageType==='pypi'?'pip':'npm'}</span>
        </div>
        <div className="p-4 bg-zinc-950 dark:bg-zinc-900 font-mono text-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 min-w-0 flex-1"><span className="text-zinc-500">$ </span><span className="text-green-400 truncate">{typed}</span>{!done&&<span className="w-0.5 h-4 bg-green-400 animate-pulse flex-shrink-0"/>}</div>
            {done&&<button onClick={()=>copy(install,'install')} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">{copied==='install'?<><Check className="w-3.5 h-3.5 text-green-400"/>copied</>:<><Copy className="w-3.5 h-3.5"/>copy</>}</button>}
          </div>
          {done&&<div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-500"><p className="text-zinc-400">added 1 package ✓</p></div>}
        </div>
      </div>
    </div>
  );
}

// Command list (bots / CLI)
function CommandList({ commands, label='Commands' }: { commands: NonNullable<Project['commands']>; label?: string }) {
  const [q,setQ]=useState(''); const {copied,copy}=useCopy();
  const f=commands.filter(c=>c.cmd.toLowerCase().includes(q.toLowerCase())||c.desc.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="my-8 not-prose">
      <p className={L}>{label}</p>
      {commands.length>4&&<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="w-full mb-3 px-3 py-2 text-xs font-mono border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none"/>}
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-zinc-800`}>
        {f.map(c=>(
          <div key={c.cmd} className="group flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
            <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200 flex-shrink-0 max-w-[45%] truncate">{c.cmd}</code>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-1 min-w-0 truncate">{c.desc}</span>
            <button onClick={()=>copy(c.cmd,c.cmd)} className="opacity-0 group-hover:opacity-100 flex-shrink-0">{copied===c.cmd?<Check className="w-3.5 h-3.5 text-green-500"/>:<Copy className="w-3.5 h-3.5 text-zinc-400"/>}</button>
          </div>
        ))}
        {!f.length&&<p className="px-4 py-3 text-xs text-zinc-400">No matches.</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget selector — every slug gets something unique
// ─────────────────────────────────────────────────────────────────────────────

function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;

  // Games
  if (slug === 'dock-poker')    return <DockPokerDemo />;
  if (slug === 'catan-online')  return <CatanProbabilityDemo />;
  if (slug === 'wordle')        return <MiniWordle />;
  if (slug === 'pokedex')       return <PokedexTypeDemo />;
  if (slug === 'pokemon-platformer') return <PokemonKeyDemo />;
  if (slug === 'greed-island-dex')   return <GreedIslandDemo />;

  // Apps
  if (slug === 'keel')              return <KeelDemo />;
  if (slug === 'todo-ios')          return <TodoKanbanDemo />;
  if (slug === 'shuttab')           return <ShutTabDemo />;
  if (slug === 'cs-stats')          return <CSStatsDemo />;
  if (slug === 'zenitsu-bot')       return <>{p.commands && <ZenitsuBotDemo />}{p.commands && <CommandList commands={p.commands} label="Bot Commands" />}</>;
  if (slug === 'hexr')              return <HexrDemo />;
  if (slug === 'pages-figma')       return <PagesReorderDemo />;
  if (slug === 'meet')              return <MeetDemo />;
  if (slug === 'git-time-machine')  return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<GitTimeMachineDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'scrapetron')        return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<ScrapetronDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'ipynb-extractor')   return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<IpynbDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'customer-management') return <CustomerManagementDemo />;
  if (slug === 'anomaly-detection') return <AnomalyDetectionDemo />;

  // Tanoshi — color palette + syntax
  if (p.colors?.length)             return <>{<TanoshiColorPalette colors={p.colors} />}<TanoshiSyntaxPreview colors={p.colors} /></>;

  // Web apps
  if (slug === 'interactions')      return <InteractionsDemo />;
  if (slug === 'margin')            return <MarginDemo />;
  if (slug === 'contests')          return <ContestsDemo />;
  if (slug === 'api-clinic')        return <ApiClinicDemo />;
  if (slug === 'dsa-roadmap')       return <DSARoadmapDemo />;
  if (slug === 'codechef-mrec')     return <CodeChefDemo />;
  if (slug === 'dekho-car')         return <DekhoCarDemo />;
  if (slug === 'qr-generator')      return <QRDemo />;
  if (slug === 'youtube-thumbnails') return <YoutubeThumbnailDemo />;
  if (slug === 'mcu-timeline')      return <MCUTimelineDemo />;

  // Other
  if (slug === 'smart-agriculture') return <SmartAgricultureDemo />;
  if (slug === 'automobile-analytics') return <AutomobileAnalyticsDemo />;
  if (slug === 'block-steam-invites') return <BlockSteamDemo />;
  if (slug === 'overthewire')       return <OverTheWireDemo />;
  if (slug === 'discord-mirror')    return <DiscordMirrorDemo />;
  if (slug === 'github-any-year')   return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<GitHubAnyYearDemo /></>;

  // Portfolios
  if (slug === 'portfolio-v5')      return <Portfolio5Demo />;
  if (slug === 'portfolio-v4')      return <Portfolio4Demo />;
  if (slug === 'portfolio-v3')      return <Portfolio3Demo />;
  if (slug === 'portfolio-v2')      return <Portfolio2Demo />;
  if (slug === 'portfolio-v1')      return <Portfolio1Demo />;

  // Generic install for remaining packages
  if (p.install) return <>{<TerminalInstall install={p.install} packageType={p.packageType} />}{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectDetail({ project: p }: { project: Project }) {
  return (
    <article className="max-w-2xl py-8 px-4 sm:px-0">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-lg font-medium dark:text-white">{p.title}</h1>
          <Link href="/projects" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">projects</Link>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{p.description}</p>
      </header>

      <LinksSection links={p.links} />

      {getWidget(p)}

      {p.longDescription && (
        <div className="mb-6">
          <p className={L}>About</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{p.longDescription}</p>
        </div>
      )}

      {p.highlights?.length && <Highlights items={p.highlights} />}
    </article>
  );
}
