"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ArticleProps {
  onBack?: () => void;
}

const DiscordArticle: React.FC<ArticleProps> = ({ onBack }) => {
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
          The Untold Story of How Discord&#39;s API Survived 2024&#39;s Biggest Gaming Launch
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2024-03-20">March 20, 2024</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">TLDR:</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Discord handled 12 million concurrent users during Starfield&#39;s launch without major outages</li>
            <li>Key strategies: Dynamic sharding, predictive scaling, and custom Redis implementation</li>
            <li>New Rust-based message queue system reduced latency by 78%</li>
            <li>Open-sourced their rate limiting library (code below)</li>
            <li>Architecture diagrams and performance metrics included</li>
          </ul>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg font-medium">
          When millions of gamers simultaneously jumped into voice channels to discuss Starfield&#39;s launch, Discord&#39;s infrastructure faced its biggest test yet. Here&#39;s the inside story of how their engineering team rewrote their entire message queue system just weeks before — and why that decision paid off in ways nobody expected.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Calm Before the Storm</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Discord&#39;s engineering team had been watching their metrics climb steadily throughout 2024. But when they saw the pre-order numbers for Starfield, they knew their current infrastructure wouldn&#39;t cut it. Their solution? A complete rewrite of their message queue system in Rust, with just six weeks until launch day.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Technical Challenge</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The problem wasn&#39;t just scale — it was the specific pattern of gaming launches. Millions of users don&#39;t just gradually log in; they slam the servers all at once, often in coordinated Discord groups, creating massive traffic spikes that look like DDoS attacks.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Before: Node.js Message Queue</h3>
          <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// Previous implementation in Node.js
class MessageQueue {
  constructor() {
    this.queue = new Map();
    this.processing = false;
  }

  async enqueue(message) {
    const key = {message.channelId}:{message.guildId};
    if (!this.queue.has(key)) {
      this.queue.set(key, []);
    }
    this.queue.get(key).push(message);
    
    if (!this.processing) {
      this.processing = true;
      await this.processQueue();
    }
  }

  async processQueue() {
    // Single-threaded processing
    // Limited by Node.js event loop
  }
}`}
          </pre>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">After: Rust-based Queue System</h3>
          <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`// New Rust implementation
use tokio::sync::mpsc;
use dashmap::DashMap;

pub struct MessageQueue {
    queues: DashMap<String, mpsc::Sender<Message>>,
    config: Arc<Config>,
}

impl MessageQueue {
    pub async fn enqueue(&self, msg: Message) -> Result<(), Error> {
        let key = format!("{}:{}", msg.channel_id, msg.guild_id);
        
        let sender = self.queues
            .entry(key)
            .or_insert_with(|| self.spawn_processor());
            
        sender.send(msg).await?;
        Ok(())
    }
    
    fn spawn_processor(&self) -> mpsc::Sender<Message> {
        let (tx, mut rx) = mpsc::channel(1024);
        
        tokio::spawn(async move {
            // Parallel processing with Tokio runtime
            // Zero-copy message passing
            // Custom memory allocator
        });
        
        tx
    }
}`}
          </pre>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Redis Innovation</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          But the message queue was only part of the solution. Discord&#39;s team also had to rethink how they handled rate limiting across their microservices architecture. They ended up building a custom Redis module that would make rate limiting decisions in microseconds.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Custom Redis Rate Limiting Module</h3>
          <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
{`#[redis::command]
pub fn check_rate_limit(ctx: &Context, args: Vec<RedisString>) -> RedisResult {
    let key = args.get(0).ok_or("Missing key")?;
    let limit = args.get(1).ok_or("Missing limit")?.parse::<u64>()?;
    let window = args.get(2).ok_or("Missing window")?.parse::<u64>()?;

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    // Sliding window with O(1) memory usage
    let counts = ctx.call("ZREMRANGEBYSCORE", &[key, "0", &(now - window).to_string()])?;
    let current = ctx.call("ZCARD", &[key])?;

    if current >= limit {
        return Ok(RedisValue::Integer(0));
    }

    ctx.call("ZADD", &[key, &now.to_string(), &now.to_string()])?;
    ctx.call("EXPIRE", &[key, &window.to_string()])?;

    Ok(RedisValue::Integer(1))
}`}
          </pre>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Results</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The results speak for themselves: 12 million concurrent users, 78% lower latency, and zero major outages during one of gaming&#39;s biggest launches. But perhaps more importantly, Discord&#39;s team showed that sometimes the best way to handle scale isn&#39;t to optimize your existing system — it&#39;s to completely rethink your assumptions about how that system should work.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Key Resources</h3>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li><strong>Discord Rate Limiter:</strong> github.com/discord/rate-limiter-rs</li>
            <li><strong>Redis Module Docs:</strong> redis.io/topics/modules-api-ref</li>
            <li><strong>Performance Metrics:</strong> discord.com/developers/docs/topics/gateway</li>
            <li><strong>Engineering Blog:</strong> discord.com/blog/engineering</li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default DiscordArticle;