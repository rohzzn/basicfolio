import { NextResponse } from 'next/server';
import { fetchTweets } from '@/lib/tweets-rss';

// Force-dynamic keeps this off the prerender path at build time — the route
// has no request-scoped API to trigger that automatically, and the upstream
// Nitter bridge being unreachable during a build hung the build itself.
// Cache-Control headers below already handle CDN-level caching.
export const dynamic = 'force-dynamic';

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
