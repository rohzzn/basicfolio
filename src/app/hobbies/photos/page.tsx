"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface InstagramResponse {
  data: InstagramPost[];
  error?: string;
}

function PhotoGrid({ posts }: { posts: InstagramPost[] }) {
  const [lightbox, setLightbox] = useState<InstagramPost | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 sm:gap-1">
        {posts.map(post => {
          const imgUrl = post.media_type === 'VIDEO' ? post.thumbnail_url ?? post.media_url : post.media_url;
          return (
            <button
              key={post.id}
              onClick={() => setLightbox(post)}
              className="relative aspect-square overflow-hidden bg-zinc-200 dark:bg-zinc-800 group"
            >
              <Image
                src={imgUrl}
                alt={post.caption?.slice(0, 80) ?? 'Photo'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 20vw"
                unoptimized
              />
              {post.media_type === 'VIDEO' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                    <span className="text-zinc-900 text-xs ml-0.5">▶</span>
                  </div>
                </div>
              )}
              {post.media_type === 'CAROUSEL_ALBUM' && (
                <div className="absolute top-2 right-2">
                  <svg className="w-4 h-4 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="7" y="3" width="14" height="14" rx="2" strokeWidth="2" />
                    <path d="M3 7v10a2 2 0 002 2h10" strokeWidth="2" />
                  </svg>
                </div>
              )}
              {/* Caption overlay */}
              {post.caption && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                  <p className="text-white text-[11px] leading-snug line-clamp-3">{post.caption}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm transition-colors"
            >
              close ✕
            </button>

            {/* Image */}
            <div className="relative w-full rounded-lg overflow-hidden bg-zinc-900">
              <Image
                src={lightbox.media_type === 'VIDEO' ? lightbox.thumbnail_url ?? lightbox.media_url : lightbox.media_url}
                alt={lightbox.caption ?? 'Photo'}
                width={800}
                height={800}
                className="w-full h-auto max-h-[70vh] object-contain"
                unoptimized
              />
            </div>

            {/* Meta */}
            <div className="mt-3 flex items-start justify-between gap-4">
              <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3 flex-1">
                {lightbox.caption ?? ''}
              </p>
              <a
                href={lightbox.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white transition-colors flex-shrink-0"
              >
                View on Instagram ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 sm:gap-1">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      ))}
    </div>
  );
}

export default function PhotosPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/instagram')
      .then(r => r.json())
      .then((data: InstagramResponse) => {
        if (data.error) throw new Error(data.error);
        setPosts(data.data ?? []);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load photos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Photos</h2>
        <a
          href="https://www.instagram.com/rohan_heic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          @rohan_heic ↗
        </a>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{error}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Add <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">INSTAGRAM_ACCESS_TOKEN</code> to your .env to enable photos.
          </p>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 py-12 text-center">No photos yet.</p>
      ) : (
        <>
          <PhotoGrid posts={posts} />
          <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-4">
            {posts.length} posts · click to view · tap outside to close
          </p>
        </>
      )}
    </div>
  );
}
