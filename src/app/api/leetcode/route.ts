import { NextResponse } from 'next/server';

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  try {
    const res = await fetch('https://leetcode-stats-api.herokuapp.com/rohzzn', {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch LeetCode stats' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
