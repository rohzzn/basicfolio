import React from "react";
import LinkGroup from "@/components/LinkGroup";

const linkGroups = [
  {
    title: "Socials",
    links: [
      { title: "Twitter", description: "Tweets", url: "https://twitter.com/rohzzn" },
      { title: "Instagram", description: "Touching grass", url: "https://instagram.com/rohzzn" },
      { title: "Discord", description: "Second home", url: "https://discord.gg/86H5fscts9" },
      { title: "LinkedIn", description: "Hire me!", url: "https://linkedin.com/in/rohzzn" },
      { title: "Spotify", description: "Playlists", url: "https://open.spotify.com/user/rohansanjeev" },
      { title: "YouTube", description: "Content", url: "https://youtube.com/rohzzn" },
      { title: "Reddit", description: "Posts & comments", url: "https://www.reddit.com/user/rohzzn/" },
    ],
  },
  {
    title: "Development",
    links: [
      { title: "GitHub", description: "Commits", url: "https://github.com/rohzzn" },
      { title: "Kaggle", description: "Notebooks", url: "https://kaggle.com/rohzzn" },
      { title: "CodeChef", description: "3 Stars", url: "https://codechef.com/users/rohzzzn" },
      { title: "Codeforces", description: "Nightmares", url: "https://codeforces.com/profile/rohzzn" },
      { title: "LeetCode", description: "Never gonna be a knight", url: "https://leetcode.com/rohzzn" },
    ],
  },
  {
    title: "Creative",
    links: [
      { title: "Dribbble", description: "Illustrations & more", url: "https://dribbble.com/rohzzn" },
      { title: "Figma", description: "Basically a Jamboard", url: "https://figma.com/@rohzzn" },
      { title: "Behance", description: "Branding & more", url: "https://behance.net/rohzzn" },
    ],
  },
  {
    title: "Gaming",
    links: [
      { title: "Steam", description: "Level 100", url: "https://steamcommunity.com/id/rohzzn" },
      { title: "CS Settings", description: "CS config", url: "https://settings.gg/rohzzn" },
      { title: "FACEIT", description: "Peak Level 8", url: "https://www.faceit.com/en/players/Calatop" },
      { title: "Leetify", description: "CS2 performance analytics", url: "https://leetify.com/@rohzzn" },
      { title: "CSWatch", description: "CS2 match history", url: "https://cswatch.in/player/76561198239653194" },
      { title: "Epic Games", description: "Library", url: "https://store.epicgames.com/u/1bd07ece9fd14b2da2c64b2c31f6f96a" },
    ],
  },
  {
    title: "Other",
    links: [
      { title: "Peerlist", description: "Linked but better", url: "https://peerlist.io/rohzzn" },
      { title: "DevPost", description: "Hackathons", url: "https://devpost.com/rohzzn" },
      { title: "Devfolio", description: "More Hackathons", url: "https://devfolio.co/@rohzzn" },
      { title: "Monkeytype", description: "Typing Speed", url: "https://monkeytype.com/profile/Rohzzn" },
      { title: "Twitch", description: "Stream", url: "https://twitch.tv/rohzzn" },
      { title: "Buy me a coffee", description: "Support", url: "https://buymeacoffee.com/rohzzn" },
      { title: "Product Hunt", description: "Hunts", url: "https://www.producthunt.com/@rohzzn" },
      { title: "Gumroad", description: "Products", url: "https://gumroad.com/rohzzn" },
    ],
  },
];

export default function LinksPage() {
  return (
    <div className="w-full min-w-0 max-w-6xl">
      <header className="mb-8">
        <h2 className="text-lg font-medium dark:text-white">On the Internet</h2>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {linkGroups.map((group) => (
          <LinkGroup key={group.title} title={group.title} links={group.links} />
        ))}
      </div>
    </div>
  );
}
