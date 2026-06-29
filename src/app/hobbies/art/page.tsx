"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "@/components/SiteImage";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import "./art.css";

interface Project {
  id: number;
  title: string;
  description: string;
  platform: "Behance" | "Dribbble";
  imageUrl: string;
  projectUrl: string;
  tags: string[];
}

/** Design disciplines — edit this list to change what scrolls in the strip. */
const MARQUEE_TAGS = [
  "Branding",
  "Logo Design",
  "Identity",
  "Illustration",
  "Character Design",
  "Mascot Design",
  "UI Design",
  "Packaging",
  "Merchandise",
  "Game Art",
  "Environment Design",
  "Cover Art",
  "Digital Art",
  "Mobile Design",
];

const projects: Project[] = [
  {
    id: 1,
    title: "Sarojini Gastro",
    description: "Branding design for Hospital.",
    platform: "Behance",
    imageUrl: "/images/design/sarojini.png",
    projectUrl: "https://www.behance.net/gallery/127106007/Sarojini-Gastro-BRANDING",
    tags: ["Branding", "Logo Design", "Hospital"],
  },
  {
    id: 2,
    title: "Kōhī",
    description: "Brand identity design for a Japanese-inspired coffee beans.",
    platform: "Behance",
    imageUrl: "/images/design/kohi2.png",
    projectUrl: "https://www.behance.net/gallery/109291517/Kohi-BRANDING",
    tags: ["Branding", "Japanese", "Coffee"],
  },
  {
    id: 3,
    title: "Merch Design",
    description: "Collection of merchandise designs featuring unique illustrations and patterns.",
    platform: "Behance",
    imageUrl: "/images/design/merch.png",
    projectUrl: "https://www.behance.net/gallery/109299665/Merch-Design",
    tags: ["Merchandise", "Illustration", "Fashion"],
  },
  {
    id: 4,
    title: "Mascots Folio",
    description: "A collection of character mascots designed for various brands and projects.",
    platform: "Behance",
    imageUrl: "/images/design/mascots.png",
    projectUrl: "https://www.behance.net/gallery/97663207/Mascots-01",
    tags: ["Character Design", "Mascots", "Illustration"],
  },
  {
    id: 5,
    title: "Game Backgrounds",
    description: "Environmental designs and background artwork for gaming projects.",
    platform: "Behance",
    imageUrl: "/images/design/gamebg.png",
    projectUrl: "https://www.behance.net/gallery/107259111/Game-Backgrounds",
    tags: ["Game Art", "Environment Design", "Digital Art"],
  },
  {
    id: 6,
    title: "Logofolio 01",
    description: "Collection of logo designs and brand marks for various clients.",
    platform: "Behance",
    imageUrl: "/images/design/logofolio.png",
    projectUrl: "https://www.behance.net/gallery/96981231/Logofolio-01",
    tags: ["Logo Design", "Branding", "Identity"],
  },
  {
    id: 7,
    title: "Pirate King",
    description: "Illustration of Pirate King YouTuber.",
    platform: "Behance",
    imageUrl: "/images/design/pirateking.png",
    projectUrl: "https://www.behance.net/gallery/134277689/Pirate-King-BANNER",
    tags: ["Cover Art", "Branding", "Identity"],
  },
  {
    id: 8,
    title: "Zenitsu",
    description: "Character illustration inspired by Demon Slayer.",
    platform: "Dribbble",
    imageUrl: "/images/design/zenitsu.jpg",
    projectUrl: "https://dribbble.com/shots/14276575-Zenitsu-x-Calatop",
    tags: ["Illustration", "Anime", "Character Design"],
  },
  {
    id: 9,
    title: "Sushi",
    description: "Food illustration and packaging design concept.",
    platform: "Dribbble",
    imageUrl: "/images/design/sushi.jpg",
    projectUrl: "https://dribbble.com/shots/14520503-Sushi",
    tags: ["Food", "Illustration", "Packaging"],
  },
  {
    id: 10,
    title: "Taj Mahal",
    description: "Architectural illustration of the iconic monument.",
    platform: "Dribbble",
    imageUrl: "/images/design/tajmahal.jpg",
    projectUrl: "https://dribbble.com/shots/14520610-Taj-Mahal",
    tags: ["Architecture", "Illustration", "Landmarks"],
  },
  {
    id: 11,
    title: "Cat Illustration",
    description: "Playful cat character design and illustration.",
    platform: "Dribbble",
    imageUrl: "/images/design/cat.jpg",
    projectUrl: "https://dribbble.com/shots/14520857-Cat",
    tags: ["Character Design", "Animals", "Illustration"],
  },
  {
    id: 12,
    title: "Dog Illustration",
    description: "Playful dog Illustration design.",
    platform: "Dribbble",
    imageUrl: "/images/design/dog.jpg",
    projectUrl: "https://dribbble.com/shots/14537048-Dog",
    tags: ["Mascot", "Character Design", "Branding"],
  },
  {
    id: 13,
    title: "Wallpaper Engine UI",
    description: "User interface design for a wallpaper customization app.",
    platform: "Dribbble",
    imageUrl: "/images/design/wallpaperengine.jpg",
    projectUrl: "https://dribbble.com/shots/14535866-UI-Concept-Wallpaper-Engine",
    tags: ["UI Design", "Desktop", "Application"],
  },
  {
    id: 14,
    title: "Delivery App UI",
    description: "Modern interface design for a food delivery application.",
    platform: "Dribbble",
    imageUrl: "/images/design/packageui.jpg",
    projectUrl: "https://dribbble.com/shots/22380216-Delivery-Tracking",
    tags: ["UI Design", "Mobile", "Food Delivery"],
  },
  {
    id: 15,
    title: "Finance App UI",
    description: "Clean and modern finance application interface.",
    platform: "Dribbble",
    imageUrl: "/images/design/cash.jpg",
    projectUrl: "https://dribbble.com/shots/21392007-Finance",
    tags: ["UI Design", "Finance", "Mobile"],
  },
  {
    id: 16,
    title: "Rohan Mascot",
    description: "Personal brand mascot design.",
    platform: "Dribbble",
    imageUrl: "/images/design/mascot.jpg",
    projectUrl: "https://dribbble.com/shots/14977365-Calatop",
    tags: ["Mascot", "Personal Brand", "Character Design"],
  },
];

type Filter = "all" | "Behance" | "Dribbble";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function TagMarquee({ tags }: { tags: string[] }) {
  const [items, setItems] = useState<string[] | null>(null);

  useEffect(() => {
    setItems([...shuffle(tags), ...shuffle(tags)]);
  }, [tags]);

  if (!items) {
    return <div className="mb-8 h-10" aria-hidden />;
  }

  return (
    <div
      className="relative mb-8 overflow-hidden rounded-full border border-zinc-200/80 bg-zinc-50/80 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-zinc-50 to-transparent dark:from-zinc-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-zinc-50 to-transparent dark:from-zinc-950" />
      <div className="art-tag-marquee-track" style={{ ["--marquee-duration" as string]: `${Math.max(60, tags.length * 8)}s` }}>
        {items.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="mx-4 shrink-0 text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

const ArtPage = () => {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const filteredProjects = useMemo(
    () => projects.filter((project) => activeFilter === "all" || project.platform === activeFilter),
    [activeFilter],
  );

  return (
    <div className="w-full min-w-0 max-w-6xl">
      <header className="mb-6 max-w-xl">
        <h2 className="text-lg font-medium dark:text-white">Design</h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Branding, illustration, and interface work.
        </p>
      </header>

      <TagMarquee tags={MARQUEE_TAGS} />

      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
        {(["all", "Behance", "Dribbble"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`text-xs uppercase tracking-[0.14em] transition-colors ${
              activeFilter === filter
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            {filter === "all" ? "All work" : filter}
            {activeFilter === filter ? (
              <span className="mt-1 block h-px w-full bg-zinc-900 dark:bg-white" />
            ) : null}
          </button>
        ))}
      </div>

      <motion.div layout className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.24) }}
              className="mb-3 break-inside-avoid sm:mb-4"
            >
              <Link
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full overflow-hidden rounded-xl ring-1 ring-zinc-200/70 transition-shadow hover:shadow-lg dark:ring-zinc-800/80"
              >
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  width={800}
                  height={1000}
                  priority={i < 6}
                  className="block h-auto w-full transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-[11px] font-medium leading-snug text-white">{project.title}</span>
                  <span className="mt-0.5 text-[10px] uppercase tracking-wider text-white/65">{project.platform}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
        Want to work together?{" "}
        <Link
          href="/meet"
          className="text-zinc-700 underline-offset-2 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-white"
        >
          Let&apos;s talk
        </Link>
        .
      </p>
    </div>
  );
};

export default ArtPage;
