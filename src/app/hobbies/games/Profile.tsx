// src/app/hobbies/games/Profile.tsx
"use client";

import React from 'react';
import Image from 'next/image';

interface SteamProfile {
  personaname: string;
  steamid: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  profileurl: string;
}

interface ProfileProps {
  profile: SteamProfile;
}

const Profile: React.FC<ProfileProps> = ({ profile }) => {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Image
          src={profile.avatarmedium}
          alt={`${profile.personaname}'s avatar`}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <p className="text-lg font-semibold dark:text-white">{profile.personaname}</p>
          <a
            href={profile.profileurl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            View Steam Profile →
          </a>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-1">
            <Image
              src="/images/games/csgo-rank.png"
              alt="CS:GO Rank"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Peak Rank</p>
          <p className="text-sm font-medium dark:text-white">DMG</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-1">
            <Image
              src="/images/games/valorant-rank.png"
              alt="Valorant Rank"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Peak Rank</p>
          <p className="text-sm font-medium dark:text-white">Immortal 1</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-1">
            <Image
              src="/images/games/ow-rank.png"
              alt="Overwatch Rank"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">Peak Rank</p>
          <p className="text-sm font-medium dark:text-white">Diamond</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;