"use client";
import React, { useState } from 'react';

const VARS = [
  { name: 'NEXT_PUBLIC_API_URL',     value: 'https://api.myapp.com', client: true  },
  { name: 'NEXT_PUBLIC_STRIPE_KEY',  value: 'pk_live_abc123xyz',     client: true  },
  { name: 'DATABASE_URL',            value: 'postgres://user:pass@db',client: false },
  { name: 'JWT_SECRET',              value: 'supersecretkey9876',    client: false },
  { name: 'STRIPE_SECRET_KEY',       value: 'sk_live_def456uvw',     client: false },
  { name: 'SENDGRID_API_KEY',        value: 'SG.aBcDe12345',         client: false },
];

export default function EnvVarDemo() {
  const [perspective, setPerspective] = useState<'browser' | 'server'>('browser');
  const visible = VARS.filter(v => perspective === 'server' || v.client);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Who can see what</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['browser', 'server'] as const).map(p => (
            <button key={p} onClick={() => setPerspective(p)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${perspective === p ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}>
              {p === 'browser' ? 'Browser / client bundle' : 'Server / API route'}
            </button>
          ))}
        </div>
        <div className="p-4 font-mono text-xs space-y-1.5">
          {VARS.map(v => {
            const shown = perspective === 'server' || v.client;
            return (
              <div key={v.name} className={`flex items-start justify-between gap-3 px-2 py-1.5 rounded transition-colors ${shown ? 'bg-zinc-50 dark:bg-zinc-800/50' : 'opacity-30'}`}>
                <span className={`${v.client ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500 dark:text-zinc-400'} flex-shrink-0`}>
                  {v.name}
                </span>
                <span className={`${shown ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700'} truncate text-right`}>
                  {shown ? v.value : '●●●●●●●●●'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="px-4 pb-4 pt-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {perspective === 'browser'
              ? <><span className="text-amber-600 dark:text-amber-400">NEXT_PUBLIC_</span> prefixed vars are compiled into your JavaScript bundle. Anyone who downloads your app can read them.</>
              : 'Server-side variables never leave your infrastructure. They are only available inside API routes and server components.'}
          </p>
        </div>
      </div>
    </div>
  );
}
