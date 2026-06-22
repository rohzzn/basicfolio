import { NextResponse } from 'next/server';
import { fetchTweets } from '@/lib/tweets-rss';

export const revalidate = 60;

export async function GET() {
  const { tweets, error } = await fetchTweets();

  if (tweets.length === 0) {
    return NextResponse.json(
      { tweets: [], error: error ?? 'empty' },
      {
        headers: {
          'Cache-Control':
            error === 'unavailable'
              ? 'public, s-maxage=30, stale-while-revalidate=60'
              : 'public, s-maxage=120, stale-while-revalidate=300',
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
