// Writes data/site.json for the ssh app from the site's own data files, so `ssh rohan.my` shows
// what rohan.run shows. Node strips the TypeScript types itself (24+). Run from this folder:
//   node gen-data.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { projects } from '../src/data/projects.ts';
import { posts } from '../src/data/writing.ts';
import { books } from '../src/data/books.ts';

// the order /projects shows: categories in tab order, pinned first, then newest, then by name
const CATEGORIES = [
  ['application', 'Apps'],
  ['web', 'Web'],
  ['game', 'Games'],
  ['other', 'Other'],
];
const byLatest = (a, b) =>
  Boolean(b.pinned) - Boolean(a.pinned) || (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title);

const projectGroups = CATEGORIES.map(([id, label]) => ({
  label,
  projects: projects
    .filter((p) => p.category === id)
    .sort(byLatest)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      year: p.year ?? 0,
      tech: p.tech,
      links: p.links,
      install: p.install ?? '',
      story: (p.longDescription ?? '').trim(),
    })),
}));

const writing = posts.map((p) => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  date: p.displayDate,
  category: p.category,
}));

const favourites = books.map((b) => ({ title: b.title, review: b.review, score: b.score }));

// The links page keeps its groups inline in the page, so they are read out of the source.
const linksSource = readFileSync('../src/app/links/page.tsx', 'utf8');
const linkGroups = [];
for (const line of linksSource.split('\n')) {
  const link = line.match(/\{\s*title:\s*"([^"]+)",\s*description:\s*"([^"]*)",\s*url:\s*"([^"]+)"\s*\}/);
  const group = !link && line.match(/^\s*title:\s*"([^"]+)",\s*$/);
  if (group) linkGroups.push({ label: group[1], links: [] });
  else if (link && linkGroups.length) linkGroups.at(-1).links.push({ title: link[1], description: link[2], url: link[3] });
}

const site = { projectGroups, writing, books: favourites, linkGroups };
writeFileSync('data/site.json', JSON.stringify(site, null, 2) + '\n');
console.log(
  `projects ${projectGroups.reduce((n, g) => n + g.projects.length, 0)}, posts ${writing.length}, books ${favourites.length}, links ${linkGroups.reduce((n, g) => n + g.links.length, 0)} in ${linkGroups.length} groups`
);
