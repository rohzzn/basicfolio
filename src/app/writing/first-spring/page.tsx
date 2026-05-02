import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import CourseCards from './CourseCards';

export const metadata: Metadata = {
  title: 'Second Semester at UC — Rohan',
  description: 'Leading a team of 13, a research role at CCHMC, harder coursework, and Cincinnati in spring — my second semester at UC.',
  openGraph: {
    title: 'Second Semester at UC',
    description: 'Leading a team of 13, a research role at CCHMC, harder coursework, and Cincinnati in spring — my second semester at UC.',
    url: 'https://rohan.run/writing/first-spring',
  },
  alternates: { canonical: 'https://rohan.run/writing/first-spring' },
};

const FirstSpring: React.FC = () => {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Second Semester at UC</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2025-04-28">April 2025</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Spring semester was harder than fall. The coursework stepped up, I took on a team lead role I had not planned for, and I started a research position at Cincinnati Children&apos;s Hospital at the same time. By April I was running on less sleep than I should have been, but I finished with all A+ again — another 4.0 — and a clearer sense of what I want out of the rest of the program.
        </p>

        <CourseCards />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Leading a team of 13</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Large Scale Software Engineering was the course I underestimated most. I ended up as team lead for a group of 13 students, which sounds straightforward until you are the one coordinating sprint planning while also writing code, managing merge conflicts from ten different branches, and figuring out why two people on the team have a dynamic that makes every standup uncomfortable.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I learned things in that course that I could not have learned from a textbook or a side project. Delegating tasks when you could just do them yourself faster. Having direct conversations about missed deadlines without making it personal. Keeping the team moving when the requirements changed mid-sprint because the professor revised the project scope. The technical work was fine. The people part was where I actually grew.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The other courses</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Advanced Algorithms II picked up exactly where the first one left off — harder problems, tighter time constraints, more expected of you. Network Security was the course I enjoyed most. The assignments were hands-on in a way that most courses are not: you were implementing things, not just studying them. The 2FA post on this site came directly out of work I did in that class, looking at how TOTP verification is commonly implemented wrong. Software Testing was a course I went in expecting to find dry, and it turned out to be one of the more useful ones — the habit of thinking about edge cases and failure modes before writing code is one I actually kept.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Research at CCHMC</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Partway through the semester I got a Graduate Research Assistant position at Cincinnati Children&apos;s Hospital Medical Center. The work sits at the intersection of software engineering and healthcare infrastructure — the kind of thing where the stakes are different from building a web app because the systems you are working on actually matter to patient outcomes.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          It was the first time I was being paid to do research, which felt different from coursework in ways I found hard to articulate at first. The timeline is longer. The definition of done is fuzzier. You are not working toward a deadline set by a syllabus but toward understanding something that is genuinely not understood yet. I am still getting used to that mode of working, but I think it suits me.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Cincinnati in spring</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The city looks completely different in spring. Coming from Hyderabad, I had experienced seasons in theory but not the specific way a Midwestern city shifts from gray to color in March and April. Eden Park in April is genuinely worth the visit. The campus got better too — the walks that were just functional in the winter became actual reasons to leave the library.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Where things stand</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          I finished with another 4.0 — all A+ again for the second semester in a row. I am going back to India for the summer before the fall semester starts — first time home since I left in August 2024. The research position continues in the fall. The program has two more semesters after that. I feel more settled in Cincinnati than I expected to after less than a year, and less certain than I expected to be about exactly what I want to do after graduation. Both of those feel like the right places to be at this point.
        </p>

      </div>
    </article>
  );
};

export default FirstSpring;
