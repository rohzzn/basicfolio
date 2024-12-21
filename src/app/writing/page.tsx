"use client";

import React, { useState } from 'react';
import IxigoExperience from './ixigo-experience';

const WritingPage = () => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const posts = [
    {
      slug: 'ixigo-experience',
      title: 'SDE Intern Experience at Abhibus (Ixigo)',
      date: 'October 10, 2023',
      readTime: '3 min read',
      description: 'A journey through my internship experience as a Software Development Engineer at Abhibus (Ixigo), exploring various projects and learning opportunities.'
    }
    // Add more blog posts here as needed
  ];

  if (selectedPost === 'ixigo-experience') {
    return <IxigoExperience onBack={() => setSelectedPost(null)} />;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Writing</h2>
      <div className="space-y-8">
        {posts.map((post) => (
          <article 
            key={post.slug}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            onClick={() => setSelectedPost(post.slug)}
          >
            <h3 className="text-xl font-medium dark:text-white mb-2">{post.title}</h3>
            <div className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              <time dateTime={post.date}>{post.date}</time>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WritingPage;