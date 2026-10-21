"use client";

import React, { useEffect, useState } from 'react';

const POLL_MS = 30_000;
const SLOW_DAY = 5_000;

// Finishes the bio's "tweaking my setup" sentence with today's steps from my
// Fitbit Air. Until there is a count the sentence just ends there.
const StepsToday: React.FC = () => {
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

  if (steps === null) return <>.</>;

  const count = (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{steps.toLocaleString('en-US')}</span>
  );
  const unit = steps === 1 ? 'step' : 'steps';

  return (
    <span className="animate-fade-in">
      {steps < SLOW_DAY ? (
        <>
          , which is probably why I&apos;ve only walked {count} {unit} today.
        </>
      ) : (
        <>
          , though I&apos;ve still walked {count} {unit} today.
        </>
      )}
    </span>
  );
};

export default StepsToday;
