import type { MetadataRoute } from 'next';
import { posts } from '@/data/writing';
import { projects } from '@/data/projects';

const SITE = 'https://rohan.run';

/** Public routes only (no /admin). */
const STATIC_PATHS: string[] = [
  '/',
  '/about',
  '/meet',
  '/guestbook',
  '/links',
  '/resume',
  '/timeline',
  '/focus',
  '/projects',
  '/writing',
  '/hobbies',
  '/hobbies/strava',
  '/hobbies/readings',
  '/hobbies/games',
  '/hobbies/content',
  '/hobbies/hackathons',
  '/hobbies/clips',
  '/hobbies/photos',
  '/hobbies/watchlist',
  '/hobbies/typing',
  '/hobbies/archive',
  '/hobbies/art',
  '/hobbies/music',
  '/hobbies/uses',
  '/hobbies/watch',
  '/hobbies/screen',
  '/hobbies/myanimelist',
  '/hobbies/letterboxd',
  '/hobbies/ben10',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/about' || path === '/writing' || path === '/projects' ? 0.9 : 0.7,
  }));

  const writingEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE}/writing/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly' as const,
    priority: 0.75,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...writingEntries, ...projectEntries];
}
