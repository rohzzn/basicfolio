"use client";
import React, { useState } from 'react';

const WEIGHTS = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 700, label: 'Bold' },
  { value: 900, label: 'Black' },
];

const SAMPLE_STRINGS = [
  'The quick brown fox',
  'Software engineering',
  'rohan.run',
  'Aa Bb Cc Dd Ee Ff',
  '0123456789',
];

const COMPARE_FONTS = [
  { label: 'Satoshi', stack: 'Satoshi, sans-serif' },
  { label: 'Inter', stack: 'Inter, sans-serif' },
  { label: 'System UI', stack: 'system-ui, sans-serif' },
  { label: 'Georgia', stack: 'Georgia, serif' },
];

export default function FontShowcase() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [size, setSize] = useState(24);
  const [activeWeight, setActiveWeight] = useState(400);
  const [tab, setTab] = useState<'weights' | 'compare' | 'specimen'>('weights');

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Satoshi Font Demo</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {(['weights', 'compare', 'specimen'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'weights' && (
          <div className="p-4">
            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <div className="flex-1 min-w-40">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1.5">Preview text</p>
                <input value={text} onChange={e => setText(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 dark:text-white outline-none focus:border-zinc-400 dark:focus:border-zinc-500" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1.5">Size: {size}px</p>
                <input type="range" min={12} max={48} value={size} onChange={e => setSize(+e.target.value)}
                  className="w-24 accent-zinc-700 dark:accent-zinc-300" />
              </div>
            </div>
            <div className="space-y-4">
              {WEIGHTS.map(w => (
                <div key={w.value}
                  className={`cursor-pointer group px-3 py-2.5 rounded-md transition-colors ${activeWeight === w.value ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'}`}
                  onClick={() => setActiveWeight(w.value)}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{w.label} — {w.value}</span>
                  </div>
                  <p style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: w.value, fontSize: `${size}px`, lineHeight: 1.2 }}
                     className="dark:text-white truncate">
                    {text || 'Type something above'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'compare' && (
          <div className="p-4">
            <div className="flex items-center gap-4 mb-5 flex-wrap">
              <div className="flex-1 min-w-40">
                <input value={text} onChange={e => setText(e.target.value)}
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 dark:text-white outline-none" />
              </div>
              <input type="range" min={12} max={48} value={size} onChange={e => setSize(+e.target.value)}
                className="w-24 accent-zinc-700 dark:accent-zinc-300" />
            </div>
            <div className="space-y-4">
              {COMPARE_FONTS.map(f => (
                <div key={f.label} className={`px-3 py-2.5 rounded-md border ${f.label === 'Satoshi' ? 'border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/50' : 'border-zinc-100 dark:border-zinc-800'}`}>
                  <span className={`text-[10px] uppercase tracking-wider mb-1 block ${f.label === 'Satoshi' ? 'text-zinc-600 dark:text-zinc-300 font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>{f.label}</span>
                  <p style={{ fontFamily: f.stack, fontWeight: 400, fontSize: `${size}px`, lineHeight: 1.3 }}
                     className="dark:text-white truncate">
                    {text || 'Type something above'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'specimen' && (
          <div className="p-4 space-y-4" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            {SAMPLE_STRINGS.map((s, i) => (
              <div key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-3 last:pb-0">
                <p style={{ fontSize: `${Math.max(12, 36 - i * 5)}px`, fontWeight: [900, 700, 500, 400, 300][i], lineHeight: 1.2 }}
                   className="dark:text-white">
                  {s}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5">{['Black 900', 'Bold 700', 'Medium 500', 'Regular 400', 'Light 300'][i]} — {Math.max(12, 36 - i * 5)}px</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
