import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Content \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Hobbies",
  title: "Content",
  description: "Everything I have uploaded to YouTube.",
  tags: ["YouTube"],
});
