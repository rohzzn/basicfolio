import type { ComponentType } from 'react';

type ArticleModule = { default: ComponentType };

/** Explicit per-slug imports so webpack always bundles every article folder. */
export const articleImports: Record<string, () => Promise<ArticleModule>> = {
  'telugumovies-in': () => import('@/app/writing/telugumovies-in/Article'),
  'apple-best-ai-feature': () => import('@/app/writing/apple-best-ai-feature/Article'),
  'discord-widgets': () => import('@/app/writing/discord-widgets/Article'),
  'linux-home-server': () => import('@/app/writing/linux-home-server/Article'),
  'what-this-site-loads': () => import('@/app/writing/what-this-site-loads/Article'),
  'software-i-admire': () => import('@/app/writing/software-i-admire/Article'),
  'forty-projects': () => import('@/app/writing/forty-projects/Article'),
  'satoshi-font': () => import('@/app/writing/satoshi-font/Article'),
  'moving-to-cincinnati': () => import('@/app/writing/moving-to-cincinnati/Article'),
  'catan-coop': () => import('@/app/writing/catan-coop/Article'),
  'first-spring': () => import('@/app/writing/first-spring/Article'),
  'uc-experience': () => import('@/app/writing/uc-experience/Article'),
  'variables-exposure': () => import('@/app/writing/variables-exposure/Article'),
  'modern-tech-stacks': () => import('@/app/writing/modern-tech-stacks/Article'),
  'security-article': () => import('@/app/writing/security-article/Article'),
  'boring-performance': () => import('@/app/writing/boring-performance/Article'),
  'discord-article': () => import('@/app/writing/discord-article/Article'),
  'esports-journey': () => import('@/app/writing/esports-journey/Article'),
  'chatgpt-interface': () => import('@/app/writing/chatgpt-interface/Article'),
  'ixigo-experience': () => import('@/app/writing/ixigo-experience/Article'),
  'beginners-guide-programming': () => import('@/app/writing/beginners-guide-programming/Article'),
  'beginners-guide-design': () => import('@/app/writing/beginners-guide-design/Article'),
};

export function loadArticle(slug: string) {
  const loader = articleImports[slug];
  if (!loader) return null;
  return loader();
}
