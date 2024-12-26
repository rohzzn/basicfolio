import React from 'react';
import LinkGroup from '@/components/LinkGroup';

const LinksPage = () => {
  const linkGroups = {
    socials: {
      title: "Socials",
      links: [
        { title: "Twitter", description: "Tweets", url: "https://twitter.com/rohzzn" },
        { title: "Instagram", description: "Touching grass", url: "https://instagram.com/rohzzn" },
        { title: "Discord", description: "Second home", url: "https://discord.gg/your-server" },
        { title: "LinkedIn", description: "Hire me!", url: "https://linkedin.com/in/rohzzn" },
        { title: "Spotify", description: "Playlists", url: "https://open.spotify.com/user/your-profile" },
        { title: "MyAnimeList", description: "Weeb list", url: "https://myanimelist.net/your-profile" },
        { title: "Apple Podcasts", description: "Unheard Perspective", url: "https://podcasts.apple.com/your-podcast" }
      ]
    },
    coding: {
      title: "Development",
      links: [
        { title: "GitHub", description: "Commits", url: "https://github.com/rohzzn" },
        { title: "Kaggle", description: "Notebooks", url: "https://kaggle.com/your-profile" },
        { title: "CodeChef", description: "Bad cook", url: "https://codechef.com/users/your-profile" },
        { title: "Codeforces", description: "Nightmares", url: "https://codeforces.com/profile/your-profile" },
        { title: "LeetCode", description: "Never gonna be a knight", url: "https://leetcode.com/your-profile" }
      ]
    },
    design: {
      title: "Creative",
      links: [
        { title: "Dribbble", description: "Illustrations & more", url: "https://dribbble.com/rohzzn" },
        { title: "Figma", description: "Basically a Jamboard", url: "https://figma.com/@your-profile" },
        { title: "Behance", description: "Branding & more", url: "https://behance.net/your-profile" }
      ]
    },
    gaming: {
      title: "Gaming",
      links: [
        { title: "Steam", description: "Level 100 degen", url: "https://steamcommunity.com/id/your-profile" },
        { title: "CS Settings", description: "CS config", url: "https://settings.gg/player/your-id" },
        { title: "Game Stats", description: "Happy Hours", url: "https://your-stats-page" },
        { title: "FACEIT", description: "Peak Level 8", url: "https://faceit.com/en/players/your-profile" }
      ]
    }
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