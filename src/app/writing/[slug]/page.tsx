import { notFound } from 'next/navigation';
import { posts } from '@/data/writing';
import ArticleJsonLd from '@/components/ArticleJsonLd';
import { generatePostMetadata, getPost } from '@/lib/post-metadata';
import { loadArticle } from '@/lib/writing-articles';

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

  const articleModule = await loadArticle(slug);
  if (!articleModule) notFound();
  const { default: Article } = articleModule;

  return (
    <>
      <ArticleJsonLd slug={slug} />
      <Article />
    </>
  );
}
