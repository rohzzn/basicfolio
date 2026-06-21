import React from 'react';
import {
  Award,
  Briefcase,
  Code,
  FileText,
  Gamepad2,
  PenTool,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { posts } from '@/data/writing';
import { projects } from '@/data/projects';

export interface PaletteItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  shortcut?: string;
  action?: () => void;
}

const writingIconBySlug: Record<string, React.ReactNode> = {
  'apple-best-ai-feature': <Sparkles className="w-4 h-4" />,
  'boring-performance': <TrendingUp className="w-4 h-4" />,
  'catan-coop': <Gamepad2 className="w-4 h-4" />,
  'chatgpt-interface': <Sparkles className="w-4 h-4" />,
  'discord-article': <Gamepad2 className="w-4 h-4" />,
  'esports-journey': <Award className="w-4 h-4" />,
  'beginners-guide-design': <PenTool className="w-4 h-4" />,
  'satoshi-font': <PenTool className="w-4 h-4" />,
  'security-article': <Target className="w-4 h-4" />,
  'what-this-site-loads': <TrendingUp className="w-4 h-4" />,
};

function writingIcon(slug: string, category: 'tech' | 'life') {
  if (writingIconBySlug[slug]) return writingIconBySlug[slug];
  if (category === 'life') return <Briefcase className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

function projectIcon(category: string) {
  if (category === 'game') return <Gamepad2 className="w-4 h-4" />;
  if (category === 'application') return <Briefcase className="w-4 h-4" />;
  return <Code className="w-4 h-4" />;
}

export const writingArticles: PaletteItem[] = posts.map((post) => ({
  title: post.title,
  href: `/writing/${post.slug}`,
  icon: writingIcon(post.slug, post.category),
  keywords: [
    post.slug,
    post.category,
    'writing',
    'blog',
    'article',
    ...post.title.toLowerCase().split(/\s+/),
  ],
}));

export const projectLinks: PaletteItem[] = projects.map((project) => ({
  title: project.title,
  href: `/projects/${project.slug}`,
  icon: projectIcon(project.category),
  keywords: [
    project.slug,
    project.category,
    'project',
    ...project.tech.map((t) => t.toLowerCase()),
    ...project.title.toLowerCase().split(/\s+/),
  ],
}));
