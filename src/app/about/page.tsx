"use client";
import React from 'react';
import Link from 'next/link';
import { FaArrowRight, FaEnvelope, FaLink, FaBook } from 'react-icons/fa';

const Home: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hey, I&#39;m Rohan Pothuru</h2>
    <div className="space-y-4">
      <p className="text-zinc-600 dark:text-zinc-400">
        This is my lil corner of the internet.
        Feel free to click around — you might accidentally learn too much about me.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
      Life Update:
      </p>
      <ul className="list-disc pl-5 text-zinc-600 dark:text-zinc-400 space-y-2">
        <li>Grad CS student at UC, hanging on to that 4.0 GPA</li>
        <li>Part-time dev at Cincinnati Children&apos;s — typing, debugging, surviving</li>
        <li>Previously at ixigo, mostly vibing and learning the ropes</li>
        <li>Always tinkering with side projects — for fun, learning, and maybe clout</li>
        <li>Turning 24 this year — holy moly, where did the time go?</li>
      </ul>
      <br />
    </div>

    <div className="mt-6 flex flex-wrap gap-4">
      {/* Links */}
      <Link
        href="/links"
        className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        On the Internet
        <FaLink className="ml-2" />
      </Link>
      {/* Guestbook */}
      <Link
        href="/guestbook"
        className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        Guest Book
        <FaBook className="ml-2" />
      </Link>
      {/* Resume */}
      <Link
        href="/stack"
        className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        Resume
        <FaArrowRight className="ml-2" />
      </Link>
      {/* Contact */}
      <a
        href="mailto:pothurrs@mail.uc.edu"
        className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        Contact
        <FaEnvelope className="ml-2" />
      </a>
    </div>
  </div>
);

export default Home;