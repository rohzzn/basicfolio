import { NextResponse } from 'next/server';
import { getStepsToday, isGoogleHealthConfigured } from '@/lib/google-health';

// The page asks every 30 seconds, and the CDN answers for those 30 seconds so
// Google is asked at most that often, however many people are reading.
const CACHE = 'public, s-maxage=30, stale-while-revalidate=600';

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
