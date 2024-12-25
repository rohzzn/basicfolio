"use client";
import React from 'react';
import Link from 'next/link';
import { FaArrowRight, FaEnvelope, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Home: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hey, I&#39;m Rohan Pothuru</h2>
    <div className="space-y-4">
      <p className="text-zinc-600 dark:text-zinc-400">
        I&#39;m currently pursuing my master&#39;s in Computer Science at the University of Cincinnati. Previously, I worked as a Software Development Engineer at Ixigo.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Over the years, I&#39;ve immersed myself in software engineering—building side projects, doing independent research, and exploring how things work under the hood. This passion for technology and innovation motivates me to create solutions that make a difference.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        I&#39;m also passionate about mentoring fellow developers and contributing to open-source communities. My curiosity about artificial general intelligence (AGI) continuously shapes my thinking about the future of cognitive computing.
      </p>
      <br />
    </div>

    {/* The only change: added 'flex-wrap gap-4' to keep original positioning but enable responsiveness */}
    <div className="mt-6 flex flex-wrap gap-4">
      {/* Twitter */}
      <a
        href="https://twitter.com/rohzzn"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        Twitter
        <FaTwitter className="ml-2" />
      </a>
      {/* LinkedIn */}
      <a
        href="https://linkedin.com/in/rohzzn"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        LinkedIn
        <FaLinkedin className="ml-2" />
      </a>
      {/* GitHub */}
      <a
        href="https://github.com/rohzzn"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        GitHub
        <FaGithub className="ml-2" />
      </a>
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
