"use client";

import React, { useState } from "react";
import Link from "next/link";
import FilmCard from "@/components/FilmCard";
import films from "@/data/hobby-films.json";

const hobbies = [
  { slug: "move", title: "Move", description: "Hevy workouts" },
  { slug: "typing", title: "Typing", description: "Speed test · 115 WPM" },
  { slug: "seen", title: "Seen", description: "Images I like" },
  { slug: "books", title: "Books", description: "Reading list & notes" },
  { slug: "content", title: "Content", description: "YouTube uploads" },
  { slug: "watchlist", title: "Watchlist", description: "Movies, TV & anime" },
  { slug: "music", title: "Music", description: "Spotify stats & playlists" },
  { slug: "art", title: "Designs", description: "UI/UX & Behance" },
  { slug: "components", title: "Components", description: "Interactive UI components" },
  { slug: "hackathons", title: "Hackathons", description: "Events & sprint builds" },
  { slug: "games", title: "Gaming", description: "CS2 stats & clips" },
  { slug: "uses", title: "Setup", description: "Desk, PC & gear" },
];

function HobbyCard({ hobby }: { hobby: (typeof hobbies)[number] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/hobbies/${hobby.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group block overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-300 dark:border-neutral-800 dark:hover:border-neutral-700"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ebe0] dark:bg-neutral-900">
        <FilmCard film={films[hobby.slug as keyof typeof films]} hovered={hovered} />
      </div>
      <div className="border-t border-zinc-100 p-3 dark:border-neutral-800/60">
        <span className="block truncate text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-neutral-300 dark:group-hover:text-paper">
          {hobby.title}
        </span>
        <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-neutral-400">{hobby.description}</p>
      </div>
    </Link>
  );
}

export default function HobbiesPage() {
  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h2 className="text-lg font-medium dark:text-paper">Hobbies</h2>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {hobbies.map((hobby) => (
          <HobbyCard key={hobby.slug} hobby={hobby} />
        ))}
      </div>
    </div>
  );
}
