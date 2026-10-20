import React from 'react';
import Link from 'next/link';
import PostReads from '@/components/PostReads';
import PostFilm from '@/components/PostFilm';
import TvLoop from './TvLoop';

const P = 'text-zinc-600 dark:text-neutral-400 mb-4';
const H2 = 'text-base font-medium mt-10 mb-4 dark:text-paper';
const ASSETS = '/writing/fast-tv';

// measured over adb with dumpsys meminfo and gfxinfo, on the Google TV home screen before and on mine after
const NUMBERS: [string, string, string][] = [
  ['Home screen memory', 'about 150 MB', 'about 40 MB'],
  ['Free memory, sitting on the home screen', 'about 520 MB', 'about 660 MB'],
  ['Preinstalled apps switched on', 'all of them', '34 fewer'],
  ['Animation when an app opens', 'yes', 'none'],
];

export default function FastTv() {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-paper">Making My TV Fast Again</h1>
          <Link
            href="/writing"
            className="text-xs text-zinc-500 dark:text-neutral-400 hover:text-zinc-700 dark:hover:text-neutral-300 transition-colors flex-shrink-0 mt-1"
          >
            writing
          </Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-neutral-400 text-sm">
          <time dateTime="2026-10-20">Oct 20, 2026</time>
          <PostReads />
        </div>
      </header>

      <PostFilm slug="fast-tv" />

      <div className="text-sm max-w-3xl">
        <p className={P}>
          My TV is a TCL Google TV. The screen is fine. The software on it was slow. I would press a button on the
          remote and wait for the TV to catch up, and opening Netflix meant watching the home screen stutter first.
          The TV has 1.8 GB of memory and a modest Realtek chip, and the software it came with behaved as if it had a
          lot more than that.
        </p>

        <p className={P}>
          So I took it apart. I switched off most of what TCL and Google put on it and wrote a new home screen from
          scratch. It is now the fastest this TV has ever been.
        </p>

        <h2 className={H2}>What was slowing it down</h2>

        <p className={P}>
          I connected to the TV from my laptop over the network with adb, Android&apos;s debugging tool, and looked at
          what was running. The Google TV home screen alone was using about 150 MB across its two processes. Around it
          sat things I never asked for: Samba TV, which recognises what is on screen so it can sell the data to
          advertisers, a bundle of TCL telemetry, TCL&apos;s demo and hotel modes, an Alexa app, the Google Assistant,
          Chromecast and AirPlay receivers, and Google&apos;s ambient mode with two processes of its own. Sitting on the
          home screen doing nothing, the TV had about 520 MB of its 1.8 GB free.
        </p>

        <h2 className={H2}>Switching things off</h2>

        <p className={P}>
          I turned off 34 of those apps. Nothing was deleted. Android lets you disable an app for your user without
          touching the system, so a factory reset brings every one of them back. One script turns them off, another
          turns them all back on, and a third runs after a TCL update and puts back anything the update changed.
        </p>

        <p className={P}>
          I also turned off the animation when an app opens or closes, sped the rest up, and stopped a handful of
          streaming apps from running in the background when I&apos;m not using them.
        </p>

        <h2 className={H2}>A home screen of my own</h2>

        <p className={P}>
          With the Google TV home screen off, the TV needs something else to show when you press Home. I tried
          Projectivy first, a popular replacement launcher, and it was better, but it still used 70 to 90 MB and had far
          more settings than I would ever touch. So I wrote my own: a small Android app in plain Java, built from
          Android&apos;s own views with no libraries.
        </p>

        <p className={P}>
          It uses about 40 MB on the home screen and lets go of most of it the moment an app opens, down to about
          27 MB. It draws at 60 frames a second on this TV: half its frames take 8 milliseconds or less, and 95% of them
          fit in the 16 milliseconds a frame gets.
        </p>

        <h2 className={H2}>Three pages</h2>

        <p className={P}>
          The home screen is three pages stacked on top of each other, and up and down on the remote move between
          them. This is the TV itself, recorded straight off its screen, with nothing sped up:
        </p>

        <figure className="mb-6 mt-2">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-black dark:border-neutral-700">
            <TvLoop
              src={`${ASSETS}/tv-ui.mp4`}
              poster={`${ASSETS}/tv-ui.webp`}
              label="A screen recording of the TV: the focus moves along the row of app tiles, one press up opens the dashboard with the weather and calendar, and one press down from the apps opens the Watch page with rows of shows and videos"
            />
          </div>
          <figcaption className="mt-2 text-xs text-zinc-500 dark:text-neutral-500">
            Along the apps, up to the dashboard, back down, and down through the Watch page.
          </figcaption>
        </figure>

        <p className={P}>
          The middle page is the apps: one row of big tiles on black. The PlayStation comes first because it is what I
          use most, and selecting it switches the TV to HDMI 1. The rest are ordered by how much I have watched each
          one over the last 30 days. The focused tile turns its brand colour and grows a little, and there is a soft
          tick as you move. The clock, the weather and whatever is playing on my Spotify sit above.
        </p>

        <p className={P}>
          Up from the apps is the dashboard: a greeting, the date and the time here and in India, the weather with a
          five-day forecast, and my calendar for the week. When India is playing cricket or a Formula 1 session is on,
          the live score takes the greeting&apos;s place, and a few stock prices can sit there too. Nothing on it moves,
          so it costs nothing to leave up.
        </p>

        <p className={P}>
          Down from the apps is the Watch page. The first row is everything I am in the middle of, from Netflix,
          Crunchyroll, Prime Video and Jellyfin, with a thin bar showing how far in I am. Below it are my latest YouTube
          videos, then trending anime and Netflix&apos;s Top 10. Picking a card opens it in its own app, right where I
          left off.
        </p>

        <h2 className={H2}>The rest of the remote</h2>

        <p className={P}>
          The mic button is mine now too. Instead of the Google Assistant it runs a short list of commands I wrote:
          &quot;open Netflix&quot;, &quot;continue Young Sheldon&quot;, &quot;volume 20&quot;, &quot;sleep in 30
          minutes&quot;, and &quot;goodnight&quot;, which turns the TV off and puts the PlayStation to rest with it.
        </p>

        <p className={P}>
          The TV also serves a small web page on my home Wi-Fi, so my phone works as a remote with a real keyboard, and
          I can send a YouTube link or photos from my phone to the screen. There is nothing to install on the phone. The
          screensaver is a thin clock on black that moves to a new spot every minute, so nothing burns in.
        </p>

        <h2 className={H2}>Before and after</h2>

        <div className="mb-6 mt-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-neutral-700">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-zinc-200 bg-zinc-100/60 px-4 py-2 text-xs text-zinc-500 dark:border-neutral-700 dark:bg-neutral-800/40 dark:text-neutral-500">
            <span />
            <span>Before</span>
            <span>After</span>
          </div>
          {NUMBERS.map(([label, before, after]) => (
            <div
              key={label}
              className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-zinc-200 px-4 py-2.5 text-zinc-600 last:border-b-0 dark:border-neutral-700 dark:text-neutral-400"
            >
              <span>{label}</span>
              <span className="tabular-nums">{before}</span>
              <span className="tabular-nums text-zinc-900 dark:text-paper">{after}</span>
            </div>
          ))}
        </div>

        <p className={P}>
          The difference is not subtle. The screen moves when the remote does, opening an app no longer waits on the
          home screen, and the TV wakes from standby in about two seconds. And because nothing was deleted, all of it can be undone with one
          script.
        </p>
      </div>
    </article>
  );
}
