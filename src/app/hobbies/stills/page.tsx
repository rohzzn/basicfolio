"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramResponse {
  data: InstagramPost[];
  error?: string;
}

function captionForDisplay(raw: string | undefined): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  let t = raw
    .replace(/@rohan_heic\b/gi, "")
    .replace(/\brohan_heic\b/gi, "")
    .replace(/https?:\/\/(www\.)?instagram\.com\/rohan_heic[^\s]*/gi, "");
  t = t.replace(/\s{2,}/g, " ").trim();
  return t.length > 0 ? t : undefined;
}

function measureSlideStepY(sc: HTMLDivElement): number {
  const ch = sc.children;
  if (ch.length < 2) return 0;
  const a = ch[0] as HTMLElement;
  const b = ch[1] as HTMLElement;
  return b.offsetTop - a.offsetTop;
}

/** Y-center of-item in scroll content coordinates (ignores transforms on thumbnails). */
function itemCenterScrollY(sc: HTMLElement, node: HTMLElement): number {
  if ((node.offsetParent as HTMLElement | null) === sc) {
    return node.offsetTop + node.offsetHeight / 2;
  }
  const sr = sc.getBoundingClientRect();
  const nr = node.getBoundingClientRect();
  return sc.scrollTop + (nr.top - sr.top) + nr.height / 2;
}

function clampScrollTop(sc: HTMLDivElement) {
  const maxScroll = Math.max(0, sc.scrollHeight - sc.clientHeight);
  sc.scrollTop = Math.max(0, Math.min(sc.scrollTop, maxScroll));
}

function scrollStripSoThumbCentered(sc: HTMLDivElement, node: HTMLElement) {
  if ((node.offsetParent as HTMLElement | null) !== sc) return;
  const mid = node.offsetTop + node.offsetHeight / 2;
  const nextTop = mid - sc.clientHeight / 2;
  sc.scrollTop = nextTop;
  clampScrollTop(sc);
}

/** Convert wheel deltas to pixels (many mice use DOM_DELTA_LINE with small values). */
function wheelDeltaPixels(e: WheelEvent): { dx: number; dy: number } {
  let dx = e.deltaX;
  let dy = e.deltaY;
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    const line = 48;
    dx *= line;
    dy *= line;
  } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    dx *= window.innerWidth;
    dy *= window.innerHeight;
  }
  return { dx, dy };
}

/** Same posts repeated so the strip can loop; logical slot uses modulo of rendered index. */
const STRIP_LOOP_COPIES = 5;
const STRIP_MIDDLE_COPY_IDX = Math.floor(STRIP_LOOP_COPIES / 2);

function logicalIndexFromRendered(renderedIndex: number, n: number): number {
  return ((renderedIndex % n) + n) % n;
}

/** Soft mechanical tick when the centered strip frame changes (Web Audio; no asset files). */
const FRAMES_SCROLL_TICK_MIN_MS = 74;

function createFramesScrollTickSound() {
  let ctx: AudioContext | null = null;
  let lastAt = 0;

  function getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      try {
        ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    return ctx;
  }

  function resume(): void {
    const c = getCtx();
    if (c?.state === "suspended") void c.resume();
  }

  function tick(): void {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const c = getCtx();
    if (!c || c.state !== "running") return;

    const now = performance.now();
    if (now - lastAt < FRAMES_SCROLL_TICK_MIN_MS) return;
    lastAt = now;

    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    const filter = c.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(560, t);
    osc.frequency.exponentialRampToValueAtTime(340, t + 0.036);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(0.6, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);

    const peak = 0.038;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.052);

    osc.start(t);
    osc.stop(t + 0.055);
  }

  return { resume, tick };
}

const framesScrollTickSound = createFramesScrollTickSound();

/** Closest thumbnail wrapper to viewport center Y (scroll coordinates); ties broken by lower rendered index. */
function findClosestThumbnailWrapper(sc: HTMLDivElement, centerY: number): HTMLElement | null {
  const thumbs = sc.querySelectorAll<HTMLElement>("[data-rendered-index]");
  let best: HTMLElement | null = null;
  let bestD = Infinity;
  let bestRendered = Infinity;
  thumbs.forEach((node) => {
    const ri = Number(node.dataset.renderedIndex);
    if (!Number.isFinite(ri)) return;
    const ic = itemCenterScrollY(sc, node);
    const d = Math.abs(ic - centerY);
    if (d < bestD - 1e-6 || (Math.abs(d - bestD) <= 1e-6 && ri < bestRendered)) {
      best = node;
      bestD = d;
      bestRendered = ri;
    }
  });
  return best;
}

/** Two stacked hero layers swap `frontA` so the URL can crossfade without layout changes. */
type HeroDuplex = { a: InstagramPost; b: InstagramPost; frontA: boolean };

function FramesHeroImageStack({
  duplex,
  altA,
  altB,
}: {
  duplex: HeroDuplex;
  altA: string;
  altB: string;
}) {
  const layerBase =
    "absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:!transition-none motion-reduce:!duration-0";

  const renderPost = (post: InstagramPost, alt: string, isFront: boolean) => (
    <div
      className={`${layerBase} ${isFront ? "z-[1] opacity-100" : "z-0 opacity-0 pointer-events-none"}`}
      aria-hidden={!isFront}
    >
      <Image
        key={post.id}
        src={post.media_type === "VIDEO" ? post.thumbnail_url ?? post.media_url : post.media_url}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
        sizes="(max-width: 1024px) min(100vw - 2rem, 384px), 420px"
        unoptimized
        draggable={false}
        priority={isFront}
      />
      {post.media_type === "VIDEO" && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md dark:bg-zinc-900/90 dark:text-zinc-100">
            <span className="ml-0.5 text-xs" aria-hidden>
              ▶
            </span>
          </span>
        </span>
      )}
      {post.media_type === "CAROUSEL_ALBUM" && (
        <span
          className="pointer-events-none absolute right-2.5 top-2.5 rounded bg-black/35 px-1.5 py-0.5 text-white backdrop-blur-[2px]"
          aria-hidden
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="7" y="3" width="14" height="14" rx="2" strokeWidth="2" />
            <path d="M3 7v10a2 2 0 002 2h10" strokeWidth="2" />
          </svg>
        </span>
      )}
    </div>
  );

  return (
    <>
      {renderPost(duplex.a, altA, duplex.frontA)}
      {renderPost(duplex.b, altB, !duplex.frontA)}
    </>
  );
}

function FramesStrip({ posts }: { posts: InstagramPost[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const didInitScrollRef = useRef(false);
  const framesZonePointerRef = useRef(false);
  const framesWheelZoneRef = useRef<HTMLDivElement | null>(null);
  const lightboxOpenRef = useRef(false);
  const isRecenteringRef = useRef(false);
  const activeLogicalIndexRef = useRef(0);
  const pendingScrollSyncRafRef = useRef<number | null>(null);
  const postRecenterRafRef = useRef<number | null>(null);

  const [activeLogicalIndex, setActiveLogicalIndex] = useState(0);
  const [lightbox, setLightbox] = useState<InstagramPost | null>(null);
  const heroDuplexRenderRef = useRef<HeroDuplex | null>(null);
  const heroLastSyncedIdRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    lightboxOpenRef.current = lightbox !== null;
  }, [lightbox]);

  const n = posts.length;

  useEffect(() => {
    activeLogicalIndexRef.current = activeLogicalIndex;
  }, [activeLogicalIndex]);

  useEffect(() => {
    const unlock = () => framesScrollTickSound.resume();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("wheel", unlock, { passive: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("wheel", unlock, true);
    };
  }, []);

  const prevLogicalForSoundRef = useRef<number | null>(null);

  useEffect(() => {
    prevLogicalForSoundRef.current = null;
  }, [n]);

  useEffect(() => {
    if (n === 0 || lightbox) return;

    const prev = prevLogicalForSoundRef.current;
    prevLogicalForSoundRef.current = activeLogicalIndex;

    if (prev === null) return;
    if (prev === activeLogicalIndex) return;

    framesScrollTickSound.tick();
  }, [activeLogicalIndex, lightbox, n]);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setLightbox(null);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [lightbox, onKeyDown]);

  const cancelPendingScrollSync = useCallback(() => {
    if (pendingScrollSyncRafRef.current != null) {
      cancelAnimationFrame(pendingScrollSyncRafRef.current);
      pendingScrollSyncRafRef.current = null;
    }
  }, []);

  const cancelPostRecenterRaf = useCallback(() => {
    if (postRecenterRafRef.current != null) {
      cancelAnimationFrame(postRecenterRafRef.current);
      postRecenterRafRef.current = null;
      isRecenteringRef.current = false;
    }
  }, []);

  /** Cancels coalesced scroll sync and deferred post-recenter work (wheel momentum removed). */
  const abortScheduledStripSync = useCallback(() => {
    cancelPendingScrollSync();
    cancelPostRecenterRaf();
  }, [cancelPendingScrollSync, cancelPostRecenterRaf]);

  const syncFromScrollRef = useRef<() => void>(() => {});

  const queuePostRecenterSync = useCallback(
    (afterSync?: () => void) => {
      cancelPostRecenterRaf();
      postRecenterRafRef.current = requestAnimationFrame(() => {
        postRecenterRafRef.current = null;
        isRecenteringRef.current = false;
        syncFromScrollRef.current();
        afterSync?.();
      });
    },
    [cancelPostRecenterRaf]
  );

  const syncFromScroll = useCallback(() => {
    const sc = scrollRef.current;
    if (!sc || n === 0) return;
    if (isRecenteringRef.current) return;

    const scrollTop = sc.scrollTop;
    const centerY = scrollTop + sc.clientHeight / 2;

    const closestBefore = findClosestThumbnailWrapper(sc, centerY);
    if (!closestBefore) return;

    const closestRenderedBefore = Number(closestBefore.dataset.renderedIndex);
    if (!Number.isFinite(closestRenderedBefore)) return;

    const step = measureSlideStepY(sc);
    const cycleHeight = n * step;
    const copyIdxBefore = Math.floor(closestRenderedBefore / n);

    if (step > 0 && STRIP_LOOP_COPIES >= 3) {
      if (copyIdxBefore === 0) {
        abortScheduledStripSync();
        isRecenteringRef.current = true;
        sc.scrollTop += cycleHeight;
        clampScrollTop(sc);
        queuePostRecenterSync();
        return;
      }
      if (copyIdxBefore === STRIP_LOOP_COPIES - 1) {
        abortScheduledStripSync();
        isRecenteringRef.current = true;
        sc.scrollTop -= cycleHeight;
        clampScrollTop(sc);
        queuePostRecenterSync();
        return;
      }
    }

    const centerY2 = sc.scrollTop + sc.clientHeight / 2;
    const centeredThumb = findClosestThumbnailWrapper(sc, centerY2);
    if (!centeredThumb) return;

    const closestRenderedIndex = Number(centeredThumb.dataset.renderedIndex);
    const closestLogicalIndex = Number(centeredThumb.dataset.logicalIndex);
    if (!Number.isFinite(closestRenderedIndex) || !Number.isFinite(closestLogicalIndex)) return;

    const thumbs = sc.querySelectorAll<HTMLElement>("[data-rendered-index]");
    thumbs.forEach((node) => {
      const ic = itemCenterScrollY(sc, node);
      const d = Math.abs(ic - centerY2);
      const norm = Math.min(1, d / (sc.clientHeight * 0.42));
      const scale = 1 - norm * 0.22;
      const opacity = 0.28 + (1 - norm) * 0.72;
      node.style.transform = `scale(${scale})`;
      node.style.opacity = String(opacity);
    });

    activeLogicalIndexRef.current = closestLogicalIndex;
    setActiveLogicalIndex((prev) => (prev === closestLogicalIndex ? prev : closestLogicalIndex));
  }, [n, abortScheduledStripSync, queuePostRecenterSync]);

  useLayoutEffect(() => {
    syncFromScrollRef.current = syncFromScroll;
  });

  const scheduleSyncFromScroll = useCallback(() => {
    if (isRecenteringRef.current) return;
    if (pendingScrollSyncRafRef.current != null) return;
    pendingScrollSyncRafRef.current = requestAnimationFrame(() => {
      pendingScrollSyncRafRef.current = null;
      syncFromScroll();
    });
  }, [syncFromScroll]);

  const navigateToLogicalIndex = useCallback(
    (targetLogical: number) => {
      const sc = scrollRef.current;
      if (!sc || n === 0) return;
      const wrapped = ((targetLogical % n) + n) % n;
      const renderedTarget = STRIP_MIDDLE_COPY_IDX * n + wrapped;
      const node = itemRefs.current[renderedTarget];
      if (!node) return;
      abortScheduledStripSync();
      isRecenteringRef.current = true;
      scrollStripSoThumbCentered(sc, node);
      clampScrollTop(sc);
      queuePostRecenterSync();
    },
    [n, abortScheduledStripSync, queuePostRecenterSync]
  );

  const centerRenderedThumbnailThen = useCallback(
    (renderedIndex: number, afterSync?: () => void) => {
      const sc = scrollRef.current;
      const totalRendered = STRIP_LOOP_COPIES * n;
      const node = itemRefs.current[renderedIndex];
      if (!sc || !node || renderedIndex < 0 || renderedIndex >= totalRendered) return;
      abortScheduledStripSync();
      isRecenteringRef.current = true;
      scrollStripSoThumbCentered(sc, node);
      clampScrollTop(sc);
      queuePostRecenterSync(afterSync);
    },
    [n, abortScheduledStripSync, queuePostRecenterSync]
  );

  const navigateByArrow = useCallback(
    (dir: 1 | -1) => {
      const cur = activeLogicalIndexRef.current;
      const next = (cur + dir + n) % n;
      navigateToLogicalIndex(next);
    },
    [n, navigateToLogicalIndex]
  );

  useEffect(() => {
    if (lightbox) return;

    const shouldHandleArrowsForTarget = (target: EventTarget | null): boolean => {
      const el = target;
      if (!(el instanceof Element)) return true;
      const editable = el.closest("input, textarea, select, [contenteditable='true']");
      return editable === null;
    };

    const onDocKeyDown = (e: KeyboardEvent) => {
      const nextKeys = ["ArrowRight", "ArrowDown"];
      const prevKeys = ["ArrowLeft", "ArrowUp"];
      const isNext = nextKeys.includes(e.key);
      const isPrev = prevKeys.includes(e.key);
      if (!isNext && !isPrev) return;
      const sc = scrollRef.current;
      if (!sc || n === 0) return;
      if (!shouldHandleArrowsForTarget(e.target)) return;

      const ae = document.activeElement;
      const wheelZone = framesWheelZoneRef.current;
      const focusInsideFrames =
        wheelZone instanceof Node && ae instanceof Node && wheelZone.contains(ae);
      if (!framesZonePointerRef.current && !focusInsideFrames) return;

      e.preventDefault();
      navigateByArrow(isNext ? 1 : -1);
    };

    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [lightbox, n, navigateByArrow]);

  useLayoutEffect(() => {
    didInitScrollRef.current = false;
  }, [posts]);

  useLayoutEffect(() => {
    const totalRendered = STRIP_LOOP_COPIES * n;
    if (itemRefs.current.length > totalRendered) itemRefs.current.length = totalRendered;
  }, [n]);

  useLayoutEffect(() => {
    const sc = scrollRef.current;
    if (!sc || n === 0) return;

    const id = requestAnimationFrame(() => {
      if (!didInitScrollRef.current) {
        const midRendered = STRIP_MIDDLE_COPY_IDX * n;
        const anchor = itemRefs.current[midRendered];
        if (anchor) {
          abortScheduledStripSync();
          isRecenteringRef.current = true;
          scrollStripSoThumbCentered(sc, anchor);
          didInitScrollRef.current = true;
          activeLogicalIndexRef.current = 0;
          setActiveLogicalIndex(0);
          queuePostRecenterSync();
          return;
        }
      }
      syncFromScroll();
    });
    return () => cancelAnimationFrame(id);
  }, [n, posts, syncFromScroll, abortScheduledStripSync, queuePostRecenterSync]);

  useLayoutEffect(() => {
    const onWheelWindowCapture = (e: WheelEvent) => {
      if (lightboxOpenRef.current) return;

      const zone = framesWheelZoneRef.current;
      const sc = scrollRef.current;
      if (!zone || !sc || n === 0) return;

      const maxScroll = sc.scrollHeight - sc.clientHeight;
      if (maxScroll <= 0) return;

      const zr = zone.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      if (x < zr.left || x > zr.right || y < zr.top || y > zr.bottom) return;

      if (e.ctrlKey) return;

      const { dx, dy } = wheelDeltaPixels(e);
      const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
      if (delta === 0) return;

      e.preventDefault();

      abortScheduledStripSync();
      sc.scrollTop += delta;
      clampScrollTop(sc);

      if (pendingScrollSyncRafRef.current != null) {
        cancelAnimationFrame(pendingScrollSyncRafRef.current);
        pendingScrollSyncRafRef.current = null;
      }
      pendingScrollSyncRafRef.current = requestAnimationFrame(() => {
        pendingScrollSyncRafRef.current = null;
        syncFromScrollRef.current();
      });
    };

    window.addEventListener("wheel", onWheelWindowCapture, { passive: false, capture: true });
    return () => {
      window.removeEventListener("wheel", onWheelWindowCapture, true);
    };
  }, [n, abortScheduledStripSync]);

  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;

    const onScroll = () => {
      scheduleSyncFromScroll();
    };

    sc.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => {
      if (isRecenteringRef.current) {
        scheduleSyncFromScroll();
        return;
      }
      syncFromScroll();
    });
    ro.observe(sc);

    const onResize = () => {
      if (isRecenteringRef.current) {
        scheduleSyncFromScroll();
        return;
      }
      syncFromScroll();
    };
    window.addEventListener("resize", onResize);

    const id = requestAnimationFrame(() => {
      if (!isRecenteringRef.current) syncFromScroll();
    });

    return () => {
      cancelAnimationFrame(id);
      sc.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [n, syncFromScroll, scheduleSyncFromScroll]);

  useLayoutEffect(() => {
    if (n === 0) return;
    setActiveLogicalIndex((prev) => Math.min(Math.max(prev, 0), n - 1));
  }, [n]);

  const heroIdx = n === 0 ? 0 : Math.min(Math.max(activeLogicalIndex, 0), n - 1);
  const activeCaption = captionForDisplay(posts[heroIdx]?.caption);
  const activePost = posts[heroIdx];
  const lightboxCaption = lightbox ? captionForDisplay(lightbox.caption) : undefined;

  let heroDuplexForUi: HeroDuplex | null = null;
  if (!activePost) {
    heroDuplexRenderRef.current = null;
    heroLastSyncedIdRef.current = null;
  } else {
    const cur = heroDuplexRenderRef.current;
    if (cur === null || activePost.id !== heroLastSyncedIdRef.current) {
      heroLastSyncedIdRef.current = activePost.id;
      if (cur === null) {
        heroDuplexRenderRef.current = { a: activePost, b: activePost, frontA: true };
      } else if (cur.frontA) {
        heroDuplexRenderRef.current = { ...cur, b: activePost, frontA: false };
      } else {
        heroDuplexRenderRef.current = { ...cur, a: activePost, frontA: true };
      }
    }
    heroDuplexForUi = heroDuplexRenderRef.current;
  }

  const heroAltA = captionForDisplay(heroDuplexForUi?.a.caption);
  const heroAltB = captionForDisplay(heroDuplexForUi?.b.caption);

  return (
    <>
      <div
        ref={(el) => {
          framesWheelZoneRef.current = el;
        }}
        onPointerEnter={() => {
          framesZonePointerRef.current = true;
        }}
        onPointerLeave={() => {
          framesZonePointerRef.current = false;
        }}
      >
        <div className="w-full min-w-0" aria-roledescription="carousel">
          <div className="flex w-full min-w-0 flex-col items-start gap-4">
            <div className="flex min-w-0 w-full flex-row items-start gap-3 sm:gap-4">
              <div className="w-[min(100%,24rem)] shrink-0">
            {activePost && heroDuplexForUi ? (
                <button
                  type="button"
                  onClick={() => setLightbox(activePost)}
                  className="group relative block w-full max-w-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] dark:focus-visible:ring-zinc-500"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-200/90 shadow-md ring-1 ring-zinc-200/90 dark:bg-zinc-800/70 dark:ring-zinc-700/60">
                    <FramesHeroImageStack
                      duplex={heroDuplexForUi}
                      altA={heroAltA ? heroAltA.slice(0, 120) : "Photo"}
                      altB={heroAltB ? heroAltB.slice(0, 120) : "Photo"}
                    />
                  </div>
                </button>
              ) : null}
              </div>

              <div
                ref={scrollRef}
                className="flex h-[min(32rem,72vh)] w-[4.25rem] shrink-0 snap-y snap-mandatory flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0.5 py-0 [scroll-padding-block:min(20vh,5.5rem)] [-webkit-mask-image:linear-gradient(180deg,transparent,black_12px,black_calc(100%-12px),transparent)] [mask-image:linear-gradient(180deg,transparent,black_12px,black_calc(100%-12px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-[4.75rem]"
                style={{
                  WebkitOverflowScrolling: "touch",
                }}
                tabIndex={0}
                role="region"
                aria-label="Seen — scroll the wheel over the gallery or swipe the strip. Arrow keys when focused."
                onKeyDown={(e) => {
                  const next = e.key === "ArrowDown" || e.key === "ArrowRight";
                  const prev = e.key === "ArrowUp" || e.key === "ArrowLeft";
                  if (!next && !prev) return;
                  e.preventDefault();
                  e.stopPropagation();
                  navigateByArrow(next ? 1 : -1);
                }}
              >
                {Array.from({ length: STRIP_LOOP_COPIES * n }, (_, renderedIndex) => {
                  const logicalIndex = logicalIndexFromRendered(renderedIndex, n);
                  const post = posts[logicalIndex]!;
                  const imgUrl =
                    post.media_type === "VIDEO" ? post.thumbnail_url ?? post.media_url : post.media_url;
                  const cap = captionForDisplay(post.caption);
                  const alt = cap ? cap.slice(0, 120) : "Photo";

                  return (
                    <div
                      key={`strip-${renderedIndex}`}
                      ref={(el) => {
                        itemRefs.current[renderedIndex] = el;
                      }}
                      data-rendered-index={renderedIndex}
                      data-logical-index={logicalIndex}
                      className="w-full shrink-0 snap-center will-change-[transform,opacity] transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none"
                      style={{ transformOrigin: "center center" }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          const wrap = (e.currentTarget as HTMLElement).closest("[data-rendered-index]");
                          if (!wrap) return;
                          const ri = Number((wrap as HTMLElement).dataset.renderedIndex);
                          const li = Number((wrap as HTMLElement).dataset.logicalIndex);
                          if (!Number.isFinite(ri) || !Number.isFinite(li)) return;
                          const postForLightbox = posts[li];
                          if (!postForLightbox) return;
                          centerRenderedThumbnailThen(ri, () => setLightbox(postForLightbox));
                        }}
                        className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] dark:focus-visible:ring-zinc-500"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-200/90 shadow-sm ring-1 ring-zinc-200/90 dark:bg-zinc-800/70 dark:ring-zinc-700/60">
                          <Image
                            src={imgUrl}
                            alt={alt}
                            fill
                            className="object-cover transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none group-hover:scale-[1.04]"
                            sizes="76px"
                            unoptimized
                            draggable={false}
                          />

                          {post.media_type === "VIDEO" && (
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/88 text-[10px] text-zinc-900 shadow-md dark:bg-zinc-900/88 dark:text-zinc-100">
                                <span className="ml-px" aria-hidden>
                                  ▶
                                </span>
                              </span>
                            </span>
                          )}

                          {post.media_type === "CAROUSEL_ALBUM" && (
                            <span
                              className="pointer-events-none absolute right-1 top-1 rounded bg-black/35 px-1 py-0.5 text-white backdrop-blur-[2px]"
                              aria-hidden
                            >
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="7" y="3" width="14" height="14" rx="2" strokeWidth="2" />
                                <path d="M3 7v10a2 2 0 002 2h10" strokeWidth="2" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

              <p
                className="max-w-prose text-left text-sm font-normal lowercase leading-snug tracking-tight text-zinc-700 transition-opacity duration-200 ease-out motion-reduce:transition-none dark:text-zinc-300"
                aria-live="polite"
              >
                {activeCaption ?? "\u00a0"}
              </p>
          </div>
        </div>
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Photo"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative flex w-full max-w-[min(100vw-2rem,1200px)] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="mb-3 self-end rounded-md px-2 py-1 text-xs text-white/85 transition-colors hover:bg-white/10 hover:text-white sm:absolute sm:-top-10 sm:mb-0"
            >
              Close <span aria-hidden>·</span> Esc
            </button>

            <Image
              src={
                lightbox.media_type === "VIDEO"
                  ? lightbox.thumbnail_url ?? lightbox.media_url
                  : lightbox.media_url
              }
              alt={lightboxCaption ?? "Photo"}
              width={1600}
              height={1600}
              className="h-auto max-h-[min(85vh,calc(100vw-2rem))] w-auto max-w-full object-contain"
              unoptimized
              priority
            />

            {lightboxCaption ? (
              <p className="mt-4 max-w-2xl self-start text-left text-sm lowercase leading-relaxed text-zinc-200">
                {lightboxCaption}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function SkeletonStrip() {
  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-4 animate-pulse">
      <div className="flex min-w-0 w-full flex-row items-start gap-3 sm:gap-4">
        <div className="w-[min(100%,24rem)] shrink-0">
          <div className="aspect-[3/4] w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="flex h-[min(32rem,72vh)] w-[4.25rem] shrink-0 flex-col gap-2 overflow-hidden px-0.5 sm:w-[4.75rem]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] w-full shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
      <div className="h-14 max-w-prose rounded-md bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default function SeenPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((data: InstagramResponse) => {
        if (data.error) throw new Error(data.error);
        setPosts(data.data ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load photos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full min-w-0" style={{ maxWidth: "75ch" }}>
      <div className="mb-6 space-y-3">
        <h2 className="text-lg font-medium dark:text-white">Seen</h2>
        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          An archive of images I liked.
        </p>
      </div>

      {loading ? (
        <SkeletonStrip />
      ) : error ? (
        <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 px-4 py-8 dark:border-zinc-800/80 dark:bg-zinc-900/25">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{error}</p>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Add{" "}
            <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              INSTAGRAM_ACCESS_TOKEN
            </code>{" "}
            to your environment to load this gallery.
          </p>
        </div>
      ) : posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-200/90 py-12 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          No photos yet.
        </p>
      ) : (
        <FramesStrip posts={posts} />
      )}
    </div>
  );
}
