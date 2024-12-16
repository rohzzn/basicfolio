// src/app/page.tsx

"use client";
import React from 'react';


const Home: React.FC = () => (
  <div className="max-w-2xl">
    {/* Existing Content */}
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hey, I'm Rohan</h2>
    <p className="text-zinc-600 dark:text-zinc-400">
      I'm currently pursuing my master's in Computer Science at the University of Cincinnati. Previously, I worked as a Software Development Engineer at Ixigo.
    </p>
    <br />
    <p className="text-zinc-600 dark:text-zinc-400">
      I've spent the past few years doing things on the internet — building side projects, doing independent research, and trying to understand how things work. You get the idea.
    </p>
    <br />
    <p className="text-zinc-600 dark:text-zinc-400">
      Occasionally, I create and share designs on <a href="https://www.behance.net/rohzzn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Behance</a> and <a href="https://dribbble.com/rohzzn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Dribbble</a>. Beyond the canvas, I challenge myself with coding competitions on <a href="https://www.codechef.com/users/rohzzzn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">CodeChef</a> and <a href="https://leetcode.com/u/rohzzn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">LeetCode</a>.
    </p>
    <br />
    <p className="text-zinc-600 dark:text-zinc-400">
      Work things aside, I’m a big fan of first-person shooters – I’ve been playing <a href="https://steamcommunity.com/id/rohzzn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Counter-Strike</a> for as long as I can remember and later picked up Valorant. Sometimes, I like editing videos and <a href="https://youtube.com/@rohzzn" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">create content</a>.
    </p>


    {/* Buttons Container */}
    <div className="mt-9 flex space-x-4 justify-start">
      {/* Download Resume Button */}
      <a
        href="https://drive.google.com/file/d/15ldUNRR5SeBCkw_C7RXmrvWYisoDX-GD/view"
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1 border border-gray-600 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-center w-24 sm:w-32 text-sm"
      >
        Resume
      </a>

      {/* Contact Me Button */}
      <a
        href="mailto:pothurrs@mail.uc.edu"
        className="px-3 py-1 border border-gray-600 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-center w-24 sm:w-32 text-sm"
      >
        Email
      </a>
    </div>
  </div>
);

export default Home;
