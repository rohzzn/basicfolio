import { posts } from '@/data/writing';

const SITE = 'https://rohan.run';

type Props = {
  slug: string;
};

export default function ArticleJsonLd({ slug }: Props) {
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  const url = `${SITE}/writing/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'Rohan',
      url: `${SITE}/about`,
    },
    publisher: {
      '@type': 'Person',
      name: 'Rohan',
      url: SITE,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
    isPartOf: {
      '@type': 'Blog',
      name: "Rohan's Writing",
      url: `${SITE}/writing`,
    },
    articleSection: post.category,
    inLanguage: 'en-US',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
