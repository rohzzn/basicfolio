import React from 'react';
import Link from 'next/link';
import PostReads from '@/components/PostReads';
import PostFilm from '@/components/PostFilm';
import Image from '@/components/SiteImage';

const P = 'text-zinc-600 dark:text-neutral-400 mb-4';
const H2 = 'text-base font-medium mt-10 mb-4 dark:text-paper';
const A = 'underline decoration-zinc-300 dark:decoration-neutral-600 underline-offset-2 hover:decoration-zinc-500';
const ASSETS = '/writing/captain-claw';

function Shot({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) {
  return (
    <div className="mb-6 mt-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-neutral-700">
      <Image src={`${ASSETS}/${src}`} alt={alt} width={width} height={height} className="h-auto w-full" />
    </div>
  );
}

// stills from the trailer, in the order they come in it
const STILLS: { src: string; alt: string }[] = [
  { src: 'trailer-keg.webp', alt: 'A thrown powder keg explodes on a stone battlement' },
  { src: 'trailer-pistol.webp', alt: 'Claw fires his pistol on the docks at night' },
  { src: 'trailer-run.webp', alt: 'Claw running through the undersea caves' },
  { src: 'trailer-browser.webp', alt: 'The game running in a browser window at captainclaw.lol' },
  { src: 'trailer-wasd.webp', alt: 'W, A, S and D keys lighting up as Claw runs through a town' },
  { src: 'trailer-split.webp', alt: 'Two players in two browser windows, in the same level' },
  { src: 'trailer-multiplayer.webp', alt: 'Two players running through a purple cavern' },
  { src: 'trailer-outro.webp', alt: 'Captain Claw, play now at captainclaw.lol' },
];

export default function CaptainClaw() {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-paper">Captain Claw, Back in a Browser Tab</h1>
          <Link
            href="/writing"
            className="text-xs text-zinc-500 dark:text-neutral-400 hover:text-zinc-700 dark:hover:text-neutral-300 transition-colors flex-shrink-0 mt-1"
          >
            writing
          </Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-neutral-400 text-sm">
          <time dateTime="2026-10-14">Oct 14, 2026</time>
          <PostReads />
        </div>
      </header>

      <PostFilm slug="captain-claw" />

      <div className="text-sm max-w-3xl">
        <p className={P}>
          Captain Claw was my favourite game as a kid. It is a pirate platformer Monolith made in 1997: you play a
          cat captain with a sword and a pistol, fighting your way through fourteen levels of soldiers and treasure.
        </p>

        <p className={P}>
          I turned it into a browser game. You can play it at{' '}
          <a href="https://captainclaw.lol" className={A} target="_blank" rel="noopener noreferrer">captainclaw.lol</a>
          : no download, no install, open the page and press Play. Then I added online multiplayer, so you can play
          it with your friends.
        </p>

        <div className="mb-8 mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-black dark:border-neutral-700">
          <video
            controls
            playsInline
            preload="none"
            poster={`${ASSETS}/trailer-title.webp`}
            width={1280}
            height={720}
            className="block aspect-video h-auto w-full"
          >
            <source src={`${ASSETS}/trailer.mp4`} type="video/mp4" />
          </video>
        </div>

        <h2 className={H2}>How I did it</h2>

        <p className={P}>
          I did not rebuild the game from scratch.{' '}
          <a href="https://github.com/pjasicek/OpenClaw" className={A} target="_blank" rel="noopener noreferrer">OpenClaw</a>{' '}
          is an open-source remake of the Captain Claw engine in C++, by pjasicek, that plays the original levels from
          the original game files. I compiled it to WebAssembly with Emscripten, which turns C++ into something a
          browser can run, and packed the game files in with it.
        </p>

        <p className={P}>
          Getting it to start was the quick part. Making it feel like the original took longer. The copy of the game
          files I started from had no sound effects in it, so I merged the original sounds back in. I got the sound
          and the MIDI music playing in the browser, fixed the screen flashing black between scenes, and moved the
          controls to WASD so nothing clashes with browser shortcuts. A few friends played the early builds, and the
          bugs they found, like slippery ledges and enemies attacking too fast, got fixed one by one. It all runs from
          a Mac I use as a server at home.
        </p>

        <Shot src="play-screen.webp" alt="The Play screen: the CLAW logo over a parchment skull and crossed swords" width={1280} height={914} />
        <Shot src="captains-log.webp" alt="The game running in the browser with the settings panel open on the right" width={1280} height={914} />
        <Shot src="lift.webp" alt="Claw holding a barrel over his head in a castle corridor" width={1269} height={951} />

        <h2 className={H2}>Adding multiplayer</h2>

        <p className={P}>
          The original is single player, and I wanted to play it with my friends. Now one person creates a room and
          gets a six-character code, everyone else types in the code, and you all land in the same level. You see each
          other&apos;s Claw running around in real time with names above their heads, and enemies one of you takes out
          are gone for everyone. A room holds up to eight players.
        </p>

        <p className={P}>
          Behind it is a small Node.js server that passes each player&apos;s position to the others twenty times a
          second, and the game smooths the movement in between. The multiplayer menu is built into the game itself, in
          the same gold lettering as the original menus.
        </p>

        <Shot src="lobby.webp" alt="The in-game lobby: a room code, two players aboard, the level picker and Start" width={1269} height={951} />

        <div className="mb-6 mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STILLS.map((s) => (
            <div key={s.src} className="overflow-hidden rounded-md border border-zinc-200 dark:border-neutral-700">
              <Image src={`${ASSETS}/${s.src}`} alt={s.alt} width={1280} height={720} className="h-auto w-full" />
            </div>
          ))}
        </div>

        <p className="text-zinc-600 dark:text-neutral-400">
          Play it at{' '}
          <a href="https://captainclaw.lol" className={A} target="_blank" rel="noopener noreferrer">captainclaw.lol</a>.
        </p>
      </div>
    </article>
  );
}
