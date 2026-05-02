import { NextResponse } from 'next/server';
import { CAL_API_BASE, calUsername, requireCalApiKey } from '@/lib/cal-config';
import { applySuppressedBookingFieldDefaults, validateMergedBookingResponses } from '@/lib/cal-booking-fields';

const MAX_NAME = 120;
const MAX_EMAIL = 254;

function extractCalMessage(json: unknown): string | undefined {
  if (!json || typeof json !== 'object') return undefined;
  const o = json as Record<string, unknown>;
  const err = o.error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
  }
  if (typeof o.message === 'string') return o.message;
  const details = o.details;
  if (details && typeof details === 'object' && 'message' in details) {
    const m = (details as { message: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return undefined;
}

async function fetchEventTypeJson(eventTypeId: number, apiKey: string): Promise<unknown | null> {
  const res = await fetch(`${CAL_API_BASE}/event-types/${eventTypeId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'cal-api-version': '2024-06-14',
    },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function POST(request: Request) {
  const key = requireCalApiKey();
  if (!key) {
    return NextResponse.json({ ok: false, error: 'missing_api_key' }, { status: 503 });
  }

  let body: {
    start?: string;
    eventTypeId?: number;
    eventTypeSlug?: string;
    lengthInMinutes?: number;
    attendee?: { name?: string; email?: string; timeZone?: string };
    bookingFieldsResponses?: Record<string, string>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const { start, eventTypeId, eventTypeSlug, lengthInMinutes, attendee, bookingFieldsResponses: clientFields } = body;
  if (!start || typeof start !== 'string' || !attendee?.name || !attendee?.email || !attendee?.timeZone) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }
  if (typeof eventTypeId !== 'number' || !Number.isFinite(eventTypeId)) {
    return NextResponse.json({ ok: false, error: 'missing_event_type_id' }, { status: 400 });
  }
  const slug =
    typeof eventTypeSlug === 'string' && eventTypeSlug.trim().length > 0 ? eventTypeSlug.trim() : undefined;
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'missing_event_type_slug' }, { status: 400 });
  }

  const name = String(attendee.name).trim().slice(0, MAX_NAME);
  const email = String(attendee.email).trim().slice(0, MAX_EMAIL);
  const timeZone = String(attendee.timeZone).trim();
  if (!name || !email || !timeZone) {
    return NextResponse.json({ ok: false, error: 'invalid_attendee' }, { status: 400 });
  }

  let startUtc: string;
  try {
    const d = new Date(start);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ ok: false, error: 'invalid_start' }, { status: 400 });
    }
    startUtc = d.toISOString();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_start' }, { status: 400 });
  }

  const etJson = await fetchEventTypeJson(eventTypeId, key);
  const etWrap = etJson as { status?: string; data?: Record<string, unknown> } | null;
  if (etWrap?.status === 'success' && etWrap.data && etWrap.data.bookingRequiresAuthentication === true) {
    return NextResponse.json(
      {
        ok: false,
        error: 'booking_requires_auth',
        calMessage: 'This event type only allows authenticated hosts to book via the API. Turn off “requires authentication” for API bookings, or use your public booking link.',
      },
      { status: 403 }
    );
  }

  const mergedFields: Record<string, string> = {};
  if (clientFields && typeof clientFields === 'object') {
    for (const [k, v] of Object.entries(clientFields)) {
      if (typeof v === 'string') mergedFields[k] = v;
    }
  }

  applySuppressedBookingFieldDefaults(
    etWrap?.status === 'success' ? etWrap.data?.bookingFields : undefined,
    mergedFields
  );

  if (etWrap?.status === 'success' && etWrap.data?.bookingFields) {
    const check = validateMergedBookingResponses(etWrap.data.bookingFields, mergedFields);
    if (!check.ok) {
      return NextResponse.json({ ok: false, error: 'booking_fields', calMessage: check.message }, { status: 400 });
    }
  }

  const username = calUsername();
  const payload: Record<string, unknown> = {
    start: startUtc,
    eventTypeSlug: slug,
    username,
    attendee: { name, email, timeZone, language: 'en' },
  };
  if (Object.keys(mergedFields).length > 0) {
    payload.bookingFieldsResponses = mergedFields;
  }
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
    return NextResponse.json(
      {
        ok: false,
        error: 'cal_request_failed',
        calMessage: extractCalMessage(json),
        details: json,
      },
      { status: res.status }
    );
  }

  const out = json as { status?: string };
  if (out.status === 'error') {
    return NextResponse.json(
      {
        ok: false,
        error: 'cal_booking_error',
        calMessage: extractCalMessage(json),
        details: json,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, data: json }, { status: 201 });
}
