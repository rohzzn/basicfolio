import { ogImageFor } from '@/lib/og-page';

export { size, contentType } from '@/lib/og-page';

export const alt = "Watchlist \u00b7 Rohan";

export default ogImageFor({
  eyebrow: "Hobbies",
  title: "Watchlist",
  description: "Movies, television and anime \u2014 rated as I go, from TMDB and MyAnimeList.",
  tags: ["Films", "TV", "Anime"],
});
