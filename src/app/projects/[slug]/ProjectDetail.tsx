"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Github } from "lucide-react";
import FilmPlate from "@/components/FilmPlate";
import films from "@/data/project-films.json";
import type { Project } from "@/data/projects";
import { getDetailWidget } from "../previews/detail";

// A project reads like a post: the title, the line, then its film playing across the top, the
// way a post opens on its own. Under it the facts in one place, then the story, then anything
// hands-on (an install line, its commands, the interactive preview), and last the way on to the
// project beside it in the list.

const CATEGORY_LABEL: Record<Project["category"], string> = {
  application: "App",
  web: "Web",
  game: "Game",
  other: "Other",
};

function reach(project: Project): string | null {
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
  if (!["Live", "Demo", "Play", "App Store"].includes(label)) return label;
  const host = linkHostname(url);
  return isUglyDeployHost(host) ? "Live" : host;
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-zinc-500 dark:text-neutral-500">{label}</dt>
      <dd className="min-w-0 text-zinc-700 dark:text-neutral-300">{children}</dd>
    </>
  );
}

function Links({ links }: { links: Project["links"] }) {
  const source = links.find((l) => l.label === "GitHub");
  const rest = links.filter((l) => l.label !== "GitHub");
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1">
      {rest.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-0.5 text-zinc-800 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-600 dark:text-neutral-200 dark:decoration-neutral-600 dark:hover:decoration-neutral-300"
        >
          {externalLinkLabel(link.url, link.label)}
          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
        </a>
      ))}
      {source ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-neutral-400 dark:hover:text-paper"
        >
          <Github className="h-3.5 w-3.5" aria-hidden />
          Source
        </a>
      ) : null}
    </span>
  );
}

function InstallLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard refused: the command is right there to select
    }
  };
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-md bg-zinc-100 py-1 pl-2.5 pr-1 dark:bg-neutral-800/80">
      <code className="min-w-0 truncate font-mono text-xs text-zinc-800 dark:text-neutral-200">{command}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy the install command"}
        title={copied ? "Copied" : "Copy"}
        className="shrink-0 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-paper"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-base font-medium dark:text-paper">{title}</h2>
      {children}
    </section>
  );
}

export type NeighbourLink = { slug: string; title: string };

function Neighbour({ project, dir }: { project: NeighbourLink | undefined; dir: "prev" | "next" }) {
  if (!project) return <span />;
  const next = dir === "next";
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group flex min-w-0 flex-col gap-0.5 ${next ? "items-end text-right" : "items-start"}`}
    >
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-neutral-500">
        {next ? null : <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" aria-hidden />}
        {next ? "Next" : "Previous"}
        {next ? <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden /> : null}
      </span>
      <span className="max-w-full truncate text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-neutral-300 dark:group-hover:text-paper">
        {project.title}
      </span>
    </Link>
  );
}

export default function ProjectDetail({
  project: p,
  prev,
  next,
}: {
  project: Project;
  prev?: NeighbourLink;
  next?: NeighbourLink;
}) {
  const count = reach(p);
  const story = p.longDescription?.trim();
  const paragraphs = story && story !== p.description.trim() ? story.split(/\n\n+/).filter(Boolean) : [];
  const Widget = getDetailWidget(p.slug);
  const film = films[p.slug as keyof typeof films];

  return (
    <article className="max-w-3xl pb-12">
      <header className="mb-8">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h1 className="text-lg font-medium dark:text-paper">{p.title}</h1>
          <Link
            href="/projects"
            className="mt-1 flex-shrink-0 text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:text-neutral-400 dark:hover:text-neutral-300"
          >
            projects
          </Link>
        </div>
        <p className="text-sm text-zinc-600 dark:text-neutral-400">{p.description}</p>
      </header>

      <FilmPlate film={film} />

      <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-6 gap-y-3 border-y border-zinc-100 py-5 text-sm dark:border-neutral-800/60 sm:grid-cols-[7rem_minmax(0,1fr)]">
        <Fact label="Type">
          {CATEGORY_LABEL[p.category]}
          {p.year ? <span className="text-zinc-500 dark:text-neutral-500"> · {p.year}</span> : null}
          {p.metrics?.preAI ? <span className="text-zinc-500 dark:text-neutral-500"> · built before AI tools</span> : null}
        </Fact>
        {p.tech.length > 0 ? <Fact label="Built with">{p.tech.join(" · ")}</Fact> : null}
        {count ? <Fact label="Reach">{count}</Fact> : null}
        {p.links.length > 0 ? (
          <Fact label="Links">
            <Links links={p.links} />
          </Fact>
        ) : null}
        {p.install ? (
          <Fact label="Install">
            <InstallLine command={p.install} />
          </Fact>
        ) : null}
      </dl>

      {paragraphs.length > 0 ? (
        <div className="mt-8 space-y-4">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-sm leading-[1.75] text-zinc-600 dark:text-neutral-400">
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {p.commands && p.commands.length > 0 ? (
        <Section title="Commands">
          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-neutral-800">
            {p.commands.map((c) => (
              <div
                key={c.cmd}
                className="grid gap-1 border-b border-zinc-100 px-4 py-2.5 last:border-0 dark:border-neutral-800/60 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-4"
              >
                <code className="truncate font-mono text-xs text-zinc-800 dark:text-neutral-200">{c.cmd}</code>
                <span className="text-xs text-zinc-500 dark:text-neutral-400">{c.desc}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {p.colors && p.colors.length > 0 ? (
        <Section title="Palette">
          <div className="flex flex-wrap gap-4">
            {p.colors.map((c) => (
              <div key={c.hex} className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-md ring-1 ring-zinc-900/10 dark:ring-white/10" style={{ background: c.hex }} />
                <span className="flex flex-col">
                  <span className="text-xs text-zinc-700 dark:text-neutral-300">{c.name}</span>
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-neutral-500">
                    {c.hex} · {c.role}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {Widget ? (
        <Section title="A closer look">
          <div className="relative h-[320px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-neutral-800 dark:bg-neutral-900">
            <Widget />
          </div>
        </Section>
      ) : null}

      <nav aria-label="More projects" className="mt-12 grid grid-cols-2 gap-6 border-t border-zinc-100 pt-6 dark:border-neutral-800/60">
        <Neighbour project={prev} dir="prev" />
        <Neighbour project={next} dir="next" />
      </nav>
    </article>
  );
}
