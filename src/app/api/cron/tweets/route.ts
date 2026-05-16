import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KVI_KV_REST_API_URL!,
  token: process.env.KVI_KV_REST_API_TOKEN!,
});

const TWEETS_KEY = 'yapping-tweets';
const X_USERNAME = 'rohzzn';
const RSS_URL = `https://rsshub.app/twitter/user/${X_USERNAME}`;

export interface Tweet {
  id: string;
  text: string;
  date: string;
  displayDate: string;
  url: string;
  images: string[];
  video?: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractMedia(html: string): { images: string[]; video?: string } {
  const images: string[] = [];
  let video: string | undefined;

  // Extract <img src="...">
  const imgRe = /<img[^>]+src="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) !== null) {
    images.push(m[1]);
  }

  // Extract <video src="..."> or <source src="...">
  const videoRe = /<(?:video|source)[^>]+src="([^"]+)"/i;
  const vm = html.match(videoRe);
  if (vm) video = vm[1];

  return { images, video };
}

function extractText(html: string): string {
  // Remove all HTML tags, then decode entities
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim());
}

function parseRSS(xml: string): Tweet[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  const tweets: Tweet[] = [];

  for (const item of items) {
    const titleMatch =
      item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
      item.match(/<title>([\s\S]*?)<\/title>/);

    const linkMatch =
      item.match(/<link>([\s\S]*?)<\/link>/) ||
      item.match(/<guid>([\s\S]*?)<\/guid>/);

    const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    const descMatch =
      item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
      item.match(/<description>([\s\S]*?)<\/description>/);

    const rawDesc = descMatch?.[1] || '';
    const rawTitle = titleMatch?.[1] || '';

    // Extract media from the HTML description before stripping tags
    const { images, video } = extractMedia(rawDesc);

    // Use description HTML for text (has full content), fall back to title
    const text = extractText(rawDesc) || decodeEntities(rawTitle);

    // Skip retweets and empty
    if (!text || text.startsWith('RT @')) continue;

    const url = (linkMatch?.[1] || '').trim();
    const rawDate = (dateMatch?.[1] || '').trim();
    const dateObj = rawDate ? new Date(rawDate) : new Date();

    const urlId = url.match(/status\/(\d+)/)?.[1];
    const id = urlId || `${dateObj.getTime()}-${text.slice(0, 12).replace(/\s/g, '')}`;

    const displayDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    tweets.push({ id, text, date: dateObj.toISOString(), displayDate, url, images, video });
  }

  return tweets;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; basicfolio-bot/1.0)' },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `RSS fetch failed: ${res.status}` },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const fresh = parseRSS(xml);

    if (fresh.length === 0) {
      return NextResponse.json({ message: 'No tweets parsed', stored: 0 });
    }

    // Merge with existing, deduplicate by id, keep latest on top
    const existing: Tweet[] = (await redis.get<Tweet[]>(TWEETS_KEY)) || [];
    const existingIds = new Set(existing.map(t => t.id));
    const newTweets = fresh.filter(t => !existingIds.has(t.id));
    const merged = [...newTweets, ...existing].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    await redis.set(TWEETS_KEY, merged);

    return NextResponse.json({
      message: 'OK',
      fresh: fresh.length,
      stored: merged.length,
      new: newTweets.length,
    });
  } catch (err) {
    console.error('Tweet cron error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
