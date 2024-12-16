// src/components/Clock.tsx

"use client";
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-zinc-600 dark:text-zinc-400 text-sm">
      Current Time: {time}
    </div>
  );
};

export default Clock;
