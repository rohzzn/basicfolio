import type { Metadata } from 'next';
import { posts } from '@/data/writing';

const SITE = 'https://rohan.run';

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

export function generatePostMetadata(slug: string): Metadata {
  const post = getPost(slug);
  if (!post) return {};

  const url = `${SITE}/writing/${post.slug}`;

  return {
    title: `${post.title} — Rohan`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
    },
    alternates: { canonical: url },
  };
}
