import { NextResponse } from 'next/server';
import { getHeartReading, isGoogleHealthConfigured } from '@/lib/google-health';

// The watch only syncs every few minutes, so the CDN answers for two of them
// and Google is asked at most that often, however many people are reading.
const CACHE = 'public, s-maxage=120, stale-while-revalidate=600';

export async function GET() {
  if (!isGoogleHealthConfigured()) {
    return NextResponse.json({ bpm: null, at: null, resting: null }, { headers: { 'Cache-Control': CACHE } });
  }

  try {
    const reading = await getHeartReading();
    return NextResponse.json(reading ?? { bpm: null, at: null, resting: null }, {
      headers: { 'Cache-Control': CACHE },
    });
  } catch (error) {
    console.error('Heart rate error:', error);
    return NextResponse.json({ error: 'Failed to fetch heart rate' }, { status: 502 });
  }
}
