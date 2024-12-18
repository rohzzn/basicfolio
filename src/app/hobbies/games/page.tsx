// src/app/hobbies/games/page.tsx

"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface MediaItem {
  type: 'video' | 'image';
  src: string; // For videos, this is the YouTube video ID; for images, the image path
  alt?: string; // Optional alt text for images
}

interface LinkItem {
  name: string;
  url: string;
}

interface Game {
  name: string;
  hoursPlayed: number;
  inGameName: string;
  links: LinkItem[]; // Array of links
  mediaPreviews: MediaItem[]; // Array of media items (videos or images)
}

const games: Game[] = [
  {
    name: 'Counter-Strike',
    hoursPlayed: 3300,
    inGameName: 'Calatop',
    links: [
      { name: 'Official Site', url: 'https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/' },
      { name: 'Steam Profile', url: 'https://steamcommunity.com/id/rohzzn' },
      { name: 'Config', url: 'https://settings.gg/rohzzn' },
    ],
    mediaPreviews: [
      { type: 'image', src: '/images/csgo.jpeg', alt: 'CS:GO' },
      { type: 'video', src: 'fNOp9Z3TC0I' }, // YouTube Video ID
      { type: 'video', src: 'iARXu2OYD5U' },
    ],
  },
  {
    name: 'Valorant',
    hoursPlayed: 1230,
    inGameName: 'Rohan#main / Rohan#31337',
    links: [
      { name: 'Official Site', url: 'https://playvalorant.com/' },
      { name: 'Profile', url: 'https://tracker.gg/valorant/profile/riot/Sirius%23main/overview' },
      { name: 'Alt Profile', url: 'https://tracker.gg/valorant/profile/riot/Rohan%2331337/overview' },
    ],
    mediaPreviews: [
      { type: 'video', src: '55GX_QSKgsU' },
      { type: 'video', src: 'BsxFgF_HtE8' },
      { type: 'video', src: 'Zwbq1LYIxDM' },
    ],
  },
  
  // Add more games as needed
];

const Games: React.FC = () => (
  <div className="max-w-7xl mx-auto p-6">
    <h2 className="text-2xl font-bold mb-6 dark:text-white">Games</h2>
    <div className="space-y-8">
      {games.map((game, index) => (
        <div key={index} className="bg-paper dark:bg-zinc-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold dark:text-white">{game.name}</h3>
            <div className="space-x-4">
              {game.links.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            <strong>ID:</strong> {game.inGameName}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            <strong>Hours Played:</strong> {game.hoursPlayed}
          </p>
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2 dark:text-white">Highlights</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {game.mediaPreviews.map((media, mediaIndex) => (
                <div key={mediaIndex} className="rounded-lg overflow-hidden shadow">
                  {media.type === 'video' ? (
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${media.src}`}
                      title={`${game.name} Gameplay ${mediaIndex + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  ) : (
                    <Image
                      src={media.src}
                      alt={media.alt || `${game.name} Image ${mediaIndex + 1}`}
                      width={800}
                      height={450}
                      className="object-cover w-full h-48 rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Games;
