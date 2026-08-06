import { NextResponse, after } from 'next/server';
import {
  loadAllstarClips,
  refreshAllstarClipsFull,
} from '@/lib/allstar-cache';

export const runtime = 'nodejs';
export const revalidate = 3600;
/** Allow enough time for a budgeted parallel fetch on Pro; Hobby still soft-caps in-code. */
export const maxDuration = 30;

export async function GET() {
  try {
    const payload = await loadAllstarClips();

    if (payload.partial || payload.clips.length === 0) {
      // Finish (or seed) the Redis cache after the response goes out.
      after(() => {
        void refreshAllstarClipsFull().catch((err) => {
          console.error('Allstar background refresh failed:', err);
        });
      });
    }

    if (payload.clips.length === 0) {
      return NextResponse.json(
        { clips: [], error: 'empty', fetchedAt: payload.fetchedAt },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          },
        }
      );
    }

    return NextResponse.json(
      {
        clips: payload.clips,
        fetchedAt: payload.fetchedAt,
        partial: payload.partial ?? false,
      },
      {
        headers: {
          'Cache-Control': payload.partial
            ? 'public, s-maxage=60, stale-while-revalidate=300'
            : 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Allstar clips:', error);
    return NextResponse.json(
      { clips: [], error: 'Failed to fetch Allstar clips' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  }
}
