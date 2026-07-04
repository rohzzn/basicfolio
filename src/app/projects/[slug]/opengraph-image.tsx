import { projects } from '@/data/projects';
import { ogSize, ogContentType, renderOgImage } from '@/lib/og-image';

const CATEGORY_LABEL: Record<string, string> = {
  application: 'Apps',
  web: 'Web',
  game: 'Games',
  other: 'Other',
};

export const size = ogSize;
export const contentType = ogContentType;
export const alt = 'Project preview';

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  return renderOgImage({
    eyebrow: project ? `Project · ${CATEGORY_LABEL[project.category] ?? project.category}` : 'Project',
    title: project?.title ?? 'Rohan',
    description: project?.description,
    tags: project?.tech,
  });
}
