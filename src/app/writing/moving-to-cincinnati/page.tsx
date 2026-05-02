import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import MoveTimeline from './MoveTimeline';

export const metadata: Metadata = {
  title: 'From Hyderabad to Cincinnati — Rohan',
  description: 'The whole process of finishing a degree in India, applying to grad school, getting a visa, and arriving alone in a city 14,000km away.',
  openGraph: {
    title: 'From Hyderabad to Cincinnati',
    description: 'The whole process of finishing a degree in India, applying to grad school, getting a visa, and arriving alone in a city 14,000km away.',
    url: 'https://rohan.run/writing/moving-to-cincinnati',
  },
  alternates: { canonical: 'https://rohan.run/writing/moving-to-cincinnati' },
};

export default function MovingToCincinnati() {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">From Hyderabad to Cincinnati</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2024-08-05">August 24, 2024</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I landed at Cincinnati/Northern Kentucky Airport at midnight on a Tuesday in early August 2024. My two suitcases weighed exactly 23kg each, the checked bag limit. My carry-on held a laptop, some snacks from Hyderabad, and a folder of documents I had been told to never let out of my sight. I had never been to America before. I did not know anyone in Cincinnati. The Uber driver asked me where I was from and whether I liked American food. I said yes to both, which was a lie on the second count.
        </p>

        <MoveTimeline />

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">The application process</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I started applications in November 2023, toward the end of my final year at MREC. The process has a lot of moving parts that all need to happen in the right order. GRE first, then IELTS, then transcripts, then letters of recommendation, then the statement of purpose. The SOP is the part nobody warns you about properly. You write a few hundred words about who you are and why you want to study at this specific school, and everything sounds both too humble and too arrogant at the same time. I rewrote mine two times.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I applied to three schools. UC came back with an acceptance in January. The Master of Engineering in Computer Science program had the right mix of what I wanted: strong algorithms curriculum, research opportunities, and a location that was not too expensive to live in relative to the coastal cities. I accepted and started the visa process.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">The visa interview</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The US student visa interview is a strange experience. You prepare documents for weeks. Financial statements, acceptance letters, I-20 form, SEVIS fee receipt, ties to your home country. You wake up at five in the morning to get to the consulate on time. You wait in a long queue outside. Then inside. Then you reach the window and the officer asks you three questions in 90 seconds and says your visa is approved. The preparation felt disproportionate to the interview itself, but I understand why it has to be that way.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">The packing problem</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Two bags, 23kg each, to represent everything you want from 23 years of life in one place. You quickly learn what actually matters. Clothes compress well. Books do not. I brought two books. I brought a small framed photo. I brought all my electronics. I brought too many jackets for a city where I did not know how cold the winter actually gets, which turned out to be very cold.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          There is a specific feeling of leaving behind things you own that have no real value but have been with you for years. A desk you sat at for thousands of hours. Posters on a wall. A gaming setup that cannot travel. You do not mourn the objects exactly. It is more that you are aware that the person who used those things is also not exactly coming with you. You arrive somewhere new and become a slightly different version of yourself out of necessity.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">The first weeks</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Cincinnati is a mid-sized city in southwest Ohio. It is not what most people picture when they think of America. It does not have the density of New York or the tech industry gravity of San Francisco. What it has is affordable rent, good architecture, hills, and a university that takes up a significant piece of it. The campus is genuinely beautiful in a way I did not expect. Red brick buildings, the 1819 Innovation Hub, green spaces that bloom dramatically in spring.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The first thing you notice when you arrive as an international student is how much you do not know about how things work. Simple things. Where to get a SIM card. How to open a bank account without a Social Security Number. How the bus system works. Whether you need to tip at a food truck. These are not hard problems but they arrive all at once and you are also jet-lagged and sleeping somewhere unfamiliar.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">What actually helped</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The international student community at UC is large and the university does orientation well. Within the first week you meet people from all over who are navigating the exact same confusion you are. Some of my closest friendships here formed in that first month, among people who had nothing in common except that they were all figuring out American grocery stores for the first time together.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The esports arena in the 1819 Innovation Hub was genuinely meaningful. I found it in the second week and spent an afternoon there. Meeting people through gaming in a new city felt familiar in a way that most of the orientation activities did not. I already spoke that language fluently.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">What I miss</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The food is the honest answer. Not just in the sense that American food is worse, but in the specific sense that Hyderabad food is extraordinary and irreplaceable. Biryani from the right place. Tea made correctly. The specific combination of spices in things that does not exist here at the same level. I have found decent approximations. None of them are the thing.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          The other thing is the ease of being somewhere that already knows you. In Hyderabad I understood the context for everything without thinking about it. The unspoken rules, the right amount of small talk with a stranger, what different things mean. Here every interaction involves slightly more effort. That fades over time but it does not disappear fully. You just learn a new set of defaults.
        </p>
      </div>
    </article>
  );
}
