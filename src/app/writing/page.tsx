"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

const WritingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const posts = useMemo(() => [
    {
      slug: 'first-spring',
      title: 'Second Semester at UC',
      date: '2025-04-28',
      displayDate: 'Apr 2025',
      description: 'Academics, leadership & Cincinnati spring',
      category: 'life',
    },
    {
      slug: 'uc-experience',
      title: 'First Semester at UC',
      date: '2024-12-31',
      displayDate: 'Dec 2024',
      description: 'New beginnings & campus life',
      category: 'life',
    },
    {
      slug: 'variables-exposure',
      title: 'Environment Variables Dont Hide Data',
      date: '2024-12-29',
      displayDate: 'Dec 2024',
      description: 'Security vulnerabilities exposed',
      category: 'tech',
    },
    {
      slug: 'modern-tech-stacks',
      title: 'Modern Tech Stacks Kill Startups',
      date: '2024-06-10',
      displayDate: 'Jun 2024',
      description: 'Why we chose PHP in 2024',
      category: 'tech',
    },
    {
      slug: 'security-article',
      title: 'Your 2FA Is Broken',
      date: '2024-05-15',
      displayDate: 'May 2024',
      description: 'Time-based token attacks',
      category: 'tech',
    },
    {
      slug: 'boring-performance',
      title: 'Boring Guide to 10x Frontend Performance',
      date: '2024-04-15',
      displayDate: 'Apr 2024',
      description: 'Unconventional optimization techniques',
      category: 'tech',
    },
    {
      slug: 'discord-article',
      title: 'How Discord Survived 2024s Biggest Launch',
      date: '2024-03-20',
      displayDate: 'Mar 2024',
      description: 'Infrastructure at 12M concurrent users',
      category: 'tech',
    },
    {
      slug: 'esports-journey',
      title: 'My Time in Esports',
      date: '2024-03-08',
      displayDate: 'Mar 2024',
      description: 'CS tournaments to Valorant',
      category: 'life',
    },
    {
      slug: 'chatgpt-interface',
      title: 'Building My Own ChatGPT UI',
      date: '2024-01-20',
      displayDate: 'Jan 2024',
      description: 'Why UI/UX engineers matter',
      category: 'tech',
    },
    {
      slug: 'ixigo-experience',
      title: 'SDE Intern at Abhibus (Ixigo)',
      date: '2023-10-10',
      displayDate: 'Oct 2023',
      description: 'Internship experience & projects',
      category: 'life',
    },
    {
      slug: 'beginners-guide-programming',
      title: 'Beginners Guide for Programming',
      date: '2021-04-28',
      displayDate: 'Apr 2021',
      description: 'Fundamentals & career paths',
      category: 'tech',
    },
    {
      slug: 'beginners-guide-design',
      title: 'Beginners Guide for Design',
      date: '2021-04-28',
      displayDate: 'Apr 2021',
      description: 'Tools & practical tips',
      category: 'tech',
    },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), []);

  const categories = ['all', 'tech', 'life'];

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div style={{ maxWidth: '75ch' }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Writing</h2>
        <div className="flex gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-sm capitalize transition-colors ${
                selectedCategory === category
                  ? 'text-zinc-900 dark:text-white font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className="group flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
          >
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
              {post.title}
            </span>
            <span className="text-xs text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors flex-shrink-0 ml-4">
              {post.displayDate}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WritingPage;
