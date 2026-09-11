import { ogContentType, ogSize, renderOgImage } from '@/lib/og-image';

/**
 * Shared plumbing for the per-page `opengraph-image` routes, so each one is a
 * few lines of copy rather than a copy of the whole template.
 */

export const size = ogSize;
export const contentType = ogContentType;

export interface OgPage {
  eyebrow: string;
  title: string;
  description?: string;
  tags?: string[];
}

export function ogImageFor(page: OgPage) {
  return async function Image() {
    return renderOgImage(page);
  };
}
