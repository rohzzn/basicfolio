import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Seen \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Hobbies",
  title: "Seen",
  description: "An archive of images I liked.",
  tags: ["Photography"],
});
