'use client';

import { useState } from 'react';

export function useCopy(ms = 1400) {
  const [id, setId] = useState('');
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setId(key);
    setTimeout(() => setId(''), ms);
  };
  return { copied: id, copy };
}

export const L =
  'text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-400 font-medium mb-3';
export const CARD = 'border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden';
