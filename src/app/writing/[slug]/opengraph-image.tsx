import { getPost } from '@/lib/post-metadata';
import { ogSize, ogContentType, renderOgImage } from '@/lib/og-image';
import { posts } from '@/data/writing';

export const size = ogSize;
export const contentType = ogContentType;
export const alt = 'Article preview';

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  return renderOgImage({
    eyebrow: post ? `Writing · ${post.category === 'tech' ? 'Tech' : 'Life'}` : 'Writing',
    title: post?.title ?? 'Rohan',
    description: post?.description,
    tags: post ? [post.displayDate] : undefined,
  });
}
