"use client";
import React from 'react';
import Link from 'next/link';
import { FaArrowRight, FaEnvelope } from 'react-icons/fa';

const Home: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hey, I&#39;m Rohan Pothuru</h2>
    <div className="space-y-4">
      <p className="text-zinc-600 dark:text-zinc-400">
        I&#39;m currently pursuing my master&#39;s in Computer Science at the University of Cincinnati. Previously, I worked as a Software Development Engineer at Ixigo.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Over the past few years, I&#39;ve immersed myself in the digital world—building side projects, conducting independent research, and delving deep into understanding how things work. This journey has fueled my passion for technology and innovation.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Beyond coding, I enjoy exploring new technologies, reading about the latest trends in software development, and collaborating with like-minded individuals to bring ideas to life. I&#39;m dedicated to creating solutions that make a meaningful impact and continuously strive to grow both personally and professionally in the ever-evolving tech landscape.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        In my free time, I love experimenting with different programming languages and frameworks, which allows me to stay versatile and adaptable. Whether it&#39;s contributing to open-source projects or developing my own applications, I find immense satisfaction in problem-solving and overcoming challenges.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        I&#39;m also passionate about mentoring and sharing knowledge. Guiding aspiring developers and helping them navigate their careers brings me joy and reinforces my own understanding of complex concepts. Building a strong community is essential, and I believe in the power of collective growth and learning.
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        My fascination with artificial general intelligence (AGI) lies in its potential to create systems that can understand and interact with the world in ways similar to human cognition. Engaging with AGI challenges me to explore the depths of machine learning and cognitive computing, fostering a deeper appreciation for the complexities of intelligence.
      </p>
      <br />
    </div>

    <div className="mt-6 flex space-x-4">
      <Link
        href="/stack"
        className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 ease-in-out transform hover:scale-105 active:scale-95"
      >
        Resume
        <FaArrowRight className="ml-2" />
      </Link>
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
