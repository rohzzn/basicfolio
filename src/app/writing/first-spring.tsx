"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ArticleProps {
  onBack?: () => void;
}

const FirstSpring: React.FC<ArticleProps> = ({ onBack }) => {
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
          My Second Semester at UC: Challenging Academics, Leadership, and Cincinnati in Bloom
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2025-04-28">April 28, 2025</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">TLDR:</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Conquered a challenging spring semester with A+ grades across all courses</li>
            <li>Led a team of 13 students in Large Scale Software Engineering</li>
            <li>Secured a Graduate Research Assistant position at Cincinnati Children&apos;s Hospital</li>
            <li>Witnessed Cincinnati transform into a breathtaking spring landscape</li>
            <li>Planning a rejuvenating summer trip to India before fall semester</li>
          </ul>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg font-medium">
          Spring 2025 built upon the foundation of my first semester at UC, bringing new challenges, opportunities, and the beautiful awakening of Cincinnati from winter&apos;s grip. Between leading a large software team, tackling demanding coursework, and beginning a research position at CCHMC, this semester has been a remarkable chapter in my graduate journey.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Academic Deep Dive: Spring 2025 Curriculum</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My second semester raised the bar significantly from fall, with a curriculum that pushed both my technical abilities and leadership skills to new heights:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Core Courses</h3>
          <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Advanced Algorithms 2:</strong>
              <p className="mt-1">Building on last semester&apos;s foundations, this course delved deeper into complex algorithmic concepts that challenged even the strongest students in the program. The progression from basic algorithm design to advanced optimization techniques gave me powerful tools for tackling real-world computational problems.</p>
            </li>
            <li>
              <strong>Network Security:</strong>
              <p className="mt-1">Though the assignments were occasionally frustrating, they were ultimately both entertaining and accessible. The hands-on approach to implementing security protocols provided practical experience that theoretical knowledge alone couldn&apos;t match, giving me a comprehensive understanding of modern cybersecurity challenges.</p>
            </li>
            <li>
              <strong>Software Testing and Quality Assurance:</strong>
              <p className="mt-1">A thorough exploration of testing methodologies that transformed my approach to software development. Learning systematic techniques for ensuring reliability and quality has become an invaluable part of my programming toolkit.</p>
            </li>
            <li>
              <strong>Large Scale Software Engineering:</strong>
              <p className="mt-1">My most transformative course experience – I served as team lead for 13 students, managing timelines, delegating tasks, and coordinating development throughout the project lifecycle. Despite some challenging interactions with Professor Nan Niu, the experience taught me invaluable lessons about technical leadership and project management.</p>
            </li>
          </ul>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The leadership role in Large Scale Software Engineering stretched me in ways I hadn&apos;t anticipated. Balancing technical implementation with team management and stakeholder communication taught me valuable lessons about project ownership and clear communication. Despite the challenges, I&apos;m proud to have secured A+ grades across all my courses this semester – a testament to the late nights and weekend study sessions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Cincinnati in Bloom: Campus Transformed</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          While fall introduced me to UC&apos;s architectural beauty, spring revealed an entirely new dimension to campus life. Cincinnati has revealed itself in entirely new colors these past few weeks, with UC&apos;s campus leading the transformation. The red brick buildings that stood stoic against winter&apos;s gray now serve as perfect backdrops for explosions of color – cherry blossoms lining McMicken Commons, tulips standing at attention around Tangeman Center, and magnolias creating natural canopies near the College of Engineering.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My daily walks through campus have become photo expeditions. The route from my apartment to classes now takes twice as long as I constantly stop to appreciate how sunlight filters through newly budded trees or how perfectly the morning dew catches light on fresh grass. Even the campus squirrels seem more energetic, darting between blooming flowerbeds with renewed purpose.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Spring Highlights</h3>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Eden Park&apos;s cherry blossom grove becoming a weekend pilgrimage destination</li>
            <li>Clifton&apos;s streets lined with flowering pear trees creating natural confetti</li>
            <li>Downtown&apos;s transformation with planters overflowing with pansies and daffodils</li>
            <li>Campus green spaces becoming perfect study spots on warm afternoons</li>
            <li>Riverside parks coming alive with joggers, picnics, and outdoor activities</li>
          </ul>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">New Growth: Research at Cincinnati Children&apos;s</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          As the city blossoms, my professional life has followed suit with an exciting new position as a Graduate Research Assistant at Cincinnati Children&apos;s Hospital Medical Center (CCHMC). The timing couldn&apos;t be more perfect – as nature begins a new cycle, I&apos;ve embarked on my own fresh chapter in research and development working with cutting-edge technologies in the healthcare space.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          One of the most exciting parts of this position is having my own dedicated cabinet! It might sound small, but having a personalized space in a research environment feels like a significant milestone. My cabinet has quickly become home to my notebooks, reference materials, and the collection of sticky notes that help me track the myriad of ideas that emerge during our research discussions.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I&apos;ve been fortunate to work under two exceptional managers at CCHMC who have created an environment where learning and growth feel as natural as the spring unfolding outside. Their contrasting but complementary styles have provided me with a balanced perspective on research and development in healthcare technology.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Looking Forward</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          As spring semester wraps up, I&apos;m excitedly planning a summer trip to India. After the intense academic and professional growth of the past months, I&apos;m looking forward to reconnecting with family, indulging in home-cooked meals, and taking some time to reflect on my journey so far. The trip will be a perfect reset before returning for the fall semester, recharged and ready for new challenges. As I continue balancing my research work at CCHMC with academic pursuits, I&apos;m grateful for how Cincinnati has become home and excited about what the future holds here.
        </p>
      </div>
    </article>
  );
};

export default FirstSpring; 