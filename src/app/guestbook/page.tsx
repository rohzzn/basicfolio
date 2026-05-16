"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// ── types ─────────────────────────────────────────────────────────────────────
type Comment = {
  id: number;
  displayName: string;
  messageBody: string;
  createdAt: string;
  user: { login: string; avatarUrl: string };
};

type Pos = { x: number; y: number };

const CARD_W = 155;
const CARD_H = 210; // approx including bottom strip

// ── helpers ───────────────────────────────────────────────────────────────────
function hash(n: number): number {
  let x = Math.abs(n) | 0;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = ((x >> 16) ^ x) * 0x45d9f3b;
  x = (x >> 16) ^ x;
  return Math.abs(x);
}

function avatarSrc(name: string, id: number) {
  const seed = encodeURIComponent(`${name}-${id}`.slice(0, 80));
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&size=80&radius=50`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function initialPos(id: number, index: number, total: number, boardW: number): Pos {
  const h = hash(id);
  const cols = Math.max(2, Math.floor((boardW + 20) / (CARD_W + 20)));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const jx = ((h % 41) - 20);       // ±20px jitter
  const jy = (((h >> 5) % 41) - 20);
  const colGap = Math.max(CARD_W + 16, (boardW - CARD_W) / Math.max(cols - 1, 1));
  const x = Math.min(boardW - CARD_W - 8, Math.max(8, col * colGap + jx));
  const y = Math.max(8, row * (CARD_H + 24) + jy + 16);
  return { x, y };
}

function rotation(id: number): number {
  const h = hash(id);
  return ((h % 21) - 10) * 0.85; // ±8.5 deg
}

// ── spring hook ───────────────────────────────────────────────────────────────
function useSpringDrop(index: number, enabled: boolean) {
  const [ty, setTy] = useState(-160);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const tid = setTimeout(() => {
      if (cancelled) return;
      let pos = -160, vel = 0;
      const step = () => {
        if (cancelled) return;
        const acc = (-220 * (pos - 0) + -20 * vel);
        vel += acc / 60;
        pos += vel / 60;
        if (Math.abs(pos) < 0.4 && Math.abs(vel) < 0.4) { setTy(0); return; }
        setTy(pos);
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    }, index * 50);
    return () => {
      cancelled = true;
      clearTimeout(tid);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return ty;
}

// ── polaroid ──────────────────────────────────────────────────────────────────
function Polaroid({
  comment,
  index,
  pos,
  onPosChange,
  flipped,
  onFlip,
  zIndex,
  onDragStart,
}: {
  comment: Comment;
  index: number;
  pos: Pos;
  onPosChange: (id: number, pos: Pos) => void;
  flipped: boolean;
  onFlip: (id: number) => void;
  zIndex: number;
  onDragStart: (id: number) => void;
}) {
  const rot = rotation(comment.id);
  const h = hash(comment.id);
  const tints = ["#f5f0e8", "#f2ede0", "#ede8db", "#f0ece2", "#ece7d8"];
  const tint = tints[h % tints.length];

  const ty = useSpringDrop(index, true);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  // drag state — all in refs so RAF doesn't stale-close
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean; pid: number } | null>(null);
  const elRef = useRef<HTMLDivElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
      pid: e.pointerId,
    };
    elRef.current?.setPointerCapture(e.pointerId);
    onDragStart(comment.id);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pid) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.sqrt(dx * dx + dy * dy) > 4) d.moved = true;
    if (!d.moved) return;
    onPosChange(comment.id, { x: d.origX + dx, y: d.origY + dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pid) return;
    elRef.current?.releasePointerCapture(e.pointerId);
    const moved = d.moved;
    dragRef.current = null;
    setDragging(false);
    if (!moved) onFlip(comment.id);
  };

  const shadow = dragging
    ? "0 28px 48px -8px rgba(0,0,0,0.38), 0 6px 16px rgba(0,0,0,0.18)"
    : hovered
    ? "0 16px 32px -6px rgba(0,0,0,0.28), 0 4px 10px rgba(0,0,0,0.12)"
    : "0 4px 14px -3px rgba(0,0,0,0.18), 0 2px 5px rgba(0,0,0,0.08)";

  const flipTransform = flipped ? "rotateY(180deg)" : "";
  const hoverTransform = hovered && !flipped && !dragging ? "scale(1.04) translateY(-5px)" : "";
  const dragTransform = dragging ? "scale(1.07)" : "";

  return (
    <div
      ref={elRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: CARD_W,
        zIndex: dragging ? 200 : zIndex,
        perspective: "900px",
        transform: `translateY(${ty}px)`,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        willChange: "transform",
      }}
    >
      {/* inner — flip + hover transforms here so they compose cleanly */}
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: dragging
            ? "box-shadow 0.15s ease"
            : "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
          transform: `rotate(${rot}deg) ${flipTransform} ${hoverTransform} ${dragTransform}`,
          boxShadow: shadow,
          borderRadius: "2px",
          position: "relative",
        }}
      >
        {/* FRONT */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "#fdfaf4",
            borderRadius: "2px",
            padding: "10px 10px 30px 10px",
          }}
        >
          <div
            style={{
              background: tint,
              aspectRatio: "1",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "1px",
              overflow: "hidden",
            }}
          >
            <Image
              src={avatarSrc(comment.displayName, comment.id)}
              alt={comment.displayName}
              width={80}
              height={80}
              unoptimized
              style={{ width: "58%", height: "58%", objectFit: "cover", pointerEvents: "none" }}
            />
          </div>
          <p style={{
            marginTop: 8,
            textAlign: "center",
            fontSize: 11,
            fontFamily: "monospace",
            color: "#4a4540",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {comment.displayName || "Anonymous"}
          </p>
        </div>

        {/* BACK */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "#fdfaf4",
            borderRadius: "2px",
            padding: "12px 11px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{
            position: "absolute",
            inset: "8px",
            backgroundImage: "repeating-linear-gradient(transparent, transparent 18px, #cfc8b8 18px, #cfc8b8 19px)",
            opacity: 0.45,
            pointerEvents: "none",
          }} />
          <p style={{
            position: "relative",
            fontSize: 11,
            lineHeight: "19px",
            color: "#2a2520",
            fontFamily: "Georgia, serif",
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 8,
            WebkitBoxOrient: "vertical",
          }}>
            {comment.messageBody}
          </p>
          <p style={{
            position: "relative",
            fontSize: 9,
            color: "#9a9288",
            fontFamily: "monospace",
            textAlign: "right",
            marginTop: 6,
          }}>
            {relativeTime(comment.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────
export default function GuestbookPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flippedId, setFlippedId] = useState<number | null>(null);
  const [positions, setPositions] = useState<Record<number, Pos>>({});
  const [zMap, setZMap] = useState<Record<number, number>>({});
  const [topZ, setTopZ] = useState(20);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  // Track board width for pixel-accurate layout
  const boardW = useRef(600);

  // Measure board on mount + resize
  useEffect(() => {
    const measure = () => {
      if (boardRef.current) boardW.current = boardRef.current.offsetWidth;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (boardRef.current) ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  const fetchPage = useCallback(async (p: number, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetch(`/api/guestbook?page=${p}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const incoming: Comment[] = data.comments || [];
      setComments(prev => {
        const next = append
          ? [...prev, ...incoming.filter(c => !prev.find(x => x.id === c.id))]
          : incoming;
        return next;
      });
      setHasNext(!!data.pagination?.hasNextPage);
      setPage(p);
    } catch {
      setError("Couldn't load entries.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  // Assign initial positions once per comment when they arrive
  useEffect(() => {
    setPositions(prev => {
      const next = { ...prev };
      let changed = false;
      comments.forEach((c, i) => {
        if (!(c.id in next)) {
          next[c.id] = initialPos(c.id, i, comments.length, boardW.current);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setZMap(prev => {
      const next = { ...prev };
      let changed = false;
      comments.forEach((c, i) => {
        if (!(c.id in next)) { next[c.id] = 10 + i; changed = true; }
      });
      return changed ? next : prev;
    });
  }, [comments]);

  // Board height = enough to show all rows without clipping
  const boardHeight = React.useMemo(() => {
    if (comments.length === 0) return 400;
    const cols = Math.max(2, Math.floor((boardW.current + 20) / (CARD_W + 20)));
    const rows = Math.ceil(comments.length / cols);
    return Math.max(400, rows * (CARD_H + 40) + 80);
  }, [comments.length]);

  const handlePosChange = useCallback((id: number, pos: Pos) => {
    setPositions(prev => ({ ...prev, [id]: pos }));
  }, []);

  const handleDragStart = useCallback((id: number) => {
    setTopZ(z => {
      const next = z + 1;
      setZMap(prev => ({ ...prev, [id]: next }));
      return next;
    });
    // unflip while dragging
    setFlippedId(prev => prev === id ? null : prev);
  }, []);

  const handleFlip = useCallback((id: number) => {
    setFlippedId(prev => prev === id ? null : id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSending(true);
    setFormError(null);
    const optimistic: Comment = {
      id: Date.now(),
      displayName: name,
      messageBody: message,
      createdAt: new Date().toISOString(),
      user: { login: "you", avatarUrl: "" },
    };
    setComments(prev => [optimistic, ...prev]);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      const { comment } = await res.json();
      setComments(prev => prev.map(c =>
        c.id === optimistic.id ? { ...c, id: comment.id, createdAt: comment.createdAt } : c
      ));
      setPositions(prev => {
        const next = { ...prev };
        if (next[optimistic.id]) { next[comment.id] = next[optimistic.id]; delete next[optimistic.id]; }
        return next;
      });
      setName(""); setMessage("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: "75ch" }}>
      <h2 className="text-lg font-medium dark:text-white mb-2">Guestbook</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Leave a note. Drag polaroids around. Click to flip and read.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-10">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          required
          disabled={sending}
          className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Your message…"
          required
          disabled={sending}
          rows={3}
          className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
        />
        {formError && <p className="text-xs text-red-500">{formError}</p>}
        <button
          type="submit"
          disabled={sending || !name.trim() || !message.trim()}
          className="self-start px-4 py-2 text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-40"
        >
          {sending ? "Sending…" : "Leave a note"}
        </button>
      </form>

      {/* Board */}
      {loading ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-600">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-600">No entries yet — be the first.</p>
      ) : (
        <>
          {/* overflow-visible so cards near edges don't clip */}
          <div
            ref={boardRef}
            style={{
              position: "relative",
              width: "100%",
              height: boardHeight,
              overflow: "visible",
            }}
          >
            {comments.map((c, i) => {
              const pos = positions[c.id];
              if (!pos) return null;
              return (
                <Polaroid
                  key={c.id}
                  comment={c}
                  index={i}
                  pos={pos}
                  onPosChange={handlePosChange}
                  flipped={flippedId === c.id}
                  onFlip={handleFlip}
                  zIndex={zMap[c.id] ?? 10}
                  onDragStart={handleDragStart}
                />
              );
            })}
          </div>

          {hasNext && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => fetchPage(page + 1, true)}
                disabled={loadingMore}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-40"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
