"use client";
import React, { useState } from 'react';

const LANGS = ['all', 'C', 'Rust', 'Go', 'C++'] as const;
type Lang = (typeof LANGS)[number];

interface SW {
  name: string;
  lang: 'C' | 'Rust' | 'Go' | 'C++';
  year: number;
  category: string;
  tagline: string;
  reason: string;
}

const LANG_COLORS: Record<string, string> = {
  C:    'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  Rust: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  Go:   'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400',
  'C++':'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400',
};

const SOFTWARE: SW[] = [
  {
    name: 'SQLite',
    lang: 'C',
    year: 2000,
    category: 'database',
    tagline: 'The most deployed database in the world',
    reason: "A single C amalgamation — 140,000 lines — that is the entire engine. Runs inside every iOS app, every Android app, every desktop browser's storage layer, every Python install. There is more test code than implementation code, and the test coverage is documented at 100% branch coverage. The thing I find most remarkable is that it passes the exact same test suite on every platform it runs on, which is almost every platform that exists.",
  },
  {
    name: 'Redis',
    lang: 'C',
    year: 2009,
    category: 'cache / data structures',
    tagline: 'Data structures as a network service',
    reason: "The API is the data structures — a hash, a sorted set, a list, a pub/sub channel, directly accessible over a protocol you can speak with telnet. Single-threaded by design, which eliminates an entire category of concurrency bugs and makes reasoning about performance simple. Written in C with no external dependencies. Consistent sub-millisecond latency at the kind of scale that would melt most databases.",
  },
  {
    name: 'Nginx',
    lang: 'C',
    year: 2004,
    category: 'web server',
    tagline: 'Event-driven, tens of thousands of simultaneous connections',
    reason: "Igor Sysoev wrote it as a side project because Apache's process-per-connection model didn't scale for the traffic patterns he was seeing. The event-driven architecture handles tens of thousands of simultaneous connections without spawning threads. The configuration syntax is terse but once you understand the phases — rewrite, access, content, log — the model is clean. Currently serves about a third of the web.",
  },
  {
    name: 'Git',
    lang: 'C',
    year: 2005,
    category: 'version control',
    tagline: 'Content-addressable filesystem with a VCS interface',
    reason: "The mental model that made everything click for me: Git is not a version control system. It is a content-addressable object store — every object is referenced by its SHA-1 hash — with a version control interface layered on top. Once you understand that commits are just pointers to tree objects, that branches are just text files containing a hash, the whole thing makes sense. Linus wrote the initial version in about two weeks.",
  },
  {
    name: 'curl',
    lang: 'C',
    year: 1998,
    category: 'networking',
    tagline: '28 protocols, 25 years, one maintainer',
    reason: "Supports 28 protocols. Runs on everything from IBM mainframes to microcontrollers. Daniel Stenberg has maintained it almost entirely alone for over 25 years. The thing I respect most about it is the backward compatibility: every flag documented in 1998 still works exactly as described. That level of discipline over that time span is genuinely rare.",
  },
  {
    name: 'PostgreSQL',
    lang: 'C',
    year: 1996,
    category: 'database',
    tagline: '30 years of active development, still accelerating',
    reason: "The feature set keeps expanding — window functions, CTEs, JSONB, full-text search, generated columns, logical replication — without the quality slipping. It has been under active development for 30 years and the codebase still scores well on maintainability audits. The query planner is a research topic in itself. The extension system (PostGIS, pgvector, TimescaleDB) means it can become a completely different database depending on what you load into it.",
  },
  {
    name: 'ripgrep',
    lang: 'Rust',
    year: 2016,
    category: 'cli tool',
    tagline: 'grep, but benchmarkably faster',
    reason: "Uses a regex engine built on finite automata instead of backtracking, which makes worst-case performance predictable. Automatically skips .gitignore entries, binary files, and hidden directories without being told to. Consistently benchmarks faster than grep, ag, and ack on real codebases. The codebase is also one of the best examples of a well-structured Rust CLI project if you want to see what idiomatic Rust looks like.",
  },
  {
    name: 'Tokio',
    lang: 'Rust',
    year: 2016,
    category: 'async runtime',
    tagline: 'Async Rust without fighting the language',
    reason: "Futures in Rust are state machines compiled at compile time rather than heap-allocated closures. Tokio provides a work-stealing scheduler on top of this so you can write concurrent code that doesn't allocate per-task. The result is async Rust that can outperform equivalent C++ in real benchmarks — not because Rust is faster than C++ in general, but because the zero-cost abstraction actually works here.",
  },
  {
    name: 'Zed',
    lang: 'Rust',
    year: 2023,
    category: 'editor',
    tagline: 'A text editor that renders at 120fps on large files',
    reason: "Built on a custom GPU-accelerated UI framework (GPUI) that does direct Metal/WebGPU rendering instead of going through a browser engine. The result is an editor that opens instantly and scrolls without frame drops on files that would choke VS Code. They published a detailed paper on their CRDT-based collaborative editing architecture that is worth reading independently of whether you use the editor.",
  },
  {
    name: 'fd',
    lang: 'Rust',
    year: 2017,
    category: 'cli tool',
    tagline: 'find, but the syntax makes sense',
    reason: "find is one of the most powerful Unix utilities and also one of the most hostile to use. fd solves this: parallel directory traversal, .gitignore-aware by default, a syntax that matches what you expect. It is a good example of a Rust rewrite that isn't just a status symbol — it's genuinely better in ways that matter for daily use.",
  },
  {
    name: 'Docker',
    lang: 'Go',
    year: 2013,
    category: 'containers',
    tagline: 'Changed how software gets deployed',
    reason: "The image format is elegant: layers of filesystem diffs, each identified by a content hash. When you push an image and only the top layer changed, only that layer uploads. The abstraction it introduced — ship the runtime with the application — is so obviously correct in retrospect that it's hard to remember how difficult deployment was before it. The original codebase was almost entirely Go, which was a young language at the time.",
  },
  {
    name: 'Caddy',
    lang: 'Go',
    year: 2015,
    category: 'web server',
    tagline: 'Automatic HTTPS by default',
    reason: "Provisions and renews TLS certificates from Let's Encrypt without any configuration. The mental model is cleaner than Nginx — instead of learning the lifecycle of a request through N config blocks, you describe what you want and Caddy figures out the rest. Written in Go, which gives it goroutine-based concurrency that scales without the complexity of Nginx's event loop model.",
  },
  {
    name: 'LLVM',
    lang: 'C++',
    year: 2003,
    category: 'compiler infrastructure',
    tagline: 'The reason Swift, Rust, and 40 other languages exist',
    reason: "By providing a common intermediate representation and a set of analysis and transformation passes, LLVM lets language designers focus on the frontend without reinventing code generation and optimization for every target architecture. Swift, Rust, Kotlin Native, Julia, and dozens of other languages all compile to LLVM IR. The IR itself — Static Single Assignment form with explicit types — is worth reading to understand what optimizing compilers actually operate on.",
  },
  {
    name: 'V8',
    lang: 'C++',
    year: 2008,
    category: 'js engine',
    tagline: 'How JavaScript runs fast despite being JavaScript',
    reason: "Compiles JavaScript to machine code using JIT compilation with multiple tiers: the Sparkplug baseline compiler, the Maglev mid-tier, and the Turbofan optimizing compiler. Hidden classes and inline caches make object property access fast despite JavaScript having no static types. The reason the V8 team had to build all this complexity is that JavaScript's dynamic typing makes every obvious optimization unsound — you have to observe actual runtime behavior to make safe assumptions.",
  },
];

export default function AdmiredSoftware() {
  const [filter, setFilter] = useState<Lang>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const shown = filter === 'all' ? SOFTWARE : SOFTWARE.filter(s => s.lang === filter);
  const counts = LANGS.slice(1).reduce<Record<string, number>>((acc, l) => {
    acc[l] = SOFTWARE.filter(s => s.lang === l).length;
    return acc;
  }, {});

  return (
    <div className="my-8 not-prose">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LANGS.map(l => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors font-mono ${
              filter === l
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {l === 'all' ? `all (${SOFTWARE.length})` : `${l} (${counts[l]})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {shown.map(sw => {
          const isOpen = expanded === sw.name;
          return (
            <div
              key={sw.name}
              className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : sw.name)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex-shrink-0">
                    {sw.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono flex-shrink-0 ${LANG_COLORS[sw.lang]}`}>
                    {sw.lang}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:block truncate">
                    {sw.tagline}
                  </span>
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-3">
                  {sw.year}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3 mb-2 uppercase tracking-wider font-medium">
                    {sw.category}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {sw.reason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
        {shown.length} of {SOFTWARE.length} · click any row to expand
      </p>
    </div>
  );
}
