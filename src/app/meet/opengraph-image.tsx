import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Book a meet \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Meet",
  title: "Book a meet",
  description: "Fifteen or thirty minutes, whenever suits. Cincinnati time.",
  tags: ["Calendar"],
});
