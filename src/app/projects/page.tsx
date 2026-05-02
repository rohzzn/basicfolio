"use client";
import React, { useState } from "react";
import Link from "next/link";
import { projects, type Project } from "@/data/projects";

const displayCategories = [
  { id: "application" as const, label: "apps" },
  { id: "web" as const, label: "web" },
  { id: "game" as const, label: "games" },
  { id: "other" as const, label: "other" },
];

const Projects = () => {
  const [activeTab, setActiveTab] = useState<Project["category"]>("application");

  const activeProjects = projects.filter((p) => p.category === activeTab);

  return (
    <div style={{ maxWidth: "75ch" }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Projects</h2>
        <div className="flex gap-4">
          {displayCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`text-sm capitalize transition-colors ${
                activeTab === cat.id
                  ? "text-zinc-900 dark:text-white font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeProjects.map((project) => (
          <div
            key={project.title}
            className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
          >
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors truncate"
              >
                {project.title}
              </Link>
            </div>
            <span className="text-sm text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-4 hidden sm:block">
              {project.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
