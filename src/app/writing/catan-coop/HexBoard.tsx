"use client";
import React, { useState } from 'react';

const HEX_SIZE = 34;
const W = Math.sqrt(3) * HEX_SIZE;
const V = 1.5 * HEX_SIZE;

const RESOURCES = {
  wood:   { fill: '#3a6b42', label: 'Wood',   emoji: '🌲', note: 'Builds roads and settlements' },
  wheat:  { fill: '#c49614', label: 'Wheat',  emoji: '🌾', note: 'Builds cities and dev cards' },
  ore:    { fill: '#5d7282', label: 'Ore',    emoji: '⛏️', note: 'Builds cities and dev cards' },
  brick:  { fill: '#a63c1e', label: 'Brick',  emoji: '🧱', note: 'Builds roads and settlements' },
  sheep:  { fill: '#6a9c3f', label: 'Sheep',  emoji: '🐑', note: 'Builds settlements and dev cards' },
  desert: { fill: '#b59228', label: 'Desert', emoji: '🏜️', note: 'No production. Robber starts here.' },
} as const;

type ResKey = keyof typeof RESOURCES;

const PROB: Record<number, number> = { 2:1, 3:2, 4:3, 5:4, 6:5, 8:5, 9:4, 10:3, 11:2, 12:1 };

const BOARD: { type: ResKey; num: number | null }[] = [
  { type:'wood',  num:11 }, { type:'sheep', num:12 }, { type:'wheat', num:9  },
  { type:'wheat', num:4  }, { type:'ore',   num:6  }, { type:'wood',  num:5  }, { type:'brick', num:10 },
  { type:'sheep', num:2  }, { type:'brick', num:8  }, { type:'desert',num:null},{ type:'ore',   num:3  }, { type:'sheep', num:6 },
  { type:'ore',   num:8  }, { type:'wood',  num:9  }, { type:'wheat', num:11 }, { type:'brick', num:4  },
  { type:'wood',  num:3  }, { type:'sheep', num:5  }, { type:'wheat', num:10 },
];

function getPositions() {
  const counts = [3, 4, 5, 4, 3];
  const result: { x: number; y: number }[] = [];
  counts.forEach((count, row) => {
    const offset = ((5 - count) / 2) * W;
    for (let col = 0; col < count; col++) {
      result.push({ x: 88 + offset + col * W, y: 44 + row * V });
    }
  });
  return result;
}

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (60 * i + 30) * (Math.PI / 180);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

const positions = getPositions();

export default function HexBoard() {
  const [hovered, setHovered] = useState<number | null>(null);
  const h = hovered !== null ? BOARD[hovered] : null;
  const info = h ? RESOURCES[h.type] : null;

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Interactive Board</p>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <svg viewBox="0 0 420 310" className="w-full max-w-xs sm:max-w-sm flex-shrink-0" style={{ overflow: 'visible' }}>
          {positions.map((pos, i) => {
            const tile = BOARD[i];
            const res = RESOURCES[tile.type];
            const hot = tile.num === 6 || tile.num === 8;
            const isHov = hovered === i;
            return (
              <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                 onTouchStart={() => setHovered(i)} style={{ cursor: 'pointer' }}>
                <polygon
                  points={hexPoints(pos.x, pos.y, HEX_SIZE - 1.5)}
                  fill={res.fill}
                  stroke={isHov ? '#e4e4e7' : '#27272a'}
                  strokeWidth={isHov ? 2 : 0.8}
                  opacity={hovered !== null && !isHov ? 0.55 : 1}
                  style={{ transition: 'all 0.12s ease' }}
                />
                {tile.num && (
                  <g>
                    <circle cx={pos.x} cy={pos.y} r={11} fill="ivory" fillOpacity={0.92} />
                    {Array.from({ length: PROB[tile.num] ?? 0 }).map((_, d) => {
                      const dotAngle = (d * (360 / (PROB[tile.num] ?? 1)) - 90) * (Math.PI / 180);
                      return <circle key={d} cx={pos.x + 7.5 * Math.cos(dotAngle)} cy={pos.y + 7.5 * Math.sin(dotAngle)} r={1.2} fill={hot ? '#b91c1c' : '#27272a'} />;
                    })}
                    <text x={pos.x} y={pos.y + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="700"
                      fill={hot ? '#b91c1c' : '#27272a'} style={{ fontFamily: 'sans-serif' }}>
                      {tile.num}
                    </text>
                  </g>
                )}
                {tile.type === 'desert' && (
                  <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="15" style={{ userSelect: 'none' }}>🏜️</text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="flex-1 w-full">
          {h && info ? (
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{info.emoji}</span>
                <span className="text-sm font-medium dark:text-white">{info.label}</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{info.note}</p>
              {h.num ? (
                <>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Rolls on</span>
                    <span className={`text-sm font-bold ${h.num === 6 || h.num === 8 ? 'text-red-500' : 'dark:text-white'}`}>{h.num}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex gap-0.5 items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`h-1.5 w-4 rounded-sm ${i < (PROB[h.num!] ?? 0) ? (h.num === 6 || h.num === 8 ? 'bg-red-500' : 'bg-zinc-600 dark:bg-zinc-300') : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                      ))}
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1.5">{((PROB[h.num!] ?? 0) / 36 * 100).toFixed(0)}% of rolls</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">No number token. Robber lives here at game start.</p>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Hover any tile to see its resource type, what it produces, and how often that number rolls.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(Object.entries(RESOURCES) as [ResKey, typeof RESOURCES[ResKey]][]).filter(([k]) => k !== 'desert').map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: val.fill }} />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{val.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
