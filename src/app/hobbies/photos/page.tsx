"use client";

import React, { useCallback, useEffect, useState } from "react";
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

/** Remove account handles / profile URLs from captions shown on-site. */
function captionForDisplay(raw: string | undefined): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  let t = raw
    .replace(/@rohan_heic\b/gi, "")
    .replace(/\brohan_heic\b/gi, "")
    .replace(/https?:\/\/(www\.)?instagram\.com\/rohan_heic[^\s]*/gi, "");
  t = t.replace(/\s{2,}/g, " ").trim();
  return t.length > 0 ? t : undefined;
}

function PhotoGallery({ posts }: { posts: InstagramPost[] }) {
  const [lightbox, setLightbox] = useState<InstagramPost | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    },
    []
  );

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

  const lightboxCaption = lightbox ? captionForDisplay(lightbox.caption) : undefined;

  return (
    <>
      <div className="columns-2 gap-x-4 md:columns-3 md:gap-x-5">
        {posts.map((post) => {
          const imgUrl =
            post.media_type === "VIDEO" ? post.thumbnail_url ?? post.media_url : post.media_url;
          const cap = captionForDisplay(post.caption);
          const alt = cap ? cap.slice(0, 120) : "Photo";

          return (
            <div key={post.id} className="mb-4 break-inside-avoid">
              <button
                type="button"
                onClick={() => setLightbox(post)}
                className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] dark:focus-visible:ring-zinc-500"
              >
                <span className="relative block overflow-hidden rounded-xl bg-zinc-200/90 shadow-sm ring-1 ring-zinc-200/90 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 dark:bg-zinc-800/70 dark:ring-zinc-700/60">
                  <Image
                    src={imgUrl}
                    alt={alt}
                    width={1080}
                    height={1440}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 768px) 45vw, 30vw"
                    unoptimized
                  />

                  {post.media_type === "VIDEO" && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md dark:bg-zinc-900/90 dark:text-zinc-100">
                        <span className="ml-0.5 text-xs" aria-hidden>
                          ▶
                        </span>
                      </span>
                    </span>
                  )}

                  {post.media_type === "CAROUSEL_ALBUM" && (
                    <span
                      className="pointer-events-none absolute right-2 top-2 rounded bg-black/35 px-1.5 py-0.5 text-white backdrop-blur-[2px]"
                      aria-hidden
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="7" y="3" width="14" height="14" rx="2" strokeWidth="2" />
                        <path d="M3 7v10a2 2 0 002 2h10" strokeWidth="2" />
                      </svg>
                    </span>
                  )}
                </span>

                {cap ? (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-zinc-500 opacity-90 dark:text-zinc-400">
                    {cap}
                  </p>
                ) : null}
              </button>
            </div>
          );
        })}
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
              <p className="mt-4 max-w-2xl self-start text-left text-sm leading-relaxed text-zinc-200">
                {lightboxCaption}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function SkeletonGallery() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800 ${
            i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
          }`}
        />
      ))}
    </div>
  );
}

export default function PhotosPage() {
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
      <div className="mb-8 space-y-3">
        <h2 className="text-lg font-medium dark:text-white">Photos</h2>
        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Frames I liked enough to keep.
        </p>
      </div>

      {loading ? (
        <SkeletonGallery />
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
        <>
          <PhotoGallery posts={posts} />
          <p className="mt-4 text-left text-[11px] text-zinc-400 dark:text-zinc-600">
            {posts.length} {posts.length === 1 ? "image" : "images"}
            <span className="text-zinc-300 dark:text-zinc-700"> · </span>
            press Esc to close the viewer
          </p>
        </>
      )}
    </div>
  );
}
