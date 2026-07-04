"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { projects, type Project } from "@/data/projects";

type CategoryFilter = Project["category"] | "all";

const categories: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "all" },
  { id: "application", label: "apps" },
  { id: "web", label: "web" },
  { id: "game", label: "games" },
  { id: "other", label: "other" },
];

const FEATURED_ORDER = ["beam", "relay", "dock-poker", "contests", "catan-online"] as const;

function sortByLatest(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    const yearDiff = (b.year ?? 0) - (a.year ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return a.title.localeCompare(b.title);
  });
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800/60 sm:py-2.5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-white">
          {project.title}
        </span>
        <span className="hidden min-w-0 truncate text-sm text-zinc-400 sm:block dark:text-zinc-400">
          {project.description}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 sm:hidden dark:text-zinc-400">{project.description}</p>
    </Link>
  );
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<CategoryFilter>("all");

  const featured = useMemo(() => {
    const bySlug = new Map(projects.map((p) => [p.slug, p]));
    return FEATURED_ORDER.map((slug) => bySlug.get(slug)).filter((p): p is Project => p != null);
  }, []);

  const featuredSlugs = useMemo(() => new Set(FEATURED_ORDER), []);

  const filtered = useMemo(() => {
    const list =
      activeTab === "all"
        ? projects.filter((p) => !featuredSlugs.has(p.slug as (typeof FEATURED_ORDER)[number]))
        : projects.filter((p) => p.category === activeTab);
    return sortByLatest(list);
  }, [activeTab, featuredSlugs]);

  const showFeatured = activeTab === "all";

  return (
    <div style={{ maxWidth: "75ch" }}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium dark:text-white">Projects</h2>
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
                  ? "font-medium text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {showFeatured ? (
        <section className="mb-10">
          <h3 className="mb-4 text-xs font-medium uppercase leading-none tracking-wider text-zinc-400 dark:text-zinc-400">
            Featured
          </h3>
          <div>
            {featured.map((project) => (
              <ProjectRow key={project.slug} project={project} />
            ))}
          </div>
        </section>
      ) : null}

      <div>
        {filtered.map((project) => (
          <ProjectRow key={project.slug} project={project} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">No projects in this category.</p>
      ) : null}
    </div>
  );
}
