"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ArticleProps {
  onBack?: () => void;
}

const Lost: React.FC<ArticleProps> = ({ onBack }) => {
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
          Lost
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2025-05-30">Aug 19, 2025</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
    


     

        
     
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Lately, I’ve never felt more lost. Whatever it is I search for in people, it always seems to slip away. I lose sight of myself, stumbling into one mess after another, as if I’m drawn to making life harder than it has to be. I feel like I’ve hit rock bottom emotionally, physically, and mentally.
        </p>
      

        <p className="text-zinc-600 dark:text-zinc-400">
         I wish to be better, and I should do better.
        </p>
      </div>
    </article>
  );
};

export default Lost;
