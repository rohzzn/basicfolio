'use client';
import dynamic from 'next/dynamic';
import type React from 'react';
import type { Project } from '@/data/projects';

const GROUP_SLUGS: Record<string, string[]> = {
  "games": [
    "dock-poker",
    "catan-online",
    "wordle",
    "pokedex",
    "pokemon-platformer",
    "greed-island-dex"
  ],
  "apps": [
    "keel",
    "relay",
    "todo-ios",
    "shuttab",
    "cs-stats",
    "zenitsu-bot",
    "hexr",
    "pages-figma",
    "meet",
    "git-time-machine",
    "scrapetron",
    "ipynb-extractor",
    "anomaly-detection"
  ],
  "web": [
    "interactions",
    "margin",
    "contests",
    "api-clinic",
    "dsa-roadmap",
    "dekho-car",
    "qr-generator",
    "youtube-thumbnails",
    "customer-management",
    "codechef-mrec",
    "mcu-timeline"
  ],
  "other": [
    "smart-agriculture",
    "automobile-analytics",
    "block-steam-invites",
    "overthewire",
    "discord-mirror",
    "github-any-year"
  ],
  "portfolios": [
    "portfolio-v5",
    "portfolio-v4",
    "portfolio-v3",
    "portfolio-v2",
    "portfolio-v1"
  ]
};

const slugToGroup: Record<string, string> = {};
for (const [group, slugs] of Object.entries(GROUP_SLUGS)) {
  for (const slug of slugs) slugToGroup[slug] = group;
}

function inferGroup(p: Project): string | null {
  if (slugToGroup[p.slug]) return slugToGroup[p.slug];
  if (p.colors?.length) return 'apps';
  if (p.install && !slugToGroup[p.slug]) return 'apps';
  return null;
}

const loaders: Record<string, React.ComponentType<{ project: Project }>> = {};

function getLoader(group: string) {
  if (!loaders[group]) {
    loaders[group] = dynamic(
      () => import(`./groups/${group}`).then((m) => ({ default: m.GroupWidget })),
      {
        loading: () => (
          <div className="my-8 h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/40" aria-hidden />
        ),
      }
    ) as React.ComponentType<{ project: Project }>;
  }
  return loaders[group];
}

export default function ProjectWidget({ project }: { project: Project }) {
  const group = inferGroup(project);
  if (!group) return null;
  const Loader = getLoader(group);
  return <Loader project={project} />;
}
