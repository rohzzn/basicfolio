import { NextResponse } from 'next/server';
import { loadAllstarClips } from '@/lib/allstar-cache';

export const revalidate = 3600;
export const maxDuration = 60;

export async function GET() {
  try {
    const { clips, fetchedAt } = await loadAllstarClips();

    return NextResponse.json(
      { clips, fetchedAt },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Allstar clips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Allstar clips' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  }
}
