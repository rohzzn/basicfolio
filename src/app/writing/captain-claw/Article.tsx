import React from 'react';
import Link from 'next/link';
import PostReads from '@/components/PostReads';
import PostFilm from '@/components/PostFilm';
import Image from '@/components/SiteImage';

const P = 'text-zinc-600 dark:text-neutral-400 mb-4';
const H2 = 'text-base font-medium mt-10 mb-4 dark:text-paper';
const A = 'underline decoration-zinc-300 dark:decoration-neutral-600 underline-offset-2 hover:decoration-zinc-500';
const ASSETS = '/writing/captain-claw';

function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-xs bg-zinc-100 dark:bg-neutral-800 px-1 py-0.5 rounded">{children}</code>;
}

function Figure({ src, alt, caption, width, height }: { src: string; alt: string; caption: string; width: number; height: number }) {
  return (
    <figure className="mb-6 mt-2">
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-neutral-700">
        <Image src={`${ASSETS}/${src}`} alt={alt} width={width} height={height} className="h-auto w-full" />
      </div>
      <figcaption className="mt-2 text-xs text-zinc-500 dark:text-neutral-500">{caption}</figcaption>
    </figure>
  );
}

// the nine stills, in the order they come in the trailer
const STILLS: { src: string; alt: string; caption: string }[] = [
  { src: 'trailer-sword.webp', alt: 'Claw strikes an officer with his sword on a jungle ledge', caption: 'Sword, level 3' },
  { src: 'trailer-keg.webp', alt: 'A thrown powder keg explodes on a stone battlement', caption: 'Keg, level 2' },
  { src: 'trailer-pistol.webp', alt: 'Claw fires his pistol on the docks at night', caption: 'Pistol, level 7' },
  { src: 'trailer-run.webp', alt: 'Claw running through the undersea caves', caption: 'The run under the title, level 12' },
  { src: 'trailer-browser.webp', alt: 'The game in a browser window at captainclaw.lol, captioned No download. Just play.', caption: 'No download. Just play.' },
  { src: 'trailer-wasd.webp', alt: 'W, A, S and D keycaps lighting up as Claw runs through a town', caption: 'The keys light on the real keypresses' },
  { src: 'trailer-split.webp', alt: 'Two browser windows side by side, Jack and Pip, in the same level', caption: 'Jack and Pip, one room' },
  { src: 'trailer-multiplayer.webp', alt: 'A card reading Real-time multiplayer over a purple cavern', caption: 'Real-time multiplayer, level 11' },
  { src: 'trailer-outro.webp', alt: 'The outro: Captain Claw, the 1997 pirate classic, back in your browser. Play now at captainclaw.lol', caption: 'The outro' },
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
          Captain Claw is a platformer Monolith shipped in 1997: a pirate cat, fourteen levels, a sword, a pistol and
          a frankly unreasonable amount of treasure. It ran on Windows 95 off a CD. You can now play it at{' '}
          <a href="https://captainclaw.lol" className={A} target="_blank" rel="noopener noreferrer">captainclaw.lol</a>
          , in a browser tab, with WASD, with the original sound and music, and with your friends in the same level.
        </p>

        <p className={P}>
          None of that would exist without{' '}
          <a href="https://github.com/pjasicek/OpenClaw" className={A} target="_blank" rel="noopener noreferrer">OpenClaw</a>
          , pjasicek&apos;s open-source reimplementation of the engine in C++ and SDL2. It reads the original game
          data and plays the levels. It already had a WebAssembly target that nobody had finished: audio calls stubbed
          out with <Code>TODO: [EMSCRIPTEN]</Code>, fades that flashed black, controls built for 1997. The goal was one
          sentence long. Get it running in Chrome and Firefox, on WASD, with no crashes, no broken graphics and no
          missing audio. That took a day. Everything after it took three more.
        </p>

        <p className={P}>This is the trailer it ended with. All of the gameplay in it is real.</p>

        <figure className="mb-8 mt-2">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-black dark:border-neutral-700">
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
          <figcaption className="mt-2 text-xs text-zinc-500 dark:text-neutral-500">
            45 seconds, with sound. Thirteen gameplay shots, each from a different level.
          </figcaption>
        </figure>

        <h2 className={H2}>An archive with no sound in it</h2>

        <p className={P}>
          The game lives in one file, <Code>CLAW.REZ</Code>, and the first problem was that the copies you can still
          download are each missing something. The CD rip on captainclaw.net is an InstallShield 6 installer whose
          archive contains every graphic and level but not one sound effect, because the rip ships the sounds
          separately as MP3s. The CrazyHook release has all the original WAV files unpacked into folders, next to a
          168-byte stub where the archive should be.
        </p>

        <p className={P}>
          So the port starts with two small tools. One reads the InstallShield cabinet directly, without ever running
          the installer, and pulls <Code>CLAW.REZ</Code> out of it. The other merges the 1,151 original WAVs back into
          that archive, which is what the retail CD installed in the first place. The result is 102 MB and 12,991
          files, and it never goes into git.
        </p>

        <h2 className={H2}>Making a browser behave like Windows 95</h2>

        <p className={P}>
          Sound came back by linking the real SDL2_mixer port instead of the stubs. Music was the interesting part:
          Claw&apos;s soundtrack is MIDI, and browsers have nothing to play MIDI with, so the page carries a small
          General MIDI synthesizer built on TinySoundFont and a free soundfont, mixed in through SDL_mixer like any
          other channel. The death and teleport fades used to flash black on WebGL, which clears the screen every
          frame; they are now drawn over a frozen copy of the last frame instead.
        </p>

        <p className={P}>
          Controls needed more thought than a remap. The original attacks with Ctrl and fires with Alt, and in a
          browser Ctrl+W closes the tab and Alt opens Firefox&apos;s menu bar. So movement went to W, A, S and D,
          jumping to Space, the sword to J, the pistol to K, and nothing uses Ctrl or Alt. Firefox also keeps Escape
          for itself in fullscreen and never passes it on, so P pauses too. The page starts the game in fullscreen on
          the same click that unlocks audio, and every setting lives in a drawer called the Captain&apos;s Log that
          slides out from the right edge on F1.
        </p>

        <Figure
          src="play-screen.webp"
          alt="The Play screen: the CLAW logo over a parchment skull and crossed swords, a gold Play button"
          caption="The Play screen, made from the game's own main-menu art."
          width={1280}
          height={914}
        />
        <Figure
          src="captains-log.webp"
          alt="The game running in a gold frame with the Captain's Log settings drawer open on the right"
          caption="The Captain's Log: multiplayer, display and the full key map, out of the way until F1."
          width={1280}
          height={914}
        />

        <p className={P}>
          The resolution picker defaults to the largest whole multiple of 640 by 480 that fits, so every game pixel
          is a whole number of screen pixels, Retina included, and the art does not shimmer while the level scrolls. A browser that
          refuses WebGL gets the game anyway, on SDL&apos;s software renderer at the original size.
        </p>

        <h2 className={H2}>The crash that was not the MacBook</h2>

        <p className={P}>
          The first time I played it on my MacBook, it died in level 1 with{' '}
          <Code>RuntimeError: memory access out of bounds</Code>, and my first question was whether the MacBook was
          crying. It was not.
          OpenClaw&apos;s elevators kept pointers to the physics bodies of whatever was riding them, and when an enemy
          or a piece of treasure was destroyed mid-ride, the elevator kept the pointer. Two cached collision contacts
          had the same problem. In a native build that is memory quietly corrupted and nobody notices. In WebAssembly
          it is a hard stop. The same review turned up three more bugs of that kind, and a diagnostic build with
          bounds checking now replays the crash to prove they stay fixed.
        </p>

        <h2 className={H2}>What the testers found</h2>

        <p className={P}>
          Four testers played the first build, and their notes were better than any test I had written.
          Enemies died towards the middle of the screen: OpenClaw sends every corpse down and to the right whichever
          side you hit it from, and the original throws it away from you. The edges of platforms were slippery: Claw
          stands on a round foot with zero friction, so on a tile corner he slid off within a second or two. Enemies
          attacked too fast: the soldiers, officers and rats in the first two levels had no delay between attacks at
          all, and now they wait 500 ms, or 750 ms for a musket.
        </p>

        <p className={P}>
          The vaguest note, that it felt a bit choppy, was the most interesting. The game was timing each frame from
          when its callback started, which jitters by a few milliseconds, so a frame that really lasted 16.7 ms was
          simulated as anything from 12 to 22. Walking advanced 4 to 8 pixels a frame. Timing it from the display&apos;s
          own refresh instead makes it a steady 5 or 6.
        </p>

        <p className={P}>
          One tester asked how to pick up barrels, and my first draft of a reply said you could not. You can: the
          original&apos;s help screen says <Code>CTRL+UP ARROW or Z: PICK UP, THROW</Code>, and it works on powder
          kegs and soldiers alike. OpenClaw just never implemented it, although
          the lifting, carrying and throwing animations are all in the archive. It is in now, with those animations,
          and the second version is much better than the first. The first had a hold-to-charge throw the original
          never had, and holding Z froze Claw in place. Now Z throws at once, low and in front of him, a keg he throws
          cannot hurt him, and a soldier thrown into another soldier takes them both out.
        </p>

        <Figure
          src="lift.webp"
          alt="Claw holding a barrel over his head in a castle corridor"
          caption="Lifting a keg, with the game's own animation."
          width={1269}
          height={951}
        />

        <h2 className={H2}>Sail together</h2>

        <p className={P}>
          Then it got multiplayer. A small relay in Node and WebSockets hands out a room code, and everyone who types
          it plays the same level: up to eight of you, each Claw in their own colour with a name tag and a health bar,
          and an arrow at the edge of the screen for anyone out of view. Other players are interpolated, and in the
          test they stayed within 0.3 pixels of the path they really walked. With the shared world on, an enemy one
          of you defeats and treasure one of you picks up are gone for everyone. A dropped connection reconnects on
          its own, a reload rejoins the room, and if the host leaves the next player becomes host.
        </p>

        <p className={P}>
          The lobby is inside the game, not on the page around it, and it is lettered like the rest of the menus.
          Nothing new was drawn for that: when the game loads it cuts letters out of 32 of the original menu label
          images and composes the new words from them, with the same drop shadow and the same glow on the selected
          item. The 1997 lettering has no X and no Z. So the room codes never contain an X or a Z, along with I, L, O,
          0 and 1, which are too easy to misread off a friend&apos;s screen.
        </p>

        <Figure
          src="lobby.webp"
          alt="The in-game lobby in gold lettering: room code 349WP2, two players aboard, level 1 La Roca, Start, Leave Room, Back"
          caption="The game lobby. Every gold letter here was cut from the original menu art."
          width={1269}
          height={951}
        />

        <p className={P}>
          Some limits are on purpose. Each player&apos;s game still runs its own enemies, loot dropped by an enemy stays
          with whoever killed it, and a player whose tab is in the background freezes for everyone else until they
          come back, because browsers stop running a page nobody is looking at.
        </p>

        <h2 className={H2}>Every item on the menu</h2>

        <p className={P}>
          By the end, everything on the main menu does something. Help lists the keys you are actually using. Credits
          scroll over the original credits picture with its music. Options holds players, difficulty per player (half
          the damage on Easy, one and a half times on Hard), a switch back to the original arrow keys, and a setting
          that shows more of the level, up to 960 by 720. Load Custom Level opens a file picker for a{' '}
          <Code>.WWD</Code> made with a Claw level editor. Saves are kept in the browser, per player, and survive a
          reload. Upload Scores is still greyed out, since the scores service it talked to shut down long ago.
        </p>

        <p className={P}>
          Replay Movies used to sit greyed out between Multiplayer and Options, because there are no movies in the
          game data. That slot is PLEASE DONATE now, in the same gold lettering, because the hosting and the relay
          cost real money every month.
        </p>

        <Figure
          src="donate.webp"
          alt="The Please Donate page: Ahoy, pirate! Servers don't run on their own, with Donate Now and Back"
          caption="The menu item that replaced Replay Movies."
          width={1269}
          height={951}
        />

        <p className={P}>
          It is all served from a Mac I keep at home as a server. The game is plain static files, about 110 MB, of
          which 104 MB is the packed game data and 5 MB the WebAssembly, and the relay sits behind the same domain at{' '}
          <Code>/mp</Code>. Before an update goes up, a Playwright suite plays the game in Chromium and Firefox: 29
          single-player checks, two browsers in one room, three players with a fourth turned away from a full room,
          lifting and throwing, every menu page. Across the four days that came to 14 commits and about 14,000 added
          lines in OpenClaw.
        </p>

        <h2 className={H2}>Cutting the trailer</h2>

        <p className={P}>
          The brief for the trailer had one hard rule: use real captures, never redraw the game. So the footage was
          recorded by scripts that play the game: a single-player session with a sword kill, pistol shots and a keg
          thrown at a soldier, and a two-browser session through the real relay. Everything around the footage is a
          single HTML page, a 1920 by 1080 stage where every frame is a function of the clock, rendered to video with
          a score generated in Web Audio at 150 beats a minute, cuts landing on the beat.
        </p>

        <p className={P}>
          Small things in it are true. The W, A, S and D keycaps light up on the exact timestamps of the keypresses in
          the recording. The room code that flips in letter by letter, B6V5HK, is the one the relay generated while
          it was being filmed, and the second browser types it in time with the game.
        </p>

        <p className={P}>
          The first cut was close, except for the background shots: Claw kept running into walls, and several shots
          came from the same level. The reshoot gave each of the thirteen
          gameplay shots its own level and found each run a clear floor by reading the level map itself: no wall, no
          spikes, no low ceiling, and enough scenery around it to look like a place. The enemies on that floor were
          knocked out before recording, Claw&apos;s position was logged every frame, and a take was only used where he
          never stopped, got hit or warped. Several were thrown out, including one where turrets above the floor shot
          both players.
        </p>

        <div className="mb-6 mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STILLS.map((s) => (
            <figure key={s.src}>
              <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-neutral-700">
                <Image src={`${ASSETS}/${s.src}`} alt={s.alt} width={1280} height={720} className="h-auto w-full" />
              </div>
              <figcaption className="mt-1 text-[11px] text-zinc-500 dark:text-neutral-500">{s.caption}</figcaption>
            </figure>
          ))}
        </div>

        <h2 className={H2}>Still open</h2>

        <p className={P}>
          One tester says the hit detection feels off, and I do not have a case I can reproduce yet. The music is
          bassier than it should be, which is the small soundfont; a better one is cheap to try. Touch screens have
          no lift button. The game&apos;s own credits screen still names the old address.
        </p>

        <p className="text-zinc-600 dark:text-neutral-400">
          If you played it in 1997, the levels are where you left them. If you never did, it takes one click at{' '}
          <a href="https://captainclaw.lol" className={A} target="_blank" rel="noopener noreferrer">captainclaw.lol</a>
          . And if it brought back a smile, there is a{' '}
          <a href="https://donate.rohan.run" className={A} target="_blank" rel="noopener noreferrer">hat for coins</a>
          {' '}that keeps the server on.
        </p>
      </div>
    </article>
  );
}
