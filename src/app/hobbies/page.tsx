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
    description: "Cardio & gym sessions",
    href: "/hobbies/strava",
  },
  {
    title: "Frames",
    description: ".heic",
    href: "/hobbies/frames",
  },
  {
    title: "Ben 10",
    description: "Childhood game archived",
    href: "/hobbies/ben10",
  },
  {
    title: "Books",
    description: "Reading list & reviews",
    href: "/hobbies/readings",
  },
  {
    title: "Content",
    description: "Videos & tutorials",
    href: "/hobbies/content",
  },
  {
    title: "Designs",
    description: "UI/UX & creative work",
    href: "/hobbies/art",
  },
  {
    title: "Watchlist",
    description: "Movies, TV & anime",
    href: "/hobbies/watchlist",
  },
  {
    title: "Gaming",
    description: "Stats & achievements",
    href: "/hobbies/games",
  },
  {
    title: "Gaming Clips",
    description: "CS2, Valorant & more",
    href: "/hobbies/clips",
  },
  {
    title: "Hackathons",
    description: "Projects & achievements",
    href: "/hobbies/hackathons",
  },
  {
    title: "Music",
    description: "Playlists & favorites",
    href: "/hobbies/music",
  },
  {
    title: "Setup",
    description: "Gear & tools",
    href: "/hobbies/uses",
  },
  {
    title: "Typing",
    description: "Speed test (115 WPM)",
    href: "/hobbies/typing",
  },
].sort((a, b) => a.title.localeCompare(b.title));

const Hobbies: React.FC = () => (
  <div style={{ maxWidth: '75ch' }}>
    <h2 className="text-lg font-medium mb-8 dark:text-white">Hobbies</h2>

    <div>
      {hobbies.map((hobby) => (
        <Link
          key={hobby.href}
          href={hobby.href}
          className="group flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
        >
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
            {hobby.title}
          </span>
          <span className="text-sm text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-4">
            {hobby.description}
          </span>
        </Link>
      ))}
    </div>
  </div>
);

export default Hobbies;
