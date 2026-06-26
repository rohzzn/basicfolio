// src/app/hobbies/games/Profile.tsx
"use client";

import React from 'react';
import Image from '@/components/SiteImage';

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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={profile.avatarmedium}
          alt={`${profile.personaname}'s avatar`}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div>
          <h3 className="text-lg font-medium dark:text-white">{profile.personaname}</h3>
          <div className="flex items-center gap-3 mt-0.5">
            <a
              href={profile.profileurl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Steam ↗
            </a>
            <span className="text-zinc-300 dark:text-zinc-600">·</span>
            <a
              href="https://settings.gg/rohzzn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Config ↗
            </a>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-2">
            <Image
              src="/images/games/csgo-rank.png"
              alt="CS:GO Rank"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">CS:GO</p>
          <p className="text-sm font-medium dark:text-white">DMG</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-2">
            <Image
              src="/images/games/valorant-rank.png"
              alt="Valorant Rank"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Valorant</p>
          <p className="text-sm font-medium dark:text-white">Immortal 1</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12 mb-2">
            <Image
              src="/images/games/ow-rank.png"
              alt="Overwatch Rank"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Overwatch</p>
          <p className="text-sm font-medium dark:text-white">Diamond</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;