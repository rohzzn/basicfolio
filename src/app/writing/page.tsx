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
      displayDate: 'April 28, 2025',
      description: 'Academics, leadership & Cincinnati spring',
      category: 'life'
    },
    {
      slug: 'uc-experience',
      title: 'First Semester at UC',
      date: '2024-12-31',
      displayDate: 'December 31, 2024',
      description: 'New beginnings & campus life',
      category: 'life'
    },
    {
      slug: 'variables-exposure',
      title: 'Environment Variables Dont Hide Data',
      date: '2024-12-29',
      displayDate: 'December 29, 2024',
      description: 'Security vulnerabilities exposed',
      category: 'tech'
    },
    {
      slug: 'modern-tech-stacks',
      title: 'Modern Tech Stacks Kill Startups',
      date: '2024-06-10',
      displayDate: 'June 10, 2024',
      description: 'Why we chose PHP in 2024',
      category: 'tech'
    },
    {
      slug: 'security-article',
      title: 'Your 2FA Is Broken',
      date: '2024-05-15',
      displayDate: 'May 15, 2024',
      description: 'Time-based token attacks',
      category: 'tech'
    },
    {
      slug: 'boring-performance',
      title: 'Boring Guide to 10x Frontend Performance',
      date: '2024-04-15',
      displayDate: 'April 15, 2024',
      description: 'Unconventional optimization techniques',
      category: 'tech'
    },
    {
      slug: 'discord-article',
      title: 'How Discord Survived 2024s Biggest Launch',
      date: '2024-03-20',
      displayDate: 'March 20, 2024',
      description: 'Infrastructure at 12M concurrent users',
      category: 'tech'
    },
    {
      slug: 'esports-journey',
      title: 'My Time in Esports',
      date: '2024-03-08',
      displayDate: 'March 8, 2024',
      description: 'CS tournaments to Valorant',
      category: 'life'
    },
    {
      slug: 'chatgpt-interface',
      title: 'Building My Own ChatGPT UI',
      date: '2024-01-20',
      displayDate: 'January 20, 2024',
      description: 'Why UI/UX engineers matter',
      category: 'tech'
    },
    {
      slug: 'ixigo-experience',
      title: 'SDE Intern at Abhibus (Ixigo)',
      date: '2023-10-10',
      displayDate: 'October 10, 2023',
      description: 'Internship experience & projects',
      category: 'life'
    },
    {
      slug: 'beginners-guide-programming',
      title: 'Beginners Guide for Programming',
      date: '2021-04-28',
      displayDate: 'April 28, 2021',
      description: 'Fundamentals & career paths',
      category: 'tech'
    },
    {
      slug: 'beginners-guide-design',
      title: 'Beginners Guide for Design',
      date: '2021-04-28',
      displayDate: 'April 28, 2021',
      description: 'Tools & practical tips',
      category: 'tech'
    },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), []);

  const categories = ['all', 'tech', 'life'];

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Writing</h2>
      
      {/* Categories */}
      <div className="flex gap-4 mb-8">
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
      
      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Link 
            key={post.slug}
            href={`/writing/${post.slug}`}
            className="group cursor-pointer block"
          >
            <article>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {post.title}, <span className="text-xs text-zinc-500 dark:text-zinc-500 font-normal">{post.description}</span>
              </h3>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WritingPage;
