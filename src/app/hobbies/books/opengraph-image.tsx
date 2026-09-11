import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Books \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Hobbies",
  title: "Books",
  description: "A few books I have read \u2014 ratings, notes and the lines worth keeping.",
  tags: ["Reading"],
});
