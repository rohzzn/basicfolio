"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, RefreshCw } from 'lucide-react';

interface Anime {
  id: number;
  title: string;
  score: number | null;
  status?: 'watched' | 'watching' | 'plan_to_watch' | 'dropped';
  genres?: string[];
  year?: number | null;
  image?: string | null;
}

// Configuration options
const MAL_USERNAME = 'rohzzn'; // Your MyAnimeList username

const MyAnimeList: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(MAL_USERNAME);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'watching' | 'watched' | 'plan_to_watch'>('all');

  // Fetch anime data from MyAnimeList
  useEffect(() => {
    const fetchAnimeList = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check URL for username parameter
        const urlParams = new URLSearchParams(window.location.search);
        const urlUsername = urlParams.get('username');
        const malUsername = urlUsername || username || MAL_USERNAME;
        
        if (!malUsername) {
          setError('MyAnimeList username is required. Please add it to the URL as ?username=YOUR_USERNAME');
          setIsLoading(false);
          return;
        }
        
        setUsername(malUsername);
        
        const response = await fetch(`/api/myanimelist?username=${encodeURIComponent(malUsername)}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch anime list: ${response.status}`);
        }
        
        const data = await response.json();
        setAnimeList(data.animeList);
      } catch (err) {
        console.error('Error fetching anime list:', err);
        setError(err instanceof Error ? err.message : 'Failed to load anime list');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchAnimeList();
  }, [isRefreshing, username]);

  // Filter anime based on active tab and search
  const filteredAnime = useMemo(() => {
    return animeList.filter(anime => {
      // Filter by search term
      if (searchTerm && !anime.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by active tab
      if (activeTab !== 'all' && anime.status !== activeTab) {
        return false;
      }
      
      return true;
    });
  }, [animeList, searchTerm, activeTab]);

  // Sort anime by score (highest first) and then by title
  const sortedAnime = useMemo(() => {
    return [...filteredAnime].sort((a, b) => {
      // First sort by score (highest first)
      if (a.score !== null && b.score !== null) {
        if (a.score !== b.score) return b.score - a.score;
      }
      if (a.score !== null && b.score === null) return -1;
      if (a.score === null && b.score !== null) return 1;
      
      // Then sort by title alphabetically
      return a.title.localeCompare(b.title);
    });
  }, [filteredAnime]);

  const handleRefresh = () => {
    setIsRefreshing(true);
  };


  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium dark:text-white">Anime List</h2>
        <button 
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
          <p className="text-zinc-700 dark:text-zinc-300">Loading anime list...</p>
        </div>
      ) : error ? (
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-xl mb-6">
          <h3 className="text-zinc-800 dark:text-zinc-200 font-medium mb-2">Error Loading Anime List</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-zinc-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      ) : (
        <>

          {/* Search and Tabs */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search anime..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
              />
            </div>
            
            <div className="flex gap-4">
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'watching' as const, label: 'Watching' },
                { id: 'watched' as const, label: 'Watched' },
                { id: 'plan_to_watch' as const, label: 'Plan to Watch' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-sm capitalize transition-colors ${
                    activeTab === tab.id
                      ? 'text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Anime Grid */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            style={{ perspective: '1000px' }}
          >
            {sortedAnime.map((anime) => (
              <div key={anime.id} className="group">
                <div 
                  className="aspect-[3/4] relative mb-3 transition-all duration-300 cursor-pointer"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(0deg) rotateX(0deg)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotateY(-15deg) rotateX(5deg) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
                  }}
                >
                  {/* Anime Cover */}
                  <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-lg">
                    {anime.image ? (
                      <Image
                        src={anime.image}
                        alt={anime.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center px-2">
                          No Image
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Spine Effect */}
                  <div 
                    className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-zinc-300 to-zinc-500 dark:from-zinc-600 dark:to-zinc-800"
                    style={{
                      transform: 'rotateY(90deg)',
                      transformOrigin: 'left center',
                      boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.2)'
                    }}
                  ></div>
                  
                  {/* Pages Effect */}
                  <div 
                    className="absolute top-1 right-1 w-2 h-[calc(100%-8px)] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-300 dark:to-gray-400"
                    style={{
                      transform: 'translateZ(-2px)',
                      borderRadius: '0 2px 2px 0'
                    }}
                  ></div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-1">
                    {anime.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    {anime.year && <span>{anime.year}</span>}
                    {anime.score && anime.score > 0 && (
                      <span className="font-medium">{anime.score}/10</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedAnime.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">No anime found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyAnimeList;