"use client";
import React from 'react';
import Link from 'next/link';

interface Game {
  name: string;
  achievements: string[];
  date: string;
}

const tournaments: Game[] = [
  
];

const stats = {
  csgo: {
    rank: "Distinguished Master Guardian",
    hours: "3000+",
    achievements: [
      "Map Knowledge Expert",
      "Clutch Specialist",
      "Entry Fragger",
    ]
  },
  valorant: {
    rank: "Immortal",
    achievements: [
      "Team Captain",
      "Tournament Experience",
      "Strategic Caller"
    ]
  }
};

const customization = {
  csgo: [
    "Improved Radio Mod",
    "Vibrance GUI",
    "Text Color Mod",
    "Simple Radar",
    "Custom Font - superstar_memesbruh03"
  ]
};

const Games: React.FC = () => {
  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Gaming</h2>
      
      {/* Tournament History */}
      <section className="mb-12">
        <div className="space-y-6">
          {tournaments.map((tournament, index) => (
            <div key={index} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-medium dark:text-white">{tournament.name}</h4>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{tournament.date}</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {tournament.achievements.map((achievement, i) => (
                  <li key={i} className="text-zinc-600 dark:text-zinc-400">
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Game Stats */}
      <section className="mb-12">
        <h3 className="text-base font-medium mb-6 dark:text-white">Game Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CS:GO Stats */}
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
            <h4 className="text-lg font-medium dark:text-white mb-4">CS:GO</h4>
            <div className="space-y-4">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400">Rank: {stats.csgo.rank}</p>
                <p className="text-zinc-600 dark:text-zinc-400">Hours: {stats.csgo.hours}</p>
              </div>
              <div>
                <p className="font-medium dark:text-white mb-2">Achievements:</p>
                <ul className="list-disc list-inside space-y-1">
                  {stats.csgo.achievements.map((achievement, i) => (
                    <li key={i} className="text-zinc-600 dark:text-zinc-400">{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Valorant Stats */}
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
            <h4 className="text-lg font-medium dark:text-white mb-4">Valorant</h4>
            <div className="space-y-4">
              <div>
                <p className="text-zinc-600 dark:text-zinc-400">Rank: {stats.valorant.rank}</p>
              </div>
              <div>
                <p className="font-medium dark:text-white mb-2">Achievements:</p>
                <ul className="list-disc list-inside space-y-1">
                  {stats.valorant.achievements.map((achievement, i) => (
                    <li key={i} className="text-zinc-600 dark:text-zinc-400">{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customization */}
      <section className="mb-12">
        <h3 className="text-base font-medium mb-6 dark:text-white">CS:GO Customization</h3>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
          <ul className="list-disc list-inside space-y-2">
            {customization.csgo.map((item, index) => (
              <li key={index} className="text-zinc-600 dark:text-zinc-400">{item}</li>
            ))}
          </ul>
          <div className="mt-6">
            <Link
              href="https://settings.gg/player/279387466"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors text-sm"
            >
              View Config
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Games;