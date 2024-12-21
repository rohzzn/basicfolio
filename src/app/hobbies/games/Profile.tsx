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
  // Add other fields as needed
}

interface ProfileProps {
  profile: SteamProfile;
}

const Profile: React.FC<ProfileProps> = ({ profile }) => {
  return (
    <div className="bg-paper dark:bg-zinc-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
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
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Steam Profile
        </a>
      </div>
    </div>
  );
};

export default Profile;
