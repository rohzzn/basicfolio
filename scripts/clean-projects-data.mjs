import fs from "fs";

const path = "src/data/projects.ts";
let src = fs.readFileSync(path, "utf8");

src = src.replace("  highlights?: string[];\n", "");
src = src.replace(/\n    highlights: \[\n(?:      [^\n]+\n)*    \],/g, "");

function deDash(text) {
  return text
    .replace(/ — /g, ". ")
    .replace(/—/g, ", ")
    .replace(/ – /g, ", ")
    .replace(/–/g, ", ")
    .replace(/;\s+/g, ". ")
    .replace(/\s+\./g, ".")
    .replace(/\.\.+/g, ".")
    .replace(/,\s*\./g, ".")
    .replace(/,\s*,/g, ",")
    .trim();
}

src = src.replace(/longDescription: "([^"]*)"/g, (_, body) => {
  return `longDescription: "${deDash(body)}"`;
});

const enrichments = {
  relay:
    "I built Relay because I was running Uptime Kuma for alerts and still needed something else for a public status page. Two tools, two configs, nothing talking to each other. Relay is both: it checks your services on a schedule, opens incidents when things break, and serves a shareable status page your users can subscribe to. It is a single Go binary with SQLite, templates embedded in the binary, and a Docker image under 20 MB. No Node runtime, no Postgres. It supports HTTP, TCP, TLS, DNS, and heartbeat monitors, with Slack, webhook, and SMTP alerts and cooldown-aware dispatch.",
  keel:
    "I built Keel because I kept forgetting about subscriptions until they showed up on my bank statement. It is a React Native app, my first real mobile ship to the App Store. The first submission to App Review got rejected over a UI detail that took three hours to track down. The second went through. Getting an app past App Review felt genuinely different from shipping a website: the process, the constraints, the platform. React Native let me move fast on the UI, but in-app purchases and App Store plumbing still took time to get right. It tracks recurring subscriptions with monthly and annual summaries and sends reminders before renewal dates.",
  "dock-poker":
    "Built for private games with friends. Full Texas Hold'em rules, private rooms with join codes, real-time game state synchronized via Socket.IO. The hand evaluation logic took longer than I expected. The number of edge cases in poker hand ranking is surprisingly large. It handles disconnect and reconnect mid-game. This project taught me more about managing distributed real-time state than anything else I have built.",
  "catan-online":
    "Building a complete board game from scratch forces you to think about state in a way that CRUD apps never do. The hex grid geometry was the first challenge. Pointy-top hexagons have specific offset math that is easy to get slightly wrong. Keeping game state server-authoritative so players cannot cheat required careful thought about what information each client should receive and when. The game implements full Catan rules: resource production, trading, building, and the robber. The Web Audio dice sounds were a last-minute addition that made the whole thing feel more alive.",
  "greed-island-dex":
    "A complete card catalog for the Greed Island arc from Hunter x Hunter. Every named card with its effects, rarity, and lore. You can search and filter by card type and rarity. I wanted the visual design to match the source material rather than being a generic list view. The card layout tries to evoke the actual card game aesthetic from the arc.",
  wordle:
    "Built in a weekend to understand how Wordle worked under the hood. Core mechanic: five letter words, six guesses, color-coded feedback on each guess. No statistics page, no streak tracking, just the game. The letter-frequency scoring for the word list took some thought to get the difficulty curve right.",
  margin:
    "Most EPUB readers are either feature-heavy or ugly. I built Margin to be the reader I actually wanted: minimal interface, clean typography, nothing competing with the text. Drop an EPUB file in and start reading. The rendering pipeline handles the EPUB zip format, parses the OPF manifest, and renders chapters through a consistent typographic system. It also tracks bookmarks and reading progress.",
  meet:
    "Video calling with screen sharing, built when I wanted to understand how WebRTC actually worked in practice. Supports group video calls, screen sharing, and real-time chat alongside the video. Authentication via Google, Slack, or Microsoft. Won first place at Vishesh MREC hackathon.",
  "zenitsu-bot":
    "A Discord bot for server moderation and games, named after the character from Demon Slayer. Running in multiple servers with two hundred users. Full moderation toolkit plus an economy system with daily rewards, a shop, and trivia and dice mini-games. Discord.js made the API surface manageable but slash command migration required a significant rewrite.",
  tanoshi:
    "An eye-friendly VS Code color theme designed for long coding sessions. The palette is desaturated enough to reduce strain but not so muted that it loses the utility of syntax highlighting. Every color decision was made for a specific reason: keyword colors, string colors, comment opacity. Seventeen hundred installs and fourteen GitHub stars. It stays consistent across twenty plus languages and ships in dark and light modes.",
  "portfolio-v5":
    "The current portfolio, what you are looking at right now. Server-rendered with Next.js, styled with Tailwind, written in TypeScript. Thirteen external API integrations for the hobbies section. The writing section has interactive components co-located with each article. Minimal and dark-mode-first.",
};

for (const [slug, text] of Object.entries(enrichments)) {
  const re = new RegExp(`(slug: '${slug}',[\\s\\S]*?longDescription: ")([^"]*)(",)`);
  src = src.replace(re, `$1${text}$3`);
}

src = src.replace(
  /(slug: 'keel',[\s\S]*?description: "[^"]+",\n    )tech: \[[^\]]+\]/,
  "$1tech: ['React Native']",
);

src = src.replace(
  /description: "Subscription tracking app for iOS"/,
  'description: "Subscription tracking app"',
);

fs.writeFileSync(path, src);
console.log("cleaned projects.ts");
