"use client";
import React from 'react';
import Link from 'next/link';

interface Hobby {
  title: string;
  description: string;
  href: string;
}

const hobbies: Hobby[] = [
  {
    title: "Activities",
    description: "Tracking workouts and daily activities with personal stats.",
    href: "/hobbies/strava"
  },
  {
    title: "Anime",
    description: "My curated collection of watched series and personal ratings.",
    href: "/hobbies/myanimelist"
  },
  {
    title: "Books",
    description: "A growing library of books that have shaped my perspective.",
    href: "/hobbies/readings"
  },
  {
    title: "Content",
    description: "My YouTube videos, tutorials, and creative content.",
    href: "/hobbies/content"
  },
  {
    title: "Designs",
    description: "Portfolio of UI/UX designs and creative projects.",
    href: "/hobbies/art"
  },
  {
    title: "Gaming",
    description: "My gaming journey, achievements, and Steam library.",
    href: "/hobbies/games"
  },
  {
    title: "Gaming Clips",
    description: "Latest gaming clips from CS, Valorant, and more.",
    href: "/hobbies/clips"
  },
  {
    title: "Hackathons",
    description: "Events I've participated in, projects built, and achievements.",
    href: "/hobbies/hackathons"
  },
  {
    title: "Music",
    description: "Music that resonates with me, from playlists to favorite tracks.",
    href: "/hobbies/music"
  },
  {
    title: "Setup",
    description: "My workstation, development environment, and daily tools.",
    href: "/hobbies/uses"
  },
  {
    title: "Typing",
    description: "Test your typing speed and compare with my 115 WPM record.",
    href: "/hobbies/typing"
  },
  {
    title: "Whiteboard",
    description: "Collaborative drawing canvas where anyone can contribute and create together.",
    href: "/hobbies/whiteboard"
  },
  {
    title: "Archive",
    description: "Visual collection of personal moments captured in time.",
    href: "/hobbies/archive"
  }
];

const Hobbies: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hobbies</h2>

    <div className="space-y-6">
      {hobbies.map((hobby) => (
        <Link
          key={hobby.href}
          href={hobby.href}
          className="group cursor-pointer block"
        >
          <article>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                {hobby.title}
              </h3>
            </div>
            
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {hobby.description}
            </p>
          </article>
        </Link>
      ))}
    </div>
  </div>
);

export default Hobbies;