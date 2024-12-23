// src/app/hobbies/games/RecentlyPlayedGames.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RecentlyPlayedGame {
  appid: number;
  name: string;
  playtime_2weeks?: number;
  playtime_forever: number;
  img_icon_url: string;
}

interface RecentlyPlayedGamesProps {
  games: RecentlyPlayedGame[];
}

const RecentlyPlayedGames: React.FC<RecentlyPlayedGamesProps> = ({ games }) => {
  if (!games || games.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">No recently played games.</p>;
  }

  const formatPlaytime = (minutes?: number) => {
    if (!minutes) return "0 hrs";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div>
      <h3 className="text-base font-medium mb-6 dark:text-white">Recent Games</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {games.map((game) => (
          <div 
            key={game.appid} 
            className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <Image
                src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                alt={`${game.name} Icon`}
                width={32}
                height={32}
                className="rounded"
              />
              <h4 className="text-sm font-medium dark:text-white line-clamp-1">
                {game.name}
              </h4>
            </div>

            <div className="mt-auto space-y-1">
              {game.playtime_2weeks && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Recent: {formatPlaytime(game.playtime_2weeks)}
                </p>
              )}
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Total: {formatPlaytime(game.playtime_forever)}
              </p>
              <Link 
                href={`https://store.steampowered.com/app/${game.appid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
              >
                View on Steam →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyPlayedGames;