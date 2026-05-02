import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import TrafficGraph from './TrafficGraph';

export const metadata: Metadata = {
  title: "How Discord Survived 2024's Biggest Launch — Rohan",
  description: "A deep dive into how Discord's infrastructure scaled to handle millions of concurrent users during a massive game launch.",
  openGraph: {
    title: "How Discord Survived 2024's Biggest Launch",
    description: "A deep dive into how Discord's infrastructure scaled to handle millions of concurrent users during a massive game launch.",
    url: 'https://rohan.run/writing/discord-article',
  },
  alternates: { canonical: 'https://rohan.run/writing/discord-article' },
};

const DiscordArticle: React.FC = () => {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">How Discord Survived 2024s Biggest Launch</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2024-03-20">March 20, 2024</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          When Starfield launched in September 2023, Discord faced a traffic spike unlike anything a typical app ever sees. Millions of people jumped into voice channels simultaneously. The gaming community flooded servers with messages. Activity timestamps, presence updates, and push notifications all fired at once for tens of millions of users. I spent some time reading through Discord&apos;s engineering blog posts and their public postmortems to understand how they actually handle this, and the architecture decisions involved are genuinely interesting.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The Problem With Gaming Launches</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Most apps scale for gradual growth. You add capacity as traffic increases week over week. Gaming launches break that model. You go from baseline to absolute peak within minutes of a release. The traffic pattern looks less like a slope and more like a wall. Discord has to pre-scale infrastructure before they even know how bad it will be, based on game pre-order numbers and community signals.
        </p>

        <TrafficGraph />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">How Discord Shards Its Gateway</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Discord&apos;s public developer documentation explains how their gateway (the WebSocket layer clients connect to) works at scale. Connections are distributed across shards, where each shard handles a subset of guilds. Large bots are required to use sharding because a single connection cannot handle the volume of events from millions of guilds. The same principle applies to the internal infrastructure: no single process owns all the state.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Discord&apos;s engineering blog documented their move from a Node.js message broker to a Rust implementation. The core motivation was latency and memory efficiency. Node.js handles IO well but every message object in JavaScript has overhead. Rust lets you process more messages with the same memory budget and get more consistent latency without GC pauses. For a system handling billions of events per day, that difference compounds.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-sm font-medium mb-4 dark:text-white">The architecture tradeoff in simplified form</h3>
          <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// Node.js: easy to write, GC pauses at high load
class MessageQueue {
  private queue = new Map<string, Message[]>();

  async enqueue(msg: Message) {
    const key = \`\${msg.channelId}:\${msg.guildId}\`;
    this.queue.get(key)?.push(msg) ?? this.queue.set(key, [msg]);
    // GC pressure grows with queue depth
  }
}

// Rust: more code, but predictable memory and latency
// use dashmap::DashMap;
// use tokio::sync::mpsc;
// Each channel gets a separate Tokio task with bounded queue
// No GC, no unpredictable pauses at peak load`}
          </pre>
        </div>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Rate Limiting at Scale</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          During a launch, many bots and clients hammer the API simultaneously. Without aggressive rate limiting, a traffic spike can cascade into a denial of service against your own infrastructure. Discord open-sourced parts of their rate limiting work. The interesting design choice is a sliding window algorithm implemented directly in Redis using sorted sets, which makes rate limit decisions in microseconds without a separate service hop.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-sm font-medium mb-4 dark:text-white">Sliding window rate limiter in Redis</h3>
          <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`-- Lua script runs atomically in Redis
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Remove entries outside the window
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

local count = redis.call('ZCARD', key)
if count >= limit then return 0 end

redis.call('ZADD', key, now, now)
redis.call('EXPIRE', key, window)
return 1`}
          </pre>
        </div>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What Makes This Hard</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Reading through Discord&apos;s engineering posts, the recurring theme is that distributed systems at their scale surface every assumption your architecture made. Things like clock drift between servers, the cost of serialization under load, and the interaction between rate limiting and retry logic all become real problems that you never see at smaller scale. The solutions are almost always boring: reduce shared mutable state, bound queue sizes, prefer simpler data structures.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          What I find useful about studying how Discord does this is that the underlying principles apply even to much smaller systems. Bounding your queues, making rate limiting decisions as early in the stack as possible, and choosing predictable latency over peak throughput are ideas worth internalizing regardless of how many users you have.
        </p>
      </div>
    </article>
  );
};

export default DiscordArticle;
