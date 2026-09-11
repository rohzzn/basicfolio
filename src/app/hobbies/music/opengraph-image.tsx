import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Music \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Hobbies",
  title: "Music",
  description: "Spotify listening stats, top artists and the playlists behind them.",
  tags: ["Spotify"],
});
