import fs from 'fs';
import path from 'path';

const root = path.resolve('src/app/projects/[slug]');
const lines = fs.readFileSync(path.join(root, 'ProjectDetail.tsx'), 'utf8').split('\n');

const sharedHeader = `'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Copy, Check, RefreshCcw } from 'lucide-react';
import type { Project } from '@/data/projects';

export function useCopy(ms = 1400) {
  const [id, setId] = useState('');
  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setId(key); setTimeout(() => setId(''), ms);
  };
  return { copied: id, copy };
}

export const L = 'text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3';
export const CARD = 'border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden';

`;

const slice = (from, to) => lines.slice(from - 1, to).join('\n');

const groups = {
  games: {
    code: slice(64, 366),
    getWidget: `export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'dock-poker') return <DockPokerDemo />;
  if (slug === 'catan-online') return <CatanProbabilityDemo />;
  if (slug === 'wordle') return <MiniWordle />;
  if (slug === 'pokedex') return <PokedexTypeDemo />;
  if (slug === 'pokemon-platformer') return <PokemonKeyDemo />;
  if (slug === 'greed-island-dex') return <GreedIslandDemo />;
  return null;
}`,
  },
  web: {
    code: [slice(367, 504), slice(936, 1230)].join('\n\n'),
    getWidget: `export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'interactions') return <InteractionsDemo />;
  if (slug === 'margin') return <MarginDemo />;
  if (slug === 'contests') return <ContestsDemo />;
  if (slug === 'api-clinic') return <ApiClinicDemo />;
  if (slug === 'dsa-roadmap') return <DSARoadmapDemo />;
  if (slug === 'dekho-car') return <DekhoCarDemo />;
  if (slug === 'qr-generator') return <QRDemo />;
  if (slug === 'youtube-thumbnails') return <YoutubeThumbnailDemo />;
  if (slug === 'customer-management') return <CustomerManagementDemo />;
  if (slug === 'codechef-mrec') return <CodeChefDemo />;
  if (slug === 'mcu-timeline') return <MCUTimelineDemo />;
  return null;
}`,
  },
  apps: {
    code: [slice(505, 935), slice(1001, 1035), slice(1297, 1329), slice(1483, 1545), slice(1651, 1703)].join('\n\n'),
    getWidget: `export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'keel') return <KeelDemo />;
  if (slug === 'relay') return <RelayDemo />;
  if (slug === 'todo-ios') return <TodoKanbanDemo />;
  if (slug === 'shuttab') return <ShutTabDemo />;
  if (slug === 'cs-stats') return <CSStatsDemo />;
  if (slug === 'zenitsu-bot') return <>{p.commands && <ZenitsuBotDemo />}{p.commands && <CommandList commands={p.commands} label="Bot Commands" />}</>;
  if (p.colors?.length) return <>{<TanoshiColorPalette colors={p.colors} />}<TanoshiSyntaxPreview colors={p.colors} /></>;
  if (slug === 'hexr') return <HexrDemo />;
  if (slug === 'pages-figma') return <PagesReorderDemo />;
  if (slug === 'meet') return <MeetDemo />;
  if (slug === 'git-time-machine') return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<GitTimeMachineDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'scrapetron') return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<ScrapetronDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'ipynb-extractor') return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<IpynbDemo />{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  if (slug === 'customer-management') return null;
  if (slug === 'anomaly-detection') return <AnomalyDetectionDemo />;
  if (p.install) return <>{<TerminalInstall install={p.install} packageType={p.packageType} />}{p.commands && <CommandList commands={p.commands} label="CLI Reference" />}</>;
  return null;
}`,
  },
  other: {
    code: slice(1231, 1482),
    getWidget: `export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'smart-agriculture') return <SmartAgricultureDemo />;
  if (slug === 'automobile-analytics') return <AutomobileAnalyticsDemo />;
  if (slug === 'block-steam-invites') return <BlockSteamDemo />;
  if (slug === 'overthewire') return <OverTheWireDemo />;
  if (slug === 'discord-mirror') return <DiscordMirrorDemo />;
  if (slug === 'github-any-year') return <>{p.install && <TerminalInstall install={p.install} packageType={p.packageType} />}<GitHubAnyYearDemo /></>;
  return null;
}`,
  },
  portfolios: {
    code: slice(1547, 1649),
    getWidget: `export function getWidget(p: Project): React.ReactNode {
  const slug = p.slug;
  if (slug === 'portfolio-v5') return <Portfolio5Demo />;
  if (slug === 'portfolio-v4') return <Portfolio4Demo />;
  if (slug === 'portfolio-v3') return <Portfolio3Demo />;
  if (slug === 'portfolio-v2') return <Portfolio2Demo />;
  if (slug === 'portfolio-v1') return <Portfolio1Demo />;
  return null;
}`,
  },
};

const SLUG_GROUPS = {
  games: ['dock-poker', 'catan-online', 'wordle', 'pokedex', 'pokemon-platformer', 'greed-island-dex'],
  apps: ['keel', 'relay', 'todo-ios', 'shuttab', 'cs-stats', 'zenitsu-bot', 'hexr', 'pages-figma', 'meet', 'git-time-machine', 'scrapetron', 'ipynb-extractor', 'customer-management', 'anomaly-detection'],
  web: ['interactions', 'margin', 'contests', 'api-clinic', 'dsa-roadmap', 'dekho-car', 'qr-generator', 'youtube-thumbnails', 'customer-management', 'codechef-mrec', 'mcu-timeline'],
  other: ['smart-agriculture', 'automobile-analytics', 'block-steam-invites', 'overthewire', 'discord-mirror', 'github-any-year'],
  portfolios: ['portfolio-v5', 'portfolio-v4', 'portfolio-v3', 'portfolio-v2', 'portfolio-v1'],
};

const outDir = path.join(root, 'project-demos');
const groupsDir = path.join(outDir, 'groups');
fs.mkdirSync(groupsDir, { recursive: true });

for (const [name, { code, getWidget }] of Object.entries(groups)) {
  fs.writeFileSync(
    path.join(groupsDir, `${name}.tsx`),
    `${sharedHeader}\n${code}\n\n${getWidget}\n\nexport function GroupWidget({ project }: { project: Project }) {\n  return <>{getWidget(project)}</>;\n}\n`
  );
}

const loader = `'use client';
import dynamic from 'next/dynamic';
import type { Project } from '@/data/projects';

const GROUP_SLUGS: Record<string, string[]> = ${JSON.stringify(SLUG_GROUPS, null, 2)};

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

const loaders: Record<string, ReturnType<typeof dynamic>> = {};

function getLoader(group: string) {
  if (!loaders[group]) {
    loaders[group] = dynamic(
      () => import(\`./groups/\${group}\`).then((m) => ({ default: m.GroupWidget })),
      {
        loading: () => (
          <div className="my-8 h-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800/40" aria-hidden />
        ),
      }
    );
  }
  return loaders[group];
}

export default function ProjectWidget({ project }: { project: Project }) {
  const group = inferGroup(project);
  if (!group) return null;
  const Loader = getLoader(group);
  return <Loader project={project} />;
}
`;

fs.writeFileSync(path.join(outDir, 'ProjectWidget.tsx'), loader);

const shell = `"use client";
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
          <Github className="w-3.5 h-3.5" />source
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
`;

fs.writeFileSync(path.join(root, 'ProjectDetail.tsx'), shell);
console.log('Project demos split into', Object.keys(groups).length, 'groups');
