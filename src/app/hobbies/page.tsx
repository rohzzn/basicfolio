"use client";

import React from "react";
import Link from "next/link";

const hobbies = [
  { title: "Move", description: "Strava & Hevy", href: "/hobbies/move" },
  { title: "Typing", description: "Speed test · 115 WPM", href: "/hobbies/typing" },
  { title: "Seen", description: "Images I like", href: "/hobbies/seen" },
  { title: "Books", description: "Reading list & notes", href: "/hobbies/books" },
  { title: "Content", description: "YouTube uploads", href: "/hobbies/content" },
  { title: "Watchlist", description: "Movies, TV & anime", href: "/hobbies/watchlist" },
  { title: "Music", description: "Spotify stats & playlists", href: "/hobbies/music" },
  { title: "Designs", description: "UI/UX & Behance", href: "/hobbies/art" },
  { title: "Components", description: "Interactive UI components", href: "/hobbies/components" },
  { title: "Hackathons", description: "Events & sprint builds", href: "/hobbies/hackathons" },
  { title: "Gaming", description: "CS2 stats & clips", href: "/hobbies/games" },
  { title: "Setup", description: "Desk, PC & gear", href: "/hobbies/uses" },
];

function HobbyRow({ hobby }: { hobby: (typeof hobbies)[number] }) {
  return (
    <Link
      href={hobby.href}
      className="group block border-b border-zinc-100 py-3 last:border-0 dark:border-neutral-800/60 sm:py-2.5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-neutral-300 dark:group-hover:text-paper">
          {hobby.title}
        </span>
        <span className="hidden min-w-0 truncate text-sm text-zinc-400 sm:block dark:text-neutral-400">
          {hobby.description}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 sm:hidden dark:text-neutral-400">{hobby.description}</p>
    </Link>
  );
}

export default function HobbiesPage() {
  return (
    <div style={{ maxWidth: "75ch" }}>
      <header className="mb-8">
        <h2 className="text-lg font-medium dark:text-paper">Hobbies</h2>
      </header>

      <div>
        {hobbies.map((hobby) => (
          <HobbyRow key={hobby.href} hobby={hobby} />
        ))}
      </div>
    </div>
  );
}
