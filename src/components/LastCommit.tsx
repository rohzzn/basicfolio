'use client';

import { useEffect, useState } from 'react';

type LastCommit = {
  shortSha: string;
  date: string;
  additions: number;
  deletions: number;
};

function formatRelativeTime(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (seconds < 45) return rtf.format(-seconds, 'second');
  const minutes = Math.round(seconds / 60);
  if (minutes < 45) return rtf.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 22) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (days < 26) return rtf.format(-days, 'day');
  const months = Math.round(days / 30);
  if (months < 11) return rtf.format(-months, 'month');
  return rtf.format(-Math.round(days / 365), 'year');
}

export default function LastCommit() {
  const [commit, setCommit] = useState<LastCommit | null>(null);
  const [relativeTime, setRelativeTime] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/github/last-commit')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LastCommit | null) => {
        if (data?.shortSha) setCommit(data);
      })
      .catch(() => {
        // Hide quietly if GitHub is unavailable
      });
  }, []);

  useEffect(() => {
    if (!commit?.date) return;

    const tick = () => setRelativeTime(formatRelativeTime(new Date(commit.date)));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [commit?.date]);

  if (!commit) return null;

  return (
    <p className="mb-10 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
      <span className="font-mono text-zinc-600 dark:text-zinc-300">
        {commit.shortSha}
      </span>
      <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
        ·
      </span>
      <span className="font-mono tabular-nums">
        <span className="text-red-500/90 dark:text-red-400/90">
          −{commit.deletions.toLocaleString()}
        </span>{' '}
        <span className="text-emerald-600 dark:text-emerald-400">
          +{commit.additions.toLocaleString()}
        </span>
      </span>
      <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
        ·
      </span>
      <span>
        Last commit {relativeTime ?? '…'}
      </span>
    </p>
  );
}
