// src/app/hobbies/games/SteamFriends.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';

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

interface SteamFriendsProps {
  friends: SteamFriend[];
}

const SteamFriends: React.FC<SteamFriendsProps> = ({ friends }) => {
  if (!friends || friends.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">No friends data available.</p>;
  }

  // Filter friends who are currently playing games
  const playingFriends = friends.filter(friend => friend.gameextrainfo);
  // No need for console logs here anymore as we've added them in the page component
  
  // Other online friends
  const onlineFriends = friends.filter(friend => friend.personastate && friend.personastate > 0 && !friend.gameextrainfo);
  
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 h-full flex flex-col">
      {/* Playing Friends Section */}
      <div className="mb-4 flex-grow overflow-hidden">
        <h4 className="text-sm font-medium dark:text-white mb-2 flex items-center">
          <Gamepad2 className="w-3.5 h-3.5 mr-1.5 text-green-500" />
          Playing Now
        </h4>
        
        {playingFriends.length === 0 ? (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">No friends are currently playing</p>
        ) : (
          <div className="space-y-2 h-[calc(100%-2rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
            {playingFriends.map((friend) => (
              <Link
                key={friend.steamid}
                href={`https://steamcommunity.com/profiles/${friend.steamid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <Image
                    src={friend.avatarfull || friend.avatarmedium || friend.avatar || '/placeholder-profile.png'}
                    alt={friend.personaname || 'Steam Friend'}
                    width={36}
                    height={36}
                    className="rounded-md"
                  />
                  <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-zinc-100 dark:border-zinc-800"></div>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-xs dark:text-white truncate">{friend.personaname || 'Unknown'}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 truncate">
                    {friend.gameextrainfo}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Online Friends Section */}
      {onlineFriends.length > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <h4 className="text-sm font-medium dark:text-white mb-2">Online</h4>
          <div className="flex flex-wrap gap-1.5 max-h-[15vh] sm:max-h-[10vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
            {onlineFriends.map((friend) => (
              <Link
                key={friend.steamid}
                href={`https://steamcommunity.com/profiles/${friend.steamid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group"
                title={friend.personaname}
              >
                <Image
                  src={friend.avatarmedium || friend.avatar || '/placeholder-profile.png'}
                  alt={friend.personaname || 'Steam Friend'}
                  width={28}
                  height={28}
                  className="rounded-full border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-green-500 transition-colors"
                />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-green-500 border border-zinc-100 dark:border-zinc-800"></div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SteamFriends;
