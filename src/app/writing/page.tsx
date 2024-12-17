// src/app/writing/page.tsx

"use client";
import React from 'react';
import Link from 'next/link';

const writing: React.FC = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Writing</h2>
    <div className="grid gap-8 md:grid-cols-2">
      {[
        {
          title: 'Understanding React Server Components',
          date: 'December 10, 2024',
          excerpt: 'An in-depth look at how React Server Components work and when to use them.',
          readTime: '5 min read',
          slug: 'understanding-react-server-components'
        },
        {
          title: 'Building with Web Components',
          date: 'December 5, 2024',
          excerpt: 'Learn how to create reusable web components for modern applications.',
          readTime: '4 min read',
          slug: 'building-with-web-components'
        }
      ].map((post, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-base font-medium dark:text-white">{post.title}</h3>
          <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3">{post.excerpt}</p>
          <Link href={`/writing/${post.slug}`}>
            <span className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              Read more →
            </span>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

export default writing;
