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
      className="group block border-b border-zinc-100 py-3 last:border-0 dark:border-neutral-800/60 sm:py-2.5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-neutral-300 dark:group-hover:text-paper">
          {project.title}
        </span>
        <span className="hidden min-w-0 truncate text-sm text-zinc-400 sm:block dark:text-neutral-400">
          {project.description}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-zinc-400 sm:hidden dark:text-neutral-400">{project.description}</p>
    </Link>
  );
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<CategoryFilter>("all");

  const filtered = useMemo(() => {
    const list =
      activeTab === "all"
        ? projects
        : projects.filter((p) => p.category === activeTab);
    return sortByLatest(list);
  }, [activeTab]);

  return (
    <div style={{ maxWidth: "75ch" }}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div>
        {filtered.map((project) => (
          <ProjectRow key={project.slug} project={project} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-sm text-zinc-500 dark:text-neutral-400">No projects in this category.</p>
      ) : null}
    </div>
  );
}
