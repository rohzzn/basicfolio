"use client";
import React, { useState } from 'react';

const EVENTS = [
  { year: 2017, game: 'CS:GO',   event: 'AMD GameOn',              result: '3rd', place: 3 },
  { year: 2017, game: 'CS:GO',   event: "Gamer's Connect by Nvidia", result: '3rd', place: 3 },
  { year: 2018, game: 'CS:GO',   event: 'Comic-Con x AMD GameOn',  result: '2nd', place: 2 },
  { year: 2019, game: 'CS:GO',   event: 'Comic-Con x AMD GameOn',  result: '2nd', place: 2 },
  { year: 2019, game: 'PUBG',    event: 'City Tournament',         result: '2nd', place: 2 },
  { year: 2020, game: 'CS:GO',   event: 'Act 1v1 (Online)',        result: '1st', place: 1 },
  { year: 2020, game: 'Valorant',event: 'NIIT College Fest',       result: '2nd', place: 2 },
  { year: 2020, game: 'Valorant',event: 'TAGVALO (Trinity Gaming)', result: '1st', place: 1 },
  { year: 2021, game: 'Valorant',event: 'NIIT College Fest',       result: '2nd', place: 2 },
  { year: 2024, game: 'Valorant',event: 'Comic-Con x AMD x Arena', result: '2nd', place: 2 },
];

const PLACE_STYLE: Record<number, string> = {
  1: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700',
  2: 'bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600',
  3: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
};

const GAME_COLORS: Record<string, string> = {
  'CS:GO':   'text-yellow-600 dark:text-yellow-400',
  'Valorant':'text-red-500 dark:text-red-400',
  'PUBG':    'text-green-600 dark:text-green-400',
};

const ALL_GAMES = [...new Set(EVENTS.map(e => e.game))];

export default function TournamentTimeline() {
  const [filter, setFilter] = useState<string>('all');
  const visible = filter === 'all' ? EVENTS : EVENTS.filter(e => e.game === filter);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Tournament History</p>

      <div className="flex gap-3 mb-4 flex-wrap">
        {['all', ...ALL_GAMES].map(g => (
          <button key={g} onClick={() => setFilter(g)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${filter === g ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'}`}>
            {g === 'all' ? 'All games' : g}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-[52px] top-0 bottom-0 w-px bg-zinc-100 dark:bg-zinc-800" />
        <div className="space-y-3">
          {visible.map((ev, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              <div className="w-10 text-right flex-shrink-0 pt-2.5">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">{ev.year}</span>
              </div>
              <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 mt-2.5 z-10 relative" />
              <div className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-md border ${PLACE_STYLE[ev.place]}`}>
                <div>
                  <span className={`text-xs font-medium ${GAME_COLORS[ev.game]}`}>{ev.game}</span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{ev.event}</p>
                </div>
                <span className={`text-xs font-bold flex-shrink-0 ml-3`}>{ev.result}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-3 text-xs text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" />1st place</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-500" />2nd place</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-300" />3rd place</div>
      </div>
    </div>
  );
}
