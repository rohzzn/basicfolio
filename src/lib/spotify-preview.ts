const PREVIEW_URL_REGEX = /https:\/\/p\.scdn\.co\/mp3-preview\/[a-f0-9]+/;

export async function getSpotifyPreviewUrl(trackId: string): Promise<string | null> {
  const response = await fetch(`https://open.spotify.com/track/${trackId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; basicfolio/1.0)',
      Accept: 'text/html',
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const html = await response.text();
  const match = html.match(PREVIEW_URL_REGEX);
  return match?.[0] ?? null;
}
