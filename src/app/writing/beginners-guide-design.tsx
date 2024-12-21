// src/app/writing/beginners-guide-design.tsx
"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BeginnersGuideDesignProps {
  onBack?: () => void;
}

const BeginnersGuideDesign: React.FC<BeginnersGuideDesignProps> = ({ onBack }) => {
  return (
    <article className="max-w-2xl mx-auto py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to writing</span>
      </button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">
          Beginners Guide for a Designer
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2021-04-28">April 28, 2021</time>

        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Getting Started in Design</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          There are different reasons for getting into graphic design. Maybe you want to create a logo for your website, 
          express yourself creatively, learn a new skill, make a career change, or make money online. Whatever your motivation, 
          it needs to be powerful enough to keep you focused on becoming proficient at graphic design.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Importance of Visual Culture</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          We live in an increasingly visual culture. This means that we value images over words as a society. We are surrounded 
          by visual interfaces. Content is mostly organized around images. Today, images are the most important and powerful 
          form of communication.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Role of Passion</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          You have to be passionate about graphic design to become a designer. In Web 2.0, anyone can become anything they want. 
          But most people fail not because they don&#39;t have the talent or skills, but because they lack passion. The capability 
          to learn the necessary skills comes from passion: persistence, discipline, and the courage to put yourself out there.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Understanding Design Principles</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Design principles are the minimum framework needed to achieve successful results as a graphic designer. The six major principles are:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 mb-6">
          <li>Unity</li>
          <li>Totality or Gestalt</li>
          <li>Dominance</li>
          <li>Space</li>
          <li>Hierarchy</li>
          <li>Balance</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Design Software</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Graphics editing software is a big part of graphic design. There are different types of software for different tasks, 
          primarily vector and pixel editing systems. Professional-grade graphic design software like Inkscape and GIMP is available 
          for free, allowing you to create your own personal design studio with virtually no startup costs.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Finding Inspiration</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          One of the best ways to learn graphic design is to emulate artists, designers, and creators that inspire us. When we 
          look for inspiration, we naturally gravitate to styles and trends we like, and we start to recognize what works and 
          what doesn&#39;t. Getting inspired gives us a roadmap of what we need to learn.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Working on Projects</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The single most important recommendation for becoming a self-taught graphic designer is to center your learning around 
          specific projects. Take on a project that matters to you as an excuse to learn - you&#39;ll learn faster and gain 
          experience as you grow.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Conclusion</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Remember that design is a journey of continuous learning and improvement. Start with understanding the fundamentals, 
          practice regularly with real projects, and always stay curious and open to inspiration. With dedication and passion, 
          you can develop the skills needed to become a successful designer.
        </p>
      </div>
    </article>
  );
};

export default BeginnersGuideDesign;