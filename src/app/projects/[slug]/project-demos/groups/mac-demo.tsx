"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { L } from "../demo-utils";

const DOCK_APPS = [
  { id: "finder", label: "Finder", icon: "https://mac.rohan.run/assets/icons/small/finder.png" },
  { id: "messages", label: "Messages", icon: "https://mac.rohan.run/assets/icons/small/messages.png" },
  { id: "facetime", label: "FaceTime", icon: "https://mac.rohan.run/assets/icons/small/facetime.png" },
  { id: "safari", label: "Safari", icon: "https://mac.rohan.run/assets/icons/small/safari.png" },
  { id: "photos", label: "Photos", icon: "https://mac.rohan.run/assets/icons/small/photos.png" },
] as const;

type AppId = (typeof DOCK_APPS)[number]["id"];

const CHAT = [
  { from: "them", text: "hey — did you see mac.rohan.run?" },
  { from: "me", text: "yeah, the dock magnification is perfect" },
  { from: "them", text: "FaceTime actually connects too 👀" },
];

function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString(undefined, {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function dockScale(index: number, hover: number | null) {
  if (hover === null) return 1;
  const dist = Math.abs(index - hover);
  if (dist === 0) return 1.55;
  if (dist === 1) return 1.28;
  if (dist === 2) return 1.1;
  return 1;
}

function MessagesBody({
  draft,
  setDraft,
  sent,
  onSend,
}: {
  draft: string;
  setDraft: (v: string) => void;
  sent: string[];
  onSend: () => void;
}) {
  return (
    <div className="flex h-full min-h-[180px]">
      <div className="hidden w-28 shrink-0 border-r border-zinc-200/80 bg-zinc-50/90 sm:block dark:border-neutral-700 dark:bg-neutral-900/60">
        <div className="border-b border-zinc-200/80 px-2 py-2 text-[10px] font-semibold text-zinc-500 dark:border-neutral-700 dark:text-neutral-400">
          iMessage
        </div>
        <button
          type="button"
          className="w-full bg-blue-500/10 px-2 py-2 text-left text-[10px] font-medium text-zinc-800 dark:text-neutral-200"
        >
          Alex
        </button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {CHAT.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
              <span
                className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-[11px] leading-snug ${
                  msg.from === "me"
                    ? "bg-[#007aff] text-white"
                    : "bg-zinc-200 text-zinc-800 dark:bg-neutral-700 dark:text-neutral-100"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
          {sent.map((text, i) => (
            <div key={`sent-${i}`} className="flex justify-end">
              <span className="max-w-[85%] rounded-2xl bg-[#007aff] px-3 py-1.5 text-[11px] text-white">
                {text}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-zinc-200/80 p-2 dark:border-neutral-700">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="iMessage"
            className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] text-zinc-800 outline-none focus:border-blue-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <button
            type="button"
            onClick={onSend}
            className="rounded-full bg-[#007aff] px-3 py-1 text-[11px] font-medium text-white hover:opacity-90"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function FaceTimeBody() {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 bg-gradient-to-b from-zinc-900 to-black p-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-700 text-xl font-semibold text-white">
        A
      </div>
      <p className="text-sm font-medium text-white">Alex</p>
      <p className="text-[11px] text-zinc-400">FaceTime Video</p>
      <div className="mt-2 flex gap-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-xs text-white"
          title="End"
        >
          ✕
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-xs text-white"
          title="Mute"
        >
          🎤
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-xs text-white"
          title="Camera"
        >
          📷
        </button>
      </div>
    </div>
  );
}

function FinderBody() {
  return (
    <div className="p-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {["Applications", "Documents", "Downloads", "Desktop"].map((name) => (
          <div key={name} className="flex flex-col items-center gap-1.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-lg">
              📁
            </div>
            <span className="text-center text-[10px] text-zinc-700 dark:text-neutral-300">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SafariBody() {
  return (
    <div className="flex h-full min-h-[180px] flex-col">
      <div className="flex items-center gap-2 border-b border-zinc-200/80 px-3 py-2 dark:border-neutral-700">
        <div className="flex-1 rounded-md bg-zinc-100 px-2 py-1 text-[10px] text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400">
          mac.rohan.run
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="text-sm font-medium text-zinc-700 dark:text-neutral-200">Safari</p>
        <p className="text-[11px] text-zinc-400 dark:text-neutral-500">Favorites · Reading List · iCloud Tabs</p>
      </div>
    </div>
  );
}

function PhotosBody() {
  return (
    <div className="grid grid-cols-3 gap-1 p-2">
      {["#60a5fa", "#34d399", "#f472b6", "#fbbf24", "#a78bfa", "#fb7185"].map((color, i) => (
        <div key={i} className="aspect-square rounded-sm" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

const APP_BODY: Record<
  AppId,
  React.ComponentType<{ draft: string; setDraft: (v: string) => void; sent: string[]; onSend: () => void }>
> = {
  finder: () => <FinderBody />,
  messages: MessagesBody,
  facetime: () => <FaceTimeBody />,
  safari: () => <SafariBody />,
  photos: () => <PhotosBody />,
};

export function MacDemo() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState<AppId | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [dockHover, setDockHover] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [pos, setPos] = useState({ x: 24, y: 36 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const clock = useClock();

  const launch = (id: AppId) => {
    setOpen(id);
    setMinimized(false);
    setMaximized(false);
  };

  const close = () => {
    setOpen(null);
    setMinimized(false);
    setMaximized(false);
  };

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    setSent((s) => [...s, text]);
    setDraft("");
  };

  const onTitleDown = useCallback(
    (e: React.MouseEvent) => {
      if (maximized) return;
      drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    },
    [maximized, pos.x, pos.y]
  );

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!drag.current) return;
      setPos({
        x: drag.current.px + (e.clientX - drag.current.x),
        y: Math.max(8, drag.current.py + (e.clientY - drag.current.y)),
      });
    };
    const up = () => {
      drag.current = null;
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const active = DOCK_APPS.find((a) => a.id === open);
  const Body = open ? APP_BODY[open] : null;

  return (
    <div className="my-8 not-prose">
      <p className={L}>macOS Desktop</p>

      <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-lg dark:border-neutral-700">
        {!loggedIn ? (
          <div
            className="relative flex min-h-[320px] flex-col items-center justify-center bg-cover bg-center px-6 py-10"
            style={{
              backgroundImage:
                "linear-gradient(160deg, rgba(15,23,42,0.55), rgba(30,58,95,0.75)), linear-gradient(135deg, #1e3a5f 0%, #4a90c2 50%, #7eb8da 100%)",
            }}
          >
            <div className="mb-1 text-sm text-white/80">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="mb-8 text-5xl font-light tabular-nums text-white">
              {new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </div>
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-semibold text-white backdrop-blur-sm">
              R
            </div>
            <p className="mb-4 text-lg font-medium text-white">Rohan</p>
            <button
              type="button"
              onClick={() => setLoggedIn(true)}
              className="rounded-full bg-white/15 px-5 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/25"
            >
              Touch ID or Enter Password
            </button>
          </div>
        ) : (
          <div
            className="relative min-h-[320px] bg-cover bg-center"
            style={{
              backgroundImage: "linear-gradient(160deg, #1a3a5c 0%, #2d5a87 45%, #5a9fd4 100%)",
            }}
          >
            {/* Menu bar */}
            <div className="flex h-7 items-center justify-between bg-black/25 px-3 text-[11px] text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="font-semibold" aria-hidden>
                  {"\uF8FF"}
                </span>
                <span className="font-semibold">{active?.label ?? "Finder"}</span>
                <span className="hidden text-white/70 sm:inline">File</span>
                <span className="hidden text-white/70 sm:inline">Edit</span>
                <span className="hidden text-white/70 sm:inline">View</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <span className="hidden sm:inline">Wi‑Fi</span>
                <span className="hidden sm:inline">🔋</span>
                <span>{clock}</span>
              </div>
            </div>

            {/* Window */}
            {open && !minimized && Body && (
              <div
                className={`absolute z-10 overflow-hidden rounded-lg border border-black/10 bg-[#f5f5f7] shadow-2xl dark:bg-neutral-900 ${
                  maximized ? "inset-x-3 top-9 bottom-14" : ""
                }`}
                style={maximized ? undefined : { left: pos.x, top: pos.y, width: 280, minHeight: 220 }}
              >
                <div
                  className="flex cursor-grab items-center gap-2 bg-[#ececef] px-3 py-2 active:cursor-grabbing dark:bg-neutral-800"
                  onMouseDown={onTitleDown}
                >
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={close}
                      className="h-3 w-3 rounded-full bg-[#ff5f57] hover:brightness-90"
                      aria-label="Close"
                    />
                    <button
                      type="button"
                      onClick={() => setMinimized(true)}
                      className="h-3 w-3 rounded-full bg-[#febc2e] hover:brightness-90"
                      aria-label="Minimize"
                    />
                    <button
                      type="button"
                      onClick={() => setMaximized((m) => !m)}
                      className="h-3 w-3 rounded-full bg-[#28c840] hover:brightness-90"
                      aria-label="Maximize"
                    />
                  </div>
                  <span className="flex-1 text-center text-[11px] font-medium text-zinc-600 dark:text-neutral-300">
                    {active.label}
                  </span>
                </div>
                <div className={maximized ? "h-[calc(100%-36px)]" : "min-h-[180px]"}>
                  <Body draft={draft} setDraft={setDraft} sent={sent} onSend={onSend} />
                </div>
              </div>
            )}

            {/* Dock */}
            <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
              <div
                className="flex items-end gap-1 rounded-2xl border border-white/20 bg-white/20 px-2 pb-1.5 pt-2 backdrop-blur-xl"
                onMouseLeave={() => setDockHover(null)}
              >
                {DOCK_APPS.map((app, i) => {
                  const scale = dockScale(i, dockHover);
                  const isOpen = open === app.id;
                  const isMin = isOpen && minimized;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      title={app.label}
                      onMouseEnter={() => setDockHover(i)}
                      onClick={() => {
                        if (isOpen && !minimized) setMinimized(true);
                        else launch(app.id);
                      }}
                      className="relative flex flex-col items-center transition-transform duration-150 ease-out"
                      style={{
                        transform: `scale(${scale}) translateY(${scale > 1 ? -(scale - 1) * 18 : 0}px)`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={app.icon} alt="" className="h-9 w-9 rounded-lg shadow-md" />
                      {(isOpen || isMin) && (
                        <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-zinc-800/70 dark:bg-white/80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
