"use client";

import React, { useState } from "react";
import Link from "next/link";
import FilmPreviewPane from "@/components/FilmPreviewPane";
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

function HobbyRow({ hobby, onEnter }: { hobby: (typeof hobbies)[number]; onEnter: () => void }) {
  return (
    <Link
      href={`/hobbies/${hobby.slug}`}
      onMouseEnter={onEnter}
      onFocus={onEnter}
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
  // The row the cursor was last on, and whether it is still on the list. Keeping the two apart
  // means leaving the list holds the last film as a still instead of snapping back to the top.
  const [active, setActive] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const shown = hobbies.find((hobby) => hobby.slug === active) ?? hobbies[0];

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h2 className="text-lg font-medium dark:text-paper">Hobbies</h2>
      </header>

      <div className="flex items-start gap-10">
        <div
          className="min-w-0 flex-1"
          onMouseLeave={() => setOver(false)}
          onBlur={() => setOver(false)}
        >
          {hobbies.map((hobby) => (
            <HobbyRow
              key={hobby.slug}
              hobby={hobby}
              onEnter={() => {
                setActive(hobby.slug);
                setOver(true);
              }}
            />
          ))}
        </div>

        <div className="hidden w-[340px] shrink-0 lg:block">
          <FilmPreviewPane
            film={films[shown.slug as keyof typeof films]}
            caption={shown.title}
            note={shown.description}
            playing={over}
          />
        </div>
      </div>
    </div>
  );
}
