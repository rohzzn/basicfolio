// src/app/hobbies/games/RecentlyPlayedGames.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RecentlyPlayedGame {
  appid: number;
  name: string;
  playtime_2weeks: number; // in minutes
  playtime_forever: number; // in minutes
  img_icon_url: string;
  img_logo_url: string;
}

interface RecentlyPlayedGamesProps {
  games: RecentlyPlayedGame[];
}

const RecentlyPlayedGames: React.FC<RecentlyPlayedGamesProps> = ({ games }) => {
  if (!games || games.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">No recently played games.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 dark:text-white">Recently Played Games</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {games.map((game) => (
          <div key={game.appid} className="bg-paper dark:bg-zinc-800 p-4 rounded-lg shadow-md flex flex-col items-center">
            <Image
              src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
              alt={`${game.name} Icon`}
              width={32}
              height={32}
              className="rounded"
            />
            <Link href={`https://store.steampowered.com/app/${game.appid}`} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-600 dark:text-blue-400 hover:underline">
              {game.name}
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Playtime: {Math.floor(game.playtime_forever / 60)} hrs {game.playtime_forever % 60} mins
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyPlayedGames;
