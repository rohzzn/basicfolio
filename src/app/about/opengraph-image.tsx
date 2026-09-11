import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Software engineer in Cincinnati \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Rohan Pothuru",
  title: "Software engineer in Cincinnati",
  description: "CS grad student at the University of Cincinnati, working part-time in healthcare tech. Projects, writing and far too many hobbies.",
  tags: ["Projects", "Writing", "Hobbies"],
});
