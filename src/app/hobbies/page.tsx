"use client";
import React from 'react';
import Link from 'next/link';

const Hobbies: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hobbies</h2>
    <div className="space-y-4 text-zinc-600 dark:text-zinc-400 mb-8">
      <p>
        When I&#39;m not coding, you can find me exploring mechanical keyboards,
        contributing to open-source projects, and learning about system design.
      </p>
      <p>
        I also enjoy reading technical writings, participating in hackathons,
        and experimenting with new programming languages.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Link
        href="/hobbies/myanimelist"
        className="block bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Anime
        </p>
      </Link>

      <Link
        href="/hobbies/readings"
        className="block bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Books
        </p>
      </Link>

      <Link
        href="/hobbies/art"
        className="block bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Designs
        </p>
      </Link>

      <Link
        href="/hobbies/games"
        className="block bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Gaming
        </p>
      </Link>
    </div>
  </div>
);

export default Hobbies;
