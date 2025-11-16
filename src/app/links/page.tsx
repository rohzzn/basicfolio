import React from 'react';
import LinkGroup from '@/components/LinkGroup';

const LinksPage = () => {
  const linkGroups = {
    socials: {
      title: "Socials",
      links: [
        { title: "Twitter", description: "Tweets", url: "https://twitter.com/rohzzn" },
        { title: "Instagram", description: "Touching grass", url: "https://instagram.com/rohzzn" },
        { title: "Discord", description: "Second home", url: "https://discord.gg/86H5fscts9" },
        { title: "LinkedIn", description: "Hire me!", url: "https://linkedin.com/in/rohzzn" },
        { title: "Spotify", description: "Playlists", url: "https://open.spotify.com/user/rohansanjeev" },
        { title: "YouTube", description: "Content", url: "https://youtube.com/rohzzn" },
        { title: "Reddit", description: "Posts & comments", url: "https://www.reddit.com/user/rohzzn/" },
      ]
    },
    coding: {
      title: "Development",
      links: [
        { title: "GitHub", description: "Commits", url: "https://github.com/rohzzn" },
        { title: "Kaggle", description: "Notebooks", url: "https://kaggle.com/rohzzn" },
        { title: "CodeChef", description: "3 Stars", url: "https://codechef.com/users/rohzzzn" },
        { title: "Codeforces", description: "Nightmares", url: "https://codeforces.com/profile/rohzzn" },
        { title: "LeetCode", description: "Never gonna be a knight", url: "https://leetcode.com/rohzzn" },
      ]
    },
  
    design: {
      title: "Creative",
      links: [
        { title: "Dribbble", description: "Illustrations & more", url: "https://dribbble.com/rohzzn" },
        { title: "Figma", description: "Basically a Jamboard", url: "https://figma.com/@rohzzn" },
        { title: "Behance", description: "Branding & more", url: "https://behance.net/rohzzn" }
      ]
    },
    gaming: {
      title: "Gaming",
      links: [
        { title: "Steam", description: "Level 100", url: "https://steamcommunity.com/id/rohzzn" },
        { title: "CS Settings", description: "CS config", url: "https://settings.gg/rohzzn" },
        { title: "FACEIT", description: "Peak Level 8", url: "https://www.faceit.com/en/players/Calatop" },
        { title: "Valorant Stats", description: "Competitive tracker", url: "https://tracker.gg/valorant/profile/riot/rohan%23main/performance?platform=pc&playlist=competitive&season=aef237a0-494d-3a14-a1c8-ec8de84e309c" },
        { title: "Valorant Stats Alt", description: "Alt account stats", url: "https://tracker.gg/valorant/profile/riot/rohan%2331337/overview?platform=pc&playlist=competitive&season=5adc33fa-4f30-2899-f131-6fba64c5dd3a" },
        { title: "Leetify", description: "CS2 performance analytics", url: "https://leetify.com/@rohzzn" },
        { title: "CSWatch", description: "CS2 match history", url: "https://cswatch.in/player/76561198239653194" },
        { title: "Epic Games", description: "Library", url: "https://store.epicgames.com/u/1bd07ece9fd14b2da2c64b2c31f6f96a" }
      ]
    },
    other: {
      title: "Other",
      links: [
        { title: "Peerlist", description: "Linked but better", url: "https://peerlist.io/rohzzn" },
        { title: "Polywork", description: "Professional life", url: "https://polywork.com/rohzzn" },
        { title: "Buy me a coffee", description: "Support", url: "https://buymeacoffee.com/rohzzn" },
        { title: "Twitch", description: "Stream", url: "https://twitch.tv/rohzzn" },
        { title: "Product Hunt", description: "Hunts", url: "https://www.producthunt.com/@rohzzn" },
        { title: "Gumroad", description: "Products", url: "https://gumroad.com/rohzzn" },
        { title: "DevPost", description: "Hackathons", url: "https://devpost.com/rohzzn" },
        { title: "Devfolio", description: "More Hackathons", url: "https://devfolio.co/@rohzzn" },
        { title: "Monkeytype", description: "Typing Speed", url: "https://monkeytype.com/profile/Rohzzn" },
      ]
    },
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-8 dark:text-white">On the Internet</h2>
      
      {/* Link Groups */}
      <div className="md:columns-2 md:gap-16 space-y-12">
        {Object.values(linkGroups).map((group, index) => (
          <div key={index} className="break-inside-avoid mb-12">
            <LinkGroup title={group.title} links={group.links} />
            
            {/* Divider between categories */}
            {index !== Object.values(linkGroups).length - 1 && (
              <div className="w-full h-px bg-zinc-200/50 dark:bg-zinc-800/50 mt-8"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinksPage;