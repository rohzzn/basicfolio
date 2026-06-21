'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_PREFIX = 'post-read:';

function formatReads(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? 'read' : 'reads'}`;
}

export default function PostReads() {
  const pathname = usePathname();
  const slug = pathname?.startsWith('/writing/') ? pathname.split('/')[2] : null;
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = useCallback(async () => {
    if (!slug) return;

    try {
      const response = await fetch(`/api/writing/${slug}/views`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = (await response.json()) as { count?: number };
      if (typeof data.count === 'number') setCount(data.count);
    } catch {
      // Ignore — article still renders without a count
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const recordAndFetch = async () => {
      const sessionKey = `${SESSION_PREFIX}${slug}`;

      try {
        if (!sessionStorage.getItem(sessionKey)) {
          const response = await fetch(`/api/writing/${slug}/views`, { method: 'POST' });
          if (response.ok) {
            const data = (await response.json()) as { count?: number; available?: boolean; recorded?: boolean };
            if (data.available !== false) {
              sessionStorage.setItem(sessionKey, '1');
            }
            if (!cancelled && typeof data.count === 'number') {
              setCount(data.count);
              if (data.available !== false) return;
            }
          }
        }
      } catch {
        // Fall through to GET
      }

      if (!cancelled) await fetchCount();
    };

    void recordAndFetch();
    const interval = window.setInterval(() => {
      void fetchCount();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [slug, fetchCount]);

  if (!slug || count === null || count === 0) return null;

  return (
    <>
      <span aria-hidden="true">·</span>
      <span>{formatReads(count)}</span>
    </>
  );
}
