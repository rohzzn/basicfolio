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
    const profileResponse = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${CSGO_USER_ID}`);
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch player summaries.');
    }
    const profileData = await profileResponse.json();
    const profile: SteamProfile = profileData.response.players[0];

    // Fetch Recently Played Games
    const recentGamesResponse = await fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${apiKey}&steamid=${CSGO_USER_ID}&count=10`);
    if (!recentGamesResponse.ok) {
      throw new Error('Failed to fetch recently played games.');
    }
    const recentGamesData: RecentlyPlayedGamesResponse = await recentGamesResponse.json();
    const recentGames = recentGamesData.response.games;

    // Fetch CS:GO Player Stats
    const statsResponse = await fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${apiKey}&steamid=${CSGO_USER_ID}&appid=730`);
    if (!statsResponse.ok) {
      throw new Error('Failed to fetch CS:GO stats.');
    }
    const statsData: CSGOStats = await statsResponse.json();



    return (
      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Introduction Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Steam Details</h2>
          
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

            <CSGOStatsComponent stats={statsData} />
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
