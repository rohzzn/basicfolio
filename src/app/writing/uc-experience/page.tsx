import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import CourseCards from './CourseCards';

export const metadata: Metadata = {
  title: 'First Semester at UC — Rohan',
  description: 'My experience navigating grad school, new friendships, and adjusting to life in Cincinnati during my first semester.',
  openGraph: {
    title: 'First Semester at UC',
    description: 'My experience navigating grad school, new friendships, and adjusting to life in Cincinnati during my first semester.',
    url: 'https://rohan.run/writing/uc-experience',
  },
  alternates: { canonical: 'https://rohan.run/writing/uc-experience' },
};

const UCExperience: React.FC = () => {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">First Semester at UC</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2024-12-31">December 2024</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I landed in Cincinnati in August with two suitcases, a laptop, and no idea what grad school in America was actually going to feel like. The moving post covers the logistics of getting here. This one is about what the first four months were like once I actually arrived.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          The short version: harder than I expected academically, better than I expected socially, and I finished with a 4.0 — all A+. The longer version is below.
        </p>

        <CourseCards />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The coursework</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Advanced Algorithms I was the course I was most nervous about and the one I spent the most time on. The gap between knowing that dynamic programming exists and being able to apply it cleanly under exam pressure is larger than I remembered. I spent most of September re-learning things I thought I knew. The Distributed Operating Systems course was dense in a different way — the content was new, not a refresher, and understanding how distributed state actually stays consistent changed how I think about the systems I build.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Cloud Computing was the most immediately practical. We were deploying things to AWS and Azure within the first few weeks. I had used both before but having to understand the IAM model and the cost implications of every architecture decision made it feel different from just following a tutorial. Innovation Design Thinking was a useful gear change — thinking about problems from the user&apos;s perspective before jumping to the technical solution is not instinctive for engineers, and the course forced that habit.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The campus</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The 1819 Innovation Hub was the first thing on campus that made me think I had chosen the right place. It has an esports arena with professional-grade setups and a community of people who take gaming seriously, which is not something I expected to find at a grad school. I found my people there in the first week, which mattered more than I would have admitted at the time.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Langsam Library became my default study spot by October. The quiet floors are actually quiet. I worked through most of my algorithms problem sets there, usually late enough that the place was nearly empty. There is something about a library at 11pm that makes hard problems feel more manageable.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The Package Center</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I got a part-time job at the Bearcats Package Center early in the semester, which was a good decision for reasons beyond the paycheck. On an F1 visa you can only work on campus, and this was the job that was available. I took it expecting to just sort boxes for a few hours a week. It turned out to be the easiest way to meet people outside my program — the team was a mix of students from completely different departments, and Tyler and Terrance ran it well enough that it never felt like dead time.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">How it ended</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          I finished the semester with A+ in every course — 4.0 GPA — which I am genuinely proud of given how much of it was new terrain — new country, new academic system, new city, all at once. By December I had a rhythm: classes in the morning, Langsam in the afternoon, the esports lab in the evenings when I needed to decompress. The spring semester would be harder in some ways and better in others.
        </p>

      </div>
    </article>
  );
};

export default UCExperience;
