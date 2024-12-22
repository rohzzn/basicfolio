"use client";
import React from 'react';
import Link from 'next/link';

const Home: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hey, I&#39;m Rohan</h2>
    <div className="space-y-4">
      <p className="text-zinc-600 dark:text-zinc-400">
        I&#39;m currently pursuing my master&#39;s in Computer Science at the University of Cincinnati. Previously, I worked as a Software Development Engineer at Ixigo.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        I&#39;ve spent the past few years doing things on the internet — building side projects, doing independent research, and trying to understand how things work. You get the idea.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Occasionally, I create and share designs on <a href="https://www.behance.net/rohzzn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Behance</a> and <a href="https://dribbble.com/rohzzn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Dribbble</a>. Beyond the canvas, I challenge myself with coding competitions on <a href="https://www.codechef.com/users/rohzzzn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">CodeChef</a> and <a href="https://leetcode.com/u/rohzzn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">LeetCode</a>.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Work things aside, I&#39;m a big fan of first-person shooters – I&#39;ve been playing <a href="https://steamcommunity.com/id/rohzzn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Counter-Strike</a> for as long as I can remember and later picked up Valorant. Sometimes, I like editing videos and <a href="https://youtube.com/@rohzzn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">create content</a>.
      </p>
    </div>

    <div className="mt-6">
      <Link
        href="/stack"
        className="block bg-paper dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors w-[150px]"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Resume
        </p>
      </Link>
    </div>
  </div>
);

export default Home;