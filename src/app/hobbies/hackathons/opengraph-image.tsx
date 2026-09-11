import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Hackathons \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Hobbies",
  title: "Hackathons",
  description: "Events, sprint builds and the things that came out of them.",
  tags: ["Devpost"],
});
