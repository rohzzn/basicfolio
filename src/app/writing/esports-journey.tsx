// src/app/writing/esports-journey.tsx
"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface EsportsJourneyProps {
  onBack?: () => void;
}

const EsportsJourney: React.FC<EsportsJourneyProps> = ({ onBack }) => {
  return (
    <article className="max-w-2xl mx-auto py-8">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to writing</span>
      </button>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">
          My Time in Esports
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2024-03-08">March 8, 2024</time>

        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Beginning: Falling in Love with Counter-Strike</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          It all started in 2014 when I first encountered Counter-Strike. From the moment I witnessed its raw and beautiful gameplay, 
          I was hooked. The intricate movement mechanics, the thrilling skin economy, and the vibrant community drew me in like a 
          moth to a flame. At the tender age of 16, the memories this game created for me were truly special, and the people I met 
          through it became some of my closest real-life friends.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Taking the Plunge: My First Tournaments</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          In 2017, I took the plunge and began playing tournaments in my city. Our team secured an impressive 3rd place finish at 
          a fancy 5-star restaurant event conducted by the wonderful people at AMD GameOn. This was the beginning of an annual 
          tradition, as our team was fortunate enough to participate in their tournaments every year.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          That same year, we also played at Gamer&#39;s Connect by Nvidia, securing another 3rd place finish. The competitive 
          spirit was ignited, and we were hungry for more.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Comic-Con Collaboration and Expanding Horizons</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          From 2018 onwards, Comic-Con collaborated with AMD GameOn, and they started conducting the tournaments together. 
          Our team&#39;s hard work paid off as we secured 2nd place in both 2018 and 2019. Determined to expand my horizons, 
          I also ventured into PUBG in 2019, where I earned an impressive 2nd place. However, my skills in Fortnite left much 
          to be desired.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Pandemic and Online Transition</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          When the COVID-19 pandemic hit in 2020, AMD GameOn shut down, and we transitioned to playing online games. That year, 
          Act, a WiFi company, conducted an online CSGO 1v1 tournament, and without a team to hold me back, I secured 1st place. 
          This was a testament to my individual skills and determination.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The pandemic also brought about the rise of Valorant, and I was fortunate enough to gain access to the beta. After a 
          couple of months of dedicated grinding, I reached the coveted Immortal rank. This opened up new opportunities, as I had 
          the chance to play at the NIIT college fest with a few friends, earning 2nd place in both 2020 and 2021.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Return to LAN</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          In 2020, our team, Trinity Gaming, secured 1st place at the TAGVALO tournament, where we had the honor of defeating 
          the YouTuber SnaxGaming. This was a significant milestone in our esports journey and a testament to our teamwork and 
          dedication.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Finally, in 2024, after a long break, we proved that our skills were still sharp as we became the Valorant runners-up 
          at the Comic-Con x AMD GameOn x The Arena event. This achievement filled me with immense pride and reminded me of the 
          incredible journey I had embarked upon.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Conclusion</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My journey in the world of esports has been a thrilling ride filled with countless memories, accomplishments, and 
          friendships forged through the heat of competition. From the raw and beautiful gameplay of Counter-Strike to the 
          electrifying Valorant tournaments, each step has been a testament to my passion for gaming and the incredible 
          community that surrounds it.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          As I look back on this exhilarating journey, I am filled with gratitude for the opportunities and experiences it has 
          provided me. The memories and friendships formed along the way will forever hold a special place in my heart, and I 
          eagerly anticipate the next chapter in my esports adventure.
        </p>
      </div>
    </article>
  );
};

export default EsportsJourney;