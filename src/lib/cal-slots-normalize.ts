/**
 * Cal.com /v2/slots returns `data` as either:
 * - A map of YYYY-MM-DD → slot entries (objects with `start`, or ISO strings), or
 * - An array of `{ start, end? }` (alternate responses — e.g. GitHub #23770).
 */
export function normalizeCalSlotsPayload(
  data: unknown,
  timeZone: string
): Record<string, string[]> {
  const byDate: Record<string, string[]> = {};

  const dateKeyForStart = (isoStart: string): string =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(isoStart));

  const push = (dateKey: string, startIso: string) => {
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(startIso);
  };

  const pushFromStartIso = (startIso: string) => {
    const dk = dateKeyForStart(startIso);
    push(dk, startIso);
  };

  if (data == null) return byDate;

  if (Array.isArray(data)) {
    for (const item of data) {
      if (!item || typeof item !== "object") continue;
      const s = (item as { start?: unknown }).start;
      if (typeof s === "string" && s.length > 0) pushFromStartIso(s);
    }
    for (const k of Object.keys(byDate)) byDate[k].sort();
    return byDate;
  }

  if (typeof data !== "object") return byDate;

  let map = data as Record<string, unknown>;
  const maybeSlots = (map as { slots?: unknown }).slots;
  if (Array.isArray(maybeSlots)) {
    return normalizeCalSlotsPayload(maybeSlots, timeZone);
  }
  if (maybeSlots && typeof maybeSlots === "object" && !Array.isArray(maybeSlots)) {
    map = maybeSlots as Record<string, unknown>;
  }

  for (const [dateKey, arr] of Object.entries(map)) {
    if (!Array.isArray(arr)) continue;
    for (const item of arr) {
      if (typeof item === "string" && item.length > 0) {
        push(dateKey, item);
        continue;
      }
      if (item && typeof item === "object" && typeof (item as { start: unknown }).start === "string") {
        const s = (item as { start: string }).start;
        if (s) push(dateKey, s);
      }
    }
  }

  for (const k of Object.keys(byDate)) byDate[k].sort();
  return byDate;
}
