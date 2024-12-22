// src/app/hobbies/games/CSGOStats.tsx
"use client";

import React from 'react';

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

interface CSGOStatsProps {
  stats: CSGOStats;
}

const CSGOStatsComponent: React.FC<CSGOStatsProps> = ({ stats }) => {
  // Extract specific stats
  const statMap: { [key: string]: number } = {};
  stats.playerstats.stats.forEach(stat => {
    statMap[stat.name] = stat.value;
  });

  // Example stats extraction (adjust based on available stats)
  const totalKills = statMap['total_kills'] || 'N/A';
  const totalWins = statMap['total_wins'] || 'N/A';

  return (
    <div className="space-y-2">
      <p><strong>Rank:</strong> Distinguished Master Guardian</p>
      <p><strong>Kills:</strong> {totalKills}</p>
      <p><strong>Wins:</strong> {totalWins}</p>
      

      {/* Add more stats as needed */}
    </div>
  );
};

export default CSGOStatsComponent;
