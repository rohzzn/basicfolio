import { notFound } from 'next/navigation';
import { posts } from '@/data/writing';
import ArticleJsonLd from '@/components/ArticleJsonLd';
import { generatePostMetadata, getPost } from '@/lib/post-metadata';

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return generatePostMetadata(slug);
}

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getPost(slug)) notFound();

  const { default: Article } = await import(`@/app/writing/${slug}/Article`);

  return (
    <>
      <ArticleJsonLd slug={slug} />
      <Article />
    </>
  );
}
