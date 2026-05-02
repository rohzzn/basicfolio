import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import ProjectStats from './ProjectStats';

export const metadata: Metadata = {
  title: 'What I Learned Building 40 Side Projects — Rohan',
  description: 'Looking back at every side project I have shipped: what got users, what got abandoned, and what the pattern between them actually is.',
  openGraph: {
    title: 'What I Learned Building 40 Side Projects',
    description: 'Looking back at every side project I have shipped: what got users, what got abandoned, and what the pattern between them actually is.',
    url: 'https://rohan.run/writing/forty-projects',
  },
  alternates: { canonical: 'https://rohan.run/writing/forty-projects' },
};

export default function FortyProjects() {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">What I Learned Building 40 Side Projects</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2026-02-10">February 10, 2026</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I just counted. Forty public repositories that are actual projects — not forks, not homework, not hello world. Applications, web tools, games, browser extensions, CLI packages, VS Code themes, Discord bots, iOS apps. Some of them have thousands of users. Most of them have none. I built all of them while doing something else: finishing school, working a job, taking classes at UC. Looking back at them as a set, the patterns are clearer than I expected.
        </p>

        <ProjectStats />

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">The projects that got traction shared one thing</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Tanoshi, my VS Code theme, has 1,700 downloads. The DSA Roadmap has 12,000 visits. The Figma Pages plugin has 800 users. The Pokemon platformer has 6,800 visits. What those have in common is that I built them because I personally wanted them to exist and could not find an existing version I liked. Tanoshi started because I was bothered by how existing themes handled certain syntax colors. The DSA Roadmap started because I was frustrated by how fragmented existing algorithm learning resources were.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The projects I built for a portfolio, or to learn a technology, or because someone suggested it as a project idea — almost none of those got any traction. The motivation came from the wrong place. Building something to learn React is fine for learning React. It is not a good origin story for something other people want to use.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Finishing is a separate skill from building</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I have dozens of projects that exist in a state I would describe as shipped but not finished. They work. They are deployed. The README explains them. But there are known rough edges, missing features, and things I planned to add that I never did. For a long time I felt like this was a character flaw. Now I think it is just how most solo projects work.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The distinction that matters is between shipped and unshipped, not between finished and unfinished. Something working and publicly accessible is infinitely more useful than something perfect that lives in a private repository. The wordle clone is not polished. It has no statistics page, no share button, nothing that the real Wordle has. But it is a working game at a public URL, and people have played it. That is better than a local build with a perfect animations system.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Technology choices mostly do not matter at the start</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          My older projects use a completely different stack from my recent ones. Early JavaScript, then React, then Next.js, then TypeScript everywhere. A bunch of Python CLI tools. One Go service. Two Swift apps. Looking back at the old code is humbling. The structure is different, the patterns are different, some of it is embarrassing. None of that matters because the projects shipped and people used them.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I spent a lot of energy early on debating what to build with instead of just building. Whether to use React or Vue. Whether to use a CSS framework or write my own styles. Whether to use MongoDB or PostgreSQL. These decisions feel important at the start and they are almost never the thing that determines whether a project succeeds or fails. Execution and shipping are what determine that. The technology is usually fine either way.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">The ones I am proudest of are not the most popular</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Keel, the iOS subscription tracker, has fewer users than several of my other projects. But building a real iOS app that went through App Review and got into the App Store taught me more than any of the web projects. SwiftUI, StoreKit, the constraints of building on a mobile platform, the specific ways Apple wants you to handle data — none of that transfers from web development. It was a genuinely new domain.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Same with the Catan game. Nobody was asking for another online Catan. But building a real-time multiplayer board game from scratch forced me to think carefully about game state, server architecture, and the specific challenges of distributed state in a way that building another CRUD app would not have. The skills compounded in useful directions.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">What I would tell myself at project one</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Ship faster. Not because speed is inherently good, but because the feedback you get from real users is categorically different from the feedback you can generate yourself. Every hour you spend polishing something before anyone has tried it is potentially wasted if you are polishing the wrong thing.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Build for a problem you personally have. The projects I built out of genuine frustration with a gap in existing tools are the ones that got users, because I was the first user and could tell when something was actually working versus just technically functional.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          And use Git from the first commit, add a README before you do anything else, and put a real domain on it even if it is just a GitHub Pages URL. Every barrier between your project and a potential user is one too many.
        </p>
      </div>
    </article>
  );
}
