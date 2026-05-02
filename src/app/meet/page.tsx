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

type SlotsPayload = { ok: true; slotsByDate: Record<string, string[]>; timeZone: string };

function sortDates(dates: string[]): string[] {
  return [...dates].sort();
}

const CINCINNATI_TZ = 'America/New_York';

function CincinnatiLocalTime() {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateLong = new Intl.DateTimeFormat('en-US', {
    timeZone: CINCINNATI_TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(tick);

  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: CINCINNATI_TZ,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
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
        Eastern Time · {CINCINNATI_TZ.replace(/_/g, ' ')}
      </p>
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
  const [loadTypesError, setLoadTypesError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsErrorDetail, setSlotsErrorDetail] = useState<string | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
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

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStart || !selectedType) return;
    setBooking(true);
    setBookError(null);
    try {
      const body: Record<string, unknown> = {
        start: selectedStart,
        eventTypeId: selectedType.id,
        attendee: { name: name.trim(), email: email.trim(), timeZone: tz },
      };
      if (
        selectedType.lengthInMinutesOptions?.length &&
        duration != null
      ) {
        body.lengthInMinutes = duration;
      }
      const res = await fetch("/api/cal/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data.details === "object" &&
          data.details !== null &&
          "message" in data.details
            ? String((data.details as { message: unknown }).message)
            : null;
        setBookError(msg || "Could not complete booking. Check details and try again.");
        return;
      }
      setBooked(true);
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

  if (booked) {
    return (
      <div style={{ maxWidth: "52ch" }} className="space-y-4">
        <h1 className="text-lg font-medium dark:text-white">You&apos;re set</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          The booking was created. You should get a confirmation email with the details and any video link.
        </p>
        <Link href="/about" className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
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
            Available times
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
                      onClick={() => setSelectedStart(startIso)}
                      className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        selectedStart === startIso
                          ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-500 dark:bg-zinc-800 dark:text-white"
                          : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700"
                      }`}
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
        <form onSubmit={handleBook} className="space-y-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-8">
          <div className="mb-1">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Your details
            </span>
          </div>
          <div>
            <label htmlFor="meet-name" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              Name
            </label>
            <input
              id="meet-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
            />
          </div>
          <div>
            <label htmlFor="meet-email" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              Email
            </label>
            <input
              id="meet-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-600"
            />
          </div>
          {bookError ? <p className="text-sm text-red-600 dark:text-red-400">{bookError}</p> : null}
          <button
            type="submit"
            disabled={booking}
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
