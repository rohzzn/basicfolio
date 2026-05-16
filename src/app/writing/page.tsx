"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { posts } from '@/data/writing';

interface Tweet {
  id: string;
  text: string;
  date: string;
  displayDate: string;
  url: string;
  images: string[];
  video?: string;
}

const INITIAL_SHOWN = 5;

function TweetMedia({ images, video }: { images: string[]; video?: string }) {
  if (video) {
    return (
      <video
        src={video}
        controls
        muted
        playsInline
        className="mt-2 rounded-lg max-h-64 w-auto max-w-full"
      />
    );
  }
  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0]}
        alt=""
        className="mt-2 rounded-lg max-h-64 w-auto max-w-full object-cover"
      />
    );
  }
  return (
    <div className={`mt-2 grid gap-1 ${images.length === 2 ? 'grid-cols-2' : images.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {images.slice(0, 4).map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt=""
          className="rounded-md w-full h-32 object-cover"
        />
      ))}
    </div>
  );
}

const WritingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const fetchedRef = useRef(false);

  const fetchTweets = React.useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setTweetsLoading(true);
    fetch('/api/tweets')
      .then(r => r.json())
      .then(data => setTweets(data.tweets || []))
      .catch(() => {})
      .finally(() => setTweetsLoading(false));
  }, []);

  // Prefetch on mount so tab switch feels instant
  useEffect(() => { fetchTweets(); }, [fetchTweets]);

  const filtered = useMemo(() => {
    return posts.filter(p =>
      selectedCategory === 'all' ? true : p.category === selectedCategory
    );
  }, [selectedCategory]);

  const categories = ['all', 'tech', 'life', 'yapping'];
  const visibleTweets = showAll ? tweets : tweets.slice(0, INITIAL_SHOWN);
  const hiddenCount = Math.max(0, tweets.length - INITIAL_SHOWN);

  return (
    <div style={{ maxWidth: '75ch' }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Writing</h2>
        <div className="flex gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setShowAll(false); }}
              className={`text-sm capitalize transition-colors ${
                selectedCategory === cat
                  ? 'text-zinc-900 dark:text-white font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory === 'yapping' ? (
        <div>
          {tweetsLoading ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Loading…</p>
          ) : tweets.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Nothing yet — check back later.</p>
          ) : (
            <>
              {visibleTweets.map((tweet) => (
                <div
                  key={tweet.id}
                  className="py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
                >
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug whitespace-pre-wrap">
                    {tweet.text}
                  </p>

                  <TweetMedia images={tweet.images} video={tweet.video} />

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {tweet.displayDate}
                    </span>
                    {tweet.url && (
                      <a
                        href={tweet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {!showAll && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                >
                  {hiddenCount} more
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div>
          {filtered.map((item) => (
            <Link
              key={item.slug}
              href={`/writing/${item.slug}`}
              className="group flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {item.title}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors flex-shrink-0 ml-4">
                {item.displayDate}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WritingPage;
