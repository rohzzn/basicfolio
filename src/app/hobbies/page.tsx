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
    description: "Workouts & daily stats",
    href: "/hobbies/strava"
  },
  {
    title: "Anime",
    description: "Watched series & ratings",
    href: "/hobbies/myanimelist"
  },
  {
    title: "Books",
    description: "Reading list & reviews",
    href: "/hobbies/readings"
  },
  {
    title: "Content",
    description: "Videos & tutorials",
    href: "/hobbies/content"
  },
  {
    title: "Designs",
    description: "UI/UX & creative work",
    href: "/hobbies/art"
  },
  {
    title: "Gaming",
    description: "Stats & achievements",
    href: "/hobbies/games"
  },
  {
    title: "Gaming Clips",
    description: "CS2, Valorant & more",
    href: "/hobbies/clips"
  },
  {
    title: "Hackathons",
    description: "Projects & achievements",
    href: "/hobbies/hackathons"
  },
  {
    title: "Music",
    description: "Playlists & favorites",
    href: "/hobbies/music"
  },
  {
    title: "Setup",
    description: "Gear & tools",
    href: "/hobbies/uses"
  },
  {
    title: "Typing",
    description: "Speed test (115 WPM)",
    href: "/hobbies/typing"
  }
];

const Hobbies: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hobbies</h2>

    <div className="space-y-4">
      {hobbies.map((hobby) => (
        <Link
          key={hobby.href}
          href={hobby.href}
          className="group cursor-pointer block"
        >
          <article>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              {hobby.title}, <span className="text-xs text-zinc-500 dark:text-zinc-500 font-normal">{hobby.description}</span>
            </h3>
          </article>
        </Link>
      ))}
    </div>
  </div>
);

export default Hobbies;