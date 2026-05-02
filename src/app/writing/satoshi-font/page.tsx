import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FontShowcase from './FontShowcase';

export const metadata: Metadata = {
  title: 'Why I Use Satoshi on Everything I Build — Rohan',
  description: 'The font choices behind this site and why Satoshi specifically became my default for almost every project.',
  openGraph: {
    title: 'Why I Use Satoshi on Everything I Build',
    description: 'The font choices behind this site and why Satoshi specifically became my default for almost every project.',
    url: 'https://rohan.run/writing/satoshi-font',
  },
  alternates: { canonical: 'https://rohan.run/writing/satoshi-font' },
};

export default function SatoshiFont() {
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
          Why I Use Satoshi on Everything I Build
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2024-10-15">October 15, 2024</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Every personal project I have built in the last year uses the same typeface. This site uses it. The Catan game uses it. The tools I build for myself use it. That typeface is Satoshi, released free on Fontshare by Indian Type Foundry. I did not set out to become monogamous with a font. It just kept being the right answer.
        </p>

        <FontShowcase />

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">What Satoshi is</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Satoshi is a geometric sans-serif designed by Deni Anggara and released through Fontshare, a free font service run by Indian Type Foundry. It comes in five weights — Light, Regular, Medium, Bold, and Black — plus matching italics. There is also a variable font version that gives you the full weight range in a single file. The name is a reference to Satoshi Nakamoto, the pseudonymous creator of Bitcoin, which is a slightly unusual origin story for a typeface but does not affect how it looks on a page.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Why it works so well for UI</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Most geometric sans-serifs have a coldness to them. Futura is famous and beautiful but it is not a text font. Helvetica is a workhorse but it has almost no personality at smaller sizes. What Satoshi does differently is introduce subtle optical corrections that make the letters feel warmer at body text sizes while staying clean and modern at display sizes. The lowercase letters have a slightly larger x-height than you would expect from a purely geometric construction, which means they stay readable at 12 or 13px where a lot of geometric fonts start to feel cramped.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The weight range also hits the right spots for UI hierarchy. The Medium weight (500) is distinct enough from Regular (400) that you can use it for labels and secondary headings without jumping to Bold, which gives you more granularity in a type system. The Black weight (900) is strong without being aggressive. The whole family feels like it was designed by someone who actually uses fonts in interfaces rather than just on posters.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Compared to the obvious alternatives</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The comparison tab above lets you see this directly. Inter is the standard choice for developer-built UIs and it is excellent. It has better hinting, more language coverage, and a larger community of tooling built around it. For most projects Inter is the correct default. But there is something in Satoshi at display sizes, particularly in the Medium and Bold weights, where it has a bit more character. The terminals of the letters are slightly less mechanical. It reads as a design choice rather than a system default.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          System UI fonts (San Francisco on Mac, Segoe UI on Windows) are fast because they require no download, but they are inconsistent across operating systems. If you care about your design looking a specific way everywhere, you need to specify a font. Satoshi loads as a single variable font file which keeps the weight penalty reasonable.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Where it falls short</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Satoshi does not have great language coverage beyond Latin. If your project needs Cyrillic, Arabic, CJK, or extensive diacritic support you will need something else. It also does not have a monospace companion, so if you are mixing prose and code you will need a separate font for code blocks. I use a system monospace stack for code to keep load times down.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The other limitation is that because Fontshare hosts it, you are adding a third-party dependency. For maximum reliability I self-host the font files — the repository for this site includes the full Satoshi web font package in <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">public/font/</code> so it loads from the same origin as everything else and is not affected by Fontshare availability.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">The practical setup</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Loading Satoshi in a Next.js project with self-hosted files looks like this. Declare the font faces in your CSS pointing at the local files, set it as the default <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">font-family</code> on the body, and add it to your Tailwind config so you can use it with utility classes.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-6">
          <pre className="text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto">{`/* globals.css */
@font-face {
  font-family: 'Satoshi';
  src: url('/font/WEB/fonts/Satoshi-Variable.woff2') format('woff2');
  font-weight: 300 900;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'Satoshi', system-ui, sans-serif;
}`}</pre>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400">
          The <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">font-display: swap</code> is important. It tells the browser to render text in the fallback system font immediately and swap to Satoshi once it loads, so users on slow connections see text right away rather than invisible characters. The variable font file covers all weights in one request, which is one of the main reasons to prefer it over loading individual weight files.
        </p>
      </div>
    </article>
  );
}
