import { NextResponse } from 'next/server';
import { CAL_API_BASE, requireCalApiKey } from '@/lib/cal-config';

const MAX_NAME = 120;
const MAX_EMAIL = 254;

export async function POST(request: Request) {
  const key = requireCalApiKey();
  if (!key) {
    return NextResponse.json({ ok: false, error: 'missing_api_key' }, { status: 503 });
  }

  let body: {
    start?: string;
    eventTypeId?: number;
    lengthInMinutes?: number;
    attendee?: { name?: string; email?: string; timeZone?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const { start, eventTypeId, lengthInMinutes, attendee } = body;
  if (!start || typeof start !== 'string' || !attendee?.name || !attendee?.email || !attendee?.timeZone) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }
  if (typeof eventTypeId !== 'number' || !Number.isFinite(eventTypeId)) {
    return NextResponse.json({ ok: false, error: 'missing_event_type_id' }, { status: 400 });
  }

  const name = String(attendee.name).trim().slice(0, MAX_NAME);
  const email = String(attendee.email).trim().slice(0, MAX_EMAIL);
  const timeZone = String(attendee.timeZone).trim();
  if (!name || !email || !timeZone) {
    return NextResponse.json({ ok: false, error: 'invalid_attendee' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    start,
    eventTypeId,
    attendee: { name, email, timeZone },
  };
  if (typeof lengthInMinutes === 'number' && Number.isFinite(lengthInMinutes)) {
    payload.lengthInMinutes = lengthInMinutes;
  }

  const res = await fetch(`${CAL_API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'cal-api-version': '2026-02-25',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json: unknown = await res.json();
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: 'cal_request_failed', details: json }, { status: res.status });
  }

  return NextResponse.json({ ok: true, data: json }, { status: 201 });
}
