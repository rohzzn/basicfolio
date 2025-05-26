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
  statsData: CSGOStats;
}

const CSGOStatsComponent: React.FC<CSGOStatsProps> = ({ statsData }) => {
  // Extract specific stats
  const statMap: { [key: string]: number } = {};
  statsData.playerstats.stats.forEach(stat => {
    statMap[stat.name] = stat.value;
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const totalKills = statMap['total_kills'] || 0;
  const totalDeaths = statMap['total_deaths'] || 0;
  const totalWins = statMap['total_wins'] || 0;
  const totalRounds = statMap['total_rounds_played'] || 0;
  const headshots = statMap['total_kills_headshot'] || 0;
  const mvps = statMap['total_mvps'] || 0;

  const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : 'N/A';
  const winRate = totalRounds > 0 ? ((totalWins / totalRounds) * 100).toFixed(1) : 'N/A';
  const hsPercentage = totalKills > 0 ? ((headshots / totalKills) * 100).toFixed(1) : 'N/A';

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
      <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Rank:</span> DMG
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Kills:</span> {formatNumber(totalKills)}
        </p>
        
        <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">K/D Ratio:</span> {kd}
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Win Rate:</span> {winRate}%
        </p>
      </div>
      <div>
      <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Wingman Rank:</span> MGE
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">MVPs:</span> {formatNumber(mvps)}
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">Headshots:</span> {formatNumber(headshots)}
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium">HS Rate:</span> {hsPercentage}%
        </p>
      </div>
    </div>
  );
};

export default CSGOStatsComponent;