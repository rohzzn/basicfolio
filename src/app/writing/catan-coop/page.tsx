import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import HexBoard from './HexBoard';
import DiceRoller from './DiceRoller';
import BuildCosts from './BuildCosts';

export const metadata: Metadata = {
  title: 'Building Multiplayer Catan From Scratch — Rohan',
  description: 'How I built a full-featured online Settlers of Catan — hex grid geometry, server-authoritative game state, Socket.IO rooms, and Web Audio all from scratch.',
  openGraph: {
    title: 'Building Multiplayer Catan From Scratch',
    description: 'How I built a full-featured online Settlers of Catan — hex grid geometry, server-authoritative game state, Socket.IO rooms, and Web Audio all from scratch.',
    url: 'https://rohan.run/writing/catan-coop',
  },
  alternates: { canonical: 'https://rohan.run/writing/catan-coop' },
};

export default function CatanCoop() {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Building Multiplayer Catan From Scratch</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2026-05-01">May 2026</time>
          <a href="https://catan.rohan.my" target="_blank" rel="noopener noreferrer"
             className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-xs">
            catan.rohan.my ↗
          </a>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I have been playing Catan since high school. My family bought a copy at a mall and that weekend I probably spent six hours placing settlements and arguing about trades. Something about the mix of strategy and luck and player interaction felt different from other board games. When I wanted a project to push my real-time web skills, building an online version seemed like the obvious choice. Complex enough to stay interesting, familiar enough that I would know immediately when something was wrong. The live version is at <a href="https://catan.rohan.my" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">catan.rohan.my</a>. It supports 2 to 4 players through room codes and implements the full ruleset including dev cards, port trading, longest road, and largest army.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Deciding where state lives</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Before writing any game logic I had to settle one architectural question: which machine is the source of truth? The naive approach lets each client validate their own moves and sync state across the group. That falls apart fast. Two players click at the same time and you get conflicts. One client drops a packet and silently diverges from everyone else. Someone opens devtools and reads the entire game state including other players hidden dev cards.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The right model is server-authoritative state. The server holds one game state object per room. Players send action events. The server validates each one, mutates the state, and broadcasts the updated object to everyone in the room. Clients are purely a rendering layer that receives state and draws it. When I added dev cards three days into the project I did not touch a single React component. I just extended the action handler on the server. That kind of clean separation is worth every extra round trip.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">The board</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The board is 19 hexagonal tiles in five rows. The server generates it once when the game starts: shuffle resources, assign number tokens, place the robber on the desert. The client receives the finished board description and renders it as SVG. Nothing about the board ever changes except where the robber sits. Hover any tile below to see what it produces and how often that number comes up.
        </p>

        <HexBoard />

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Making the geometry work</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          What makes a hex board tricky in code is that adjacent tiles share geometry. A single corner vertex belongs to up to three tiles. If you model each tile independently with its own six corners you end up with duplicate vertex objects for the same physical point. Two tiles each have their own data for one intersection, and placing a settlement there only registers on one tile.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The fix is a global graph. I used axial coordinates to place tile centers, derived pixel positions from those, then computed the six corner positions for each tile. The key is rounding each pixel coordinate before using it as a map key. Neighboring tiles that share a vertex compute the same rounded pixel position and automatically reference the same entry in the vertices map. No deduplication logic, just consistent arithmetic. The result is 54 unique vertices and 72 unique edges shared correctly across all 19 tiles.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Numbers and probability</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Each tile has a number token showing which dice total produces resources from it. The numbers in red are 6 and 8, the most common rolls. A 7 triggers the robber and produces nothing. Most of the strategic depth in Catan comes from deciding where to place your initial settlements relative to these tokens. The dice roller below is fully functional. Roll a few times and watch where the results cluster.
        </p>

        <DiceRoller />

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Building rules</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Every placement goes through a validation function on the server. Settlements need a vertex that has no adjacent settlements (the distance rule), is connected by at least one of your roads except during initial setup, and is not already occupied. Roads need an edge touching at least one of your existing roads or settlements. Cities can only replace your own settlements. All of this runs in one function so there is a single place to read when debugging a rule.
        </p>

        <BuildCosts />

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Longest road is harder than it looks</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I expected Longest Road to be a straightforward graph search. It is not. Catan counts the longest continuous path through your road network, not total roads. Your network can have branches and loops. You can backtrack through junctions but you cannot pass through an opponent settlement that sits at a crossing.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The correct approach is DFS with backtracking. For each starting edge, extend along adjacent roads you have not visited yet in this particular path, stopping when an opponent settlement blocks the crossing. Track the maximum length found across all starting points and all starting edges. Run this for every player after any road placement or settlement that could disrupt a path.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The tie-breaking rule catches people off guard. Once you earn the Longest Road card you keep it until someone strictly exceeds your count. Tying it is not enough to take it away. The card stays with the current holder until someone definitively beats the number.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Hidden victory points</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Dev cards include VP cards that you hold in secret until you win. The server tracks two numbers per player. The real VP total includes everything, including hidden dev card VPs. The public total excludes them. When broadcasting state, each player receives their own true count but sees only the public total for opponents. Your display shows a small asterisk when your VP includes hidden points. The win condition check only runs server-side so no client can fake the win.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Sound without audio files</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          I wanted sound for key moments without dealing with audio licensing or CDN hosting. The Web Audio API lets you synthesize sound directly from oscillators and noise. The build sound is an oscillator sweeping from 400Hz to 800Hz over 100ms then decaying. The dice sound is filtered white noise that lasts about 200ms. The win sound is a short ascending chord. The app watches each incoming state broadcast and diffs it against the previous one to decide which sound to fire.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">Deployment</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          The project is a monorepo with a Node and Express server alongside a Vite React client. In development they run on separate ports with Vite proxying WebSocket connections. In production a single build command compiles the client to a dist folder and Express serves it as static files. One process, one Render service, a health endpoint at /health for the platform. All game state is in memory so a server restart drops active games, which is fine for a side project but would need Redis or a database for anything real.
        </p>

        <h2 className="text-base font-medium mt-8 mb-3 dark:text-white">What I would change</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          A few things still bother me. When a 7 rolls and multiple opponents are adjacent to the robber placement, the game uses <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">window.prompt</code> to pick who to steal from rather than a proper in-game modal. It works but it breaks the UI flow every time. Discarding resources on a 7 is also handled by randomly removing cards on the server instead of letting the player choose, which removes a real decision from the game. Reconnection does not exist, so a dropped connection leaves a ghost player in the room for the rest of the game. All three are solvable but I ran out of motivation once the core game was playable.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          Building a board game turned out to be a good exercise in software design specifically because the rules are finite and unambiguous. Any mismatch between spec and code shows up immediately when you play. You cannot hide a bug behind edge case input. If the Longest Road algorithm is wrong you feel it in the first game.
        </p>

      </div>
    </article>
  );
}
