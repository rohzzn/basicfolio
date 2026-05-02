import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import ProgRoadmap from './ProgRoadmap';

export const metadata: Metadata = {
  title: 'Beginners Guide for Programming — Rohan',
  description: 'A practical, no-nonsense starting point for anyone who wants to learn to code but has no idea where to begin.',
  openGraph: {
    title: 'Beginners Guide for Programming',
    description: 'A practical, no-nonsense starting point for anyone who wants to learn to code but has no idea where to begin.',
    url: 'https://rohan.run/writing/beginners-guide-programming',
  },
  alternates: { canonical: 'https://rohan.run/writing/beginners-guide-programming' },
};

const BeginnersGuideProgramming: React.FC = () => {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Beginners Guide for Programming</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2021-04-28">April 28, 2021</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          I started coding seriously around 2018, mostly to automate things in games and build small tools I wanted to exist. I did not have a structured learning path. I bounced between YouTube tutorials, Stack Overflow answers, and half-finished Udemy courses. Looking back, the things that actually moved the needle were simple and nothing like what most beginner advice says. This is the version of that advice I wish I had read first.
        </p>

        <ProgRoadmap />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Pick one language and stay with it</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The single biggest mistake beginners make is switching languages every few weeks. Python looks easier, then JavaScript looks more practical, then someone mentions Java and now you are doing all three badly. Programming concepts — loops, functions, data structures, recursion — are the same in every language. Once you know them solidly in one language, picking up another takes weeks rather than months. Pick Python or JavaScript. Commit. Do not switch for at least a year.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          I started with Python and I am glad I did. The syntax is clean, error messages are readable, and the standard library handles most things you want to do without third-party packages. Once I understood Python well, picking up JavaScript for web work felt natural. I now use TypeScript for almost everything. But none of that was possible without the Python foundation.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Tutorials are a trap after the first week</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Watch one beginner tutorial to understand the syntax. Then stop watching and start building something. Tutorials feel productive because you are following along and the code works. But you are not learning to problem-solve — you are learning to copy. The moment you try to do something not covered in the tutorial, you will feel like you know nothing, because you effectively do not.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The projects that actually taught me things were embarrassingly small: a script to rename files in a folder, a Discord bot that responded to commands, a webpage that fetched an API and displayed data. Each one forced me to read documentation, debug real errors, and make real decisions. That process is the actual learning.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Learn to read errors before anything else</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          New programmers are afraid of error messages and try to close them as fast as possible. This is backwards. The error message is almost always telling you exactly what is wrong, often including the file and line number. Learning to read a stack trace slowly and actually understand what it says will save you more time than any other skill you develop early on.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          When you are stuck: read the full error message. Google the exact error text in quotes. Read the Stack Overflow answers, not just the accepted one. Try to understand why the solution works before applying it. This habit is what separates people who can actually debug from people who just paste errors into ChatGPT and hope the suggestion works.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Use Git from day one</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          I did not start using Git until embarrassingly late and I regret it. You do not need to understand branching or rebasing right away. Just learn <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">git init</code>, <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">git add</code>, <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">git commit</code>, and <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">git push</code>. Commit every time you make something work. Put every project on GitHub. When you break something, you can always go back. When you are applying for jobs, you have a public record of what you have built.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The path that worked for me</h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          I went from Python scripts to web development (HTML, CSS, JavaScript) to backend work (Node.js, Express) to full-stack projects. Along the way I picked up TypeScript because codebases with type safety are much more pleasant to work in. I learned C++ briefly for algorithms coursework. I built iOS apps with Swift during a phase of wanting to ship something to the App Store. Each step added tools without replacing the previous ones. The foundation is always the same: write code, break things, fix them, repeat.
        </p>
      </div>
    </article>
  );
};

export default BeginnersGuideProgramming;
