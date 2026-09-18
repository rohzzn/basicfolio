'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { posts } from '@/data/writing';
import FilmCard from '@/components/FilmCard';
import films from '@/data/writing-films.json';
import type { TweetItem } from '@/lib/tweets-types';

type Category = 'all' | 'tech' | 'life' | 'tweets';

const REFRESH_MS = 60 * 1000;

const categories: Category[] = ['tech', 'life', 'tweets'];

type Post = (typeof posts)[number];

function PostCard({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/writing/${post.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group block overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-300 dark:border-neutral-800 dark:hover:border-neutral-700"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ebe0] dark:bg-neutral-900">
        <FilmCard film={films[post.slug as keyof typeof films]} hovered={hovered} />
      </div>
      <div className="border-t border-zinc-100 p-3 dark:border-neutral-800/60">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900 dark:text-neutral-300 dark:group-hover:text-paper">
            {post.title}
          </span>
          <span className="shrink-0 text-[10px] text-zinc-400 dark:text-neutral-500">{post.displayDate}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-neutral-400">{post.description}</p>
      </div>
    </Link>
  );
}

const WritingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
  const [tweets, setTweets] = useState<TweetItem[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [tweetsError, setTweetsError] = useState(false);

  const filtered = useMemo(() => {
    return posts.filter((post) =>
      selectedCategory === 'all' ? true : post.category === selectedCategory
    );
  }, [selectedCategory]);

  const loadTweets = async () => {
    setTweetsLoading(true);
    setTweetsError(false);

    try {
      const response = await fetch('/api/writing/tweets');
      const data = (await response.json()) as { tweets?: TweetItem[]; error?: string };
      setTweets(data.tweets ?? []);
      setTweetsError(data.error === 'unavailable');
    } catch {
      setTweets([]);
      setTweetsError(true);
    } finally {
      setTweetsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory !== 'tweets') return;

    void loadTweets();
    const interval = window.setInterval(() => {
      void loadTweets();
    }, REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [selectedCategory]);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-paper">Writing</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2" role="tablist" aria-label="Writing categories">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-sm capitalize transition-colors ${
                selectedCategory === cat
                  ? 'text-zinc-900 dark:text-paper font-medium'
                  : 'text-zinc-500 dark:text-neutral-400 hover:text-zinc-700 dark:hover:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory === 'tweets' ? (
        // tweets stay in a reading column; only the post grid wants the wide one
        <div className="max-w-2xl">
          {tweetsLoading && tweets.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-neutral-400 py-2">Loading tweets…</p>
          )}

          {!tweetsLoading && tweetsError && tweets.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-neutral-400 py-2">Tweets unavailable right now.</p>
          )}

          {!tweetsLoading && !tweetsError && tweets.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-neutral-400 py-2">No tweets yet.</p>
          )}

          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="py-3 border-b border-zinc-100 dark:border-neutral-800/60 last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  {tweet.text && (
                    <a
                      href={tweet.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium text-zinc-700 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-paper transition-colors"
                    >
                      {tweet.text}
                    </a>
                  )}

                  {tweet.media && tweet.media.length > 0 && (
                    <div
                      className={`grid gap-2 ${tweet.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} max-w-md`}
                    >
                      {tweet.media.map((item) => (
                        <div
                          key={item.previewUrl}
                          className={`relative rounded-md border border-zinc-200 dark:border-neutral-800 bg-zinc-100 dark:bg-neutral-900 ${
                            item.type === 'video' ? '' : 'overflow-hidden'
                          }`}
                        >
                          {item.type === 'video' && item.videoUrl ? (
                            <video
                              src={item.videoUrl}
                              poster={item.previewUrl}
                              controls
                              playsInline
                              preload="metadata"
                              className="block w-full max-h-80 bg-black"
                            />
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.previewUrl}
                              alt=""
                              className="w-full max-h-56 object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!tweet.text && !tweet.media && (
                    <a
                      href={tweet.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm font-medium text-zinc-700 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-paper transition-colors"
                    >
                      Post
                    </a>
                  )}
                </div>

                {tweet.displayDate && (
                  <a
                    href={tweet.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 dark:text-neutral-400 hover:text-zinc-600 dark:hover:text-neutral-400 transition-colors flex-shrink-0"
                  >
                    {tweet.displayDate}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {filtered.map((item) => (
            <PostCard key={item.slug} post={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WritingPage;
