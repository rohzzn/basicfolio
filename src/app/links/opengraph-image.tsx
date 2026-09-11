import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "On the Internet \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Elsewhere",
  title: "On the Internet",
  description: "Every account worth having \u2014 socials, development, creative, gaming.",
  tags: ["GitHub", "Twitter", "Steam"],
});
