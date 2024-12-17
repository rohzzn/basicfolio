// src/app/timeline/page.tsx

"use client";
import React from "react";

interface TimelineEvent {
  date: string; // Month and Year
  description: string[]; // List of descriptions
}

const events: TimelineEvent[] = [
  {
    date: "2024",
    description: [],
  },
  {
    date: "December",
    description: [
      "Achieved 3rd place in the AMD Gameon x The Arena 2024 gaming tournament.",
      "Attended the Travis Scott concert.",
    ],
  },
  {
    date: "November",
    description: [
      "Secured 2nd position in a 48-hour hackathon.",
      "Earned Generative AI and Large Language Models certifications from Google.",
    ],
  },
  {
    date: "October",
    description: [],
  },
  {
    date: "September",
    description: [],
  },
  {
    date: "August",
    description: [
      "Started my Master's in Engineering at the University of Cincinnati.",
      "Joined as a part-time student worker at the Bearcats Package Center.",
    ],
  },
  {
    date: "July",
    description: [],
  },
  {
    date: "June",
    description: [],
  },
  {
    date: "2023",
    description: [],
  },
  {
    date: "September",
    description: [
      "Completed a Software Development Engineer internship at AbhiBus.",
    ],
  },
  {
    date: "June",
    description: [
      "Began a Software Development Engineer internship at AbhiBus.",
    ],
  },
  {
    date: "2022",
    description: [],
  },
  {
    date: "September",
    description: [
      "Became President of the CodeChef Chapter at Malla Reddy Engineering College.",
    ],
  },
  {
    date: "2017",
    description: [
      "My first AMD Game ON Tournament counter-strike tournament.",
      "My second tournament was also in this year by Nvidia Gamer's Connect.",
      "Met Carry Minati, Venom (Redbull Ambassador) and many more creators.",
      "Spent over $1000 on Counter-Strike: Global Offensive Gambling.",
    ],
  },
  {
    date: "2016",
    description: [
      "Got my first paycheck from YouTube and bought a blue snowball.",
      "200k views on my YouTube Channel.",
      "My graphic pack got 42k downloads.",
    ],
  },
  {
    date: "2014",
    description: [
     "Created a YouTube Channel and started uploading videos.",
     "Got a new computer and started playing Counter-Strike: Global Offensive.",
    
    ],
  },
  {
    date: "2006",
    description: [
      "Got my first computer and the love for technology began.",
      "Started playing Counter-Strike 1.6, TOD, Claw, Road Rash, IGI, and Freedom fighters. ",
    ],
  },
  {
    date: "2001",
    description: [
      "A npc nerd is spawned on earth.",
    ],
  },
];

const Timeline: React.FC = () => {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Timeline</h2>
      <div className="relative border-l border-zinc-300 dark:border-zinc-700 pl-4">
        {events.map((event, index) => (
          <div key={index} className="mb-10">
            <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-zinc-600 dark:bg-zinc-400 rounded-full" />
            <p className="mb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {event.date}
            </p>
            {event.description.length > 0 && (
              <ul className="mt-2 list-disc ml-4 text-sm text-zinc-600 dark:text-zinc-400">
                {event.description.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
