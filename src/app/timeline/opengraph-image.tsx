import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "A long narrow autobiography \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Timeline",
  title: "A long narrow autobiography",
  description: "Every job, degree and side role on one scrollable chart.",
  tags: ["2020", "2026"],
});
