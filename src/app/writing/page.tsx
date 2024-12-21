"use client";

import React, { useState, useMemo } from 'react';
import IxigoExperience from './ixigo-experience';
import BeginnersGuideDesign from './beginners-guide-design';
import BeginnersGuideProgramming from './beginners-guide-programming';
import EsportsJourney from './esports-journey';

const WritingPage = () => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const posts = useMemo(() => {
    const allPosts = [
      {
        slug: 'esports-journey',
        title: 'My Time in Esports',
        date: '2024-03-08',
        displayDate: 'March 8, 2024',
        description: 'A personal journey through competitive gaming, from Counter-Strike tournaments to Valorant achievements.'
      },
      {
        slug: 'ixigo-experience',
        title: 'SDE Intern Experience at Abhibus (Ixigo)',
        date: '2023-10-10',
        displayDate: 'October 10, 2023',
        description: 'A journey through my internship experience as a Software Development Engineer at Abhibus (Ixigo), exploring various projects and learning opportunities.'
      },
      {
        slug: 'beginners-guide-programming',
        title: 'Beginners Guide for a Programmer',
        date: '2021-04-28',
        displayDate: 'April 28, 2021',
        description: 'A comprehensive guide to understanding programming fundamentals, different languages, and career paths in software development.'
      },
      {
        slug: 'beginners-guide-design',
        title: 'Beginners Guide for a Designer',
        date: '2021-04-28',
        displayDate: 'April 28, 2021',
        description: 'An insightful guide to getting started with graphic design, covering fundamentals, tools, and practical tips for beginners.'
      }
    ];

    return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const renderPost = () => {
    switch(selectedPost) {
      case 'ixigo-experience':
        return <IxigoExperience onBack={() => setSelectedPost(null)} />;
      case 'beginners-guide-programming':
        return <BeginnersGuideProgramming onBack={() => setSelectedPost(null)} />;
      case 'beginners-guide-design':
        return <BeginnersGuideDesign onBack={() => setSelectedPost(null)} />;
      case 'esports-journey':
        return <EsportsJourney onBack={() => setSelectedPost(null)} />;
      default:
        return null;
    }
  };

  if (selectedPost) {
    return renderPost();
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Writing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <article 
            key={post.slug}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            onClick={() => setSelectedPost(post.slug)}
          >
            <h3 className="text-base font-medium dark:text-white mb-1">{post.title}</h3>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
              <time dateTime={post.date}>{post.displayDate}</time>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WritingPage;