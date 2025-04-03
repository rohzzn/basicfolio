"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ArticleProps {
  onBack?: () => void;
}

const UCExperience: React.FC<ArticleProps> = ({ onBack }) => {
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
          My First Semester at UC: A Deep Dive into MENG CS and Campus Life
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2024-12-29">December 31, 2024</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">TLDR:</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Completed first semester of MENG CS with intense technical curriculum</li>
            <li>Regular at UC&#39;s state-of-the-art Innovation Hub and esports lab</li>
            <li>Balanced academics with part-time work at Bearcats Package Center</li>
            <li>Experienced UC&#39;s world-class facilities and support systems</li>
            <li>Built strong connections in Cincinnati&#39;s vibrant campus community</li>
          </ul>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg font-medium">
          Fall 2024 marked my journey into UC&#39;s Master of Engineering program as an F1 student. Between diving deep into advanced algorithms, unwinding at the esports lab, and working at the package center, these past few months have been an incredible adventure. Here&#39;s my story of life as a Bearcat.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Academic Deep Dive: Fall 2024 Curriculum</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My first semester challenged me with four intensive courses that built a strong foundation in advanced computing:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Core Courses</h3>
          <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Advanced Algorithms 1:</strong>
              <p className="mt-1">An intense exploration of algorithmic complexity and optimization techniques. We tackled challenging problem-solving scenarios that pushed our computational thinking to new levels.</p>
            </li>
            <li>
              <strong>Distributed Operating Systems:</strong>
              <p className="mt-1">Deep dive into distributed systems architecture and synchronization. This course opened my eyes to the complexities of modern distributed computing and cloud infrastructure.</p>
            </li>
            <li>
              <strong>Introduction to Cloud Computing:</strong>
              <p className="mt-1">Hands-on experience with modern cloud platforms, understanding everything from basic deployments to complex cloud architectures. The practical approach made complex concepts accessible.</p>
            </li>
            <li>
              <strong>Innovation Design Thinking:</strong>
              <p className="mt-1">A refreshing take on problem-solving that went beyond pure technology. Learning to approach challenges from multiple angles has already improved how I tackle technical problems.</p>
            </li>
          </ul>
        </div>
        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">UC&#39;s Crown Jewel: The 1819 Innovation Hub</h2>
<p className="text-zinc-600 dark:text-zinc-400 mb-6">
  Among UC&#39;s many impressive facilities, the 1819 Innovation Hub stands in a league of its own. This architectural masterpiece isn&#39;t just another building on campus - it&#39;s where the future happens. Imagine walking into a space that feels like a blend of a Silicon Valley tech campus and a next-gen gaming arena. The moment you step in, you know you&#39;re somewhere special.
</p>
<p className="text-zinc-600 dark:text-zinc-400 mb-6">
  What makes the Innovation Hub truly unique is its esports arena - my personal sanctuary on campus. Picture professional-grade gaming setups that rival major esports tournaments, a community of passionate gamers, and an atmosphere that perfectly balances competitive spirit with casual fun. Whether I&#39;m unwinding after an intense algorithms class or connecting with fellow tech enthusiasts over a game, this space has become an integral part of my UC experience.
</p>
<p className="text-zinc-600 dark:text-zinc-400 mb-6">
  Beyond the gaming haven, the Innovation Hub exemplifies UC&#39;s commitment to cutting-edge education. Collaborative spaces filled with the latest technology, areas designed for both focused work and creative brainstorming, and an environment that constantly inspires innovation. It&#39;s where theoretical knowledge from our classes meets practical application, and where countless project ideas have sparked into reality.
</p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">More fun places</h3>

  <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400">

    <li>
      <strong>Langsam Library:</strong>
      <p className="mt-1">My go-to spot for focused study sessions, offering quiet floors, group study rooms, and an extensive collection of technical resources. Perfect for those deep dives into algorithms and distributed systems.</p>
    </li>
    <li>
      <strong>Campus Recreation Center:</strong>
      <p className="mt-1">World-class fitness facilities that help maintain a healthy work-life balance.</p>
    </li>
    <li>
      <strong>Tangeman University Center (TUC):</strong>
      <p className="mt-1">The heart of campus life, always buzzing with activity and perfect for quick meals or study breaks.</p>
    </li>
  </ul>
</div>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Working at Bearcats Package Center</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My part-time position at the Bearcats Package Center has been a highlight of my UC experience. Under Tyler and Terrance&#39;s exceptional leadership, what could have been just a job has become a valuable part of my campus life. Their management style makes every shift engaging and educational, while the flexible scheduling helps balance work with my academic commitments.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Work Experience Highlights</h3>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Developed efficient package handling and tracking skills</li>
            <li>Built strong customer service abilities in a diverse campus environment</li>
            <li>Learned practical inventory management techniques</li>
            <li>Collaborated with an amazing team of fellow students</li>
            <li>Mastered the art of work-study balance</li>
          </ul>
        </div>


        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Looking Forward</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          This first semester at UC has been transformative. The blend of rigorous academics, cutting-edge facilities like the Innovation Hub, amazing gaming breaks at the esports lab, and rewarding work at the package center has created an incredible graduate school experience. The foundation built through courses like Advanced Algorithms and Distributed Systems has me excited for what&#39;s next. As I look ahead to future semesters, I&#39;m grateful for this vibrant community and eager to keep exploring everything UC has to offer.
        </p>
      </div>
    </article>
  );
};

export default UCExperience;