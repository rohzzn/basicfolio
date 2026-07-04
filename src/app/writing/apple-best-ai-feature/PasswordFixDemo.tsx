"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';

type Status = 'queued' | 'signing-in' | 'saving' | 'upgraded' | 'failed';
type TwoFA = 'none' | 'sms' | 'email' | 'authenticator';

interface Account {
  id: string;
  site: string;
  issue: 'reused' | 'compromised' | 'weak';
  twoFA: TwoFA;
}

const ACCOUNTS: Account[] = [
  { id: '1', site: 'github.com', issue: 'compromised', twoFA: 'authenticator' },
  { id: '2', site: 'reddit.com', issue: 'reused', twoFA: 'none' },
  { id: '3', site: 'spotify.com', issue: 'reused', twoFA: 'sms' },
  { id: '4', site: 'linkedin.com', issue: 'weak', twoFA: 'email' },
  { id: '5', site: 'twitter.com', issue: 'compromised', twoFA: 'sms' },
  { id: '6', site: 'notion.so', issue: 'weak', twoFA: 'authenticator' },
];

const ISSUE_LABEL = { reused: 'Reused', compromised: 'Leaked', weak: 'Weak' } as const;
const ISSUE_COLOR = {
  reused: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
  compromised: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
  weak: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40',
};

const STEP_MS = 900;

function willSucceed(twoFA: TwoFA): boolean {
  return twoFA === 'none' || twoFA === 'sms' || twoFA === 'email';
}

export default function PasswordFixDemo() {
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    () => Object.fromEntries(ACCOUNTS.map(a => [a.id, 'queued']))
  );
  const [running, setRunning] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [liveActivity, setLiveActivity] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const cancelRef = useRef(false);

  const reset = () => {
    cancelRef.current = true;
    setRunning(false);
    setCurrentId(null);
    setLiveActivity(null);
    setDone(false);
    setStatuses(Object.fromEntries(ACCOUNTS.map(a => [a.id, 'queued'])));
  };

  const sleep = (ms: number) =>
    new Promise<void>(resolve => {
      const id = setTimeout(resolve, ms);
      if (cancelRef.current) clearTimeout(id);
    });

  const processAccount = useCallback(async (account: Account) => {
    if (cancelRef.current) return;

    setCurrentId(account.id);
    setStatuses(s => ({ ...s, [account.id]: 'signing-in' }));
    setLiveActivity(`Signing in to ${account.site}`);
    await sleep(STEP_MS);
    if (cancelRef.current) return;

    if (!willSucceed(account.twoFA)) {
      setStatuses(s => ({ ...s, [account.id]: 'failed' }));
      setLiveActivity(`Could not verify ${account.site}`);
      await sleep(600);
      return;
    }

    setStatuses(s => ({ ...s, [account.id]: 'saving' }));
    setLiveActivity(`Saving strong password for ${account.site}`);
    await sleep(STEP_MS);
    if (cancelRef.current) return;

    setStatuses(s => ({ ...s, [account.id]: 'upgraded' }));
    setLiveActivity(`Security upgraded: ${account.site}`);
    await sleep(500);
  }, []);

  const runFix = async () => {
    reset();
    cancelRef.current = false;
    setRunning(true);

    for (const account of ACCOUNTS) {
      if (cancelRef.current) break;
      await processAccount(account);
    }

    if (!cancelRef.current) {
      setLiveActivity(null);
      setCurrentId(null);
      setDone(true);
    }
    setRunning(false);
  };

  useEffect(() => () => { cancelRef.current = true; }, []);

  const upgraded = Object.values(statuses).filter(s => s === 'upgraded').length;
  const failed = Object.values(statuses).filter(s => s === 'failed').length;

  const statusLabel = (s: Status) => {
    switch (s) {
      case 'signing-in': return 'Signing in…';
      case 'saving': return 'Saving password…';
      case 'upgraded': return 'Upgraded';
      case 'failed': return 'Needs manual fix';
      default: return 'Queued';
    }
  };

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-400 font-medium mb-3">Passwords app simulator</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {liveActivity && (
          <div className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-xs text-white dark:text-zinc-900 font-medium truncate">{liveActivity}</span>
          </div>
        )}

        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium dark:text-white">Security</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{ACCOUNTS.length} accounts need attention</p>
          </div>
          {!running ? (
            <button
              onClick={runFix}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Fix Passwords
            </button>
          ) : (
            <button
              onClick={reset}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {ACCOUNTS.map(account => {
            const status = statuses[account.id];
            const active = currentId === account.id;
            return (
              <div
                key={account.id}
                className={`px-4 py-3 flex items-center gap-3 transition-colors ${active ? 'bg-zinc-50 dark:bg-zinc-800/40' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    {account.site.slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium dark:text-white truncate">{account.site}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${ISSUE_COLOR[account.issue]}`}>
                      {ISSUE_LABEL[account.issue]}
                    </span>
                    {account.twoFA !== 'none' && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-400">
                        2FA: {account.twoFA}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] flex-shrink-0 ${
                  status === 'upgraded' ? 'text-emerald-600 dark:text-emerald-400' :
                  status === 'failed' ? 'text-red-500 dark:text-red-400' :
                  active ? 'text-blue-500 dark:text-blue-400' :
                  'text-zinc-400 dark:text-zinc-400'
                }`}>
                  {statusLabel(status)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
          {done ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Done. <span className="text-emerald-600 dark:text-emerald-400 font-medium">{upgraded} upgraded</span>
              {failed > 0 && <>, <span className="text-red-500 font-medium">{failed} failed</span> (authenticator 2FA)</>}.
              {' '}Tap Fix Passwords to run again.
            </p>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tap Fix Passwords to watch the agent work through each account. Accounts with authenticator-app 2FA fail in the beta.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
