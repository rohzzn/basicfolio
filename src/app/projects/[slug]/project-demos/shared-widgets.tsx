'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Project } from '@/data/projects';
import { CARD, L, useCopy } from './demo-utils';

export function TerminalInstall({
  install,
  packageType,
}: {
  install: string;
  packageType?: string;
}) {
  const { copied, copy } = useCopy();
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(install.slice(0, i));
      if (i >= install.length) {
        clearInterval(t);
        setDone(true);
      }
    }, 28);
    return () => clearInterval(t);
  }, [install]);
  return (
    <div className="my-8 not-prose">
      <p className={L}>Install</p>
      <div className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-1.5">
            {['bg-red-400', 'bg-yellow-400', 'bg-green-400'].map((c) => (
              <div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-70`} />
            ))}
          </div>
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-400">
            {packageType === 'pypi' ? 'pip' : 'npm'}
          </span>
        </div>
        <div className="p-4 bg-zinc-950 dark:bg-zinc-900 font-mono text-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-zinc-500">$ </span>
              <span className="text-green-400 truncate">{typed}</span>
              {!done && (
                <span className="w-0.5 h-4 bg-green-400 animate-pulse flex-shrink-0" />
              )}
            </div>
            {done && (
              <button
                onClick={() => copy(install, 'install')}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
              >
                {copied === 'install' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    copy
                  </>
                )}
              </button>
            )}
          </div>
          {done && (
            <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
              <p className="text-zinc-400">added 1 package ✓</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommandList({
  commands,
  label = 'Commands',
}: {
  commands: NonNullable<Project['commands']>;
  label?: string;
}) {
  const [q, setQ] = useState('');
  const { copied, copy } = useCopy();
  const f = commands.filter(
    (c) =>
      c.cmd.toLowerCase().includes(q.toLowerCase()) ||
      c.desc.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="my-8 not-prose">
      <p className={L}>{label}</p>
      {commands.length > 4 && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="w-full mb-3 px-3 py-2 text-xs font-mono border border-zinc-100 dark:border-zinc-800 rounded-lg bg-transparent text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none"
        />
      )}
      <div className={`${CARD} divide-y divide-zinc-100 dark:divide-zinc-800`}>
        {f.map((c) => (
          <div
            key={c.cmd}
            className="group flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
          >
            <code className="text-xs font-mono text-zinc-800 dark:text-zinc-200 flex-shrink-0 max-w-[45%] truncate">
              {c.cmd}
            </code>
            <span className="text-xs text-zinc-400 dark:text-zinc-400 flex-1 min-w-0 truncate">
              {c.desc}
            </span>
            <button
              onClick={() => copy(c.cmd, c.cmd)}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0"
            >
              {copied === c.cmd ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          </div>
        ))}
        {!f.length && <p className="px-4 py-3 text-xs text-zinc-400">No matches.</p>}
      </div>
    </div>
  );
}
