import { NextResponse } from 'next/server';
import { CAL_API_BASE, calUsername, requireCalApiKey } from '@/lib/cal-config';

export async function GET() {
  const key = requireCalApiKey();
  if (!key) {
    return NextResponse.json({ ok: false, error: 'missing_api_key' }, { status: 503 });
  }

  const username = calUsername();
  const url = new URL(`${CAL_API_BASE}/event-types`);
  url.searchParams.set('username', username);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${key}`,
      'cal-api-version': '2024-06-14',
    },
    next: { revalidate: 120 },
  });

  const json: unknown = await res.json();
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: 'cal_request_failed', details: json }, { status: res.status });
  }

  const raw = json as { status?: string; data?: Array<Record<string, unknown>> };
  if (raw.status !== 'success' || !Array.isArray(raw.data)) {
    return NextResponse.json({ ok: false, error: 'unexpected_response', details: json }, { status: 502 });
  }

  const eventTypes = raw.data
    .filter((e) => !e.hidden)
    .map((e) => ({
      id: e.id as number,
      slug: e.slug as string,
      title: e.title as string,
      lengthInMinutes: e.lengthInMinutes as number,
      lengthInMinutesOptions: (e.lengthInMinutesOptions as number[] | undefined) ?? undefined,
    }));

  return NextResponse.json({ ok: true, eventTypes });
}
