"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import NewsletterSubscribe from '@/components/NewsletterSubscribe';

interface PostProps {
  onBack: () => void;
}

const NewsletterLaunch: React.FC<PostProps> = ({ onBack }) => {
  return (
    <article className="max-w-7xl py-8 px-4 sm:px-0">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to writing</span>
      </button>

      {/* Header */}
      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 dark:text-white">
          Announcing: Subscribe to Get Updates on New Posts!
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2025-05-28">May 28, 2025</time>
        </div>
      </header>

      {/* Content */}
      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I&apos;m excited to announce that you can now subscribe to receive email notifications 
          whenever I publish new content on this site!
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Why I Added a Newsletter</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I&apos;ve been writing and sharing my thoughts on various tech topics for a while now,
          but until today, there hasn&apos;t been an easy way for readers to stay updated when new
          content is published. That changes with this new newsletter feature!
        </p>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The newsletter system is fully automated - when I publish a new post, all subscribers
          automatically receive a beautifully formatted email with a summary and link to the full article.
          No need to keep checking back manually.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">How It Works</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The newsletter system uses modern web technologies:
        </p>
        
        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 mb-6">
          <li>Next.js API routes for handling subscriptions</li>
          <li>Vercel KV (Redis) for securely storing subscriber emails</li>
          <li>SendGrid for reliable email delivery</li>
          <li>Optimistic UI updates for a seamless subscription experience</li>
        </ul>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          All emails are sent individually to protect your privacy - no one else can see who&apos;s subscribed.
          And of course, you can unsubscribe at any time.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Subscribe Now</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          If you&apos;d like to stay updated with my latest posts, enter your email below.
          No spam, I promise - just notifications when I publish something new!
        </p>
        
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 my-8">
          <NewsletterSubscribe />
        </div>
        
        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">What&apos;s Coming Next</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I have several new posts in the pipeline covering topics like:
        </p>
        
        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 mb-6">
          <li>Advanced React patterns and performance optimizations</li>
          <li>Building with modern serverless architectures</li>
          <li>My experiences with various developer tools and frameworks</li>
          <li>Insights from my personal and professional projects</li>
        </ul>
        
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Subscribe now to make sure you don&apos;t miss them!
        </p>
      </div>
    </article>
  );
};

export default NewsletterLaunch; 