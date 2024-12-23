// src/app/hobbies/games/page.tsx

import React from 'react';
import Profile from './Profile';
import RecentlyPlayedGames from './RecentlyPlayedGames';
import CSGOStatsComponent from './CSGOStats';
import Link from 'next/link';
import Image from 'next/image';

interface SteamProfile {
  personaname: string;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
}

interface CSGOStats {
  playerstats: {
    steamID: string;
    gameName: string;
    stats: Array<{
      name: string;
      value: number;
    }>;
    achievements: Array<{
      name: string;
      achieved: number;
    }>;
  };
}

interface SteamGame {
  appid: number;
  name: string;
  playtime_2weeks?: number;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url?: string;
}

interface OwnedGamesResponse {
  response: {
    game_count: number;
    games: SteamGame[];
  };
}

interface Achievement {
  tournament: string;
  year: string;
  result: string;
}
const achievements: Achievement[] = [
  {
    tournament: "Comic Con x The Arena",
    year: "2024",
    result: "3rd Place"
  },
  {
    tournament: "Trinity Gaming TAGVALO - Valorant",
    year: "2020",
    result: "1st Place"
  },
  {
    tournament: "ACT X CSGO 1v1 Tournament",
    year: "2020",
    result: "1st Place"
  },
  {
    tournament: "AMD Gameon x Playmax - Fortnite",
    year: "2019",
    result: "3rd Place"
  },
  {
    tournament: "AMD Gameon x Playmax - PUBG",
    year: "2019",
    result: "3rd Place"
  },
  {
    tournament: "AMD Gameon x Playmax",
    year: "2019",
    result: "2nd Place"
  },
  {
    tournament: "Comic-Con Hyderabad",
    year: "2018",
    result: "2nd Place"
  },
  {
    tournament: "Gamer's Connect Hyderabad",
    year: "2017",
    result: "3rd Place"
  },
  {
    tournament: "AMD Gameon Hyderabad",
    year: "2017",
    result: "3rd Place"
  }
];


const Games = async () => {
  const CSGO_USER_ID = '76561198239653194';
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    console.error('Steam API Key is not set in environment variables.');
    return (
      <div className="max-w-7xl">
        <p className="text-red-500">Steam API Key not configured.</p>
      </div>
    );
  }

  try {
    // Fetch Player Summaries
    const profileResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${CSGO_USER_ID}`
    );
    if (!profileResponse.ok) throw new Error('Failed to fetch player summaries.');
    const profileData = await profileResponse.json();
    const profile: SteamProfile = profileData.response.players[0];

    // Fetch all owned games
    const ownedGamesResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${CSGO_USER_ID}&include_appinfo=1&include_played_free_games=1`
    );
    if (!ownedGamesResponse.ok) throw new Error('Failed to fetch owned games.');
    const ownedGamesData: OwnedGamesResponse = await ownedGamesResponse.json();
    const ownedGames = ownedGamesData.response.games || [];

    // Sort games by recent playtime first, then total playtime
    const sortedGames = [...ownedGames].sort((a: SteamGame, b: SteamGame) => {
      if (a.playtime_2weeks && b.playtime_2weeks) {
        return b.playtime_2weeks - a.playtime_2weeks;
      }
      if (a.playtime_2weeks) return -1;
      if (b.playtime_2weeks) return 1;
      return b.playtime_forever - a.playtime_forever;
    });

    // Get recently played and all games
    const recentGames = sortedGames.filter((game: SteamGame) => 
      game.playtime_2weeks && game.playtime_2weeks > 0
    ).slice(0, 8);
    const allGames = sortedGames.slice(0, 12);

    // Fetch CS:GO Stats
    const statsResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${apiKey}&steamid=${CSGO_USER_ID}&appid=730`
    );
    if (!statsResponse.ok) throw new Error('Failed to fetch CS:GO stats.');
    const statsData: CSGOStats = await statsResponse.json();

    return (
      <div className="max-w-7xl">
        <h2 className="text-lg font-medium mb-6 dark:text-white">Gaming</h2>

        {/* Steam Profile */}
        <section className="mb-8">
          <Profile profile={profile} />
        </section>

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <section className="mb-8">
            <RecentlyPlayedGames games={recentGames} />
          </section>
        )}

        {/* All Games */}
        {allGames.length > 0 && (
          <section className="mb-8">
            <h3 className="text-base font-medium mb-6 dark:text-white">Top Games</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allGames.map((game) => (
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
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Playtime: {Math.floor(game.playtime_forever / 60)}h
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
          </section>
        )}

        {/* CS:GO Section */}
        <section className="mb-8">
          <h3 className="text-base font-medium mb-6 dark:text-white">CS Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats Box */}
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium dark:text-white mb-2">Statistics</h4>
                <CSGOStatsComponent stats={statsData} />
              </div>
            </div>

            {/* Customization Box */}
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
              <h4 className="text-lg font-medium dark:text-white mb-4">Customization</h4>
              <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>Improved Radio Mod</li>
                <li>Vibrance GUI</li>
                <li>Text Color Mod</li>
                <li>Simple Radar</li>
                <li>Custom Font - superstar_memesbruh03</li>
              </ul>
              <div className="mt-6">
                <Link
                  href="https://settings.gg/player/279387466"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-sm"
                >
                  View Config
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tournament Achievements Section */}
        <section className="mb-8">
          <h3 className="text-base font-medium mb-4 dark:text-white">Tournament Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4">
                <span className="text-sm font-medium dark:text-white block">{achievement.tournament}</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 block mt-1">{achievement.year}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-500 block mt-1">{achievement.result}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  } catch (error: unknown) {
    console.error('Error fetching data:', error);
    return (
      <div className="max-w-7xl">
        <p className="text-red-500">Failed to fetch data.</p>
      </div>
    );
  }
};

export default Games;