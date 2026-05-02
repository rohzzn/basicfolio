"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type EventType = {
  id: number;
  slug: string;
  title: string;
  lengthInMinutes: number;
  lengthInMinutesOptions?: number[];
};

type PublicBookingField = {
  slug: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

type SlotsPayload = { ok: true; slotsByDate: Record<string, string[]>; timeZone: string };

type Confirmation = {
  eventTitle: string;
  whenShort: string;
  whenLong: string;
  timeZone: string;
  name: string;
  email: string;
  rows: { label: string; value: string }[];
};

function sortDates(dates: string[]): string[] {
  return [...dates].sort();
}

const CINCINNATI_TZ = "America/New_York";

function CincinnatiLocalTime() {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateLong = new Intl.DateTimeFormat("en-US", {
    timeZone: CINCINNATI_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(tick);

  const timeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: CINCINNATI_TZ,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(tick);

  return (
    <div className="rounded-lg border border-zinc-200/90 bg-zinc-50/90 px-4 py-3.5 dark:border-zinc-800/90 dark:bg-zinc-900/35">
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
        Cincinnati
      </p>
      <p
        className="text-2xl font-medium tracking-tight text-zinc-900 tabular-nums dark:text-zinc-50 sm:text-[1.65rem]"
        suppressHydrationWarning
      >
        {timeStr}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{dateLong}</p>
      <p className="mt-2 border-t border-zinc-200/80 pt-2 text-[11px] text-zinc-400 dark:border-zinc-800/80 dark:text-zinc-500">
        Eastern Time · {CINCINNATI_TZ.replace(/_/g, " ")}
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600";

function BookingFieldControl({
  field,
  value,
  onChange,
}: {
  field: PublicBookingField;
  value: string;
  onChange: (slug: string, v: string) => void;
}) {
  const id = `bf-${field.slug}`;
  if (
    field.options &&
    field.options.length > 0 &&
    (field.type === "radioInput" || field.type === "select" || field.type === "multiselect")
  ) {
    return (
      <div>
        <label htmlFor={id} className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          {field.label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </label>
        <select
          id={id}
          required={field.required}
          value={value}
          onChange={(e) => onChange(field.slug, e.target.value)}
          className={inputClass}
        >
          {!field.required ? <option value="">—</option> : null}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label htmlFor={id} className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          {field.label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </label>
        <textarea
          id={id}
          required={field.required}
          rows={4}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.slug, e.target.value)}
          className={`${inputClass} resize-y min-h-[88px]`}
        />
      </div>
    );
  }

  if (field.type === "boolean" || field.type === "checkbox") {
    return (
      <div className="flex items-start gap-2">
        <input
          id={id}
          type="checkbox"
          checked={value === "true"}
          onChange={(e) => onChange(field.slug, e.target.checked ? "true" : "false")}
          className="mt-1 h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 dark:border-zinc-600"
        />
        <label htmlFor={id} className="text-sm text-zinc-600 dark:text-zinc-300 leading-snug">
          {field.label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </label>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div>
        <label htmlFor={id} className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          {field.label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </label>
        <input
          id={id}
          type="number"
          required={field.required}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.slug, e.target.value)}
          className={inputClass}
        />
      </div>
    );
  }

  if (field.type === "phone" || field.slug === "attendeePhoneNumber") {
    return (
      <div>
        <label htmlFor={id} className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          {field.label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </label>
        <input
          id={id}
          type="tel"
          required={field.required}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.slug, e.target.value)}
          className={inputClass}
        />
      </div>
    );
  }

  if (field.type === "url") {
    return (
      <div>
        <label htmlFor={id} className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          {field.label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </label>
        <input
          id={id}
          type="url"
          required={field.required}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.slug, e.target.value)}
          className={inputClass}
        />
      </div>
    );
  }

  if (field.type === "multiemail") {
    return (
      <div>
        <label htmlFor={id} className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          {field.label}
          {field.required ? <span className="text-red-500"> *</span> : null}
        </label>
        <textarea
          id={id}
          required={field.required}
          rows={2}
          placeholder={field.placeholder ?? "email@one.com, email@two.com"}
          value={value}
          onChange={(e) => onChange(field.slug, e.target.value)}
          className={`${inputClass} resize-y min-h-[64px]`}
        />
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
        {field.label}
        {field.required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={id}
        type="text"
        required={field.required}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(field.slug, e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

export default function MeetPage() {
  const [tz, setTz] = useState("UTC");
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [slotsByDate, setSlotsByDate] = useState<Record<string, string[]>>({});
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [extraFields, setExtraFields] = useState<PublicBookingField[]>([]);
  const [loadingExtraFields, setLoadingExtraFields] = useState(false);
  const [bookingFieldValues, setBookingFieldValues] = useState<Record<string, string>>({});
  const [loadTypesError, setLoadTypesError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsErrorDetail, setSlotsErrorDetail] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      setTz("UTC");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingTypes(true);
      setLoadTypesError(null);
      try {
        const res = await fetch("/api/cal/event-types");
        const data = await res.json();
        if (!res.ok) {
          if (data.error === "missing_api_key") {
            if (!cancelled) setLoadTypesError("missing_api_key");
            return;
          }
          throw new Error("failed");
        }
        if (!cancelled && data.ok && Array.isArray(data.eventTypes)) {
          setEventTypes(data.eventTypes);
          if (data.eventTypes.length > 0) {
            setSelectedId(data.eventTypes[0].id);
            const first = data.eventTypes[0] as EventType;
            setDuration(first.lengthInMinutes);
          }
        }
      } catch {
        if (!cancelled) setLoadTypesError("load_failed");
      } finally {
        if (!cancelled) setLoadingTypes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedType = useMemo(
    () => eventTypes.find((e) => e.id === selectedId) ?? null,
    [eventTypes, selectedId]
  );

  useEffect(() => {
    if (selectedType) {
      setDuration(selectedType.lengthInMinutes);
    }
  }, [selectedType]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      setLoadingExtraFields(true);
      setExtraFields([]);
      setBookingFieldValues({});
      try {
        const res = await fetch(`/api/cal/event-type?eventTypeId=${selectedId}`);
        const data = await res.json();
        if (!cancelled && res.ok && data.ok && Array.isArray(data.bookingFields)) {
          setExtraFields(data.bookingFields as PublicBookingField[]);
        }
      } catch {
        if (!cancelled) setExtraFields([]);
      } finally {
        if (!cancelled) setLoadingExtraFields(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!extraFields.length) return;
    setBookingFieldValues((prev) => {
      const next = { ...prev };
      for (const f of extraFields) {
        if (f.options && f.options.length > 0 && next[f.slug] === undefined) {
          next[f.slug] = f.options[0].value;
        }
        if ((f.type === "boolean" || f.type === "checkbox") && f.required && next[f.slug] === undefined) {
          next[f.slug] = "false";
        }
      }
      return next;
    });
  }, [extraFields, selectedStart]);

  const fetchSlots = useCallback(async () => {
    if (!selectedId) return;
    setLoadingSlots(true);
    setSlotsError(null);
    setSlotsErrorDetail(null);
    setSelectedStart(null);
    setSlotsByDate({});
    try {
      const et = eventTypes.find((e) => e.id === selectedId);
      if (!et?.slug) {
        setSlotsError("load_failed");
        return;
      }
      const startStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      const endStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000));

      const params = new URLSearchParams({
        eventTypeSlug: et.slug,
        timeZone: tz,
        start: startStr,
        end: endStr,
      });
      if (et?.lengthInMinutesOptions && et.lengthInMinutesOptions.length > 1 && duration != null) {
        params.set("duration", String(duration));
      }
      const res = await fetch(`/api/cal/slots?${params}`);
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "missing_api_key") setSlotsError("missing_api_key");
        else {
          setSlotsError("load_failed");
          if (typeof data.calMessage === "string" && data.calMessage) setSlotsErrorDetail(data.calMessage);
        }
        return;
      }
      if (data.ok) {
        const p = data as SlotsPayload;
        setSlotsByDate(p.slotsByDate || {});
      }
    } catch {
      setSlotsError("load_failed");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedId, tz, duration, eventTypes]);

  useEffect(() => {
    if (selectedId) void fetchSlots();
  }, [selectedId, tz, duration, fetchSlots]);

  const slotFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    [tz]
  );

  const longWhenFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        timeZone: tz,
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    [tz]
  );

  const setField = useCallback((slug: string, v: string) => {
    setBookingFieldValues((prev) => ({ ...prev, [slug]: v }));
  }, []);

  const clearSlotSelection = useCallback(() => {
    setSelectedStart(null);
    setBookingFieldValues((prev) => {
      const next = { ...prev };
      for (const f of extraFields) {
        if (f.options && f.options.length > 0) {
          next[f.slug] = f.options[0].value;
        } else if ((f.type === "boolean" || f.type === "checkbox") && f.required) {
          next[f.slug] = "false";
        } else {
          delete next[f.slug];
        }
      }
      return next;
    });
    setBookError(null);
  }, [extraFields]);

  const pickSlot = useCallback((startIso: string) => {
    setSelectedStart(startIso);
    setBookError(null);
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStart || !selectedType) return;
    setBooking(true);
    setBookError(null);
    try {
      const bookingFieldsResponses: Record<string, string> = {};
      for (const [k, v] of Object.entries(bookingFieldValues)) {
        if (typeof v === "string") bookingFieldsResponses[k] = v;
      }

      const body: Record<string, unknown> = {
        start: selectedStart,
        eventTypeId: selectedType.id,
        eventTypeSlug: selectedType.slug,
        attendee: { name: name.trim(), email: email.trim(), timeZone: tz },
        bookingFieldsResponses,
      };
      if (selectedType.lengthInMinutesOptions?.length && duration != null) {
        body.lengthInMinutes = duration;
      }
      const res = await fetch("/api/cal/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const fromApi =
          typeof data.calMessage === "string" && data.calMessage.trim()
            ? data.calMessage.trim()
            : null;
        const fromDetails =
          typeof data.details === "object" &&
          data.details !== null &&
          "message" in data.details &&
          typeof (data.details as { message: unknown }).message === "string"
            ? String((data.details as { message: string }).message)
            : null;
        const nestedErr =
          typeof data.details === "object" &&
          data.details !== null &&
          "error" in data.details &&
          typeof (data.details as { error?: { message?: string } }).error?.message === "string"
            ? (data.details as { error: { message: string } }).error.message
            : null;
        setBookError(
          fromApi ||
            nestedErr ||
            fromDetails ||
            "Could not complete booking. Check details and try again."
        );
        return;
      }

      const rows: { label: string; value: string }[] = [];
      for (const f of extraFields) {
        const raw = bookingFieldValues[f.slug] ?? "";
        if (f.type === "boolean" || f.type === "checkbox") {
          rows.push({ label: f.label, value: raw === "true" ? "Yes" : "No" });
          continue;
        }
        const t = raw.trim();
        if (t.length > 0) rows.push({ label: f.label, value: t });
      }

      setConfirmation({
        eventTitle: selectedType.title,
        whenShort: slotFormatter.format(new Date(selectedStart)),
        whenLong: longWhenFormatter.format(new Date(selectedStart)),
        timeZone: tz,
        name: name.trim(),
        email: email.trim(),
        rows,
      });
    } catch {
      setBookError("Network error. Try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loadTypesError === "missing_api_key") {
    return (
      <div style={{ maxWidth: "52ch" }} className="space-y-4">
        <h1 className="text-lg font-medium dark:text-white">Book a meet</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Scheduling on this page needs a server API key. Add{" "}
          <code className="text-xs text-zinc-700 dark:text-zinc-300">CAL_API_KEY</code> to your environment, then restart
          the dev server.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Until then, you can still{" "}
          <a
            href="https://cal.me/rohzzn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            book on Cal.me
          </a>
          .
        </p>
        <Link href="/about" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
          ← About
        </Link>
      </div>
    );
  }

  if (loadingTypes) {
    return (
      <div style={{ maxWidth: "52ch" }}>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (loadTypesError || eventTypes.length === 0) {
    return (
      <div style={{ maxWidth: "52ch" }} className="space-y-4">
        <h1 className="text-lg font-medium dark:text-white">Book a meet</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          No bookable event types were found, or the calendar request failed. Try{" "}
          <a
            href="https://cal.me/rohzzn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            cal.me/rohzzn
          </a>{" "}
          instead.
        </p>
        <Link href="/about" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
          ← About
        </Link>
      </div>
    );
  }

  if (confirmation) {
    const c = confirmation;
    return (
      <div style={{ maxWidth: "52ch" }} className="space-y-8">
        <h1 className="text-lg font-medium dark:text-white">Booking confirmed</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Here is a summary of what you submitted. You should also receive a confirmation email.
        </p>

        <div className="rounded-lg border border-zinc-200/90 bg-zinc-50/90 px-4 py-4 dark:border-zinc-800/90 dark:bg-zinc-900/35 space-y-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Event
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.eventTitle}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
              Date & time
            </p>
            <p className="text-sm text-zinc-800 dark:text-zinc-200">{c.whenLong}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {c.whenShort} · your timezone: {c.timeZone}
            </p>
          </div>
          <div className="border-t border-zinc-200/80 pt-4 dark:border-zinc-800/80 space-y-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                Name
              </p>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">{c.name}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                Email
              </p>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 break-all">{c.email}</p>
            </div>
            {c.rows.map((row) => (
              <div key={row.label}>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  {row.label}
                </p>
                <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        <Link href="/about" className="inline-block text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
          ← About
        </Link>
      </div>
    );
  }

  const dates = sortDates(Object.keys(slotsByDate));
  const totalSlots = dates.reduce((n, d) => n + (slotsByDate[d]?.length ?? 0), 0);

  return (
    <div style={{ maxWidth: "52ch" }} className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-lg font-medium dark:text-white">Book a meet</h1>
        <CincinnatiLocalTime />
      </div>

      <div>
        <div className="mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Event</span>
        </div>
        <div className="flex flex-col gap-2">
          {eventTypes.map((et) => (
            <button
              key={et.id}
              type="button"
              onClick={() => setSelectedId(et.id)}
              className={`w-full text-left rounded-md border px-3 py-2.5 text-sm transition-colors ${
                selectedId === et.id
                  ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-500 dark:bg-zinc-800 dark:text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <span className="font-medium">{et.title}</span>
              <span className="text-zinc-500 dark:text-zinc-400"> · {et.lengthInMinutes} min</span>
            </button>
          ))}
        </div>
        {selectedType?.lengthInMinutesOptions && selectedType.lengthInMinutesOptions.length > 1 ? (
          <div className="mt-3">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Length
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedType.lengthInMinutesOptions.map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setDuration(len)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    duration === len
                      ? "border-zinc-400 bg-zinc-100 dark:border-zinc-500 dark:bg-zinc-800"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {len} min
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {selectedStart ? "Your time" : "Available times"}
          </span>
          {loadingSlots ? (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">Updating…</span>
          ) : null}
        </div>
        {slotsError ? (
          <div className="space-y-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Could not load slots. Try again later.</p>
            {slotsErrorDetail ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 break-words">{slotsErrorDetail}</p>
            ) : null}
          </div>
        ) : totalSlots === 0 && !loadingSlots ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No open slots in the next few weeks for this event.</p>
        ) : selectedStart ? (
          <div className="rounded-lg border border-zinc-200/90 bg-zinc-50/90 px-4 py-4 dark:border-zinc-800/90 dark:bg-zinc-900/35">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Selected
            </p>
            <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
              {slotFormatter.format(new Date(selectedStart))}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Timezone: {tz}</p>
            <button
              type="button"
              onClick={clearSlotSelection}
              className="mt-3 text-xs font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Choose a different time
            </button>
          </div>
        ) : (
          <div className="space-y-6 max-h-[min(420px,50vh)] overflow-y-auto pr-1">
            {dates.map((date) => (
              <div key={date}>
                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-2">
                  {(() => {
                    try {
                      const [y, mo, da] = date.split("-").map(Number);
                      const ref = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0));
                      return new Intl.DateTimeFormat(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        timeZone: tz,
                      }).format(ref);
                    } catch {
                      return date;
                    }
                  })()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(slotsByDate[date] ?? []).map((startIso) => (
                    <button
                      key={startIso}
                      type="button"
                      onClick={() => pickSlot(startIso)}
                      className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40"
                    >
                      {slotFormatter.format(new Date(startIso))}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStart ? (
        <form onSubmit={handleBook} className="space-y-6 border-t border-zinc-100 dark:border-zinc-800/60 pt-8">
          <div className="mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Your details
            </span>
          </div>

          {loadingExtraFields ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading form…</p>
          ) : null}

          <div>
            <label htmlFor="meet-name" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="meet-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="meet-email" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="meet-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          {!loadingExtraFields &&
            extraFields.map((f) => (
              <BookingFieldControl
                key={f.slug}
                field={f}
                value={bookingFieldValues[f.slug] ?? ""}
                onChange={setField}
              />
            ))}

          {bookError ? <p className="text-sm text-red-600 dark:text-red-400">{bookError}</p> : null}
          <button
            type="submit"
            disabled={booking || loadingExtraFields}
            className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/60"
          >
            {booking ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      ) : null}

      <Link href="/about" className="inline-block text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
        ← About
      </Link>
    </div>
  );
}
