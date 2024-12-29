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
        { title: "CS Settings", description: "CS config", url: "https://settings.gg/player/rohzzn" },
        { title: "FACEIT", description: "Peak Level 8", url: "https://www.faceit.com/en/players/Calatop" }
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
        
      ]
    },
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-8 dark:text-white">On the Internet</h2>
      
      {/* Link Groups */}
      <div className="space-y-4">
        {Object.values(linkGroups).map((group, index) => (
          <LinkGroup key={index} title={group.title} links={group.links} />
        ))}
      </div>
    </div>
  );
};

export default LinksPage;