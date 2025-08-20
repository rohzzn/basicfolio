// src/app/hobbies/games/SteamHelpers.tsx

export const getPersonaStateText = (state?: number): string => {
  switch (state) {
    case 0: return 'Offline';
    case 1: return 'Online';
    case 2: return 'Busy';
    case 3: return 'Away';
    case 4: return 'Snooze';
    case 5: return 'Looking to Trade';
    case 6: return 'Looking to Play';
    default: return 'Offline';
  }
};

export const getPersonaStateColor = (state?: number): string => {
  switch (state) {
    case 0: return 'text-zinc-500 dark:text-zinc-400';
    case 1: return 'text-green-500 dark:text-green-400';
    case 2: return 'text-red-500 dark:text-red-400';
    case 3: return 'text-yellow-500 dark:text-yellow-400';
    case 4: return 'text-yellow-500 dark:text-yellow-400';
    case 5: return 'text-blue-500 dark:text-blue-400';
    case 6: return 'text-blue-500 dark:text-blue-400';
    default: return 'text-zinc-500 dark:text-zinc-400';
  }
};

export const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};
