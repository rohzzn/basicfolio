import type { TweetItem, TweetMedia } from '@/lib/tweets-types';

export type { TweetItem, TweetMedia };

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, '')
    .trim();
}

function stripHtml(text: string): string {
  return decodeXml(text).replace(/\s+/g, ' ').trim();
}

function tagValue(block: string, tag: string): string {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))</${tag}>`, 'i')
  );
  return (match?.[1] ?? match?.[2] ?? '').trim();
}

function formatDisplayDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toXLink(path: string): string {
  const match = path.match(/\/([^/]+)\/status\/(\d+)/);
  if (match) return `https://x.com/${match[1]}/status/${match[2]}`;
  return path;
}

function normalizePicPath(picSrc: string): string {
  if (!picSrc.startsWith('/pic/')) return picSrc;

  try {
    return decodeURIComponent(picSrc);
  } catch {
    return picSrc;
  }
}

function toMediaProxyUrl(picSrc: string): string {
  return `/api/writing/tweets/media?src=${encodeURIComponent(normalizePicPath(picSrc))}`;
}

function toVideoProxyUrl(videoUrl: string): string {
  return `/api/writing/tweets/video?src=${encodeURIComponent(videoUrl)}`;
}

function extractVideoUrl(attachmentHtml: string): string | undefined {
  const match = attachmentHtml.match(/class="video-download"[^>]+href="([^"]+)"/i);
  if (!match?.[1]) return undefined;

  const encodedUrl = match[1].replace(/^\/video\/[^/]+\//, '');
  try {
    return decodeURIComponent(encodedUrl);
  } catch {
    return undefined;
  }
}

function extractNitterMedia(chunk: string): TweetMedia[] {
  const attachmentHtml =
    chunk.match(/class="attachments[\s\S]*?(?=<div class="tweet-stats")/i)?.[0] ?? '';
  if (!attachmentHtml) return [];

  return extractMediaFromHtml(attachmentHtml);
}

function normalizeTweetText(text: string, media: TweetMedia[]): string {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed === 'Video' && media.some((item) => item.type === 'video')) {
    return '';
  }
  return trimmed;
}

function extractMediaFromHtml(html: string): TweetMedia[] {
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)]
    .map((match) => match[1])
    .filter((src) => src.includes('/pic/') && !src.includes('profile_images'));

  if (images.length === 0) return [];

  const isVideo = /gallery-video|video-download|amplify_video_thumb|tweet_video_thumb|<br>Video<br>/i.test(
    html
  );
  const videoUrl = extractVideoUrl(html);

  const toPicPath = (src: string): string => {
    try {
      const url = new URL(src, 'http://nitter.local');
      return normalizePicPath(`${url.pathname}${url.search}`);
    } catch {
      return normalizePicPath(src.startsWith('/pic/') ? src : '');
    }
  };

  if (isVideo) {
    return [
      {
        type: 'video',
        previewUrl: toMediaProxyUrl(toPicPath(images[0])),
        videoUrl: videoUrl ? toVideoProxyUrl(videoUrl) : undefined,
      },
    ];
  }

  return images.map((src) => ({
    type: 'photo' as const,
    previewUrl: toMediaProxyUrl(toPicPath(src)),
  }));
}

function parseTweetDate(rawDate: string): { isoDate: string; displayDate: string } {
  const normalizedDate = rawDate
    .replace(/\uFFFD/g, ' ')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const parsedDate = normalizedDate ? new Date(normalizedDate) : new Date(NaN);
  const isoDate = Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString();

  return {
    isoDate,
    displayDate: isoDate ? formatDisplayDate(parsedDate) : '',
  };
}

function isValidTweet(text: string, media: TweetMedia[]): boolean {
  return Boolean(text) || media.length > 0;
}

export function parseRssItems(xml: string): TweetItem[] {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  const items = blocks
    .map((block) => {
      const rawLink = tagValue(block, 'link');
      const pubDate = tagValue(block, 'pubDate');
      const rawDescription = tagValue(block, 'description');
      const media = extractMediaFromHtml(rawDescription);
      const text = normalizeTweetText(stripHtml(rawDescription), media);

      const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="([^"]+)"/i);
      if (enclosure && media.length === 0) {
        media.push({
          type: enclosure[2]?.startsWith('video/') ? 'video' : 'photo',
          previewUrl: enclosure[1],
        });
      }

      const link = toXLink(rawLink.replace(/#.*$/, ''));

      if (!link || !isValidTweet(text, media)) return null;

      const isoDate = pubDate ? new Date(pubDate).toISOString() : '';

      return {
        id: link,
        text,
        link,
        date: isoDate,
        displayDate: pubDate ? formatDisplayDate(pubDate) : '',
        media: media.length > 0 ? media : undefined,
      };
    })
    .filter((item): item is TweetItem => item !== null);

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Nitter RSS is often empty even when the profile page has tweets. */
export function parseNitterHtml(html: string): TweetItem[] {
  const blocks = html.split(/<div class="timeline-item\s*"/i).slice(1);

  const items = blocks
    .map((chunk) => {
      const linkMatch = chunk.match(/class="tweet-link"\s+href="([^"]+)"/i);
      const contentMatch = chunk.match(/class="tweet-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      const dateMatch = chunk.match(/class="tweet-date"><a[^>]+title="([^"]+)"/i);

      const path = linkMatch?.[1]?.trim();
      const rawText = contentMatch?.[1] ? stripHtml(contentMatch[1]) : '';
      const media = extractNitterMedia(chunk);
      const text = normalizeTweetText(rawText, media);

      if (!path || !isValidTweet(text, media)) return null;

      const link = toXLink(path);
      const { isoDate, displayDate } = parseTweetDate(dateMatch?.[1] ?? '');

      return {
        id: link,
        text,
        link,
        date: isoDate,
        displayDate,
        media: media.length > 0 ? media : undefined,
      };
    })
    .filter((item): item is TweetItem => item !== null);

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getTweetsRssUrl(): string {
  return process.env.TWEETS_RSS_URL ?? 'http://192.168.1.63:8087/rohzzn/rss';
}

export function getTweetsProfileUrl(): string {
  return getTweetsRssUrl().replace(/\/rss\/?$/, '');
}

export async function fetchTweets(): Promise<TweetItem[]> {
  const rssUrl = getTweetsRssUrl();
  const profileUrl = getTweetsProfileUrl();

  try {
    const htmlResponse = await fetch(profileUrl, {
      next: { revalidate: 60 },
      headers: { Accept: 'text/html' },
    });

    if (htmlResponse.ok) {
      const tweets = parseNitterHtml(await htmlResponse.text());
      if (tweets.length > 0) return tweets;
    }
  } catch (error) {
    console.error('Failed to fetch Nitter profile HTML:', error);
  }

  try {
    const rssResponse = await fetch(rssUrl, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    });

    if (rssResponse.ok) {
      return parseRssItems(await rssResponse.text());
    }
  } catch (error) {
    console.error('Failed to fetch tweets RSS:', error);
  }

  return [];
}
