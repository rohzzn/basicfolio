import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import TOTPDemo from './TOTPDemo';

export const metadata: Metadata = {
  title: 'Your 2FA Is Broken — Rohan',
  description: 'Two-factor authentication feels safe, but most implementations have critical weaknesses that attackers exploit every day.',
  openGraph: {
    title: 'Your 2FA Is Broken',
    description: 'Two-factor authentication feels safe, but most implementations have critical weaknesses that attackers exploit every day.',
    url: 'https://rohan.run/writing/security-article',
  },
  alternates: { canonical: 'https://rohan.run/writing/security-article' },
};

const SecurityArticle: React.FC = () => {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Your 2FA Is Broken</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2024-05-15">May 15, 2024</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          Adding TOTP (the six-digit code from an authenticator app) to a login flow feels like real security. And it is better than nothing. But while studying how TOTP verification is commonly implemented, and testing patterns in my own Network Security coursework at UC, I kept running into the same class of flaw. The algorithm itself is sound. The way most code actually checks the code is not.
        </p>

        <TOTPDemo />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">How TOTP Is Supposed to Work</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          TOTP generates a code from two inputs: a shared secret and the current timestamp divided into 30-second windows. Both your phone and the server perform the same calculation independently. If the results match, you are who you say you are. The code changes every 30 seconds so a stolen code quickly becomes useless.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The demo above shows the real problem. Toggle between the vulnerable and secure modes to see it. A naive implementation only accepts codes from the exact current 30-second window. But clocks drift. Your phone might be a few seconds behind or ahead of the server. A strict single-window check fails legitimate users whenever their clock is off by more than a few seconds, which happens more often than you would expect.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The Drift Problem</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          RFC 6238 (the TOTP standard) explicitly recommends accepting codes from one window before and after the current one to handle clock drift. That means a 90-second total acceptance window instead of 30. Most developers who write TOTP verification from scratch miss this and check only the current window. The result: legitimate users get locked out during DST transitions or when their phone battery ran out and the time resynced slightly off.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-sm font-medium mb-4 dark:text-white">Vulnerable vs correct TOTP check</h3>
          <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// Vulnerable: only checks current 30-second window
function verifyTOTP(token: string, secret: string): boolean {
  const now = Math.floor(Date.now() / 30000);
  return token === generateTOTP(secret, now);
}

// Correct: accepts one window either side (RFC 6238 recommendation)
function verifyTOTPSecure(token: string, secret: string): boolean {
  const now = Math.floor(Date.now() / 30000);
  for (let i = -1; i <= 1; i++) {
    if (token === generateTOTP(secret, now + i)) return true;
  }
  return false;
}`}
          </pre>
        </div>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Replay Attacks</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The other common gap is replay protection. A TOTP code is valid for its entire 30-second window (or longer with drift compensation). An attacker who intercepts a valid code can reuse it within that window. The fix is straightforward: store the last successfully used code per user and reject it if it appears again. This is mentioned in the RFC but frequently skipped in real implementations.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-sm font-medium mb-4 dark:text-white">Adding replay protection</h3>
          <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// Track used codes in Redis with TTL matching the acceptance window
async function verifyWithReplayProtection(
  userId: string,
  token: string,
  secret: string
): Promise<boolean> {
  const key = \`totp:used:\${userId}:\${token}\`;

  // Check if this code was already used
  const alreadyUsed = await redis.get(key);
  if (alreadyUsed) return false;

  // Verify the code itself
  if (!verifyTOTPSecure(token, secret)) return false;

  // Mark it as used with 90s TTL (our acceptance window)
  await redis.set(key, '1', 'EX', 90);
  return true;
}`}
          </pre>
        </div>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What This Means Practically</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          None of these flaws break TOTP completely. A motivated attacker would need to intercept the code in transit, or the user would need a significantly drifted clock, for these to matter. But these gaps are the difference between an implementation that follows the specification and one that does not. If you are implementing TOTP yourself rather than using a library, check against RFC 6238, add replay protection, and handle drift.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          If you are using a library, check that it implements drift compensation. Most well-maintained TOTP libraries (like <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">speakeasy</code> in Node or <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">pyotp</code> in Python) do this correctly by default. The danger is rolling your own without reading the spec carefully.
        </p>
      </div>
    </article>
  );
};

export default SecurityArticle;
