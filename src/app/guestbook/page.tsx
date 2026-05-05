"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";

type User = {
  login: string;
  avatarUrl: string;
};

type Comment = {
  id: number;
  displayName: string;
  messageBody: string;
  createdAt: string;
  user: User;
};

type PaginationInfo = {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: string | number;
};

type NormPos = { x: number; y: number };

const POSITIONS_STORAGE_KEY = "guestbook-desk-positions-v1";

/** DiceBear Adventurer — CC BY 4.0 design; API MIT. https://www.dicebear.com/styles/adventurer/ */
function adventurerAvatarSrc(seed: string): string {
  const s = encodeURIComponent((seed || "guest").slice(0, 80));
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${s}&size=64&radius=50`;
}

function scrambleSeed(id: number): number {
  let x = Math.abs(id) | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return Math.abs(x) || 1;
}

function loadStoredPositions(): Record<string, NormPos> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, NormPos>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistPositions(map: Record<number, NormPos>) {
  if (typeof window === "undefined") return;
  const out: Record<string, NormPos> = {};
  for (const [k, v] of Object.entries(map)) {
    if (v && typeof v.x === "number" && typeof v.y === "number") {
      out[String(k)] = { x: clamp01(v.x), y: clamp01(v.y) };
    }
  }
  localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(out));
}

function clamp01(n: number) {
  return Math.max(0.04, Math.min(0.96, n));
}

function defaultPositionFor(id: number, index: number, total: number): NormPos {
  const seed = scrambleSeed(id);
  const cols = Math.max(2, Math.ceil(Math.sqrt(Math.max(total, 1))) + 1);
  const rows = Math.ceil(total / cols) || 1;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const jx = ((seed % 61) - 30) / 900;
  const jy = (((seed >> 5) % 61) - 30) / 900;
  const x = clamp01(0.08 + (col / Math.max(cols - 1, 1)) * 0.76 + jx);
  const y = clamp01(0.1 + (row / Math.max(rows - 1, 1)) * 0.72 + jy);
  return { x, y };
}

function mergeCommentPositions(comments: Comment[], prev: Record<number, NormPos>, stored: Record<string, NormPos>): Record<number, NormPos> {
  const next: Record<number, NormPos> = {};
  const ids = new Set(comments.map((c) => c.id));
  for (const id of ids) {
    const key = String(id);
    if (prev[id]) next[id] = prev[id];
    else if (stored[key]) next[id] = { x: clamp01(stored[key].x), y: clamp01(stored[key].y) };
    else {
      const idx = comments.findIndex((c) => c.id === id);
      next[id] = defaultPositionFor(id, Math.max(idx, 0), comments.length);
    }
  }
  return next;
}

const POST_IT = [
  { bg: "#faf3d9", border: "#e8dfbd", ink: "#3a372e" },
  { bg: "#f5e8f0", border: "#e5d4df", ink: "#3b3438" },
  { bg: "#e4f2e8", border: "#cfded3", ink: "#2e352f" },
  { bg: "#e8eef8", border: "#d4deed", ink: "#2e3340" },
  { bg: "#fce9e5", border: "#edd5cf", ink: "#3b3030" },
  { bg: "#f2f0e4", border: "#e0ddce", ink: "#38352c" },
] as const;

function formatGuestbookDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CuttingMatDecor() {
  return (
    <>
      {/* Bevel / depth */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_2px_3px_rgba(255,255,255,0.12),inset_0_-4px_12px_rgba(0,0,0,0.22),inset_0_0_80px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),inset_0_-6px_16px_rgba(0,0,0,0.45)]"
        aria-hidden
      />
      {/* Center alignment guides (diagonal hints like real mats) */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full rounded-[inherit] opacity-[0.07] dark:opacity-[0.05]" aria-hidden>
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* Wear specks */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.22] dark:opacity-[0.1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='w'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23w)' opacity='.18'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
        }}
        aria-hidden
      />
    </>
  );
}

function DraggableStickyNote({
  comment,
  boardRef,
  xPct,
  yPct,
  rotationDeg,
  zBase,
  avatarSrc,
  palette,
  useTape,
  tapeShiftDeg,
}: {
  comment: Comment;
  boardRef: React.RefObject<HTMLDivElement | null>;
  xPct: number;
  yPct: number;
  rotationDeg: number;
  zBase: number;
  avatarSrc: string;
  palette: (typeof POST_IT)[number];
  useTape: boolean;
  tapeShiftDeg: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const board = boardRef.current;
    const el = wrapRef.current;
    if (!board || !el) return;
    const er = el.getBoundingClientRect();
    const cx = er.left + er.width / 2;
    const cy = er.top + er.height / 2;
    dragRef.current = {
      pointerId: e.pointerId,
      offsetX: e.clientX - cx,
      offsetY: e.clientY - cy,
    };
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(true);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const board = boardRef.current;
    const el = wrapRef.current;
    if (!board || !el) return;
    const br = board.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const halfW = er.width / 2;
    const halfH = er.height / 2;
    let cx = e.clientX - br.left - d.offsetX;
    let cy = e.clientY - br.top - d.offsetY;
    cx = Math.max(halfW + 6, Math.min(br.width - halfW - 6, cx));
    cy = Math.max(halfH + 6, Math.min(br.height - halfH - 6, cy));
    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;
  };

  const commitOrCancel = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      const board = boardRef.current;
      const el = wrapRef.current;
      dragRef.current = null;
      setDragging(false);
      try {
        el?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (!board || !el) return;
      const br = board.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const centerX = er.left + er.width / 2 - br.left;
      const centerY = er.top + er.height / 2 - br.top;
      el.style.left = "";
      el.style.top = "";
      const detail = {
        id: comment.id,
        x: clamp01(centerX / br.width),
        y: clamp01(centerY / br.height),
      };
      window.dispatchEvent(new CustomEvent("guestbook-note-moved", { detail }));
    },
    [comment.id, boardRef]
  );

  return (
    <div
      ref={wrapRef}
      role="article"
      aria-label={`Note from ${comment.displayName || "Anonymous"}`}
      className="absolute max-w-[min(100vw-2rem,268px)] cursor-grab touch-manipulation select-none active:cursor-grabbing motion-reduce:cursor-default"
      style={{
        left: `${xPct * 100}%`,
        top: `${yPct * 100}%`,
        transform: "translate(-50%, -50%)",
        zIndex: dragging ? 120 : zBase,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={commitOrCancel}
      onPointerCancel={commitOrCancel}
    >
      <div
        className={`rounded-md border shadow-[3px_8px_20px_-4px_rgba(15,35,28,0.35),1px_2px_6px_rgba(15,35,28,0.12),inset_0_1px_0_rgba(255,255,255,0.45)] transition-shadow duration-150 dark:shadow-[4px_12px_28px_-4px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] motion-reduce:transition-none ${dragging ? "shadow-[6px_16px_36px_-4px_rgba(15,35,28,0.45)] dark:shadow-[8px_22px_44px_-4px_rgba(0,0,0,0.65)]" : ""}`}
        style={{
          backgroundColor: palette.bg,
          borderColor: palette.border,
          color: palette.ink,
          transform: dragging ? `rotate(${rotationDeg}deg) scale(1.02)` : `rotate(${rotationDeg}deg)`,
        }}
      >
        {useTape ? (
          <div
            className="pointer-events-none absolute -top-2 left-1/2 z-[1] h-[18px] w-[55%] rounded-[2px] bg-white/50 shadow-[0_1px_2px_rgba(0,0,0,0.12)] backdrop-blur-[1px] dark:bg-white/14"
            style={{ transform: `translateX(-50%) rotate(${tapeShiftDeg}deg)` }}
            aria-hidden
          />
        ) : (
          <div className="pointer-events-none absolute -top-1.5 left-1/2 z-[1] flex -translate-x-1/2 flex-col items-center" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-gradient-to-br from-[#b8b4af] to-[#7f7a75] shadow-[inset_0_-1px_1px_rgba(255,255,255,0.35),0_2px_5px_rgba(0,0,0,0.2)] ring-1 ring-black/15" />
            <span className="-mt-px h-2 w-px bg-[#8a8580]" />
          </div>
        )}

        <div className="relative px-3.5 pb-3.5 pt-6">
          <div className="mb-2 flex items-center gap-2.5 border-b border-black/[0.08] pb-2">
            <Image
              src={avatarSrc}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full ring-1 ring-black/10"
              unoptimized
            />
            <h3 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">{comment.displayName || "Anonymous"}</h3>
          </div>
          <time className="mb-1.5 block text-[10px] opacity-70">{formatGuestbookDate(comment.createdAt)}</time>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{comment.messageBody}</p>
          <p className="mt-2 text-[10px] opacity-45 motion-reduce:hidden md:opacity-55">Drag to move</p>
        </div>
      </div>
    </div>
  );
}

export default function GuestbookPage() {
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<number, NormPos>>({});

  const boardRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async (page: number, append: boolean = false) => {
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);
    try {
      const response = await fetch(`/api/guestbook?page=${page}`);
      if (!response.ok) throw new Error(`Failed to fetch comments: ${response.status}`);
      const data = await response.json();
      if (append) {
        setComments((prevComments) => {
          const existingIds = new Set(prevComments.map((comment) => comment.id));
          const uniqueNewComments = data.comments.filter((comment: Comment) => !existingIds.has(comment.id));
          return [...prevComments, ...uniqueNewComments];
        });
      } else {
        setComments(data.comments || []);
      }
      setPagination(
        data.pagination || {
          currentPage: page,
          hasNextPage: false,
          hasPrevPage: false,
          totalCount: data.comments?.length || 0,
        }
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load guestbook entries. Please try again later.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  useEffect(() => {
    const stored = loadStoredPositions();
    setPositions((prev) => mergeCommentPositions(comments, prev, stored));
  }, [comments]);

  useEffect(() => {
    const onMove = (e: Event) => {
      const { id, x, y } = (e as CustomEvent<{ id: number; x: number; y: number }>).detail;
      setPositions((prev) => {
        const next = { ...prev, [id]: { x, y } };
        persistPositions(next);
        return next;
      });
    };
    window.addEventListener("guestbook-note-moved", onMove);
    return () => window.removeEventListener("guestbook-note-moved", onMove);
  }, []);

  const loadMoreComments = useCallback(() => {
    if (pagination.hasNextPage) fetchComments(pagination.currentPage + 1, true);
  }, [pagination.hasNextPage, pagination.currentPage, fetchComments]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSending(true);
    setError(null);

    const optimisticComment: Comment = {
      id: Date.now(),
      displayName: name,
      messageBody: message,
      createdAt: new Date().toISOString(),
      user: { login: "you", avatarUrl: "" },
    };

    setComments((prevComments) => [optimisticComment, ...prevComments]);

    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit comment");
      }

      const result = await response.json();

      setName("");
      setMessage("");

      const newId = result.comment.id as number;
      const oldId = optimisticComment.id;

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === oldId ? { ...comment, id: newId, createdAt: result.comment.createdAt } : comment
        )
      );

      setPositions((prev) => {
        const next = { ...prev };
        if (next[oldId]) {
          next[newId] = next[oldId];
          delete next[oldId];
        }
        persistPositions(next);
        return next;
      });

      if (typeof pagination.totalCount === "number") {
        setPagination((prev) => ({ ...prev, totalCount: Number(prev.totalCount) + 1 }));
      }
    } catch (error: unknown) {
      console.error("Error posting comment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit your message. Please try again later.";
      setError(errorMessage);
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== optimisticComment.id));
    } finally {
      setIsSending(false);
    }
  };

  const resetLayout = useCallback(() => {
    const next: Record<number, NormPos> = {};
    comments.forEach((c, i) => {
      next[c.id] = defaultPositionFor(c.id, i, comments.length);
    });
    setPositions(next);
    persistPositions(next);
  }, [comments]);

  const noteLayouts = useMemo(() => {
    return comments.map((c, i) => {
      const seed = scrambleSeed(c.id);
      const rotationDeg = ((seed % 13) - 6) * 0.95;
      const useTape = seed % 3 !== 0;
      const tapeShiftDeg = ((seed >> 2) % 7) - 3;
      const palette = POST_IT[seed % POST_IT.length];
      const pos = positions[c.id] ?? defaultPositionFor(c.id, i, comments.length);
      const avatarSeed = `${c.displayName || "anon"}-${c.id}`;
      const avatarSrc = adventurerAvatarSrc(avatarSeed);
      const zBase = 10 + (i % 12);
      return {
        comment: c,
        rotationDeg,
        useTape,
        tapeShiftDeg,
        palette,
        pos,
        avatarSrc,
        zBase,
      };
    });
  }, [comments, positions]);

  /* Bring note to front while dragging — handled inside note via dragging state z-index */

  const matBg = {
    backgroundColor: "#1e4d42",
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px),
      linear-gradient(rgba(0,0,0,0.14) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.14) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px, 40px 40px, 10px 10px, 10px 10px, 2px 2px, 2px 2px",
  } as const;

  const matBgDark = {
    backgroundColor: "#142e29",
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px),
      linear-gradient(rgba(0,0,0,0.35) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.35) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px, 40px 40px, 10px 10px, 10px 10px, 2px 2px, 2px 2px",
  } as const;

  return (
    <div className="relative -mx-4 w-[calc(100%+2rem)] max-w-none sm:-mx-6 sm:w-[calc(100%+3rem)] md:-mx-8 md:w-[calc(100%+4rem)] lg:-mx-10 lg:w-[calc(100%+5rem)]">
      <div
        className="relative min-h-[100dvh] rounded-2xl border border-[#0f3530]/80 shadow-[0_24px_60px_-24px_rgba(10,28,24,0.55)] md:min-h-[calc(100dvh-5rem)] dark:border-[#0a221e]/90"
        style={matBg}
      >
        {/* Dark-mode mat paint */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 dark:opacity-100"
          style={matBgDark}
          aria-hidden
        />

        <CuttingMatDecor />

        {/* Fine grain */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.22] dark:opacity-[0.14]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
            backgroundSize: "140px 140px",
            mixBlendMode: "soft-light",
          }}
          aria-hidden
        />

        {/* Edge rulers */}
        <div className="pointer-events-none absolute left-0 top-10 bottom-10 z-[2] w-9 border-r border-white/[0.08] bg-black/[0.08] dark:bg-black/25" aria-hidden>
          <div
            className="absolute inset-y-6 left-2 w-px"
            style={{
              backgroundImage: `repeating-linear-gradient(180deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 8px, transparent 8px, transparent 40px)`,
            }}
          />
          <div
            className="absolute inset-y-6 left-3.5 w-px opacity-70"
            style={{
              backgroundImage: `repeating-linear-gradient(180deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 4px, transparent 4px, transparent 20px)`,
            }}
          />
        </div>
        <div className="pointer-events-none absolute left-10 right-0 top-0 z-[2] h-10 border-b border-white/[0.08] bg-black/[0.08] dark:bg-black/25" aria-hidden>
          <div
            className="absolute inset-x-8 top-3 h-px"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 8px, transparent 8px, transparent 40px)`,
            }}
          />
          <div
            className="absolute inset-x-8 top-5 h-px opacity-70"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 4px, transparent 4px, transparent 20px)`,
            }}
          />
        </div>

        {/* Corner branding ticks */}
        <div className="pointer-events-none absolute bottom-3 left-11 text-[9px] font-medium uppercase tracking-[0.35em] text-white/35 dark:text-white/25" aria-hidden>
          cm · grid 40
        </div>

        <div className="relative z-[3] px-3 pb-12 pt-[3.25rem] sm:px-5 lg:px-8">
          <header className="mx-auto mb-8 max-w-2xl text-center md:mb-9">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#b8dfd6]">Guestbook</p>
            <h1 className="text-xl font-semibold tracking-tight text-[#e8f5f2] md:text-2xl">Craft desk</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#a8cfc6]/95">Leave a sticky note.</p>
            <button
              type="button"
              onClick={resetLayout}
              className="mt-4 text-xs text-[#a8cfc6]/80 underline decoration-[#a8cfc6]/35 underline-offset-4 hover:text-[#e8f5f2]"
            >
              Reset note positions
            </button>
          </header>

          {/* Desk form */}
          <div className="mx-auto mb-8 max-w-xl md:mb-10">
            <div className="rounded-xl border border-[#2d6b5e]/70 bg-[#f4f7f5]/97 p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-md dark:border-[#2a524a]/90 dark:bg-[#152824]/94 dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.55)]">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="sr-only" htmlFor="guestbook-name">
                  Your name
                </label>
                <input
                  id="guestbook-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name…"
                  className="rounded-lg border border-[#c5cfc9] bg-white px-3 py-2.5 text-sm text-[#1e2e29] outline-none ring-[#5a9e8c]/35 transition-shadow placeholder:text-[#8a9e96] focus:border-[#5a9e8c] focus:ring-2 dark:border-[#355048] dark:bg-[#0f1c18] dark:text-[#e4ebe9] dark:placeholder:text-[#6f837d]"
                  disabled={isSending}
                  required
                  autoComplete="name"
                />
                <label className="sr-only" htmlFor="guestbook-message">
                  Your message
                </label>
                <textarea
                  id="guestbook-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message…"
                  className="min-h-[100px] resize-y rounded-lg border border-[#c5cfc9] bg-white px-3 py-2.5 text-sm text-[#1e2e29] outline-none ring-[#5a9e8c]/35 transition-shadow placeholder:text-[#8a9e96] focus:border-[#5a9e8c] focus:ring-2 dark:border-[#355048] dark:bg-[#0f1c18] dark:text-[#e4ebe9] dark:placeholder:text-[#6f837d]"
                  disabled={isSending}
                  required
                />
                <button
                  type="submit"
                  disabled={isSending || !name.trim() || !message.trim()}
                  className="self-start rounded-lg bg-[#2d6b5e] px-4 py-2 text-sm font-medium text-white shadow-sm transition-[opacity,background-color] hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#3d8f7d] dark:hover:bg-[#347a6b]"
                >
                  {isSending ? "Sending…" : "Add to desk"}
                </button>
              </form>
            </div>
          </div>

          {error && (
            <div
              className="mx-auto mb-8 max-w-xl rounded-xl border border-[#c4786a]/70 bg-[#fdecea]/97 px-4 py-3 text-sm text-[#5c2e28] dark:border-[#7a453d]/80 dark:bg-[#2b1512]/95 dark:text-[#f0beb8]"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="mx-auto mb-3 flex flex-wrap items-center justify-between gap-2 px-1 md:px-2">
            <h2 className="text-sm font-semibold tracking-tight text-[#cdebe4]">
              Board
              {typeof pagination.totalCount === "number" && pagination.totalCount > 0 && (
                <span className="ml-2 font-normal text-[#8fbdb3]">({pagination.totalCount})</span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-[#b8dfd6]" aria-hidden />
              <span className="sr-only">Loading messages</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#9fc9bf]">No notes yet — add the first one above.</p>
          ) : (
            <>
              <div className="mx-auto overflow-x-hidden overflow-y-visible rounded-xl border border-[#2d6b5e]/45 bg-[#0f2924]/35 shadow-inner dark:border-[#1a3d36]/80 dark:bg-black/15">
                <div
                  ref={boardRef}
                  className="relative min-h-[480px] touch-pan-y md:min-h-[min(720px,calc(100dvh-22rem))]"
                >
                  {noteLayouts.map((row) => (
                    <DraggableStickyNote
                      key={row.comment.id}
                      comment={row.comment}
                      boardRef={boardRef}
                      xPct={row.pos.x}
                      yPct={row.pos.y}
                      rotationDeg={row.rotationDeg}
                      zBase={row.zBase}
                      avatarSrc={row.avatarSrc}
                      palette={row.palette}
                      useTape={row.useTape}
                      tapeShiftDeg={row.tapeShiftDeg}
                    />
                  ))}
                </div>
              </div>

              {pagination.hasNextPage && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMoreComments}
                    disabled={isLoadingMore}
                    className="rounded-lg border border-white/15 bg-[#1a3d36]/80 px-5 py-2.5 text-sm font-medium text-[#d4ebe6] shadow-sm transition-[background-color] hover:bg-[#22564c] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoadingMore ? "Loading…" : "Load more notes"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
