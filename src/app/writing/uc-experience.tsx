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
          My First Semester at UC: New Beginnings, Technical Challenges, and Campus Exploration
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2024-12-29">December 31, 2024</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">TLDR:</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Successfully completed first semester of MENG CS with rigorous technical curriculum</li>
            <li>Discovered UC&apos;s impressive 1819 Innovation Hub and state-of-the-art esports lab</li>
            <li>Balanced academics with rewarding part-time work at Bearcats Package Center</li>
            <li>Explored Cincinnati&apos;s campus community and world-class university facilities</li>
            <li>Built strong foundation for future semesters in the graduate program</li>
          </ul>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg font-medium">
          Fall 2024 marked the beginning of my UC journey as an F1 student in the Master of Engineering program. From intensive algorithm courses to exploring campus facilities, this semester has been filled with growth and discovery. Balancing academics, work, and campus life has created an incredible introduction to life as a Bearcat.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Academic Deep Dive: Fall 2024 Curriculum</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My first semester presented me with a robust set of courses that established a strong foundation in advanced computing and problem-solving methodologies:
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Core Courses</h3>
          <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Advanced Algorithms 1:</strong>
              <p className="mt-1">An intense exploration of algorithmic complexity and optimization techniques. We tackled challenging problem-solving scenarios that pushed our computational thinking to new levels, providing critical foundations for advanced software development.</p>
            </li>
            <li>
              <strong>Distributed Operating Systems:</strong>
              <p className="mt-1">Deep dive into distributed systems architecture and synchronization. This course opened my eyes to the complexities of modern distributed computing and cloud infrastructure, with practical implementations that reinforced theoretical concepts.</p>
            </li>
            <li>
              <strong>Introduction to Cloud Computing:</strong>
              <p className="mt-1">Hands-on experience with modern cloud platforms, understanding everything from basic deployments to complex cloud architectures. The practical approach made complex concepts accessible while providing valuable skills for today&apos;s tech landscape.</p>
            </li>
            <li>
              <strong>Innovation Design Thinking:</strong>
              <p className="mt-1">A refreshing take on problem-solving that went beyond pure technology. Learning to approach challenges from multiple angles has already improved how I tackle technical problems and enhanced my perspective on product development.</p>
            </li>
          </ul>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Campus Discovery: UC&apos;s Impressive Facilities</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My exploration of UC&apos;s campus revealed impressive facilities that enhance both academic and recreational aspects of student life. Among these, the 1819 Innovation Hub stands in a league of its own – an architectural masterpiece that feels like a blend of Silicon Valley tech campus and next-gen gaming arena.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The Innovation Hub&apos;s esports arena quickly became my campus sanctuary. With professional-grade gaming setups, a passionate community, and an atmosphere that balances competitive spirit with casual fun, it&apos;s the perfect place to unwind after intensive coursework or connect with fellow tech enthusiasts.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Campus Highlights</h3>
          <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>1819 Innovation Hub:</strong>
              <p className="mt-1">UC&apos;s crown jewel of innovation, offering collaborative spaces, cutting-edge technology, and an environment that transforms theoretical knowledge into practical application.</p>
            </li>
            <li>
              <strong>Langsam Library:</strong>
              <p className="mt-1">My go-to spot for focused study sessions, offering quiet floors, group study rooms, and an extensive collection of technical resources. Perfect for those deep dives into algorithms and distributed systems.</p>
            </li>
            <li>
              <strong>Campus Recreation Center:</strong>
              <p className="mt-1">World-class fitness facilities that help maintain a healthy work-life balance, offering everything from swimming pools to rock climbing walls.</p>
            </li>
            <li>
              <strong>Tangeman University Center (TUC):</strong>
              <p className="mt-1">The heart of campus life, always buzzing with activity and perfect for quick meals, study breaks, and connecting with the diverse UC community.</p>
            </li>
          </ul>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Professional Development: Bearcats Package Center</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Balancing academics with practical work experience, my part-time position at the Bearcats Package Center has become a valuable component of my UC journey. Under the exceptional leadership of Tyler and Terrance, what could have been just a job has transformed into an enriching experience that complements my academic pursuits.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Work Experience Highlights</h3>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Developed efficient package handling and tracking skills with real-world applications</li>
            <li>Built strong customer service abilities through interactions with the diverse campus community</li>
            <li>Learned practical inventory management techniques that complement theoretical coursework</li>
            <li>Collaborated with an amazing team of fellow students from various academic disciplines</li>
            <li>Mastered the art of work-study balance, a critical skill for graduate success</li>
          </ul>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Looking Forward</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          This first semester at UC has laid a strong foundation for my graduate journey. The combination of rigorous academics, cutting-edge facilities, and valuable work experience has exceeded my expectations for the MENG program. The knowledge gained through courses like Advanced Algorithms and Distributed Systems has prepared me for more advanced coursework, while connections made in the Innovation Hub and Package Center have enriched my campus experience. As I look toward spring semester, I&apos;m eager to build on this foundation, take on new challenges, and continue exploring everything UC has to offer.
        </p>
      </div>
    </article>
  );
};

export default UCExperience;