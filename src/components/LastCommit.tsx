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

export default function LastCommit({ initialCommit }: { initialCommit: LastCommit | null }) {
  const [relativeTime, setRelativeTime] = useState<string | null>(() =>
    initialCommit ? formatRelativeTime(new Date(initialCommit.date)) : null
  );

  useEffect(() => {
    if (!initialCommit?.date) return;

    const tick = () => setRelativeTime(formatRelativeTime(new Date(initialCommit.date)));
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [initialCommit?.date]);

  if (!initialCommit) return null;

  return (
    <p className="mb-10 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-xs leading-relaxed text-zinc-600 dark:text-neutral-300">
      <span>{initialCommit.shortSha}</span>
      <span aria-hidden className="text-zinc-300 dark:text-neutral-500">
        ·
      </span>
      <span className="tabular-nums">
        <span className="text-red-500/90 dark:text-red-400/90">
          −{initialCommit.deletions.toLocaleString()}
        </span>{' '}
        <span className="text-emerald-600 dark:text-emerald-400">
          +{initialCommit.additions.toLocaleString()}
        </span>
      </span>
      <span aria-hidden className="text-zinc-300 dark:text-neutral-500">
        ·
      </span>
      <span>{relativeTime ?? '…'}</span>
    </p>
  );
}
