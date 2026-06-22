import { NextResponse } from 'next/server';
import { fetchTweets } from '@/lib/tweets-rss';

export const revalidate = 60;

export async function GET() {
  const tweets = await fetchTweets();

  if (tweets.length === 0) {
    return NextResponse.json(
      { tweets: [], error: 'empty' },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
        },
      }
    );
  }

  return NextResponse.json(
    { tweets },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  );
}
