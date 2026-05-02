import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import DesignShowcase from './DesignShowcase';

export const metadata: Metadata = {
  title: 'Beginners Guide for Design — Rohan',
  description: 'The core principles, tools, and resources that helped me go from zero design knowledge to building real products.',
  openGraph: {
    title: 'Beginners Guide for Design',
    description: 'The core principles, tools, and resources that helped me go from zero design knowledge to building real products.',
    url: 'https://rohan.run/writing/beginners-guide-design',
  },
  alternates: { canonical: 'https://rohan.run/writing/beginners-guide-design' },
};

const BeginnersGuideDesign: React.FC = () => {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <Link href="/writing"
        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to writing</span>
      </Link>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-lg font-medium mb-4 dark:text-white">
          Beginners Guide for Design
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2021-04-28">April 28, 2021</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          I came to design through programming, not the other way around. I was building projects and they looked terrible, which bothered me enough to start learning why. I picked up Photoshop first, then Illustrator, then eventually Figma once it became the clear industry standard. Along the way I built a VS Code theme (Tanoshi), designed logos and merch, and got comfortable enough with the tools to consider design a real part of my skill set rather than just something I muddle through. This is what I would tell myself at the start.
        </p>

        <DesignShowcase />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Learn Figma. Skip everything else for now.</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          When I started, the advice was to learn Photoshop or Illustrator. Both are still worth knowing, but Figma is now where almost all UI and product design work happens. It is free, browser-based, great for collaboration, and has a community of plugins that extend it endlessly. If you are building things for screens, start with Figma. Photoshop is useful for photo editing and image manipulation. Illustrator is useful for vector illustration and logo work. You can come back to those when you have a specific need.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Study before you copy</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The fastest way to develop taste is to look at a lot of good work and understand why it works. Not just passively scrolling Dribbble, but actually asking: what makes this feel clean? Why do the sections feel well-separated? What is the visual hierarchy? Sites like <a href="https://www.mobbin.com" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">Mobbin</a> and <a href="https://www.awwwards.com" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">Awwwards</a> are useful references. For UI patterns specifically, Mobbin captures real interfaces from real apps, which is more useful than design awards that often prioritize visual novelty over usability.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The four principles that cover most problems</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Robin Williams wrote a book called The Non-Designer&apos;s Design Book that covers four principles: contrast, repetition, alignment, and proximity. These four things explain a huge proportion of why designs look good or bad. The interactive demo above shows them. When a layout feels off and you cannot explain why, going through those four principles one at a time almost always surfaces the problem.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Contrast is the one that helps most in the beginning. If something is meant to be important, make it look important — bigger, bolder, or more saturated than the things around it. If two things have the same visual weight, the reader does not know which one to look at first. Hierarchy comes from contrast.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Typography is half the work</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Most beginners focus on colors and ignore type. This is backwards. Typography does more to determine whether a design feels professional or amateurish than any other single element. Using a system font like Inter or a well-chosen Google Font, setting a consistent type scale (e.g. 12 / 14 / 16 / 20 / 28px), and getting line height right (1.5 to 1.6 for body text) will make almost any design look significantly better immediately.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          For my projects, I use Satoshi for most things and Inter as a fallback. Both are clean, legible, and free. Avoid decorative fonts for body text. Save them for headlines if you use them at all.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Build something real as fast as possible</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The Tanoshi VS Code theme was one of the projects that taught me the most about design. It forced me to think carefully about every color choice because the stakes were real — people were actually installing it and using it to code. Designing for a specific use case with real constraints is more educational than any amount of practice projects with fake briefs.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Take on a real project as early as possible. Redesign an app you use. Build a visual for a project you are already working on. Design a logo for something that matters to you. The feedback loop from making something real is faster and more useful than tutorials, because the question is never just what looks good abstractly but what works for this specific thing.
        </p>
      </div>
    </article>
  );
};

export default BeginnersGuideDesign;
