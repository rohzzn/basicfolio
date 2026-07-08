import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRohanComponent, rohanComponents } from "@/data/rohan-components";
import ComponentDoc from "./ComponentDoc";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return rohanComponents.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const component = getRohanComponent(slug);
  if (!component) return { title: "Component not found" };
  return {
    title: `${component.name} — Components`,
    description: component.description,
  };
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params;
  const component = getRohanComponent(slug);
  if (!component) notFound();
  return <ComponentDoc component={component} />;
}
