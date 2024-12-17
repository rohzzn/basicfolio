"use client";
import React from 'react';
import Link from 'next/link';

const Hobbies: React.FC = () => (
  <div className="max-w-full p-6">
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
      {/* MyAnimeList */}
      <Link href="/hobbies/myanimelist" className="block bg-paper dark:bg-zinc-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-serif mb-2">MyAnimeList</h3>
        <p className="text-zinc-600 dark:text-zinc-400">Track and explore my anime and manga collections.</p>
      </Link>

      {/* Readings */}
      <Link href="/hobbies/readings" className="block bg-paper dark:bg-zinc-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-serif mb-2">Readings</h3>
        <p className="text-zinc-600 dark:text-zinc-400">My favorite books and articles.</p>
      </Link>

      {/* Art */}
      <Link href="/hobbies/art" className="block bg-paper dark:bg-zinc-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-serif mb-2">Art</h3>
        <p className="text-zinc-600 dark:text-zinc-400">My artistic creations and designs.</p>
      </Link>

      {/* Games */}
      <Link href="/hobbies/games" className="block bg-paper dark:bg-zinc-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-serif mb-2">Games</h3>
        <p className="text-zinc-600 dark:text-zinc-400">My favorite games and gaming experiences.</p>
      </Link>
    </div>
  </div>
);

export default Hobbies;