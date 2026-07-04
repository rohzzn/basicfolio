"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Github } from "lucide-react";
import type { Project } from "@/data/projects";
import ProjectWidget from "./project-demos/ProjectWidget";

function projectMeta(project: Project): string | null {
  const { metrics } = project;
  if (metrics?.githubStars) return `${metrics.githubStars.toLocaleString()} GitHub stars`;
  if (metrics?.users) return `${metrics.users.toLocaleString()} users`;
  if (metrics?.downloads) return `${metrics.downloads.toLocaleString()} downloads`;
  if (metrics?.visits) return `${metrics.visits.toLocaleString()} visits`;
  return null;
}

function linkHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function isUglyDeployHost(host: string): boolean {
  if (host.endsWith(".github.io")) return true;
  if (host.endsWith(".vercel.app")) {
    const sub = host.slice(0, -".vercel.app".length);
    return sub.length > 24 || sub.split("-").length > 4;
  }
  return false;
}

function externalLinkLabel(url: string, label: string): string {
  if (!["Live", "Demo", "Play", "App Store"].includes(label)) {
    return label;
  }
  const host = linkHostname(url);
  if (isUglyDeployHost(host)) {
    return "Live";
  }
  return host;
}

function LinksSection({ links }: { links: Project["links"] }) {
  const gh = links.find((l) => l.label === "GitHub");
  const rest = links.filter((l) => l.label !== "GitHub");

  if (rest.length === 0 && !gh) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
      {rest.map((link, index) => (
        <React.Fragment key={link.url}>
          {index > 0 ? <span className="text-zinc-300 dark:text-zinc-500">·</span> : null}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            {externalLinkLabel(link.url, link.label)}
          </a>
        </React.Fragment>
      ))}
      {gh ? (
        <>
          {rest.length > 0 ? <span className="text-zinc-300 dark:text-zinc-500">·</span> : null}
          <a
            href={gh.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Source
            <Github className="h-3.5 w-3.5" aria-hidden />
          </a>
        </>
      ) : null}
    </div>
  );
}

function StoryBlock({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <div className="mt-6 space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-sm leading-[1.75] text-zinc-700 dark:text-zinc-300">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export default function ProjectDetail({ project: p }: { project: Project }) {
  const meta = projectMeta(p);
  const techLine = p.tech.length > 0 ? p.tech.join(" · ") : null;
  const story = p.longDescription?.trim();
  const showStory = Boolean(story && story !== p.description.trim());

  return (
    <article className="pb-12">
      <div className="max-w-prose">
        <header>
          <h1 className="text-lg font-medium dark:text-white">{p.title}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{p.description}</p>
          {techLine || meta ? (
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-400">
              {[techLine, meta].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          <LinksSection links={p.links} />
        </header>

        {showStory ? <StoryBlock text={story!} /> : null}
      </div>

      <div className="mt-8 max-w-4xl">
        <ProjectWidget project={p} />
      </div>

      <Link
        href="/projects"
        className="mt-10 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Projects
      </Link>
    </article>
  );
}
