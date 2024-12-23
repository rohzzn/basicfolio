"use client";
import React from 'react';
import Link from 'next/link';
import { Activity, Gamepad2, BookOpen, PenTool, Film } from 'lucide-react';

interface HobbyCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const hobbyCards: HobbyCard[] = [
  {
    title: "Anime",
    description: "My curated collection of watched series and personal ratings.",
    href: "/hobbies/myanimelist",
    icon: Film
  },
  {
    title: "Books",
    description: "A growing library of books that have shaped my perspective.",
    href: "/hobbies/readings",
    icon: BookOpen
  },
  {
    title: "Designs",
    description: "Portfolio of UI/UX designs and creative projects.",
    href: "/hobbies/art",
    icon: PenTool
  },
  {
    title: "Gaming",
    description: "My gaming journey, achievements, and Steam library.",
    href: "/hobbies/games",
    icon: Gamepad2
  },
  {
    title: "Running",
    description: "Track my running journey, statistics and achievements from Strava.",
    href: "/hobbies/strava",
    icon: Activity // from Lucide icons
  }
];

const Hobbies: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hobbies</h2>
    <div className="space-y-4 text-zinc-600 dark:text-zinc-400 mb-8">
      <p>
        When I am not coding, you can find me exploring mechanical keyboards,
        contributing to open-source projects, and learning about system design.
      </p>
      <p>
        I also enjoy reading technical writings, participating in hackathons,
        and experimenting with new programming languages.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {hobbyCards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center gap-3 mb-3">
            <card.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors" />
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
              {card.title}
            </h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
            {card.description}
          </p>
        </Link>
      ))}
    </div>
  </div>
);

export default Hobbies;