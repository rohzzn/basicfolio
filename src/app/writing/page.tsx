"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

type Post = {
  slug: string;
  title: string;
  date: string;
  displayDate: string;
  category: 'tech' | 'life';
};

type Thought = {
  text: string;
  date: string;
  displayDate: string;
  category: 'thoughts';
};

type Item = Post | Thought;

const posts: Post[] = [
  { slug: 'first-spring', title: 'Second Semester at UC', date: '2025-04-28', displayDate: 'Apr 2025', category: 'life' },
  { slug: 'uc-experience', title: 'First Semester at UC', date: '2024-12-31', displayDate: 'Dec 2024', category: 'life' },
  { slug: 'variables-exposure', title: 'Environment Variables Dont Hide Data', date: '2024-12-29', displayDate: 'Dec 2024', category: 'tech' },
  { slug: 'modern-tech-stacks', title: 'Modern Tech Stacks Kill Startups', date: '2024-06-10', displayDate: 'Jun 2024', category: 'tech' },
  { slug: 'security-article', title: 'Your 2FA Is Broken', date: '2024-05-15', displayDate: 'May 2024', category: 'tech' },
  { slug: 'boring-performance', title: 'Boring Guide to 10x Frontend Performance', date: '2024-04-15', displayDate: 'Apr 2024', category: 'tech' },
  { slug: 'discord-article', title: 'How Discord Survived 2024s Biggest Launch', date: '2024-03-20', displayDate: 'Mar 2024', category: 'tech' },
  { slug: 'esports-journey', title: 'My Time in Esports', date: '2024-03-08', displayDate: 'Mar 2024', category: 'life' },
  { slug: 'chatgpt-interface', title: 'Building My Own ChatGPT UI', date: '2024-01-20', displayDate: 'Jan 2024', category: 'tech' },
  { slug: 'ixigo-experience', title: 'SDE Intern at Abhibus (Ixigo)', date: '2023-10-10', displayDate: 'Oct 2023', category: 'life' },
  { slug: 'beginners-guide-programming', title: 'Beginners Guide for Programming', date: '2021-04-28', displayDate: 'Apr 2021', category: 'tech' },
  { slug: 'beginners-guide-design', title: 'Beginners Guide for Design', date: '2021-04-28', displayDate: 'Apr 2021', category: 'tech' },
];

// ── Add your thoughts here ──────────────────────────────────────────────────
const thoughts: Thought[] = [
  {
    text: "Less — Shortcuts, Overthinking, Fear, Adding, Postponing\nMore — Living by my principles, Doing, Risk, Subtracting, JUST GETTING S**T DONE",
    date: '2026-03-11',
    displayDate: 'Mar 2026',
    category: 'thoughts',
  },
];
// ────────────────────────────────────────────────────────────────────────────

const WritingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allItems = useMemo<Item[]>(() => {
    return [...posts, ...thoughts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, []);

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return allItems.filter((item) => item.category !== 'thoughts');
    return allItems.filter((item) => item.category === selectedCategory);
  }, [allItems, selectedCategory]);

  const categories = ['all', 'tech', 'life', 'thoughts'];

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
        {filtered.map((item, i) =>
          item.category === 'thoughts' ? (
            <div
              key={i}
              className="py-3 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                  {item.text}
                </p>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 mt-0.5">
                  {item.displayDate}
                </span>
              </div>
            </div>
          ) : (
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
          )
        )}
      </div>
    </div>
  );
};

export default WritingPage;
