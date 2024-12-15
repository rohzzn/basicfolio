// src/app/about/page.tsx

"use client";
import React, { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';

interface AboutProps {
  lanyardData?: any;
}

const About: React.FC<AboutProps> = () => {
  const [lanyardData, setLanyardData] = useState<any>(null);
  const discordId = "407922731645009932"; // Your Discord ID

  useEffect(() => {
    const fetchLanyardData = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const data = await response.json();
        if (data.success) {
          setLanyardData(data.data);
        } else {
          console.error('Failed to fetch Lanyard data:', data);
        }
      } catch (error) {
        console.error('Error fetching Lanyard data:', error);
      }
    };

    fetchLanyardData();

    const interval = setInterval(fetchLanyardData, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [discordId]);

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">About</h2>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
        I'm a software engineer focused on building exceptional digital experiences. 
        Currently, I'm working on creating accessible, human-centered products.
      </p>

      {/* Discord Status and Activity */}
      {lanyardData && (
        <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {/* Status Section */}
          <div className="flex items-center gap-2 mb-4">
            <Circle 
              size={8} 
              fill={lanyardData.discord_status === 'online' ? '#43b581' : '#747f8d'} 
              className={lanyardData.discord_status === 'online' ? 'text-green-500' : 'text-gray-500'}
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              {lanyardData.discord_status.charAt(0).toUpperCase() + lanyardData.discord_status.slice(1)}
            </span>
          </div>
          {/* Activity Section */}
          {lanyardData.activities && lanyardData.activities.length > 0 && (
            <div>
              <h4 className="text-sm font-medium dark:text-white">Current Activity</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {lanyardData.activities[0].name}: {lanyardData.activities[0].state}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default About;
