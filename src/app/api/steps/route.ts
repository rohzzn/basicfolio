import { NextResponse } from 'next/server';
import { getStepsToday, isGoogleHealthConfigured } from '@/lib/google-health';

// The band only syncs every few minutes, so the CDN answers for two of them
// and Google is asked at most that often, however many people are reading.
const CACHE = 'public, s-maxage=120, stale-while-revalidate=600';

export async function GET() {
  if (!isGoogleHealthConfigured()) {
    return NextResponse.json({ steps: null }, { headers: { 'Cache-Control': CACHE } });
  }

  try {
    const steps = await getStepsToday();
    return NextResponse.json({ steps }, { headers: { 'Cache-Control': CACHE } });
  } catch (error) {
    console.error('Steps error:', error);
    return NextResponse.json({ error: 'Failed to fetch steps' }, { status: 502 });
  }
}
