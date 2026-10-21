"use client";

import React, { useEffect, useState } from 'react';
import { Footprints } from 'lucide-react';

const POLL_MS = 120_000;

// Today's steps from the Fitbit Air, beside the Discord status. Renders
// nothing until there is a count.
const Steps: React.FC = () => {
  const [steps, setSteps] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSteps = async () => {
      try {
        const response = await fetch('/api/steps');
        if (!response.ok) return;
        const data: { steps: number | null } = await response.json();
        if (isMounted) setSteps(data.steps);
      } catch {
        // Leave the last count in place
      }
    };

    fetchSteps();
    const interval = setInterval(fetchSteps, POLL_MS);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (steps === null) return null;

  const count = steps.toLocaleString('en-US');
  const label = `${count} steps today, from my Fitbit Air`;

  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5" title={label} aria-label={label} role="img">
      <Footprints aria-hidden="true" className="h-3 w-3 text-zinc-500 dark:text-neutral-400" />
      <span className="text-xs tabular-nums text-zinc-600 dark:text-neutral-400">
        {count}
        <span className="ml-0.5 text-zinc-400 dark:text-neutral-500">steps</span>
      </span>
    </span>
  );
};

export default Steps;
