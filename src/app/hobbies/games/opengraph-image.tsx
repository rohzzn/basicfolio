import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Gaming \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Hobbies",
  title: "Gaming",
  description: "CS2 stats, inventory and clips, plus everything else in the library.",
  tags: ["CS2", "Steam"],
});
