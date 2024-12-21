// src/app/writing/ixigo-experience.tsx
"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface IxigoExperienceProps {
  onBack?: () => void;
}

const IxigoExperience: React.FC<IxigoExperienceProps> = ({ onBack }) => {
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
          SDE Intern Experience at Abhibus (Ixigo)
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2023-10-10">October 10, 2023</time>

        </div>
      </header>

      {/* Rest of the content remains the same */}
      <div className="prose dark:prose-invert prose-zinc max-w-none">
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          As I reflect on my SDE (Software Development Engineer) internship experience at Abhibus Ixigo, 
          I&#39;m filled with a sense of accomplishment and gratitude. It was a journey that began with curiosity, 
          and it led me through various projects, challenges, and new friendships.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Getting Started</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My initial days at Abhibus were marked by excitement and a bit of apprehension. I was just getting 
          started with the architecture and system design, trying to wrap my head around the company&#39;s tech 
          stack and workflows. The learning curve was steep, but the support I received from my team was invaluable. 
          I found myself surrounded by talented individuals who were always willing to guide me.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Versatility in Projects</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          One of the unique aspects of my internship was the variety of projects I got to work on. 
          Since I was the only intern on the team, I had the opportunity to explore different domains:
        </p>
        
        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 mb-6">
          <li>KSRTC Tourist Packages Report Fetching - Enhanced user experience through improved report presentation</li>
          <li>HRTC Feedback Alignment - Implemented dynamic data fetching for up-to-date information</li>
          <li>Soup UI Gender and Senior Concession Total Fare Error Fix - Resolved critical calculation issues</li>
          <li>Banner Updates on All RTC - Enhanced visual appeal across platforms</li>
          <li>KSRTC Ant to Maven Project Conversion - Improved build and dependency management</li>
          <li>Solr Debug Fix for KSRTC - Enhanced search capabilities</li>
          <li>GST Details in Final Ticket - Ensured tax compliance in ticket generation</li>
          <li>Service Feedback Hyperlink Fix - Improved user feedback system</li>
          <li>PM2 Fix for React KSRTC - Implemented robust process management</li>
          <li>Sleeper API Layout Issue - Enhanced UI for berth visualization</li>
          <li>User Session Working in React KSRTC - Improved session management</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Memorable Moments</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          While each project came with its unique set of challenges, my most memorable moments were when 
          I successfully integrated user sessions and PM2 for the KSRTC React app. These tasks were not 
          only technically challenging but also crucial for the project&#39;s overall stability and user experience. 
          It was incredibly rewarding to see the positive impact these changes had on the application.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Team</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I must express my gratitude to the amazing team I had the privilege of working with during my 
          internship at Abhibus. My colleagues were not just mentors but also friends who created a 
          supportive and inclusive work environment. Our team lead, in particular, played an instrumental 
          role in guiding me through the complexities of software development and fostering my growth.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Conclusion</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My SDE internship at Abhibus (Ixigo) was an enriching experience that allowed me to grow both 
          personally and professionally. I learned the importance of adaptability and versatility in a 
          dynamic work environment. The exposure to a wide range of projects and the guidance of a supportive 
          team helped me gain invaluable skills and knowledge.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          As I look back on my journey, I&#39;m filled with a sense of achievement and gratitude for the 
          opportunity to contribute to such meaningful projects and to work alongside talented individuals. 
          My time at Abhibus was not just a stepping stone in my career, but a memorable chapter in my 
          life that I will cherish forever.
        </p>
      </div>
    </article>
  );
};

export default IxigoExperience;