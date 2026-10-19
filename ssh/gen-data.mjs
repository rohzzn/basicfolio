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

// A post's words, read out of its Article.tsx: headings, paragraphs, list items and code blocks in
// order, inline markup flattened to text. An interactive component or a video becomes a pointer to
// the post on rohan.run, since a terminal cannot show it.
const ENTITIES = { apos: "'", quot: '"', amp: '&', lt: '<', gt: '>', nbsp: ' ', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', hellip: '…', mdash: ', ', ndash: '-', middot: '·', rarr: '→', larr: '←', times: '×' };
const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENTITIES[e] ?? m
  );
function flatten(jsx, keepLines = false) {
  if (keepLines) {
    // a code block: <pre><code>{`...`}</code></pre>, the template literal kept whole
    const code = jsx.trim().replace(/^<code[^>]*>([\s\S]*)<\/code>$/, '$1').trim();
    if (code.startsWith('{`') && code.endsWith('`}')) return code.slice(2, -2).replace(/\\`/g, '`').replace(/^\n+|\s+$/g, '');
  }
  let s = jsx
    .replace(/\{\s*`([^`]*)`\s*\}/g, '$1') // {`code`}
    .replace(/\{\s*(['"])((?:\\.|(?!\1).)*)\1\s*\}/g, '$2') // {' '} and {"text"}
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // {/* comments */}
    .replace(/\{[^{}]*\}/g, '') // other expressions
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '');
  s = decode(s);
  return keepLines ? s.replace(/^\n+|\s+$/g, '') : s.replace(/\s+/g, ' ').replace(/ ([:;,.!?)])/g, '$1').trim();
}
const INLINE = new Set(['Link', 'Code', 'Image', 'Shot', 'PostReads', 'PostFilm', 'React']);
function postBody(slug) {
  let src;
  try {
    src = readFileSync(`../src/app/writing/${slug}/Article.tsx`, 'utf8');
  } catch {
    return [];
  }
  const start = src.indexOf('<PostFilm');
  if (start >= 0) src = src.slice(start);
  const blocks = [];
  const open = /<(h2|h3|p|li|pre|video)\b|<([A-Z][A-Za-z0-9]*)\b/g;
  let m;
  while ((m = open.exec(src))) {
    const tag = m[1];
    if (tag === 'video') {
      blocks.push({ t: 'embed', text: 'A video plays here' });
      open.lastIndex = src.indexOf('</video>', m.index) + 1 || src.length;
      continue;
    }
    if (tag) {
      const close = src.indexOf(`</${tag}>`, m.index);
      if (close < 0) continue;
      const inner = src.slice(src.indexOf('>', m.index) + 1, close);
      const text = flatten(inner, tag === 'pre');
      if (text) blocks.push({ t: tag === 'h3' ? 'h' : tag === 'h2' ? 'h' : tag, text });
      open.lastIndex = close + tag.length + 3;
      continue;
    }
    if (INLINE.has(m[2])) continue;
    if (blocks.at(-1)?.t !== 'embed') blocks.push({ t: 'embed', text: 'An interactive part of this post' });
    // skip past the component, self-closing or with children
    const selfClose = src.indexOf('/>', m.index), childClose = src.indexOf(`</${m[2]}>`, m.index);
    const nextTag = src.indexOf('<', m.index + 1);
    open.lastIndex = childClose > 0 && (selfClose < 0 || nextTag < selfClose) ? childClose : selfClose > 0 ? selfClose : m.index + 1;
  }
  return blocks;
}

const writing = posts.map((p) => {
  const body = postBody(p.slug);
  const words = body.filter((b) => b.t !== 'embed').reduce((n, b) => n + b.text.split(/\s+/).length, 0);
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.displayDate,
    category: p.category,
    words,
    body,
  };
});

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

// new projects go in at the top of projects.ts, so its file order (pinned ones aside) is newest first
const latestProjects = projects.filter((p) => !p.pinned).slice(0, 2).map((p) => p.slug);

const site = { projectGroups, latestProjects, writing, books: favourites, linkGroups };
writeFileSync('data/site.json', JSON.stringify(site, null, 2) + '\n');
console.log(
  `projects ${projectGroups.reduce((n, g) => n + g.projects.length, 0)}, posts ${writing.length}, books ${favourites.length}, links ${linkGroups.reduce((n, g) => n + g.links.length, 0)} in ${linkGroups.length} groups`
);
