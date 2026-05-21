"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { posts } from '@/data/writing';

const WritingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    return posts.filter(p =>
      selectedCategory === 'all' ? true : p.category === selectedCategory
    );
  }, [selectedCategory]);

  const categories = ['all', 'tech', 'life'];

  return (
    <div style={{ maxWidth: '75ch' }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Writing</h2>
        <div className="flex gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
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
    </div>
  );
};

export default WritingPage;
