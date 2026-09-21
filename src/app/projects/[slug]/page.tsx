import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';
import { generateProjectMetadata } from '@/lib/project-metadata';
import { sortByLatest } from '@/lib/project-order';
import ProjectDetail from './ProjectDetail';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateProjectMetadata(slug);
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  // the projects either side, in the order the Projects list shows this category
  const order = sortByLatest(projects.filter((p) => p.category === project.category));
  const at = order.findIndex((p) => p.slug === slug);
  const link = (p: (typeof projects)[number] | undefined) => (p ? { slug: p.slug, title: p.title } : undefined);
  return <ProjectDetail project={project} prev={link(order[at - 1])} next={link(order[at + 1])} />;
}
