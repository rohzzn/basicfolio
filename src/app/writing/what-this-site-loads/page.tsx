import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import NetworkWaterfall from './NetworkWaterfall';

export const metadata: Metadata = {
  title: 'Everything This Site Loads Over the Wire — Rohan',
  description: "I opened the network tab on my own portfolio, wrote down every request, and inventoried all 13 external services it talks to.",
  openGraph: {
    title: 'Everything This Site Loads Over the Wire',
    description: "I opened the network tab on my own portfolio, wrote down every request, and inventoried all 13 external services it talks to.",
    url: 'https://rohan.run/writing/what-this-site-loads',
  },
  alternates: { canonical: 'https://rohan.run/writing/what-this-site-loads' },
};

export default function WhatThisSiteLoads() {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Everything This Site Loads Over the Wire</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2026-05-02">May 2026</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I built this site, which means I have a lot of opinions about how it works and almost no objective data about what it actually costs someone to visit. Those are different things. So I opened the network tab, did a hard refresh, and wrote down everything.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          This portfolio is more connected than it looks. There is a visible page load — fonts, scripts, the GitHub contributions calendar — but underneath there are 13 external services the site integrates with, ranging from Steam and Valorant to Hevy workout logs and a Redis KV store for photo likes. Most of them are server-proxied so the API keys never reach your browser. The component below has two views: the waterfall for what loads when you hit the home page, and an inventory of every external service the site talks to.
        </p>

        <NetworkWaterfall />

        <h2 className="text-base font-medium mt-10 mb-4 dark:text-white">What the page load looks like</h2>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The document arrives in under 80ms and is server-rendered — the browser gets readable HTML before any JavaScript executes. This matters for first-content metrics and for search indexing. Next.js handles it automatically, but it is worth naming: the page is not an empty shell that React hydrates later.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The two big chunks — 45.5KB and 54.2KB — are the React runtime and the vendor bundle. Together they are about 100KB compressed. After the first visit, both are cached by content hash and load from disk in milliseconds. The page-specific JavaScript is 2.3KB. The CSS is 3.2KB, which is the result of Tailwind stripping every unused utility class at build time.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The font and the GitHub contributions API are the two items I would fix first. The Satoshi font loads from Fontshare&apos;s CDN, which means a cross-origin DNS lookup on every cold visit. Self-hosting it with <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">next/font/local</code> would eliminate that entirely. The GitHub contributions calendar calls an unofficial third-party scraping API directly from the browser — it is the last item to arrive (around 600ms), the largest JSON payload on the page, and the most fragile dependency. If that service goes down, the calendar disappears.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The API integrations</h2>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Thirteen external services in total. The hobbies section drives most of this — Steam, Valorant, Leetify, and Medal for gaming; Hevy for workouts; TMDB, MyAnimeList, and YouTube for entertainment. Most of them are proxied through Next.js API routes so the API keys live only on the server and never reach the browser.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The pattern for most of them is the same: client makes a request to <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">/api/[service]</code>, the route authenticates with the upstream API using an environment variable, processes the response, and returns cleaned JSON. This keeps credentials off the client and lets me add caching, rate limiting, or content filtering server-side before the data reaches the page.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          A few are worth calling out specifically. The guestbook uses GitHub Issues as a database — entries are comments on an issue in this repo, fetched and written via the GitHub API. It sounds odd but it works: free, versioned, and requires no separate database. The Medal.tv integration calls three different endpoints in parallel and deduplicates because Medal&apos;s API is inconsistent about which endpoint actually returns your clips. The MyAnimeList route handles pagination recursively — MAL caps responses at 100 entries, and my list is longer than that.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The only persistent state on the site is photo likes, stored in Upstash Redis. Everything else is read-only from the upstream service. The Redis integration is also the only one using a structured KV store rather than a REST API — it uses Upstash&apos;s HTTP-based Redis interface so it works in Vercel&apos;s edge runtime without a persistent connection.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What I would change</h2>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Self-host the font. It is a one-hour job — download the woff2, add a <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">localFont</code> configuration, remove the Fontshare link tag. I have been doing this for long enough that I should just do it.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Proxy the GitHub contributions API. Move the react-github-calendar data fetch into a server-side route that caches aggressively and returns stale data on failure. The calendar is a nice visual but it should not be the last and most fragile thing on the page.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400">
          Audit the vendor chunk. 54KB suggests there is a library in there I am using one function from. The most likely candidate is react-github-calendar — it is used on exactly one page, which means it should probably be dynamically imported rather than bundled into the shared chunk. That would cut the initial load by a meaningful amount for every page that is not the home page.
        </p>

      </div>
    </article>
  );
}
