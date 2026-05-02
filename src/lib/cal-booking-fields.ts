/**
 * Validates merged `bookingFieldsResponses` against Cal event-type `bookingFields`.
 */

/** Hidden on our UI; server fills defaults before calling Cal (see `applySuppressedBookingFieldDefaults`). */
export const SUPPRESSED_BOOKING_FIELD_SLUGS = ["guests", "location"] as const;

export function isSuppressedBookingFieldSlug(slug: string): boolean {
  return (SUPPRESSED_BOOKING_FIELD_SLUGS as readonly string[]).includes(slug);
}

type BookingField = Record<string, unknown>;

function slugOf(f: BookingField): string | undefined {
  return typeof f.slug === 'string' ? f.slug : undefined;
}

function typeOf(f: BookingField): string {
  return typeof f.type === 'string' ? f.type : '';
}

function labelOf(f: BookingField): string {
  const lab = typeof f.label === 'string' ? f.label.trim() : '';
  if (lab) return lab;
  const dl = f.defaultLabel;
  if (typeof dl === 'string' && dl.trim()) {
    return dl
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const s = slugOf(f);
  return s ?? 'Field';
}

export function validateMergedBookingResponses(
  bookingFields: unknown,
  responses: Record<string, string>
): { ok: true } | { ok: false; message: string } {
  if (!Array.isArray(bookingFields)) return { ok: true };

  for (const item of bookingFields) {
    if (!item || typeof item !== 'object') continue;
    const f = item as BookingField;
    if (f.hidden === true) continue;
    const slug = slugOf(f);
    if (!slug || slug === 'name' || slug === 'email') continue;
    if (isSuppressedBookingFieldSlug(slug)) continue;

    const required = f.required === true;
    const t = typeOf(f);
    const raw = responses[slug];
    const v = typeof raw === 'string' ? raw.trim() : '';

    if (t === 'boolean' || t === 'checkbox') {
      if (!required) continue;
      const b = v.toLowerCase();
      if (b !== 'true' && b !== 'false') {
        return { ok: false, message: `Please choose “${labelOf(f)}”.` };
      }
      continue;
    }

    if (!required) continue;

    if (t === 'number') {
      if (v === '' || Number.isNaN(Number(v))) {
        return { ok: false, message: `Please enter a valid number for “${labelOf(f)}”.` };
      }
      continue;
    }

    if (v.length === 0) {
      return { ok: false, message: `Please fill in “${labelOf(f)}”.` };
    }
  }

  return { ok: true };
}

/**
 * Strips suppressed keys from client input, then sets Cal defaults for guests/location
 * so the booking API still receives valid responses when those fields exist on the event.
 */
export function applySuppressedBookingFieldDefaults(
  bookingFields: unknown,
  merged: Record<string, string>
): void {
  for (const s of SUPPRESSED_BOOKING_FIELD_SLUGS) {
    delete merged[s];
  }
  if (!Array.isArray(bookingFields)) return;

  for (const item of bookingFields) {
    if (!item || typeof item !== 'object') continue;
    const f = item as BookingField;
    if (f.hidden === true) continue;
    const slug = slugOf(f);
    if (!slug || !isSuppressedBookingFieldSlug(slug)) continue;

    if (slug === 'location') {
      const opts = Array.isArray(f.options) ? f.options : [];
      const first = opts[0] as { value?: unknown } | undefined;
      if (first && typeof first.value === 'string' && first.value.length > 0) {
        merged[slug] = first.value;
      }
      continue;
    }

    if (slug === 'guests') {
      merged[slug] = '';
    }
  }
}
