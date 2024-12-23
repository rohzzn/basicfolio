"use client";
import React, { useState } from "react";
import { Calendar, Gamepad, Code, Briefcase, GraduationCap, Youtube, Laptop } from 'lucide-react';

interface TimelineEvent {
  date: string;
  description: string[];
  category: 'education' | 'gaming' | 'work' | 'tech' | 'content' | 'achievement';
}

const events: TimelineEvent[] = [
  {
    date: "2024",
    description: [
      "Started Spring Semester at University of Cincinnati"
    ],
    category: "education"
  },
  {
    date: "December 2023",
    description: [
      "Achieved 3rd place in the AMD Gameon x The Arena 2024 gaming tournament",
      "Attended the Travis Scott concert"
    ],
    category: "gaming"
  },
  {
    date: "November 2023",
    description: [
      "Secured 2nd position in a 48-hour hackathon",
      "Earned Generative AI and Large Language Models certifications from Google"
    ],
    category: "achievement"
  },
  {
    date: "August 2023",
    description: [
      "Started Master's in Engineering at the University of Cincinnati",
      "Joined as a part-time student worker at the Bearcats Package Center"
    ],
    category: "education"
  },
  {
    date: "June - September 2023",
    description: [
      "Software Development Engineer internship at AbhiBus",
      "Worked on multiple projects and improved system performance"
    ],
    category: "work"
  },
  {
    date: "September 2022",
    description: [
      "Became President of the CodeChef Chapter at Malla Reddy Engineering College"
    ],
    category: "achievement"
  },
  {
    date: "2020 - 2024",
    description: [
      "Bachelor of Technology in Computer Science at Malla Reddy Engineering College",
      "Focused on Data Structures, Algorithms, and System Design"
    ],
    category: "education"
  },
  {
    date: "2017",
    description: [
      "First AMD Game ON Tournament Counter-Strike tournament",
      "Second tournament at Nvidia Gamer's Connect",
      "Met Carry Minati, Venom (Redbull Ambassador) and many creators",
      "Invested heavily in CS:GO skins and trading"
    ],
    category: "gaming"
  },
  {
    date: "2016",
    description: [
      "Received first YouTube monetization payment",
      "Achieved 200k views milestone on YouTube channel",
      "Released graphic pack with 42k downloads"
    ],
    category: "content"
  },
  {
    date: "2014",
    description: [
      "Created YouTube Channel and started content creation",
      "Started playing Counter-Strike: Global Offensive"
    ],
    category: "content"
  },
  {
    date: "2006",
    description: [
      "Got first computer - beginning of tech journey",
      "Started gaming with CS 1.6, TOD, Claw, Road Rash, IGI, Freedom Fighters"
    ],
    category: "tech"
  },
  {
    date: "2001",
    description: [
      "Born in Hyderabad, India"
    ],
    category: "achievement"
  }
];

const Timeline: React.FC = () => {
  const [filter, setFilter] = useState<TimelineEvent['category'] | 'all'>('all');

  const getCategoryIcon = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'education':
        return <GraduationCap className="w-4 h-4" />;
      case 'gaming':
        return <Gamepad className="w-4 h-4" />;
      case 'work':
        return <Briefcase className="w-4 h-4" />;
      case 'tech':
        return <Laptop className="w-4 h-4" />;
      case 'content':
        return <Youtube className="w-4 h-4" />;
      case 'achievement':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: TimelineEvent['category']) => {
    switch (category) {
      case 'education':
        return 'bg-blue-500 dark:bg-blue-400';
      case 'gaming':
        return 'bg-purple-500 dark:bg-purple-400';
      case 'work':
        return 'bg-green-500 dark:bg-green-400';
      case 'tech':
        return 'bg-yellow-500 dark:bg-yellow-400';
      case 'content':
        return 'bg-red-500 dark:bg-red-400';
      case 'achievement':
        return 'bg-indigo-500 dark:bg-indigo-400';
      default:
        return 'bg-zinc-500 dark:bg-zinc-400';
    }
  };

  const filteredEvents = events.filter(
    event => filter === 'all' || event.category === filter
  );

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Timeline</h2>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${filter === 'all' 
              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' 
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
        >
          All
        </button>
        {(['education', 'gaming', 'work', 'tech', 'content', 'achievement'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filter === category 
                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
          >
            {getCategoryIcon(category)}
            <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative border-l border-zinc-300 dark:border-zinc-700 pl-4">
        {filteredEvents.map((event, index) => (
          <div key={index} className="mb-10">
            <span className={`absolute -left-2 flex items-center justify-center w-4 h-4 ${getCategoryColor(event.category)} rounded-full`}>
              {getCategoryIcon(event.category)}
            </span>
            <div className="flex flex-col bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {event.date}
              </p>
              {event.description.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {event.description.map((point, i) => (
                    <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;