import React from 'react';
import PostReads from '@/components/PostReads';
import Link from 'next/link';
import { TeluguMoviesDemo } from './TeluguMoviesDemo';

const TeluguMoviesIn: React.FC = () => {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-paper">
            Why I Built telugumovies.in
          </h1>
          <Link
            href="/writing"
            className="text-xs text-zinc-400 dark:text-neutral-400 hover:text-zinc-700 dark:hover:text-neutral-300 transition-colors flex-shrink-0 mt-1"
          >
            writing
          </Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-neutral-400 text-sm">
          <time dateTime="2026-06-28">Jun 28, 2026</time>
          <PostReads />
        </div>
      </header>

      <div className="text-sm max-w-3xl">
        <p className="text-zinc-600 dark:text-neutral-400 mb-6 text-sm">
          My parents watch almost exclusively Telugu movies. Tollywood, not Bollywood. Not English-language streaming
          catalogs with a Telugu dub buried three menus deep. When they sit down in the evening, they want a Telugu
          film: the kind they grew up with, the kind their friends are talking about, the kind that plays in
          Hyderabad and Vijayawada and every small-town single-screen that still puts up a hand-painted poster on
          Friday morning.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          For a long time I had a simple plan for them: buy a NAS, fill it with every Telugu movie ever made, run
          Jellyfin on the living-room TV, and hand them a remote that just works. No subscriptions. No algorithm
          pushing Hindi originals. No hunting through five apps to find whether <em>RRR</em> is on Netflix this month
          or gone next month. One library. Their language. Their movies. Done.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">The NAS dream and the storage math</h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          The idea was never complicated. Jellyfin is excellent for exactly this use case: a clean interface on a
          Fire TV or Android box, posters and metadata pulled automatically, resume playback, big text, nothing
          clever. My parents are not trying to learn Plex server settings at 9 pm. They want to press play.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          What stopped me was not the software. It was the storage. Tollywood has been releasing somewhere between
          150 and 200 films a year for decades. Even if you only care about the catalog from 1980 onward, which is
          roughly where my parents&apos; nostalgia and mine overlap, you are still talking about thousands of
          titles. At reasonable quality, that is not a 4 TB drive and a shrug. It is racks of drives, redundancy,
          power draw, and a number on a spreadsheet that made me quietly close the tab.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          Storage prices in 2026 are better than they were five years ago. They are still not &ldquo;download the
          entire Telugu film industry&rdquo; better. Not for a side project built for two people on a sofa. The NAS
          plan is not dead. I still want to build it someday, probably starting with a curated subset rather than
          everything, but it went on the shelf until I can afford to do it properly.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">What telugumovies.in actually is</h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          While the NAS idea was on pause, I built something smaller:{' '}
          <a
            href="https://telugumovies.in"
            className="underline decoration-zinc-300 dark:decoration-neutral-600 underline-offset-2 hover:decoration-zinc-500"
            target="_blank"
            rel="noopener noreferrer"
          >
            telugumovies.in
          </a>
          . The pitch on the tin is straightforward: every Telugu movie, from 1980 through 2026, with what is
          playing in cinemas right now, plus a TV section where you can watch more than five hundred films for free.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          Under the hood it is a Next.js app with TMDb metadata, portrait posters, browse-by-year pages, hero and
          director filters, and a search bar. The home page pulls live &ldquo;now playing&rdquo; data for
          Telugu-original films in Indian cinemas. The catalog rows are organized by decade and year. There is a
          parent-friendly layer on top: big mode, favorites, watched history, continue watching, all stored in
          localStorage so nothing leaves the browser.
        </p>

        <TeluguMoviesDemo />

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          The TV section is where the honest description matters. The site does not host video files. It does not
          scrape piracy sites. It does not download anything. What it does is search YouTube for likely full-movie
          uploads, score the candidates, cache the results, and only surface matches that pass a verification step:
          long runtime, title match, embeddable player, trusted channel when possible. A human can approve or
          reject borderline matches in an admin panel. Public users only see verified links.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          In practice, for the time being, this is probably the most legal way my parents could watch a large
          back catalog without paying for four different streaming services that each own a slice of Tollywood.
          Many classics and mid-list titles already live on YouTube: official studio channels, licensed aggregators,
          uploads that have sat there for years. telugumovies.in is, at the end of the day, a YouTube link
          aggregator with good metadata and a Netflix-style UI wrapped around it.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">Why I paused it</h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          I want to be direct about that last part because it is the reason the project is paused. The idea is not
          bad. My parents genuinely used the prototype, and the problem it tries to solve is real, but it is also
          not great in the way I originally imagined. I did not build a personal Tollywood library. I built a nicer
          front door to content that already exists elsewhere, maintained by a matching pipeline that eats YouTube
          API quota and still needs manual review when the scorer gets it wrong.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          There is a ceiling on how far that goes. Metadata from TMDb is useful but incomplete for older Telugu
          films. YouTube matches drift: videos get taken down, channels change names, a trailer masquerades as a
          full movie until someone notices. Every verified link is a dependency on a platform I do not control. The
          NAS version, expensive as it is, at least owns the files.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          So I stopped actively working on it. Not because I am embarrassed by it. I am sharing it here, after all,
          but because I would rather be honest about what it is than pretend I shipped Netflix for Telugu cinema.
          It is a stopgap I wrote for my parents while I save up for the storage problem. It works well enough for
          that. It is not the thing I actually wanted to build.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-paper">What I would do differently</h2>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          If I pick it back up, the path probably looks like this: keep the catalog and cinema listings, since those are
          legitimately useful even without the TV section, and treat YouTube matching as optional enrichment rather
          than the product. Pair the site with a small NAS holding a curated hundred films my parents actually
          rewatch, Jellyfin for what I own, telugumovies.in for discovery and what is in theaters now. Hybrid,
          honest, sized to the budget.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          Until then, the code exists, the domain is live, and the story is worth telling. Sometimes the project
          you finish is not the project you dreamed about. Sometimes it is the one that teaches you why the dream
          costs what it costs, and what you are actually willing to build in the meantime.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400 mb-4 text-sm">
          If you are building something similar for your own family, a home media server, a language-specific
          catalog, anything where &ldquo;just use Netflix&rdquo; is not the answer, I hope this helps more than a
          polished landing page would. The NAS is still the goal. telugumovies.in was the bridge. Bridges are
          useful. They are also not where you live.
        </p>
      </div>
    </article>
  );
};

export default TeluguMoviesIn;
