import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import PerfMetrics from './PerfMetrics';

export const metadata: Metadata = {
  title: 'Boring Guide to 10x Frontend Performance — Rohan',
  description: 'The unsexy, practical steps that actually make your frontend fast — no magic, just fundamentals done right.',
  openGraph: {
    title: 'Boring Guide to 10x Frontend Performance',
    description: 'The unsexy, practical steps that actually make your frontend fast — no magic, just fundamentals done right.',
    url: 'https://rohan.run/writing/boring-performance',
  },
  alternates: { canonical: 'https://rohan.run/writing/boring-performance' },
};

const BoringPerformance: React.FC = () => {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Boring Guide to 10x Frontend Performance</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2024-04-15">April 15, 2024</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          Every developer who has shipped a production frontend eventually hits the moment where the app feels slow and they have no idea why. I have been there more than once. After auditing my own projects and diving into the Lighthouse reports of sites I was building at Abhibus, a pattern kept showing up: the biggest wins were almost never in the JavaScript. They were in the boring stuff that everyone skips.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The Bundle Size Problem</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Unused code is probably responsible for a larger share of your bundle than you think. A typical React app imports a full UI library to use three components. It ships development-mode warnings. It includes every locale string for a date library when you only need English. The fastest way to audit this is to run <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">npx @next/bundle-analyzer</code> or the webpack bundle analyzer and look for anything suspiciously large. You will almost always find something that can be swapped for a smaller alternative or lazy-loaded.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-sm font-medium mb-4 dark:text-white">Code splitting with Next.js dynamic imports</h3>
          <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`import dynamic from 'next/dynamic';

// Heavy chart library only loads when the component is actually rendered
const Chart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div className="h-64 bg-zinc-100 animate-pulse rounded" />,
  ssr: false,
});`}
          </pre>
        </div>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Memory Leaks in React</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The most common memory leak I have seen is a missing cleanup in a <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">useEffect</code>. You set up an interval or subscription, but you never return a cleanup function. The component unmounts but the timer keeps running, keeping references to stale state alive. If this happens in a list that mounts and unmounts a lot you will see memory grow over time.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-sm font-medium mb-4 dark:text-white">Missing cleanup vs correct cleanup</h3>
          <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// Leaks memory — interval keeps running after unmount
useEffect(() => {
  const interval = setInterval(() => {
    setData(prev => [...prev, fetchLatest()]);
  }, 1000);
  // Missing return
}, []);

// Correct — cleanup runs on unmount
useEffect(() => {
  const interval = setInterval(() => {
    setData(prev => [...prev.slice(-100), fetchLatest()]);
  }, 1000);
  return () => clearInterval(interval);
}, []);`}
          </pre>
        </div>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Network: The Biggest Win Nobody Does</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Setting proper cache headers on your static assets is one of the highest-leverage performance changes you can make and it takes about five minutes. Images and fonts that change rarely should have a very long max-age. JavaScript bundles built with content hashes can be cached indefinitely because the URL changes whenever the content changes. Most developers never set these and wonder why their Lighthouse score shows poor cache policy.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-sm font-medium mb-4 dark:text-white">vercel.json cache configuration</h3>
          <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}`}
          </pre>
        </div>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Measure Before Optimizing</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The most important rule is one that gets ignored most often. Run Lighthouse or WebPageTest on your app before touching anything. Find the actual bottleneck. Nine times out of ten it is not what you assumed it was. I have spent hours micro-optimizing a React component tree when the real problem was a 400KB image served without compression. Do not optimize what you have not measured.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What these changes actually look like</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Applied together across a typical mid-sized React app, the improvements compound. Bundle analysis and code splitting handle the load time. Proper cleanup prevents memory from growing unchecked in long sessions. Cache headers mean returning users get instant loads from the second visit onward. None of these are exciting. They are just the fundamentals done right.
        </p>

        <PerfMetrics />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Where to start</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Open Lighthouse right now on your production site. Look at the three lowest-scoring sections. Fix those first. Then look at your bundle with a bundle analyzer. Remove or lazy-load anything you can. Check your cache headers. These three steps will get you most of the way there without touching a single component.
        </p>
      </div>
    </article>
  );
};

export default BoringPerformance;
