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
          First Spring: Blossoms, New Beginnings, and Research Adventures
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2025-04-28">April 28, 2025</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">TLDR:</h2>
          <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>Cincinnati transforms into a breathtaking landscape during spring</li>
            <li>Started a new position as Graduate Research Assistant at CCHMC</li>
            <li>Completed a challenging spring semester with A+ in all subjects</li>
            <li>Led a team of 13 students in Large Scale Software Engineering</li>
            <li>Looking forward to a summer trip to India</li>
          </ul>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg font-medium">
          My first spring in Cincinnati has been nothing short of magical. As nature awakens from winter&apos;s embrace, I&apos;ve found myself embracing new opportunities, particularly my research position at Cincinnati Children&apos;s Hospital Medical Center. The city&apos;s transformation parallels my own journey into new professional territory.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Cincinnati in Bloom: A City Transformed</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          There&apos;s something profoundly beautiful about experiencing your first spring in a new city. Cincinnati has revealed itself in entirely new colors these past few weeks, with UC&apos;s campus leading the transformation. The red brick buildings that stood stoic against winter&apos;s gray now serve as perfect backdrops for explosions of color – cherry blossoms lining McMicken Commons, tulips standing at attention around Tangeman Center, and magnolias creating natural canopies near the College of Engineering.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          My daily walks through campus have become photo expeditions. The route from my apartment to classes now takes twice as long as I constantly stop to appreciate how sunlight filters through newly budded trees or how perfectly the morning dew catches light on fresh grass. Even the campus squirrels seem more energetic, darting between blooming flowerbeds with renewed purpose.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Beyond campus, Cincinnati&apos;s neighborhoods have their own spring personalities. Clifton&apos;s streets are now lined with flowering pear trees, their white blossoms creating natural confetti with each breeze. Over in Eden Park, the cherry blossom grove has become weekend pilgrimage territory, with locals and visitors alike gathering to witness this ephemeral spectacle. Even downtown&apos;s concrete landscape has softened, with planters overflowing with pansies and daffodils lining Fountain Square.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Spring Semester: Academic Challenges</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          This semester proved significantly more challenging than the fall, with a lineup of demanding courses that pushed my technical and leadership abilities to new heights. The academic rigor was intense, but the growth I&apos;ve experienced has been worth every late night.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Course Highlights</h3>
          <ul className="list-disc pl-6 space-y-4 text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Network Security:</strong>
              <p className="mt-1">The assignments were admittedly annoying at times but ultimately super fun and surprisingly easy to grasp. The practical aspects of implementing security protocols gave me hands-on experience that theory alone couldn&apos;t provide.</p>
            </li>
            <li>
              <strong>Advanced Algorithms 2:</strong>
              <p className="mt-1">Building on last semester&apos;s foundations, this course delved deeper into complex algorithmic concepts that challenged even the strongest students in the program.</p>
            </li>
            <li>
              <strong>Software Testing and Quality Assurance:</strong>
              <p className="mt-1">A thorough exploration of testing methodologies that changed how I approach software development from the ground up.</p>
            </li>
            <li>
              <strong>Large Scale Software Engineering:</strong>
              <p className="mt-1">Perhaps the most transformative experience of the semester – I served as team lead for a group of 13 students, managing timelines, delegating tasks, and coordinating development efforts throughout the entire project lifecycle. Had a few back-and-forths with Professor Nan Niu along the way, but the challenges only made the successful completion more rewarding.</p>
            </li>
          </ul>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The leadership role in Large Scale Software Engineering stretched me in ways I hadn&apos;t anticipated. Balancing technical implementation with team management and stakeholder communication taught me valuable lessons about project ownership and clear communication. Despite the challenges, I&apos;m proud to have secured A+ grades across all my courses this semester – a testament to the late nights and weekend study sessions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">New Growth: My Position at Cincinnati Children&apos;s</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          As the city blossoms, my professional life has followed suit with an exciting new position as a Graduate Research Assistant at Cincinnati Children&apos;s Hospital Medical Center (CCHMC). The timing couldn&apos;t be more perfect – as nature begins a new cycle, I&apos;ve embarked on my own fresh chapter in research and development working with cutting-edge technologies in the healthcare space.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          One of the most exciting parts of this position is having my own dedicated cabinet! It might sound small, but having a personalized space in a research environment feels like a significant milestone. My cabinet has quickly become home to my notebooks, reference materials, and the collection of sticky notes that help me track the myriad of ideas that emerge during our research discussions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Mentorship in Bloom</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I&apos;ve been fortunate to work under two exceptional managers at CCHMC who have created an environment where learning and growth feel as natural as the spring unfolding outside. Their contrasting but complementary styles have provided me with a balanced perspective on research and development in healthcare technology.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Their guidance has been invaluable as I navigate the intersection of advanced AI and healthcare applications. They understand when to provide direction and when to step back and let me explore solutions independently. This balance has accelerated my learning curve dramatically, allowing me to contribute meaningfully to projects despite being relatively new to the team.
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