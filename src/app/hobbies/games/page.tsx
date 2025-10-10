// src/app/hobbies/games/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Profile from './Profile';
import RecentlyPlayedGames from './RecentlyPlayedGames';

import Link from 'next/link';
import Image from 'next/image';
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
// Fetch function for client-side requests
const fetchWithRetry = async (url: string) => {
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
};

const Games = () => {
  const STEAM_ID = '76561198239653194';
  
  // State for data
  const [profile, setProfile] = useState<SteamProfile>(emptyProfile);
  const [ownedGames, setOwnedGames] = useState<SteamGame[]>(emptyGames);
  const [profileError, setProfileError] = useState(false);
  const [ownedGamesError, setOwnedGamesError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from our API routes instead of directly from Steam
        const [profileResponse, gamesResponse] = await Promise.all([
          fetch('/api/steam/profile').catch(() => null),
          fetch('/api/steam/games').catch(() => null)
        ]);

        if (profileResponse && profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.response && profileData.response.players && profileData.response.players.length > 0) {
            setProfile(profileData.response.players[0]);
          }
        } else {
          setProfileError(true);
        }

        if (gamesResponse && gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          if (gamesData.response && gamesData.response.games) {
            setOwnedGames(gamesData.response.games);
          }
        } else {
          setOwnedGamesError(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProfileError(true);
        setOwnedGamesError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
  ).slice(0, 2);
  const allGames = totalPlaytimeSortedGames.slice(0, 12);

  if (loading) {
    return (
      <div className="max-w-7xl">
        <h2 className="text-lg font-medium mb-6 dark:text-white">Gaming</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Loading gaming data...</p>
      </div>
    );
  }

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

      {/* Gaming Content Layout */}
      <section className="mb-8">
        {ownedGamesError && (
          <div className="bg-yellow-50 dark:bg-zinc-800 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 dark:text-yellow-400">Could not load game data.</p>
          </div>
        )}
        
        <div className="space-y-8">
          {/* Recent Games */}
          {recentGames.length > 0 && (
            <div>
              <h3 className="text-base font-medium mb-6 dark:text-white">Recent Games</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentGames.map((game) => (
                  <Link
                    key={game.appid}
                    href={`https://store.steampowered.com/app/${game.appid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group cursor-pointer block"
                  >
                    <article className="text-center">
                      <div className="w-full aspect-[460/215] bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden mb-3">
                        <Image
                          src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                          alt={`${game.name} Header`}
                          width={460}
                          height={215}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Fallback to capsule image if header fails
                            target.src = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_231x87.jpg`;
                            target.onError = () => {
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<span class="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center w-full h-full">No IMG</span>';
                              }
                            };
                          }}
                        />
                      </div>
                      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-1">
                        {game.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {game.playtime_2weeks && game.playtime_2weeks > 0 
                          ? `${Math.floor(game.playtime_2weeks / 60)}h recently` 
                          : `${Math.floor(game.playtime_forever / 60)}h total`}
                      </p>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Top Games */}
          <div>
            <h3 className="text-base font-medium mb-6 dark:text-white">Top Games</h3>
            <div className="space-y-4">
              {allGames.map((game, index) => (
                <div key={game.appid}>
                  <Link
                    href={`https://store.steampowered.com/app/${game.appid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group cursor-pointer block"
                  >
                    <article>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
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
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                              {game.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                              <span>{Math.floor(game.playtime_forever / 60)}h</span>
                              <span>→</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                  {index < allGames.length - 1 && (
                    <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
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