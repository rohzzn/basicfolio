// Games played outside Steam (consoles, other launchers, old PC discs),
// shown alongside the Steam library on /hobbies/games.

export interface ManualGame {
  id: string;
  name: string;
  playtime_forever: number; // minutes
  logoUrl: string;
  storeUrl: string;
  // Set when the game is also on Steam: the Steam entry is hidden so the
  // game isn't listed twice, and these hours are shown instead
  steamAppId?: number;
}

const h = (hours: number) => hours * 60;
const steam = (appid: number) => `https://store.steampowered.com/app/${appid}`;
const wiki = (page: string) => `https://en.wikipedia.org/wiki/${page}`;

// Local icons: /public/images/games/{id}.png
export const MANUAL_GAMES: ManualGame[] = [
  { id: 'valorant',  name: 'Valorant',  playtime_forever: h(2430), logoUrl: '/images/games/valorantlogo.png',  storeUrl: 'https://playvalorant.com' },
  { id: 'fortnite',  name: 'Fortnite',  playtime_forever: h(1839), logoUrl: '/images/games/fortnitelogo.png',  storeUrl: 'https://www.epicgames.com/fortnite' },
  { id: 'minecraft', name: 'Minecraft', playtime_forever: h(439),  logoUrl: '/images/games/minecraftlogo.png', storeUrl: 'https://www.minecraft.net' },

  { id: 'god-of-war-2005',            name: 'God of War (2005)',           playtime_forever: h(197), logoUrl: '/images/games/god-of-war-2005.png',            storeUrl: wiki('God_of_War_(2005_video_game)') },
  { id: 'god-of-war-ii',              name: 'God of War II',               playtime_forever: h(327), logoUrl: '/images/games/god-of-war-ii.png',              storeUrl: wiki('God_of_War_II') },
  { id: 'god-of-war-iii',             name: 'God of War III',              playtime_forever: h(112), logoUrl: '/images/games/god-of-war-iii.png',             storeUrl: wiki('God_of_War_III') },
  { id: 'god-of-war-ghost-of-sparta', name: 'God of War: Ghost of Sparta', playtime_forever: h(87),  logoUrl: '/images/games/god-of-war-ghost-of-sparta.png', storeUrl: wiki('God_of_War:_Ghost_of_Sparta') },
  { id: 'god-of-war-2018',            name: 'God of War (2018)',           playtime_forever: h(186), logoUrl: '/images/games/god-of-war-2018.png',            storeUrl: steam(1593500), steamAppId: 1593500 },

  { id: 'assassins-creed',               name: "Assassin's Creed",                playtime_forever: h(38),  logoUrl: '/images/games/assassins-creed.png',               storeUrl: steam(15100),  steamAppId: 15100 },
  { id: 'assassins-creed-ii',            name: "Assassin's Creed II",             playtime_forever: h(107), logoUrl: '/images/games/assassins-creed-ii.png',            storeUrl: steam(33230),  steamAppId: 33230 },
  { id: 'assassins-creed-brotherhood',   name: "Assassin's Creed Brotherhood",    playtime_forever: h(94),  logoUrl: '/images/games/assassins-creed-brotherhood.png',   storeUrl: steam(48190),  steamAppId: 48190 },
  { id: 'assassins-creed-revelations',   name: "Assassin's Creed Revelations",    playtime_forever: h(71),  logoUrl: '/images/games/assassins-creed-revelations.png',   storeUrl: steam(201870), steamAppId: 201870 },
  { id: 'assassins-creed-iii',           name: "Assassin's Creed III",            playtime_forever: h(83),  logoUrl: '/images/games/assassins-creed-iii.png',           storeUrl: steam(911400), steamAppId: 208480 },
  { id: 'assassins-creed-iv-black-flag', name: "Assassin's Creed IV Black Flag",  playtime_forever: h(138), logoUrl: '/images/games/assassins-creed-iv-black-flag.png', storeUrl: steam(242050), steamAppId: 242050 },
  { id: 'assassins-creed-rogue',         name: "Assassin's Creed Rogue",          playtime_forever: h(33),  logoUrl: '/images/games/assassins-creed-rogue.png',         storeUrl: steam(311560), steamAppId: 311560 },
  { id: 'assassins-creed-unity',         name: "Assassin's Creed Unity",          playtime_forever: h(76),  logoUrl: '/images/games/assassins-creed-unity.png',         storeUrl: steam(289650), steamAppId: 289650 },
  { id: 'assassins-creed-syndicate',     name: "Assassin's Creed Syndicate",      playtime_forever: h(62),  logoUrl: '/images/games/assassins-creed-syndicate.png',     storeUrl: steam(368500), steamAppId: 368500 },
  { id: 'assassins-creed-origins',       name: "Assassin's Creed Origins",        playtime_forever: h(118), logoUrl: '/images/games/assassins-creed-origins.png',       storeUrl: steam(582160), steamAppId: 582160 },
  { id: 'assassins-creed-odyssey',       name: "Assassin's Creed Odyssey",        playtime_forever: h(134), logoUrl: '/images/games/assassins-creed-odyssey.png',       storeUrl: steam(812140), steamAppId: 812140 },

  { id: 'gta-vice-city',    name: 'Grand Theft Auto: Vice City',   playtime_forever: h(268), logoUrl: '/images/games/gta-vice-city.png',    storeUrl: wiki('Grand_Theft_Auto:_Vice_City'),   steamAppId: 12110 },
  { id: 'gta-san-andreas',  name: 'Grand Theft Auto: San Andreas', playtime_forever: h(296), logoUrl: '/images/games/gta-san-andreas.png',  storeUrl: wiki('Grand_Theft_Auto:_San_Andreas'), steamAppId: 12120 },
  { id: 'gta-v-legacy',     name: 'Grand Theft Auto V Legacy',     playtime_forever: h(304), logoUrl: '/images/games/gta-v-legacy.png',     storeUrl: steam(271590),                         steamAppId: 271590 },

  { id: 'call-of-duty-4',                name: 'Call of Duty 4: Modern Warfare',        playtime_forever: h(91), logoUrl: '/images/games/call-of-duty-4.png',                storeUrl: steam(7940),  steamAppId: 7940 },
  { id: 'call-of-duty-modern-warfare-2', name: 'Call of Duty: Modern Warfare 2 (2009)', playtime_forever: h(69), logoUrl: '/images/games/call-of-duty-modern-warfare-2.png', storeUrl: steam(10180), steamAppId: 10180 },
  { id: 'battlefield-bad-company',       name: 'Battlefield: Bad Company',              playtime_forever: h(21), logoUrl: '/images/games/battlefield-bad-company.png',       storeUrl: wiki('Battlefield:_Bad_Company') },

  { id: 'ghost-of-tsushima', name: 'Ghost of Tsushima',  playtime_forever: h(131), logoUrl: '/images/games/ghost-of-tsushima.png', storeUrl: steam(2215430), steamAppId: 2215430 },
  { id: 'dmc-devil-may-cry', name: 'DmC: Devil May Cry', playtime_forever: h(72),  logoUrl: '/images/games/dmc-devil-may-cry.png', storeUrl: steam(220440),  steamAppId: 220440 },
  { id: 'tekken-4',          name: 'Tekken 4',           playtime_forever: h(47),  logoUrl: '/images/games/tekken-4.png',          storeUrl: wiki('Tekken_4') },
  { id: 'tekken-5',          name: 'Tekken 5',           playtime_forever: h(83),  logoUrl: '/images/games/tekken-5.png',          storeUrl: wiki('Tekken_5') },
  { id: 'tekken-6',          name: 'Tekken 6',           playtime_forever: h(61),  logoUrl: '/images/games/tekken-6.png',          storeUrl: wiki('Tekken_6') },
  { id: 'astro-bot',         name: 'Astro Bot',          playtime_forever: h(8),   logoUrl: '/images/games/astro-bot.png',         storeUrl: 'https://www.playstation.com/en-us/games/astro-bot/' },

  { id: 'freedom-fighters', name: 'Freedom Fighters', playtime_forever: h(98),  logoUrl: '/images/games/freedom-fighters.png', storeUrl: steam(1347780), steamAppId: 1347780 },
  { id: 'project-igi',      name: 'Project I.G.I.',   playtime_forever: h(52),  logoUrl: '/images/games/project-igi.png',      storeUrl: wiki('Project_I.G.I.') },
  { id: 'total-overdose',   name: 'Total Overdose',   playtime_forever: h(43),  logoUrl: '/images/games/total-overdose.png',   storeUrl: 'https://www.gog.com/game/total_overdose_a_gunslingers_tale_in_mexico' },
  { id: 'road-rash',        name: 'Road Rash',        playtime_forever: h(113), logoUrl: '/images/games/road-rash.png',        storeUrl: wiki('Road_Rash_(1994_video_game)') },
  { id: 'blur',             name: 'Blur',             playtime_forever: h(243), logoUrl: '/images/games/blur.png',             storeUrl: wiki('Blur_(video_game)'), steamAppId: 42640 },
  { id: 'claw',             name: 'Claw',             playtime_forever: h(29),  logoUrl: '/images/games/claw.png',             storeUrl: wiki('Claw_(video_game)') },
  { id: 'dangerous-dave',   name: 'Dangerous Dave',   playtime_forever: h(48),  logoUrl: '/images/games/dangerous-dave.png',   storeUrl: wiki('Dangerous_Dave') },
  { id: 'wii-sports',       name: 'Wii Sports',       playtime_forever: h(79),  logoUrl: '/images/games/wii-sports.png',       storeUrl: wiki('Wii_Sports') },
];
