"use client";

import React, { useEffect, useMemo, useState } from "react";
import { L } from "./demo-utils";

type HourFormat = "12" | "24";
type ClockStyle = "minimal" | "seconds";

type City = {
  id: string;
  label: string;
  timezone: string;
};

const CITIES: City[] = [
  { id: "nyc", label: "New York", timezone: "America/New_York" },
  { id: "lon", label: "London", timezone: "Europe/London" },
  { id: "tok", label: "Tokyo", timezone: "Asia/Tokyo" },
  { id: "hyd", label: "Hyderabad", timezone: "Asia/Kolkata" },
  { id: "syd", label: "Sydney", timezone: "Australia/Sydney" },
  { id: "lax", label: "Los Angeles", timezone: "America/Los_Angeles" },
];

const ACCENTS = ["#ff9f45", "#5ac8fa", "#34c759", "#ff6b6b", "#bf5af2", "#ffd60a"] as const;

function mixHex(from: string, to: string, amount: number): string {
  let hex = "#";
  for (let i = 1; i < 7; i += 2) {
    const a = Number.parseInt(from.slice(i, i + 2), 16);
    const b = Number.parseInt(to.slice(i, i + 2), 16);
    hex += Math.round(a + (b - a) * amount)
      .toString(16)
      .padStart(2, "0");
  }
  return hex;
}

function daylightFactor(hour: number, minute: number): number {
  const hours = hour + minute / 60;
  return 0.5 - 0.5 * Math.cos((2 * Math.PI * (hours - 1)) / 24);
}

function zonedParts(timezone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function formatHour(hour: number, format: HourFormat) {
  if (format === "12") {
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return String(h);
  }
  return String(hour).padStart(2, "0");
}

function ClockKey({
  city,
  now,
  accent,
  hourFormat,
  style,
  pressed,
  onPress,
}: {
  city: City;
  now: Date;
  accent: string;
  hourFormat: HourFormat;
  style: ClockStyle;
  pressed: boolean;
  onPress: () => void;
}) {
  const time = useMemo(() => zonedParts(city.timezone, now), [city.timezone, now]);
  const daylight = daylightFactor(time.hour, time.minute);
  const bgCenter = mixHex("#0e1016", "#141010", daylight);
  const bgEdge = mixHex("#181c26", "#221c1a", daylight);

  const hour = formatHour(time.hour, hourFormat);
  const minute = String(time.minute).padStart(2, "0");
  const meridiem = hourFormat === "12" ? (time.hour < 12 ? "AM" : "PM") : null;
  const seconds = style === "seconds" ? String(time.second).padStart(2, "0") : null;
  const sweep = time.second * 6;
  const ringR = 42;
  const rad = ((sweep - 90) * Math.PI) / 180;
  const endX = 50 + ringR * Math.cos(rad);
  const endY = 50 + ringR * Math.sin(rad);
  const large = sweep > 180 ? 1 : 0;

  return (
    <button
      type="button"
      onClick={onPress}
      className={`relative aspect-square w-full overflow-hidden rounded-[18%] border border-black/40 shadow-lg transition-transform duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 ${
        pressed ? "scale-[0.96]" : "hover:scale-[1.02]"
      }`}
      style={{
        background: `radial-gradient(circle at 50% 42%, ${bgCenter}, ${bgEdge})`,
      }}
      aria-label={`${city.label} clock. Press to toggle seconds.`}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={ringR}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.4"
        />
        {time.second > 0 && (
          <path
            d={`M 50 ${50 - ringR} A ${ringR} ${ringR} 0 ${large} 1 ${endX} ${endY}`}
            fill="none"
            stroke={accent}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        )}
      </svg>

      <div className="relative z-[1] flex h-full flex-col items-center justify-center px-2 pt-1">
        <p
          className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/55 sm:text-[10px]"
          style={{ letterSpacing: city.label.length > 10 ? "0.08em" : "0.14em" }}
        >
          {city.label.length > 14 ? city.label.slice(0, 14) : city.label}
        </p>
        <p
          className="mt-0.5 font-medium tabular-nums leading-none text-[#f2f2ee]"
          style={{ fontSize: "clamp(1.15rem, 4.2vw, 1.65rem)" }}
        >
          {hour}
          <span className="mx-[0.06em] inline-block translate-y-[-0.06em] text-[0.55em] opacity-80">
            :
          </span>
          {minute}
        </p>
        {(meridiem || seconds) && (
          <p className="mt-1 text-[10px] font-medium tabular-nums tracking-wide text-white/45">
            {meridiem}
            {meridiem && seconds ? <span className="mx-1 opacity-50">·</span> : null}
            {seconds && <span style={{ color: accent }}>{seconds}</span>}
          </p>
        )}
      </div>
    </button>
  );
}

export function WorldClockDemo() {
  const [now, setNow] = useState(() => new Date());
  const [hourFormat, setHourFormat] = useState<HourFormat>("24");
  const [style, setStyle] = useState<ClockStyle>("minimal");
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]>(ACCENTS[0]);
  const [pressedId, setPressedId] = useState<string | null>(null);

  useEffect(() => {
    let intervalId = 0;
    const delay = 1000 - (Date.now() % 1000);
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
      intervalId = window.setInterval(() => setNow(new Date()), 1000);
    }, delay);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  const onKeyPress = (id: string) => {
    setPressedId(id);
    setStyle((s) => (s === "minimal" ? "seconds" : "minimal"));
    window.setTimeout(() => setPressedId(null), 140);
  };

  return (
    <div className="my-8 not-prose">
      <p className={L}>Stream Deck Preview</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(["24", "12"] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setHourFormat(fmt)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                hourFormat === fmt
                  ? "bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-zinc-100 text-zinc-500 hover:text-zinc-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {fmt}-hour
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(["minimal", "seconds"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`rounded-md px-3 py-1.5 text-xs capitalize transition-colors ${
                style === s
                  ? "bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "bg-zinc-100 text-zinc-500 hover:text-zinc-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {ACCENTS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setAccent(color)}
              aria-label={`Accent ${color}`}
              className={`h-5 w-5 rounded-full border-2 transition-transform ${
                accent === color
                  ? "scale-110 border-zinc-900 dark:border-white"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-3 dark:border-neutral-800 dark:bg-neutral-900/80 sm:p-4">
        <div className="mb-3 flex items-center justify-between px-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-neutral-500">
            Stream Deck
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-neutral-500">press a key to toggle seconds</p>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {CITIES.map((city) => (
            <ClockKey
              key={city.id}
              city={city}
              now={now}
              accent={accent}
              hourFormat={hourFormat}
              style={style}
              pressed={pressedId === city.id}
              onPress={() => onKeyPress(city.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
