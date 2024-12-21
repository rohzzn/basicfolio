// src/app/hobbies/games/page.tsx

import React from 'react';
import Profile from './Profile';
import RecentlyPlayedGames from './RecentlyPlayedGames';
import CSGOStatsComponent from './CSGOStats';
import Image from 'next/image';

interface SteamProfile {
  personaname: string;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
  // Add other fields as needed
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

interface RecentlyPlayedGame {
  appid: number;
  name: string;
  playtime_2weeks: number; // in minutes
  playtime_forever: number; // in minutes
  img_icon_url: string;
  img_logo_url: string;
}

interface RecentlyPlayedGamesResponse {
  response: {
    total_count: number;
    games: RecentlyPlayedGame[];
  };
}

const Games: React.FC = async () => {
  const CSGO_USER_ID = '76561198239653194'; // Updated Steam User ID

  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    console.error('Steam API Key is not set in environment variables.');
    // Render an error message if API Key is missing
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-red-500">Internal Server Error: Steam API Key not configured.</p>
      </div>
    );
  }

  try {
    // Fetch Player Summaries
    const profileResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${CSGO_USER_ID}`
    );
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch player summaries.');
    }
    const profileData = await profileResponse.json();
    const profile: SteamProfile = profileData.response.players[0];

    // Fetch Recently Played Games
    const recentGamesResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${apiKey}&steamid=${CSGO_USER_ID}&count=10`
    );
    if (!recentGamesResponse.ok) {
      throw new Error('Failed to fetch recently played games.');
    }
    const recentGamesData: RecentlyPlayedGamesResponse = await recentGamesResponse.json();
    const recentGames = recentGamesData.response.games;

    // Fetch CS:GO Player Stats
    const statsResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${apiKey}&steamid=${CSGO_USER_ID}&appid=730`
    );
    if (!statsResponse.ok) {
      throw new Error('Failed to fetch CS:GO stats.');
    }
    const statsData: CSGOStats = await statsResponse.json();

    return (
      <div className="max-w-7xl mx-auto p-6 space-y-12 relative">
        {/* Corner Image */}
        <Image
          src="https://steamuserimages-a.akamaihd.net/ugc/1761441441770633915/D5C9445C04723815B909A2A8A36FC8B250F99559/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false"
          alt="Corner Decoration"
          width={200}
          height={200}
          className="absolute top-4 right-4 opacity-50"
        />

        {/* Peripherals Section */}
        <section className="bg-paper dark:bg-zinc-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Peripherals</h2>
          <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
            <li><strong>Monitor:</strong> Benq 165Hz</li>
            <li><strong>Mouse:</strong> Razer DeathAdder V2, Glorious Model O Mini</li>
            <li><strong>Keyboard:</strong> GK61 Gateron, Keychron K8 Brown Switches</li>
            <li><strong>Headset:</strong> Razer Kraken, Apple Earphones</li>
            <li><strong>Microphone:</strong> Blue Snowball</li>
          </ul>
        </section>

        {/* Introduction Section */}
        <section>

          {/* Profile Information */}
          <Profile profile={profile} />

          {/* Recently Played Games */}
          <div className="mt-6">
            <RecentlyPlayedGames games={recentGames} />
          </div>
        </section>

        {/* CS:GO Profile Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">CS Statistics</h2>

          {/* CS:GO Stats */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Statistics</h3>
            <CSGOStatsComponent stats={statsData} />
          </div>

          {/* Tweaks Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Tweaks</h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>Improved Radio Mod</li>
              <li>Vibrance GUI</li>
              <li>Text Color Mod</li>
              <li>Simple Radar</li>
              <li>Custom Font - <em>superstar_memesbruh03</em></li>
            </ul>
          </div>

          {/* Config URL */}
          <div>
            <a
              href="https://settings.gg/player/279387466"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              View Config
            </a>
          </div>
        </section>
      </div>
    );
  } catch (error: unknown) {
    // Properly handle errors without using 'any'
    if (error instanceof Error) {
      console.error('Error fetching data:', error.message);
    } else {
      console.error('Error fetching data:', error);
    }
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-red-500">Failed to fetch data.</p>
      </div>
    );
  }
};

export default Games;
