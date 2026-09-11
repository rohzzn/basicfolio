import { projects } from '@/data/projects';
import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = 'Projects · Rohan';

export default ogImageFor({
  eyebrow: 'Projects',
  title: `${projects.length} things I have built`,
  description:
    'Apps, web toys, games and experiments — nearly all of them with a live demo you can poke at.',
  tags: ['Apps', 'Web', 'Games', 'Other'],
});
