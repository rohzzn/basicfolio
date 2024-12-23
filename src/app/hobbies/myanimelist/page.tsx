"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import { SortAsc, SortDesc, Star, List, AlertCircle } from 'lucide-react';

interface Anime {
  id: number;
  title: string;
  score: number | null;
}

const animeList: Anime[] = [
  { id: 1, title: "MF Ghost 2nd Season Airing", score: 6 },
  { id: 2, title: "Mushoku Tensei II: Isekai Ittara Honki Dasu Part 2", score: 7 },
  { id: 3, title: "Ansatsu Kyoushitsu", score: 7 },
  { id: 4, title: "Ansatsu Kyoushitsu 2nd Season", score: 8 },
  { id: 5, title: "Bocchi the Rock!", score: 8 },
  { id: 6, title: "Boku no Hero Academia", score: 8 },
  { id: 7, title: "Boku no Hero Academia 2nd Season", score: 8 },
  { id: 8, title: "Boku no Hero Academia 3rd Season", score: 8 },
  { id: 9, title: "Boku no Hero Academia 4th Season", score: 9 },
  { id: 10, title: "Boku no Hero Academia the Movie 1: Futari no Hero Specials", score: 6 },
  { id: 11, title: "Boku no Hero Academia the Movie 2: Heroes:Rising", score: 9 },
  { id: 12, title: "Chuukou Ikkan!! Kimetsu Gakuen Monogatari: Valentine-hen", score: 8 },
  { id: 13, title: "Code Geass: Hangyaku no Lelouch", score: 7 },
  { id: 14, title: "Cyberpunk: Edgerunners", score: 8 },
  { id: 15, title: "Darling in the FranXX", score: 7 },
  { id: 16, title: "Death Note", score: 8 },
  { id: 17, title: "Dr. Stone", score: 9 },
  { id: 18, title: "Dr. Stone: Stone Wars", score: 7 },
  { id: 19, title: "Fairy Tail", score: 7 },
  { id: 20, title: "Fairy Tail Movie 1: Houou no Miko", score: 5 },
  { id: 21, title: "Fruits Basket 1st Season", score: 8 },
  { id: 22, title: "Fullmetal Alchemist", score: 8 },
  { id: 23, title: "Fullmetal Alchemist: Brotherhood", score: 9 },
  { id: 24, title: "Golden Boy", score: 7 },
  { id: 25, title: "Haikyuu!!", score: 9 },
  { id: 26, title: "Haikyuu!! Karasuno Koukou vs. Shiratorizawa Gakuen Koukou", score: 8 },
  { id: 27, title: "Haikyuu!! Movie: Gomisuteba no Kessen", score: 8 },
  { id: 28, title: "Haikyuu!! Second Season", score: 7 },
  { id: 29, title: "Haikyuu!! To the Top", score: 7 },
  { id: 30, title: "Hunter x Hunter (2011)", score: 10 },
  { id: 31, title: "Hunter x Hunter Movie 1: Phantom Rouge", score: 7 },
  { id: 32, title: "Hunter x Hunter Movie 2: The Last Mission", score: 9 },
  { id: 33, title: "Isekai wa Smartphone to Tomo ni.", score: 6 },
  { id: 34, title: "Jujutsu Kaisen", score: 8 },
  { id: 35, title: "Jujutsu Kaisen 2nd Season", score: 9 },
  { id: 36, title: "Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen", score: 9 },
  { id: 37, title: "Kaguya-sama wa Kokurasetai? Tensai-tachi no Renai Zunousen", score: 9 },
  { id: 38, title: "Kaijuu 8-gou", score: 6 },
  { id: 39, title: "Kakegurui", score: 7 },
  { id: 40, title: "Kakegurui××", score: 6 },
  { id: 41, title: "Kimetsu no Yaiba", score: 10 },
  { id: 42, title: "Kimetsu no Yaiba Movie: Mugen Ressha-hen", score: 10 },
  { id: 43, title: "Kimetsu no Yaiba: Hashira Geiko-hen", score: 10 },
  { id: 44, title: "Kimetsu no Yaiba: Katanakaji no Sato-hen", score: 10 },
  { id: 45, title: "Kimetsu no Yaiba: Mugen Ressha-hen", score: 9 },
  { id: 46, title: "Kimetsu no Yaiba: Yuukaku-hen", score: 10 },
  { id: 47, title: "Kimi no Na wa.", score: 9 },
  { id: 48, title: "Kimi no Suizou wo Tabetai", score: 9 },
  { id: 49, title: "Kimi to, Nami ni Noretara", score: 5 },
  { id: 50, title: "Kobayashi-san Chi no Maid Dragon", score: 7 },
  { id: 51, title: "Koe no Katachi", score: 8 },
  { id: 52, title: "Kono Subarashii Sekai ni Shukufuku wo!", score: 8 },
  { id: 53, title: "Kono Subarashii Sekai ni Shukufuku wo! 2", score: 8 },
  { id: 54, title: "Kono Subarashii Sekai ni Shukufuku wo! Movie: Kurenai Densetsu", score: 8 },
  { id: 55, title: "Mashle", score: 8 },
  { id: 56, title: "Mashle: Shinkakusha Kouho Senbatsu Shiken-hen", score: 8 },
  { id: 57, title: "MF Ghost", score: 7 },
  { id: 58, title: "Mob Psycho 100", score: 8 },
  { id: 59, title: "Mob Psycho 100 II", score: 8 },
  { id: 60, title: "Mushoku Tensei II: Isekai Ittara Honki Dasu", score: 9 },
  { id: 61, title: "Mushoku Tensei II: Isekai Ittara Honki Dasu - Shugo Jutsushi Fitz", score: 8 },
  { id: 62, title: "Mushoku Tensei: Isekai Ittara Honki Dasu", score: 10 },
  { id: 63, title: "Mushoku Tensei: Isekai Ittara Honki Dasu - Eris no Goblin Toubatsu", score: 7 },
  { id: 64, title: "Mushoku Tensei: Isekai Ittara Honki Dasu Part 2", score: 10 },
  { id: 65, title: "Nakitai Watashi wa Neko wo Kaburu", score: 5 },
  { id: 66, title: "Nanatsu no Taizai", score: 9 },
  { id: 67, title: "Nanatsu no Taizai Movie 1: Tenkuu no Torawarebito", score: 9 },
  { id: 68, title: "Nanatsu no Taizai: Imashime no Fukkatsu", score: 7 },
  { id: 69, title: "Nanatsu no Taizai: Kamigami no Gekirin", score: 2 },
  { id: 70, title: "No Game No Life", score: 9 },
  { id: 71, title: "No Game No Life: Zero", score: 7 },
  { id: 72, title: "Omoide no Marnie", score: 9 },
  { id: 73, title: "One Piece Film: Red", score: 8 },
  { id: 74, title: "One Punch Man", score: 9 },
  { id: 75, title: "One Punch Man 2nd Season", score: 7 },
  { id: 76, title: "Re:Zero kara Hajimeru Isekai Seikatsu", score: 7 },
  { id: 77, title: "Saiki Kusuo no Ψ-nan", score: 7 },
  { id: 78, title: "Saiki Kusuo no Ψ-nan 2", score: 7 },
  { id: 79, title: "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai", score: 8 },
  { id: 80, title: "Sen to Chihiro no Kamikakushi", score: 5 },
  { id: 81, title: "Shigatsu wa Kimi no Uso", score: 7 },
  { id: 82, title: "Shingeki no Kyojin", score: 8 },
  { id: 83, title: "Shingeki no Kyojin Season 2", score: 7 },
  { id: 84, title: "Shingeki no Kyojin Season 3", score: 7 },
  { id: 85, title: "Shingeki no Kyojin Season 3 Part 2", score: 9 },
  { id: 86, title: "Shokugeki no Souma", score: 7 },
  { id: 87, title: "Shokugeki no Souma: Gou no Sara", score: 7 },
  { id: 88, title: "Shokugeki no Souma: Ni no Sara", score: 7 },
  { id: 89, title: "Shokugeki no Souma: San no Sara", score: 8 },
  { id: 90, title: "Shokugeki no Souma: San no Sara - Tootsuki Ressha-hen", score: 7 },
  { id: 91, title: "Shokugeki no Souma: Shin no Sara", score: 8 },
  { id: 92, title: "Spy x Family", score: 9 },
  { id: 93, title: "Spy x Family Part 2", score: 8 },
  { id: 94, title: "Suzume no Tojimari", score: 8 },
  { id: 95, title: "Sword Art Online", score: 7 },
  { id: 96, title: "Tenki no Ko", score: 10 },
  { id: 97, title: "Toradora!", score: 10 },
  { id: 98, title: "Vinland Saga", score: 8 },
  { id: 99, title: "Violet Evergarden", score: 8 },
  { id: 100, title: "Violet Evergarden Movie", score: 9 },
  { id: 101, title: "Xian Wang de Richang Shenghuo", score: 7 },
  { id: 102, title: "Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e", score: 9 },
  { id: 103, title: "Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e 2nd Season", score: 7 },
  { id: 104, title: "Yuru Camp△", score: 8 },
  { id: 105, title: "Chainsaw Man", score: 8 },
  { id: 106, title: "Oshi no Ko;", score: 8 },
  { id: 107, title: "Baki", score: 5 },
  { id: 108, title: "Black Clover", score: 5 },
  { id: 109, title: "Boku no Hero Academia 5th Season", score: 7 },
  { id: 110, title: "Chi. Chikyuu no Undou ni Tsuite Airing", score: 6 },
  { id: 111, title: "Dr. Stone: New World", score: null },
  { id: 112, title: "Grand Blue", score: 4 },
  { id: 113, title: "High School DxD", score: null },
  { id: 114, title: "Hyouka", score: null },
  { id: 115, title: "Isekai wa Smartphone to Tomo ni. 2", score: 6 },
  { id: 116, title: "Jibaku Shounen Hanako-kun", score: null },
  { id: 117, title: "Mob Psycho 100 III", score: null },
  { id: 118, title: "Nanatsu no Taizai: Funnu no Shinpan", score: 5 },
  { id: 119, title: "Sousou no Frieren", score: 4 },
  { id: 120, title: "Summer Wars", score: 4 },
  { id: 121, title: "Bakemonogatari", score: null },
  { id: 122, title: "Barakamon", score: null },
  { id: 123, title: "Bocchi the Rock! Movie", score: null },
  { id: 124, title: "Boku dake ga Inai Machi", score: null },
  { id: 125, title: "Boku no Hero Academia 7th Season", score: null },
  { id: 126, title: "Clannad: After Story", score: null },
  { id: 127, title: "Fruits Basket 2nd Season", score: 7 },
  { id: 128, title: "Fruits Basket: The Final", score: null },
  { id: 129, title: "Jigokuraku", score: 7 },
  { id: 130, title: "K-On!!", score: null },
  { id: 131, title: "Kaguya-sama wa Kokurasetai: Ultra Romantic", score: null },
  { id: 132, title: "Kimetsu no Yaiba Movie: Mugen Jou-hen Not Yet Aired", score: null },
  { id: 133, title: "Kono Subarashii Sekai ni Bakuen wo!", score: null },
  { id: 134, title: "Kono Subarashii Sekai ni Shukufuku wo! 3", score: null },
  { id: 135, title: "One Outs", score: null },
  { id: 136, title: "One Punch Man 3 Not Yet Aired", score: null },
  { id: 137, title: "Redline", score: null },
  { id: 138, title: "Spy x Family Season 2", score: null },
  { id: 139, title: "Tomodachi Game", score: null },
  { id: 140, title: "Vinland Saga Season 2", score: null },
  { id: 141, title: "Wind Breaker", score: null },
  { id: 142, title: "Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e 3rd Season", score: null },
  { id: 143, title: "Zom 100: Zombie ni Naru made ni Shitai 100 no Koto", score: null },
];


const MyAnimeList: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Anime; direction: "ascending" | "descending" } | null>({
    key: "score",
    direction: "descending",
  });
  const [imageCache, setImageCache] = useState<{ [key: number]: string }>({});
  const [hoveredAnime, setHoveredAnime] = useState<Anime | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate statistics
  const stats = useMemo(() => {
    const watched = animeList.filter(anime => anime.score !== null).length;
    const planToWatch = animeList.filter(anime => anime.score === null).length;
    const avgScore = animeList.reduce((acc, curr) => curr.score ? acc + curr.score : acc, 0) / watched;
    const maxScore = Math.max(...animeList.filter(anime => anime.score !== null).map(anime => anime.score || 0));
    
    return {
      watched,
      planToWatch,
      avgScore: avgScore.toFixed(1),
      maxScore
    };
  }, []);

  const sortedAnime = useMemo(() => {
    const sortableAnime = [...animeList];
    if (sortConfig !== null) {
      sortableAnime.sort((a, b) => {
        let aKey = a[sortConfig.key];
        let bKey = b[sortConfig.key];

        if (sortConfig.key === "title") {
          aKey = (aKey as string).toLowerCase();
          bKey = (bKey as string).toLowerCase();
        }

        if (aKey === null) return 1;
        if (bKey === null) return -1;

        if (aKey < bKey) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aKey > bKey) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableAnime;
  }, [sortConfig]);

  const requestSort = (key: keyof Anime) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const fetchImage = async (title: string, id: number) => {
    if (imageCache[id]) return;

    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const imageUrl = data.data[0].images.jpg.image_url;
        setImageCache((prev) => ({ ...prev, [id]: imageUrl }));
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleMouseEnter = (anime: Anime) => {
    setHoveredAnime(anime);
    fetchImage(anime.title, anime.id);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Anime List</h2>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <List className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">Total Watched</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{stats.watched}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">Plan to Watch</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{stats.planToWatch}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">Average Score</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{stats.avgScore}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">Highest Score</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{stats.maxScore}</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => requestSort("title")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            sortConfig?.key === "title"
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "bg-zinc-100 dark:bg-zinc-800"
          }`}
        >
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Title</span>
          {sortConfig?.key === "title" && (
            sortConfig.direction === "ascending" ? 
              <SortAsc className="w-4 h-4" /> : 
              <SortDesc className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => requestSort("score")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            sortConfig?.key === "score"
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "bg-zinc-100 dark:bg-zinc-800"
          }`}
        >
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Score</span>
          {sortConfig?.key === "score" && (
            sortConfig.direction === "ascending" ? 
              <SortAsc className="w-4 h-4" /> : 
              <SortDesc className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Anime List */}
      <div className="grid grid-cols-1 gap-2">
        {sortedAnime.map((anime) => (
          <div
            key={anime.id}
            className="group bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 flex justify-between items-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            onMouseEnter={() => handleMouseEnter(anime)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredAnime(null)}
          >
            <span className="text-sm text-zinc-700 dark:text-zinc-300">{anime.title}</span>
            <div className="flex items-center gap-2">
              {anime.score !== null ? (
                <span className="px-2 py-1 text-xs rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {anime.score}/10
                </span>
              ) : (
                <span className="px-2 py-1 text-xs rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                  PTW
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hover Preview */}
      {hoveredAnime && imageCache[hoveredAnime.id] && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ top: cursorPosition.y + 20, left: cursorPosition.x + 20 }}
        >
          <Image
            src={imageCache[hoveredAnime.id]}
            alt={`${hoveredAnime.title} Cover`}
            width={160}
            height={240}
            className="rounded shadow-lg object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default MyAnimeList;