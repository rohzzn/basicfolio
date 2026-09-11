import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Say hello if you have stopped by \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Guestbook",
  title: "Say hello if you have stopped by",
  description: "I read every message. Sign in with Discord or just leave a name.",
  tags: ["Guestbook"],
});
