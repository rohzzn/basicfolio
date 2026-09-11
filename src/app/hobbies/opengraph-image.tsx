import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "What I do when I'm not shipping \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Hobbies",
  title: "What I do when I'm not shipping",
  description: "Lifting, typing, reading, watching, gaming, designing \u2014 tracked in public.",
  tags: ["Move", "Books", "Music", "Gaming"],
});
