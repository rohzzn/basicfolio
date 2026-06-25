export function decodeSpotifyText(text: string | null | undefined): string {
  if (!text?.trim()) return '';

  if (typeof document !== 'undefined') {
    const element = document.createElement('textarea');
    element.innerHTML = text;
    return element.value.trim();
  }

  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}
