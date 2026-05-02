import { NextResponse } from 'next/server';
import { CAL_API_BASE, requireCalApiKey } from '@/lib/cal-config';
import { isSuppressedBookingFieldSlug } from '@/lib/cal-booking-fields';

type BookingField = Record<string, unknown>;

function humanizeDefaultLabel(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function labelOf(f: BookingField): string {
  const lab = typeof f.label === 'string' ? f.label.trim() : '';
  if (lab) return lab;
  const dl = f.defaultLabel;
  if (typeof dl === 'string' && dl.trim()) return humanizeDefaultLabel(dl.trim());
  const slug = typeof f.slug === 'string' ? f.slug : 'Field';
  return slug;
}

export type PublicBookingField = {
  slug: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

function simplifyField(f: BookingField): PublicBookingField | null {
  if (f.hidden === true) return null;
  const slug = typeof f.slug === 'string' ? f.slug.trim() : '';
  if (!slug) return null;
  if (slug === 'name' || slug === 'email') return null;
  if (isSuppressedBookingFieldSlug(slug)) return null;

  const type = typeof f.type === 'string' ? f.type : '';
  const placeholder = typeof f.placeholder === 'string' ? f.placeholder : undefined;
  const options: { value: string; label: string }[] = [];
  if (Array.isArray(f.options)) {
    for (const o of f.options) {
      if (!o || typeof o !== 'object') continue;
      const value = (o as { value?: unknown }).value;
      const lab = (o as { label?: unknown }).label;
      if (typeof value === 'string' && value.length > 0) {
        options.push({ value, label: typeof lab === 'string' && lab.trim() ? lab.trim() : value });
      }
    }
  }

  const baseLabel = labelOf(f);
  const label = slug === 'title' ? 'What is this meeting about?' : baseLabel;

  return {
    slug,
    label,
    type,
    required: f.required === true,
    placeholder,
    options: options.length > 0 ? options : undefined,
  };
}

export async function GET(request: Request) {
  const key = requireCalApiKey();
  if (!key) {
    return NextResponse.json({ ok: false, error: 'missing_api_key' }, { status: 503 });
  }

  const id = new URL(request.url).searchParams.get('eventTypeId');
  const numId = id ? parseInt(id, 10) : NaN;
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: 'invalid_id' }, { status: 400 });
  }

  const res = await fetch(`${CAL_API_BASE}/event-types/${numId}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      'cal-api-version': '2024-06-14',
    },
    cache: 'no-store',
  });

  const json: unknown = await res.json();
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: 'cal_request_failed', details: json }, { status: res.status });
  }

  const raw = json as { status?: string; data?: Record<string, unknown> };
  if (raw.status !== 'success' || !raw.data) {
    return NextResponse.json({ ok: false, error: 'unexpected_response' }, { status: 502 });
  }

  const bookingFieldsRaw = raw.data.bookingFields;
  const bookingFields: PublicBookingField[] = [];
  if (Array.isArray(bookingFieldsRaw)) {
    for (const item of bookingFieldsRaw) {
      if (!item || typeof item !== 'object') continue;
      const s = simplifyField(item as BookingField);
      if (s) bookingFields.push(s);
    }
  }

  return NextResponse.json({
    ok: true,
    eventTitle: typeof raw.data.title === 'string' ? raw.data.title : '',
    bookingFields,
  });
}
