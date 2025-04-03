// src/app/writing/beginners-guide-programming.tsx
"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BeginnersGuideProgrammingProps {
  onBack?: () => void;
}

const BeginnersGuideProgramming: React.FC<BeginnersGuideProgrammingProps> = ({ onBack }) => {
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
          Beginner&#39;s Guide to Programming
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2023-05-15">May 15, 2023</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Understanding Programming</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Before we can introduce you to some key concepts, we need to understand what programming really is. 
          A computer is a hardware machine that can store and process information. The language of a computer is Binary, 
          a complex set of ones and zeroes. Programming is essentially the larger-scale process of developing a complex 
          machine program that acts according to our wishes.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">What is Coding?</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Think of coding as a translator between English (or a different human language) and the computer&#39;s binary. 
          Coding involves the actual syntax and structure by which we write commands. A computer can then take those commands, 
          translate it into binary, and do what is written.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Popular Programming Languages</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          There are tons of programming languages, and they each serve different purposes, styles, and specializations. 
          Here are some of the most popular ones:
        </p>

        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 mb-6">
          <li><strong>Java:</strong> One of the older, more established programming languages used in universities and large-scale businesses</li>
          <li><strong>Python:</strong> A very user-friendly language preferred by many beginners with simple and clear syntax</li>
          <li><strong>Ruby:</strong> Similar to Python, known for being beginner-friendly and built on the notion that programming should be fun</li>
          <li><strong>JavaScript:</strong> A text-based language foundational to all websites</li>
          <li><strong>C:</strong> One of the original programming languages, great for high-performance applications</li>
          <li><strong>Swift:</strong> Developed by Apple for iOS and Mac OS apps, designed to be simple and easy to learn</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Career Paths</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Different types of programming roles include:
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3 dark:text-white">Web Developers</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Web developers can be further separated into front-end and back-end coders. Front-end coders are responsible for writing 
          the code that determines how the website looks and how its content is presented. Back-end programmers write web apps 
          and other complicated programs that provide the framework for the website to run on.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3 dark:text-white">Software Programmers</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Software programmers develop software for clients/companies based on demand. Key languages include Java, JavaScript, 
          C++, and Python.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3 dark:text-white">Mobile App Development</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Mobile app development is quickly becoming one of the most lucrative programming fields. React Native is widely used 
          to build effective mobile apps, offering an easy learning curve and efficient workflow.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Conclusion</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          The journey to becoming a programmer requires dedication, continuous learning, and practice. Start with the basics, 
          choose a path that interests you, and keep building projects to gain practical experience. Remember, every expert was 
          once a beginner.
        </p>
      </div>
    </article>
  );
};

export default BeginnersGuideProgramming;