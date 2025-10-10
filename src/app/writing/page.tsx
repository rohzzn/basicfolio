"use client";

import React, { useState, useMemo, useEffect } from 'react';
import IxigoExperience from './ixigo-experience';
import BeginnersGuideDesign from './beginners-guide-design';
import BeginnersGuideProgramming from './beginners-guide-programming';
import EsportsJourney from './esports-journey';
import VariablesExposure from './variables-exposure';
import SecurityArticle from './security-article';
import BoringPerformance from './boring-performance';
import ModernTechStacks from './modern-tech-stacks';
import ChatGPTInterface from './chatgpt-interface';
import DiscordArticle from './discord-article';
import UCExperience from './uc-experience';
import FirstSpring from './first-spring';

const WritingPage = () => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const posts = useMemo(() => [
    {
      slug: 'first-spring',
      title: 'My Second Semester at UC: Challenging Academics, Leadership, and Cincinnati in Bloom',
      date: '2025-04-28',
      displayDate: 'April 28, 2025',
      description: 'A personal journey through Cincinnati\'s spring transformation and starting a new research position at Cincinnati Children\'s Hospital.',
      category: 'life'
    },
    {
      slug: 'uc-experience',
      title: 'My First Semester at UC: New Beginnings, Technical Challenges, and Campus Exploration',
      date: '2024-12-31',
      displayDate: 'December 31, 2024',
      description: 'A Deep Dive into MENG CS and Campus Life',
      category: 'life'
    },
    {
      slug: 'variables-exposure',
      title: 'Why Environment Variables Dont Truly Hide Sensitive Data',
      date: '2024-12-29',
      displayDate: 'December 29, 2024',
      description: 'A detailed exploration of how storing tokens or keys in environment variables does not effectively hide them from end users, demonstrated through the use of Burp Suite.',
      category: 'tech'
    },
    {
      slug: 'modern-tech-stacks',
      title: 'Modern Tech Stacks Are Killing Your Startup — Heres What We Learned Building With PHP in 2024',
      date: '2024-06-10',
      displayDate: 'June 10, 2024',
      description: 'A controversial take on why choosing boring technology and monolithic architecture might be the best decision for your startup, backed by real-world data and cost analysis.',
      category: 'tech'
    },
    {
      slug: 'security-article',
      title: 'Your 2FA Is Broken: Inside the New Wave of Time-Based Token Attacks',
      date: '2024-05-15',
      displayDate: 'May 15, 2024',
      description: 'An investigation into critical vulnerabilities in common 2FA implementations, with practical solutions and security testing tools for protecting your authentication systems.',
      category: 'tech'
    },
    {
      slug: 'boring-performance',
      title: 'The Boring Company Guide to 10x Frontend Performance',
      date: '2024-04-15',
      displayDate: 'April 15, 2024',
      description: 'A deep dive into how The Boring Companys frontend team achieved dramatic performance improvements through systematic testing and unconventional optimization techniques.',
      category: 'tech'
    },
    {
      slug: 'discord-article',
      title: 'The Untold Story of How Discords API Survived 2024s Biggest Gaming Launch',
      date: '2024-03-20',
      displayDate: 'March 20, 2024',
      description: 'A deep dive into Discords infrastructure transformation, including their switch to Rust and innovative Redis implementations for handling 12 million concurrent users.',
      category: 'tech'
    },
    {
      slug: 'esports-journey',
      title: 'My Time in Esports',
      date: '2024-03-08',
      displayDate: 'March 8, 2024',
      description: 'A personal journey through competitive gaming, from Counter-Strike tournaments to Valorant achievements.',
      category: 'life'
    },
    {
      slug: 'chatgpt-interface',
      title: 'I Built My Own ChatGPT UI and Learned Why UI/UX Engineers Still Have Jobs',
      date: '2024-01-20',
      displayDate: 'January 20, 2024',
      description: 'A three-month journey of building a ChatGPT-style interface from scratch, revealing the complex UX patterns and trust-building features that make AI interfaces effective.',
      category: 'tech'
    },
    {
      slug: 'ixigo-experience',
      title: 'SDE Intern Experience at Abhibus (Ixigo)',
      date: '2023-10-10',
      displayDate: 'October 10, 2023',
      description: 'A journey through my internship experience as a Software Development Engineer at Abhibus (Ixigo), exploring various projects and learning opportunities.',
      category: 'life'
    },
    {
      slug: 'beginners-guide-programming',
      title: 'Beginners Guide for a Programmer',
      date: '2021-04-28',
      displayDate: 'April 28, 2021',
      description: 'A comprehensive guide to understanding programming fundamentals, different languages, and career paths in software development.',
      category: 'tech'
    },
    {
      slug: 'beginners-guide-design',
      title: 'Beginners Guide for a Designer',
      date: '2021-04-28',
      displayDate: 'April 28, 2021',
      description: 'An insightful guide to getting started with graphic design, covering fundamentals, tools, and practical tips for beginners.',
      category: 'tech'
    },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), []);

  const categories = ['all', 'tech', 'life'];

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return posts;
    return posts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  // Use effect to handle URL parameters
  useEffect(() => {
    // Check if there's a post parameter in the URL
    const params = new URLSearchParams(window.location.search);
    const postSlug = params.get('post');
    
    if (postSlug) {
      setSelectedPost(postSlug);
    }
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
      case 'variables-exposure':
        return <VariablesExposure onBack={() => setSelectedPost(null)} />;
      case 'security-article':
        return <SecurityArticle onBack={() => setSelectedPost(null)} />;
      case 'boring-performance':
        return <BoringPerformance onBack={() => setSelectedPost(null)} />;
      case 'modern-tech-stacks':
        return <ModernTechStacks onBack={() => setSelectedPost(null)} />;
      case 'chatgpt-interface':
        return <ChatGPTInterface onBack={() => setSelectedPost(null)} />;
      case 'discord-article':
        return <DiscordArticle onBack={() => setSelectedPost(null)} />;
      case 'uc-experience':
        return <UCExperience onBack={() => setSelectedPost(null)} />;
      case 'first-spring':
        return <FirstSpring onBack={() => setSelectedPost(null)} />;
      default:
        return null;
    }
  };

  if (selectedPost) {
    return renderPost();
  }

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
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <article 
            key={post.slug}
            onClick={() => setSelectedPost(post.slug)}
            className="cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                {post.title}
              </h3>
              <time 
                dateTime={post.date}
                className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5"
              >
                {post.displayDate}
              </time>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WritingPage;