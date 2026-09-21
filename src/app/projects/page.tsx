"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FilmCard from "@/components/FilmCard";
import FilmPreviewPane from "@/components/FilmPreviewPane";
import films from "@/data/project-films.json";
import { projects, type Project } from "@/data/projects";

type CategoryFilter = Project["category"] | "all";

const categories: { id: CategoryFilter; label: string }[] = [
  { id: "application", label: "apps" },
  { id: "web", label: "web" },
  { id: "game", label: "games" },
  { id: "other", label: "other" },
];

function sortByLatest(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    // A pinned project holds the front of its category whatever the year says.
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    const yearDiff = (b.year ?? 0) - (a.year ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return a.title.localeCompare(b.title);
  });
}

// The films are hung as a contact sheet with a rhythm to it: two large, then three smaller, and
// round again. Fixed bands rather than a masonry, so every film keeps the 4:3 it was drawn in.
function inBands(list: Project[]): { wide: boolean; items: Project[] }[] {
  const bands: { wide: boolean; items: Project[] }[] = [];
  let wide = true;
  for (let i = 0; i < list.length; wide = !wide) {
    const n = wide ? 2 : 3;
    bands.push({ wide, items: list.slice(i, i + n) });
    i += n;
  }
  return bands;
}

function ProjectTile({ project, eager }: { project: Project; eager?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/projects/${project.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative block overflow-hidden rounded-lg bg-[#f0ebe0] ring-1 ring-zinc-900/[.07] transition duration-200 hover:ring-zinc-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:bg-neutral-900 dark:ring-white/10 dark:hover:ring-white/25"
    >
      <div className="relative aspect-[4/3]">
        <FilmCard film={films[project.slug as keyof typeof films]} hovered={hovered} eager={eager} />
      </div>
      {/* Every film signs itself with the name at the end, so the label steps out of the way as
          soon as one starts playing and the tile is nothing but film. */}
      <div
        className={`pointer-events-none absolute bottom-2.5 left-2.5 flex max-w-[calc(100%-1.25rem)] items-baseline gap-2 rounded-md bg-white/85 px-2 py-1 shadow-sm backdrop-blur-[2px] transition-opacity duration-200 ease-out dark:bg-neutral-900/85 ${
          hovered ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="truncate text-xs font-medium text-zinc-800 dark:text-neutral-200">
          {project.title}
        </span>
        {project.year ? (
          <span className="shrink-0 text-[10px] tabular-nums text-zinc-500 dark:text-neutral-500">
            {project.year}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

// On desktop the projects are a list like Writing and Hobbies: name, line, year, and the film plays
// in the pane beside it while the cursor is on the row.
function ProjectRow({ project, onEnter }: { project: Project; onEnter: () => void }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      className="group flex items-baseline justify-between gap-4 border-b border-zinc-100 py-2.5 last:border-0 dark:border-neutral-800/60"
    >
      <span className="flex min-w-0 items-baseline gap-3">
        <span className="shrink-0 text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-neutral-300 dark:group-hover:text-paper">
          {project.title}
        </span>
        <span className="truncate text-sm text-zinc-500 dark:text-neutral-400">{project.description}</span>
      </span>
      {project.year ? (
        <span className="shrink-0 text-xs tabular-nums text-zinc-500 transition-colors group-hover:text-zinc-700 dark:text-neutral-400">
          {project.year}
        </span>
      ) : null}
    </Link>
  );
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<CategoryFilter>(categories[0].id);
  // The row the cursor is on; the pane is empty until one is hovered.
  const [active, setActive] = useState<string | null>(null);

  const list = useMemo(
    () => sortByLatest(activeTab === "all" ? projects : projects.filter((p) => p.category === activeTab)),
    [activeTab]
  );
  const bands = useMemo(() => inBands(list), [list]);

  // Switching tab pulls the list out from under the cursor, so the pane empties with it.
  useEffect(() => {
    setActive(null);
  }, [activeTab]);

  return (
    <div className="max-w-5xl">
      {/* On desktop the header stops where the list does, so the tabs stay over the list. */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:pr-[380px] xl:pr-0 min-[1400px]:pr-[340px]">
        <h2 className="text-lg font-medium dark:text-paper">Projects</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2" role="tablist" aria-label="Project categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeTab === cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`text-sm capitalize transition-colors ${
                activeTab === cat.id
                  ? "font-medium text-zinc-900 dark:text-paper"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-neutral-400 dark:hover:text-neutral-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phones and tablets have no cursor and no room for a pane, so they keep the contact sheet,
          each film playing as it scrolls by. One across on phones, where a third of 343 px would
          be a thumbnail again. */}
      <div className="space-y-3 sm:space-y-4 lg:hidden">
        {bands.map((band, bandIndex) => (
          <div
            key={band.items[0].slug}
            className={`grid gap-3 sm:gap-4 ${
              band.wide ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {band.items.map((project) => (
              <ProjectTile key={project.slug} project={project} eager={bandIndex === 0} />
            ))}
          </div>
        ))}
      </div>

      <div className="hidden items-start gap-10 lg:flex">
        <div className="min-w-0 flex-1" onMouseLeave={() => setActive(null)} onBlur={() => setActive(null)}>
          {list.map((project) => (
            <ProjectRow key={project.slug} project={project} onEnter={() => setActive(project.slug)} />
          ))}
        </div>
        <div className="hidden w-[340px] shrink-0 lg:block xl:hidden xl:w-[300px] min-[1400px]:block">
          <FilmPreviewPane film={active ? films[active as keyof typeof films] : undefined} />
        </div>
      </div>

      {bands.length === 0 ? (
        <p className="py-6 text-sm text-zinc-500 dark:text-neutral-400">No projects in this category.</p>
      ) : null}
    </div>
  );
}
