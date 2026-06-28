"use client";
import React from 'react';
import Link from 'next/link';
import { ExternalLink, Github } from 'lucide-react';
import type { Project } from '@/data/projects';
import ProjectWidget from './project-demos/ProjectWidget';

const L = 'text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3';

function LinksSection({ links }: { links: Project['links'] }) {
  const gh = links.find(l => l.label === 'GitHub');
  const rest = links.filter(l => l.label !== 'GitHub');
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
      {rest.map(l => (
        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />{l.label}
        </a>
      ))}
      {gh && (
        <a href={gh.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <Github className="w-3.5 h-3.5" />Source
        </a>
      )}
    </div>
  );
}

function Highlights({ items }: { items: string[] }) {
  return (
    <div className="mt-8">
      <p className={L}>Highlights</p>
      <ul className="space-y-2">
        {items.map((h, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500 flex-shrink-0 mt-[7px]" />{h}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProjectDetail({ project: p }: { project: Project }) {
  return (
    <article className="max-w-2xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-lg font-medium dark:text-white">{p.title}</h1>
          <Link href="/projects" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">projects</Link>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{p.description}</p>
      </header>

      <LinksSection links={p.links} />

      <ProjectWidget project={p} />

      {p.longDescription && (
        <div className="mb-6">
          <p className={L}>About</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{p.longDescription}</p>
        </div>
      )}

      {p.highlights?.length ? <Highlights items={p.highlights} /> : null}
    </article>
  );
}
