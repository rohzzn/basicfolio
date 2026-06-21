import type { MetadataRoute } from 'next';

const SITE = 'https://rohan.run';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
