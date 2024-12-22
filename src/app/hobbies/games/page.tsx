// src/app/hobbies/games/page.tsx

import React from 'react';
import Profile from './Profile';
import RecentlyPlayedGames from './RecentlyPlayedGames';
import CSGOStatsComponent from './CSGOStats';

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
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Page Title */}
        <h2 className="text-lg font-medium mb-6 dark:text-white">Gaming</h2>

        {/* Steam Profile Section */}
        <section>
          <Profile profile={profile} />
        </section>

        {/* Recently Played Games Section */}
        <section>
          <RecentlyPlayedGames games={recentGames} />
        </section>

        {/* CS:GO Statistics Section */}
        <section>
          <h3 className="text-2xl font-bold mb-6 dark:text-white">CS Statistics</h3>

          {/* CS:GO Stats and Tweaks in a Flex Container */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* CS:GO Stats Box */}
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-4 dark:text-white">Statistics</h4>
              <CSGOStatsComponent stats={statsData} />
            </div>

            {/* Tweaks Box */}
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-4 dark:text-white">Tweaks</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>Improved Radio Mod</li>
                <li>Vibrance GUI</li>
                <li>Text Color Mod</li>
                <li>Simple Radar</li>
                <li>Custom Font - <em>superstar_memesbruh03</em></li>
              </ul>
            </div>
          </div>

          {/* Config URL */}
          <div className="mt-6">
            <a
              href="https://settings.gg/player/279387466"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
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
