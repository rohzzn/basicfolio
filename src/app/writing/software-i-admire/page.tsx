import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import AdmiredSoftware from './AdmiredSoftware';

export const metadata: Metadata = {
  title: 'Software I Admire That I Didn\'t Write — Rohan',
  description: 'A look at the C programs, Rust tools, and Go infrastructure I depend on every day but couldn\'t have built myself.',
  openGraph: {
    title: 'Software I Admire That I Didn\'t Write',
    description: 'A look at the C programs, Rust tools, and Go infrastructure I depend on every day but couldn\'t have built myself.',
    url: 'https://rohan.run/writing/software-i-admire',
  },
  alternates: { canonical: 'https://rohan.run/writing/software-i-admire' },
};

export default function SoftwareIAdmire() {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Software I Admire That I Didn&apos;t Write</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2025-04-10">April 2025</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The software I think about most is not written in TypeScript or Python. It is mostly C. SQLite runs inside my iPhone, my browser&apos;s storage layer, and the Firefox profile on my laptop. Nginx is probably handling some request I am making right now. Git runs every time I save work. I have read documentation for all of these. I have filed a bug report against one of them. I have never written a meaningful program in any of their primary languages.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I find this interesting as a category. There is software that I use constantly and understand well enough to configure and debug, but that I could not have built — not because of effort, but because the engineering discipline involved is genuinely foreign to me. The people who wrote SQLite or ripgrep were optimizing for things I have never had to optimize for. Reading about how they work has changed how I think about the software I do write.
        </p>

        <AdmiredSoftware />

        <h2 className="text-base font-medium mt-10 mb-4 dark:text-white">What the C programs have in common</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The C programs on this list were all built before most modern software tooling existed. No package managers, no memory-safe languages, no ubiquitous cloud infrastructure. The constraints forced a kind of design discipline that is less common now: small binaries, no external dependencies, explicit memory management, portable by default.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          SQLite&apos;s commitment to backward compatibility is the most extreme version of this. The library guarantees that a database file written in 2004 will be readable by any future version. That kind of constraint, held for 25 years, is almost unimaginable in web development. We break APIs between minor versions.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What the Rust tools changed</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          ripgrep and fd are not just C programs rewritten in Rust. They are fundamentally better tools. ripgrep is faster and has better defaults. fd has a sane syntax. The improvements came partly from Rust&apos;s performance characteristics, but mostly from someone sitting down and thinking carefully about what the tool should actually do and being willing to make different default choices than the Unix tools they replaced.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The Rust programs are also easier to contribute to than the C programs because the safety guarantees make the reviewer&apos;s job easier. A pull request to ripgrep that compiles and passes the tests is almost certainly memory-safe. A pull request to a C codebase requires the reviewer to mentally execute the change looking for use-after-free and buffer overflows. That difference affects the rate at which communities can accept outside contributions.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What I actually learned</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Reading about how these systems work has changed how I write TypeScript and Python in a few specific ways. Studying how Redis implements its sorted sets made me much more careful about when I reach for a sorted array versus a different data structure. Understanding how SQLite handles concurrent reads made me think differently about locking strategies in the services I build. Reading about V8&apos;s hidden classes made me write JavaScript objects more carefully — consistent property order across objects, not adding properties after construction.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          I am not going to write a production C program. But understanding what the people who did write them were optimizing for — and why those constraints produced the designs they did — seems like useful context for writing software in any language.
        </p>

      </div>
    </article>
  );
}
