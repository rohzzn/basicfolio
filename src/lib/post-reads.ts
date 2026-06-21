import { posts } from '@/data/writing';
import { getRedis, isRedisAvailable } from '@/lib/redis';

const validSlugs = new Set(posts.map((post) => post.slug));

export function isValidPostSlug(slug: string): boolean {
  return validSlugs.has(slug);
}

export function isReadsStorageAvailable(): boolean {
  return isRedisAvailable();
}

export function viewsKey(slug: string): string {
  return `writing:views:${slug}`;
}

export async function getReadCount(slug: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  try {
    const count = await redis.get<number>(viewsKey(slug));
    return typeof count === 'number' ? count : 0;
  } catch (error) {
    console.error('Error reading post view count:', error);
    return 0;
  }
}

export async function incrementReadCount(slug: string): Promise<number | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    return await redis.incr(viewsKey(slug));
  } catch (error) {
    console.error('Error incrementing post view count:', error);
    return null;
  }
}

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|HeadlessChrome/i.test(userAgent);
}

export function readCookieName(slug: string): string {
  return `post_read_${slug}`;
}
