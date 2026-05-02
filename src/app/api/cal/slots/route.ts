import { NextResponse } from 'next/server';
import { CAL_API_BASE, calUsername, requireCalApiKey } from '@/lib/cal-config';
import { normalizeCalSlotsPayload } from '@/lib/cal-slots-normalize';

function extractCalErrorMessage(json: unknown): string | undefined {
  if (!json || typeof json !== 'object') return undefined;
  const o = json as Record<string, unknown>;
  const err = o.error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  if (typeof o.message === 'string') return o.message;
  return undefined;
}

export async function GET(request: Request) {
  const key = requireCalApiKey();
  if (!key) {
    return NextResponse.json({ ok: false, error: 'missing_api_key' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const eventTypeId = searchParams.get('eventTypeId');
  const eventTypeSlug = searchParams.get('eventTypeSlug');
  const timeZone = searchParams.get('timeZone') || 'UTC';
  const duration = searchParams.get('duration');
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  if (!eventTypeId && !eventTypeSlug) {
    return NextResponse.json({ ok: false, error: 'missing_event_type' }, { status: 400 });
  }

  const url = new URL(`${CAL_API_BASE}/slots`);
  /** Prefer slug + username — more reliable than eventTypeId alone on some Cal deployments. */
  if (eventTypeSlug) {
    url.searchParams.set('eventTypeSlug', eventTypeSlug);
    url.searchParams.set('username', calUsername());
  } else {
    url.searchParams.set('eventTypeId', eventTypeId!);
  }

  if (startParam && endParam) {
    url.searchParams.set('start', startParam.slice(0, 10));
    url.searchParams.set('end', endParam.slice(0, 10));
  } else {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(start.getTime() + 28 * 24 * 60 * 60 * 1000);
    url.searchParams.set('start', start.toISOString().slice(0, 10));
    url.searchParams.set('end', end.toISOString().slice(0, 10));
  }

  url.searchParams.set('timeZone', timeZone);
  if (duration) url.searchParams.set('duration', duration);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${key}`,
      'cal-api-version': '2024-09-04',
    },
    cache: 'no-store',
  });

  const json: unknown = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: 'cal_request_failed',
        calMessage: extractCalErrorMessage(json),
        details: json,
      },
      { status: res.status }
    );
  }

  const raw = json as { status?: string; data?: unknown };
  if (raw.status !== 'success') {
    return NextResponse.json(
      {
        ok: false,
        error: 'unexpected_response',
        calMessage: extractCalErrorMessage(json),
        details: json,
      },
      { status: 502 }
    );
  }

  const slotsByDate = normalizeCalSlotsPayload(raw.data, timeZone);

  return NextResponse.json({ ok: true, slotsByDate, timeZone });
}
