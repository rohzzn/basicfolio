// src/app/hobbies/games/page.tsx

import React from 'react';
import Profile from './Profile';
import RecentlyPlayedGames from './RecentlyPlayedGames';
import SteamFriends from './SteamFriends';
import Link from 'next/link';
import Image from 'next/image';
import { cache } from 'react';
import { Settings } from 'lucide-react';

interface SteamProfile {
  personaname: string;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
  communityvisibilitystate?: number;
  profilestate?: number;
  lastlogoff?: number;
  commentpermission?: number;
  personastate?: number;
  personastateflags?: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
}

interface SteamFriend {
  steamid: string;
  relationship: string;
  friend_since: number;
  personaname?: string;
  avatar?: string;
  avatarmedium?: string;
  avatarfull?: string;
  personastate?: number;
  gameextrainfo?: string;
}



interface SteamGame {
  appid: number;
  name: string;
  playtime_2weeks?: number;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url?: string;
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

// Empty fallback data (no hardcoded values)
const emptyProfile: SteamProfile = {
  personaname: "",
  steamid: "",
  avatar: "",
  avatarmedium: "",
  avatarfull: "",
  profileurl: ""
};

const emptyGames: SteamGame[] = [];
const emptyFriends: SteamFriend[] = [];

// Use React's cache function to prevent duplicate fetches
const fetchWithCache = cache(async (url: string) => {
  console.log(`Fetching from: ${url}`);
  
  // Simple retry logic with backoff
  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 1000;
  
  let lastError;
  let delay = INITIAL_DELAY;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, { 
        cache: 'no-store' // Don't cache, always fetch fresh data
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      lastError = new Error(`HTTP error ${response.status}`);
      
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      throw lastError;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  
  throw lastError;
});

const Games = async () => {
  const STEAM_ID = '76561198239653194';
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    console.error('Steam API Key is not set in environment variables.');
    return (
      <div className="max-w-7xl">
        <p className="text-red-500">Steam API Key not configured.</p>
      </div>
    );
  }

  // Initialize with empty data
  let profile: SteamProfile = emptyProfile;
  let ownedGames: SteamGame[] = emptyGames;
  let friends: SteamFriend[] = emptyFriends;
  
  let profileError = false;
  let ownedGamesError = false;
  let friendsError = false;

  // Fetch Player Summaries
  try {
    const profileData = await fetchWithCache(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${STEAM_ID}`
    );
    if (profileData.response && profileData.response.players && profileData.response.players.length > 0) {
      profile = profileData.response.players[0];
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    profileError = true;
  }

  // Fetch all owned games
  try {
    const ownedGamesData = await fetchWithCache(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${STEAM_ID}&include_appinfo=1&include_played_free_games=1`
    );
    if (ownedGamesData.response && ownedGamesData.response.games) {
      ownedGames = ownedGamesData.response.games;
    }
  } catch (error) {
    console.error('Error fetching owned games:', error);
    ownedGamesError = true;
  }
  

  
  // Fetch friends list
  try {
    console.log('Fetching friends list...');
    // First get the friend list
    const friendsData = await fetchWithCache(
      `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${apiKey}&steamid=${STEAM_ID}&relationship=friend`
    );
    
    if (friendsData.friendslist && friendsData.friendslist.friends) {
      const friendsList = friendsData.friendslist.friends;
      console.log('Total friends in list:', friendsList.length);
      
      // The Steam API has a limit of 100 profiles per call, so we need to batch them
      const allFriendProfiles: SteamProfile[] = [];
      const BATCH_SIZE = 100;
      
      // Split the friend IDs into batches of 100
      for (let i = 0; i < friendsList.length; i += BATCH_SIZE) {
        const batchIds = friendsList
          .slice(i, i + BATCH_SIZE)
          .map((friend: SteamFriend) => friend.steamid)
          .join(',');
        
        console.log(`Fetching batch ${i / BATCH_SIZE + 1} of friends (${i} to ${Math.min(i + BATCH_SIZE, friendsList.length)})`);
        
        // Fetch profiles for this batch of friends
        const batchProfiles = await fetchWithCache(
          `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${batchIds}`
        );
        
        if (batchProfiles.response && batchProfiles.response.players) {
          allFriendProfiles.push(...batchProfiles.response.players);
        }
      }
      
      console.log('Total profiles fetched:', allFriendProfiles.length);
      
      // Combine friend data with profile data
      friends = friendsList.map((friend: SteamFriend) => {
        const profile = allFriendProfiles.find(
          (p: SteamProfile) => p.steamid === friend.steamid
        );
        return { ...friend, ...profile };
      });
      
      // Sort by playing status first, then online status, then by name
      friends.sort((a, b) => {
        // Playing friends first
        if (a.gameextrainfo && !b.gameextrainfo) return -1;
        if (!a.gameextrainfo && b.gameextrainfo) return 1;
        
        // Then online friends
        if ((a.personastate || 0) > 0 && (b.personastate || 0) === 0) return -1;
        if ((a.personastate || 0) === 0 && (b.personastate || 0) > 0) return 1;
        
        // Then by name
        return (a.personaname || '').localeCompare(b.personaname || '');
      });
      
      // Keep all friends, don't filter out offline ones
      // This will allow showing all friends, including those who are offline
      
      const playingFriends = friends.filter(f => f.gameextrainfo);
      console.log('Final filtered friends count:', friends.length);
      console.log('Friends playing games:', playingFriends.length);
      console.log('Games being played:', playingFriends.map(f => f.gameextrainfo).join(', '));
    }
  } catch (error) {
    console.error('Error fetching friends:', error);
    friendsError = true;
  }

  // Sort games by recent playtime for recent games section
  const recentlySortedGames = [...ownedGames].sort((a: SteamGame, b: SteamGame) => {
    if (a.playtime_2weeks && b.playtime_2weeks) {
      return b.playtime_2weeks - a.playtime_2weeks;
    }
    if (a.playtime_2weeks) return -1;
    if (b.playtime_2weeks) return 1;
    return b.playtime_forever - a.playtime_forever;
  });

  // Sort games by total playtime for top games section
  const totalPlaytimeSortedGames = [...ownedGames].sort((a: SteamGame, b: SteamGame) => {
    return b.playtime_forever - a.playtime_forever;
  });

  // Get recently played and top games
  const recentGames = recentlySortedGames.filter((game: SteamGame) => 
    game.playtime_2weeks && game.playtime_2weeks > 0
  ).slice(0, 8);
  const allGames = totalPlaytimeSortedGames.slice(0, 12);

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Gaming</h2>

      {/* Steam Profile */}
      <section className="mb-8">
        {profileError ? (
          <div className="bg-yellow-50 dark:bg-zinc-800 p-4 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-400">Could not load Steam profile.</p>
          </div>
        ) : null}
        <Profile profile={profile} />
      </section>

      {/* Config Download Card */}
      <section className="mb-8">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium dark:text-white">Game Configurations</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Download my CS:GO and Valorant settings</p>
            </div>
          </div>
          <Link
            href="https://settings.gg/rohzzn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-800 dark:text-zinc-200"
          >
            Download
          </Link>
        </div>
      </section>



      {/* Gaming Content Layout - 3 columns on large screens */}
      <section className="mb-8">
        {ownedGamesError && (
          <div className="bg-yellow-50 dark:bg-zinc-800 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 dark:text-yellow-400">Could not load game data.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Takes 3/4 of the space on large screens */}
          <div className="lg:col-span-3 space-y-8">
            {/* Recent Games */}
            {recentGames.length > 0 && (
              <div>
                <RecentlyPlayedGames games={recentGames} />
              </div>
            )}
            
            {/* Top Games */}
            <div>
              <h3 className="text-base font-medium mb-6 dark:text-white">Top Games</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allGames.map((game) => (
                  <div 
                    key={game.appid} 
                    className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center overflow-hidden">
                        {game.img_icon_url ? (
                          <Image
                            src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                            alt={`${game.name} Icon`}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        ) : (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">No IMG</span>
                        )}
                      </div>
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
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs flex items-center"
                      >
                        View in Steam Store
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Friends Column - Always displayed beside games with fixed height */}
          {!friendsError && (
            <div className="lg:col-span-1 flex flex-col">
              <div className="mb-2 flex justify-between items-center">
                <h3 className="text-base font-medium dark:text-white">Friends</h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Scroll to see more</span>
              </div>
              <div className="h-full">
                <SteamFriends friends={friends} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tournament Achievements */}
      <section className="mb-8">
        <h3 className="text-base font-medium mb-6 dark:text-white">Tournament Achievements</h3>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-zinc-200 dark:bg-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Tournament</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-600">
                {achievements.map((achievement, index) => (
                  <tr key={index} className="bg-white dark:bg-zinc-800">
                    <td className="px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">{achievement.tournament}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{achievement.year}</td>
                    <td className="px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200">{achievement.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Games;