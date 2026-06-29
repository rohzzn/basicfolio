import type { Metadata } from 'next';
import { projects } from '@/data/projects';

const SITE = 'https://rohan.run';

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function generateProjectMetadata(slug: string): Metadata {
  const project = getProject(slug);
  if (!project) return {};

  const url = `${SITE}/projects/${project.slug}`;
  const imageUrl = project.image.startsWith('http') ? project.image : `${SITE}${project.image}`;

  return {
    title: `${project.title} · Rohan`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      url,
      type: 'website',
      siteName: "Rohan's Personal Website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [imageUrl],
    },
    alternates: { canonical: url },
  };
}
