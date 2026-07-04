"use client";
import React, { useState, useEffect, useRef } from 'react';

const MANUAL_STEPS = [
  'Open Passwords app',
  'Tap compromised account',
  'Open website in Safari',
  'Find account settings',
  'Navigate to password page',
  'Enter current password',
  'Wait for SMS 2FA code',
  'Type new password twice',
  'Save to Keychain',
  'Repeat for next account…',
];

const AGENT_STEPS = [
  'Open Passwords app',
  'Tap Fix Passwords',
  'Grant 2FA access (one time)',
  'Agent runs in background',
  'Done',
];

export default function ManualVsAgent() {
  const [mode, setMode] = useState<'manual' | 'agent' | null>(null);
  const [step, setStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = mode === 'manual' ? MANUAL_STEPS : mode === 'agent' ? AGENT_STEPS : [];
  const finished = mode !== null && step >= steps.length;

  const start = (m: 'manual' | 'agent') => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(m);
    setStep(0);
    setElapsed(0);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(null);
    setStep(0);
    setElapsed(0);
  };

  useEffect(() => {
    if (mode === null || finished) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    const delay = mode === 'manual' ? 1400 : 700;
    const id = setInterval(() => {
      setStep(s => {
        if (s >= steps.length - 1) {
          clearInterval(id);
          return s + 1;
        }
        return s + 1;
      });
    }, delay);

    return () => {
      clearInterval(id);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, finished, steps.length]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-400 font-medium mb-3">Manual vs one tap</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => start('manual')}
            disabled={mode === 'manual' && !finished}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              mode === 'manual' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            Manual (6 accounts)
          </button>
          <button
            onClick={() => start('agent')}
            disabled={mode === 'agent' && !finished}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors border-l border-zinc-200 dark:border-zinc-800 ${
              mode === 'agent' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            iOS 27 agent
          </button>
        </div>

        <div className="p-4 min-h-[200px]">
          {mode === null ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-8">
              Pick a workflow to simulate fixing 6 flagged accounts
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Step {Math.min(step + 1, steps.length)} of {steps.length}
                </span>
                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-300">{formatTime(elapsed)}</span>
              </div>

              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    mode === 'agent' ? 'bg-emerald-500' : 'bg-zinc-500 dark:bg-zinc-400'
                  }`}
                  style={{ width: `${Math.min((step / steps.length) * 100, 100)}%` }}
                />
              </div>

              <div className="space-y-1.5">
                {steps.map((label, i) => {
                  const done = i < step;
                  const current = i === step && !finished;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
                        current ? 'bg-zinc-100 dark:bg-zinc-800' : done ? 'opacity-60' : 'opacity-30'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${
                        done ? 'bg-emerald-500 text-white' : current ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-700'
                      }`}>
                        {done ? '✓' : i + 1}
                      </span>
                      <span className={current ? 'dark:text-white font-medium' : 'text-zinc-600 dark:text-zinc-400'}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {finished && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {mode === 'manual'
                      ? <>And that was <span className="font-medium dark:text-white">one</span> account. Multiply by six.</>
                      : <>All eligible accounts handled in the background.</>
                    }
                  </p>
                  <button onClick={reset} className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300">
                    Reset
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
