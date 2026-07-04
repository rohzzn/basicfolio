"use client";
import React, { useState } from 'react';

const METHODS = [
  {
    id: 'none',
    label: 'No 2FA',
    agent: 'success' as const,
    detail: 'Agent signs in with saved credentials and rotates the password directly.',
  },
  {
    id: 'sms',
    label: 'SMS code',
    agent: 'success' as const,
    detail: 'Agent requests temporary access to Messages, reads the OTP, and completes the flow.',
  },
  {
    id: 'email',
    label: 'Email code',
    agent: 'success' as const,
    detail: 'Same as SMS but pulls the code from Mail instead.',
  },
  {
    id: 'authenticator',
    label: 'Authenticator app',
    agent: 'fail' as const,
    detail: 'TOTP codes live outside Messages and Mail. The agent has nothing to read.',
  },
  {
    id: 'passkey',
    label: 'Passkey',
    agent: 'fail' as const,
    detail: 'WebAuthn prompts require user gesture and device keys the agent cannot invoke.',
  },
];

export default function TwoFactorMatrix() {
  const [selected, setSelected] = useState('sms');
  const method = METHODS.find(m => m.id === selected)!;

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-neutral-400 font-medium mb-3">2FA compatibility</p>
      <div className="border border-zinc-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="flex flex-wrap border-b border-zinc-200 dark:border-neutral-800">
          {METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`flex-1 min-w-[80px] py-2.5 px-2 text-[11px] font-medium transition-colors border-r border-zinc-200 dark:border-neutral-800 last:border-r-0 ${
                selected === m.id
                  ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'text-zinc-500 dark:text-neutral-400 hover:bg-zinc-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              method.agent === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-950/50 text-red-500 dark:text-red-400'
            }`}>
              {method.agent === 'success' ? '✓' : '✕'}
            </div>
            <div>
              <p className="text-sm font-medium dark:text-paper">
                Agent {method.agent === 'success' ? 'can' : 'cannot'} auto-fix
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-neutral-400">{method.label} accounts</p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 dark:text-neutral-400 leading-relaxed mb-4">{method.detail}</p>

          <div className="rounded-md bg-zinc-50 dark:bg-neutral-800/50 p-3 font-mono text-[11px] space-y-1">
            <div className="text-zinc-400 dark:text-neutral-400">{`// Agent access for ${method.label}`}</div>
            {method.agent === 'success' ? (
              <>
                <div className="text-zinc-700 dark:text-neutral-300">safari.navigate(site)</div>
                <div className="text-zinc-700 dark:text-neutral-300">keychain.read(credentials)</div>
                {(method.id === 'sms' || method.id === 'email') && (
                  <div className="text-emerald-600 dark:text-emerald-400">messages.readOTP() {'// temporary grant'}</div>
                )}
                <div className="text-zinc-700 dark:text-neutral-300">keychain.write(newPassword)</div>
              </>
            ) : (
              <>
                <div className="text-zinc-700 dark:text-neutral-300">safari.navigate(site)</div>
                <div className="text-zinc-700 dark:text-neutral-300">keychain.read(credentials)</div>
                <div className="text-red-500 dark:text-red-400">secondFactor.resolve() // undefined</div>
                <div className="text-zinc-400 dark:text-neutral-400">keychain.write(newPassword) // never reached</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
