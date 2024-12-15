// src/app/timeline/page.tsx

"use client";
import React from 'react';

interface TimelineEvent {
  month: string;
  title: string;
  description: string;
}

const events: TimelineEvent[] = [
  {
    month: "January",
    title: "Started New Project",
    description: "Initiated a new open-source project focusing on building reusable React components."
  },
  {
    month: "February",
    title: "Completed React Course",
    description: "Finished an advanced React and TypeScript course to enhance frontend skills."
  },
  {
    month: "March",
    title: "Launched Portfolio Website",
    description: "Deployed my personal portfolio site showcasing projects and skills."
  },
  // Add more events up to the current month
  {
    month: "December",
    title: "Contributed to Open Source",
    description: "Made significant contributions to several open-source repositories."
  },
];

const Timeline: React.FC = () => {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Timeline</h2>
      <div className="relative border-l border-zinc-300 dark:border-zinc-700">
        {events.map((event, index) => (
          <div key={index} className="mb-10 ml-4">
            <span className="absolute -left-2 flex items-center justify-center w-3 h-3 bg-zinc-600 dark:bg-zinc-400 rounded-full">
              {/* Optional: Add an icon here */}
            </span>
            <h3 className="mb-1 text-lg font-medium dark:text-white">{event.month}</h3>
            <h4 className="text-base font-medium dark:text-zinc-200">{event.title}</h4>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
