import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import type { Tweet } from '@/app/api/cron/tweets/route';

const redis = new Redis({
  url: process.env.KVI_KV_REST_API_URL!,
  token: process.env.KVI_KV_REST_API_TOKEN!,
});

const TWEETS_KEY = 'yapping-tweets';

export async function GET() {
  try {
    const tweets = (await redis.get<Tweet[]>(TWEETS_KEY)) || [];
    const res = NextResponse.json({ tweets });
    res.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res;
  } catch {
    return NextResponse.json({ tweets: [] });
  }
}
