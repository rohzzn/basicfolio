"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ArticleProps {
  onBack?: () => void;
}

const PerformanceArticle: React.FC<ArticleProps> = ({ onBack }) => {
  return (
    <article className="max-w-7xl py-8 px-4 sm:px-0">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to writing</span>
      </button>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 dark:text-white">
          The Ultimate Guide to Web Performance Optimization
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2023-07-20">July 20, 2023</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">TLDR:</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Traditional Next.js optimizations (image, code splitting, lazy loading) only improved performance by 15%</li>
            <li>Moving to Edge Runtime gave a 40% speed boost</li>
            <li>The biggest wins came from removing stuff: dropping client JS and embracing Server Components</li>
            <li>Final stack: 90% Server Components + Edge Runtime + minimal client JS = 800ms load time</li>
            <li>Check the code samples below for before/after implementations</li>
          </ul>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg font-medium">
          Two months ago, my Next.js app was a sluggish mess that made users wait 6 seconds to see anything useful. Today, it loads in under a second. But the path to getting here wasn&#39;t what any performance guide would tell you to do.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Experiment</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Instead of blindly following performance best practices, I decided to run an experiment: rebuild the same core functionality five different ways and measure what actually moves the needle. No assumptions, no common wisdom — just cold, hard data.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Version 1: The Best Practices Approach</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          First up: implementing every Next.js performance best practice in the book. Image optimization, code splitting, lazy loading, the works. The result? A measly 15% improvement. Turns out, checking all the boxes doesn&#39;t automatically make things fast.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Version 2: The Static Generation Zealot</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Next, I went all-in on static generation. Every page that could be static, was static. I built elaborate build-time data fetching systems. The result? Actually slower than the original in real-world use, because now users were getting stale data and forcing revalidation constantly.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Version 3: The Database Overhaul</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Third attempt: I blamed the database. Moved from MongoDB to PostgreSQL, optimized every query, added indexes everywhere. This one hurt: two weeks of work for a 20% improvement. Better, but not the game-changer I was hoping for.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Version 4: The Edge Runtime Champion</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Getting desperate, I went all-in on Edge Runtime. Moved everything to edge functions, used Vercel&#39;s edge caching... and finally saw a significant improvement. Load times dropped by 40%. Now we&#39;re talking.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Version 5: The Weird One That Actually Worked</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          For the final version, I threw out the performance playbook entirely. Here&#39;s what the transformation looked like:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Before: Client Component Hell</h3>
          <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// pages/dashboard.tsx
"use client";
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useRecoilState } from 'recoil';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [filterState, setFilterState] = useRecoilState(filterAtom);
  const { data: queryData } = useQuery('dashboard', fetchDashboardData);

  useEffect(() => {
    // Complex data transformation
    const transformed = queryData?.map(item => ({
      ...item,
      computed: complexCalculation(item)
    }));
    setData(transformed || []);
  }, [queryData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Lots of client-side rendered content */}
    </motion.div>
  );
}`}
          </pre>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">After: Server Component Simplicity</h3>
          <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// app/dashboard/page.tsx
import { fetchDashboardData } from './actions';

export default async function Dashboard({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Data fetching happens server-side
  const data = await fetchDashboardData({
    filter: searchParams.filter
  });

  return (
    <div>
      {/* Server rendered content */}
      <DashboardHeader data={data} />
      <DashboardContent data={data} />
      {/* Minimal client components */}
      <ClientSearch /> 
    </div>
  );
}`}
          </pre>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Useful Resources</h3>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li><strong>Server Components Deep Dive:</strong> next.js/docs/app/building-your-application/rendering/server-components</li>
            <li><strong>Edge Runtime Configuration:</strong> vercel.com/docs/functions/edge-functions/edge-runtime</li>
            <li><strong>Performance Monitoring:</strong> vercel.com/docs/speed-insights</li>
          </ul>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Real Lessons</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The final version loads in 800ms. That&#39;s not a typo. By doing less — way less — the app got dramatically faster. The biggest performance gain came from simply removing things: unnecessary libraries, client-side JavaScript, and complex state management.
        </p>
      </div>
    </article>
  );
};

export default PerformanceArticle;