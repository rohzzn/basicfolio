'use client';

import React, { useEffect, useState } from 'react';

const TIMEZONE = 'America/New_York';

export default function LocalTime() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = () => {
      setTime(
        new Intl.DateTimeFormat('en-US', {
          timeZone: TIMEZONE,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date())
      );
    };

    format();
    const id = window.setInterval(format, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <time
      className="text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400 select-none"
      style={{ fontFamily: '"Satoshi", sans-serif' }}
      title="Cincinnati"
    >
      {time}
    </time>
  );
}
