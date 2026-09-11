import { posts } from '@/data/writing';
import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = 'Writing · Rohan';

export default ogImageFor({
  eyebrow: 'Writing',
  title: `${posts.length} essays on code and life`,
  description:
    'Long-form notes on what I build, what I break, and everything in between.',
  tags: ['Tech', 'Life'],
});
