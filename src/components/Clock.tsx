"use client";
import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      
      // Format time without AM/PM
      const timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
      setTime(timeString);
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center text-zinc-700 dark:text-zinc-300">
      <span className="text-xs font-medium">{time}</span>
    </div>
  );
};

export default DigitalClock;
