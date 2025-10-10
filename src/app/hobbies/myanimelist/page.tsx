"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { SortAsc, SortDesc, Star, List, AlertCircle, Clock, Filter, X, Search, RefreshCw } from 'lucide-react';

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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Anime; direction: "ascending" | "descending" } | null>({
    key: "score",
    direction: "descending",
  });
  const [imageCache, setImageCache] = useState<{ [key: number]: string }>({});
  const [hoveredAnime, setHoveredAnime] = useState<Anime | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(MAL_USERNAME);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        
        // Pre-load images for anime that have image URLs
        data.animeList.forEach((anime: Anime) => {
          if (anime.image) {
            setImageCache(prev => ({ ...prev, [anime.id]: anime.image as string }));
          }
        });
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

  // Calculate statistics
  const stats = useMemo(() => {
    const watched = animeList.filter(anime => anime.status === 'watched').length;
    const planToWatch = animeList.filter(anime => anime.status === 'plan_to_watch').length;
    const watching = animeList.filter(anime => anime.status === 'watching').length;
    const dropped = animeList.filter(anime => anime.status === 'dropped').length;
    
    // Calculate average score only from watched anime with scores
    const scoredAnime = animeList.filter(anime => anime.status === 'watched' && anime.score !== null);
    const avgScore = scoredAnime.length > 0 
      ? scoredAnime.reduce((acc, curr) => curr.score ? acc + curr.score : acc, 0) / scoredAnime.length
      : 0;
    
    return {
      watched,
      planToWatch,
      avgScore: avgScore.toFixed(1),
      watching,
      dropped,
      total: animeList.length
    };
  }, [animeList]);

  // Get all unique genres from the anime list
  const allGenres = useMemo(() => {
    return [...new Set(animeList.flatMap(anime => anime.genres || []))].sort();
  }, [animeList]);

  // Filter anime based on selected filters
  const filteredAnime = useMemo(() => {
    return animeList.filter(anime => {
      // Filter by search term
      if (searchTerm && !anime.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (statusFilter && anime.status !== statusFilter) {
        return false;
      }
      
      // Filter by genres
      if (selectedGenres.length > 0 && !selectedGenres.some(genre => anime.genres?.includes(genre))) {
        return false;
      }
      
      return true;
    });
  }, [animeList, searchTerm, statusFilter, selectedGenres]);

  // Sort the filtered anime
  const sortedAnime = useMemo(() => {
    const sortableAnime = [...filteredAnime];
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

        // Handle potentially undefined values
        if (aKey === undefined && bKey === undefined) return 0;
        if (aKey === undefined) return 1;
        if (bKey === undefined) return -1;

        if (aKey < bKey) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aKey > bKey) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableAnime;
  }, [filteredAnime, sortConfig]);

  const requestSort = (key: keyof Anime) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const fetchImage = async (title: string, id: number) => {
    if (imageCache[id]) return;
    
    setLoading(prev => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const imageUrl = data.data[0].images.jpg.image_url;
        setImageCache((prev) => ({ ...prev, [id]: imageUrl }));
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleMouseEnter = (anime: Anime) => {
    setHoveredAnime(anime);
    if (!imageCache[anime.id]) {
      fetchImage(anime.title, anime.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre) 
        : [...prev, genre]
    );
  };

  const toggleStatusFilter = (status: string | null) => {
    setStatusFilter(prev => prev === status ? null : status);
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setStatusFilter(null);
    setSearchTerm('');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
  };

  // Get currently watching anime
  const currentlyWatching = useMemo(() => {
    return animeList
      .filter(anime => anime.status === 'watching')
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [animeList]);

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium dark:text-white">
          Anime List
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
          <p className="text-zinc-700 dark:text-zinc-300">Loading anime list...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl mb-6">
          <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Error Loading Anime List</h3>
          <p className="text-red-500 dark:text-red-300 mb-4">{error}</p>
          
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg mb-4 text-sm">
            <p className="font-medium mb-2 text-zinc-800 dark:text-zinc-200">How to fix this:</p>
            <ol className="list-decimal list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Make sure you entered a valid MyAnimeList username</li>
              <li>Add <code className="bg-zinc-100 dark:bg-zinc-700 px-1 py-0.5 rounded">?username=YOUR_USERNAME</code> to the URL</li>
              <li>Check if the MyAnimeList service is currently available</li>
              <li>Try refreshing the page</li>
            </ol>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">Watched</h3>
              </div>
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">{stats.watched}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Completed anime</p>
            </article>
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">Watching</h3>
              </div>
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">{stats.watching}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Currently watching</p>
            </article>
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">Plan to Watch</h3>
              </div>
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">{stats.planToWatch}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">In backlog</p>
            </article>
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">Average Score</h3>
              </div>
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">{stats.avgScore}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Out of 10</p>
            </article>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-12"></div>

          {/* Currently Watching Section */}
          {currentlyWatching.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-medium mb-6 dark:text-white">Currently Watching</h3>
              <div className="space-y-6">
                {currentlyWatching.map(anime => (
                  <article 
                    key={`watching-${anime.id}`}
                    className="group cursor-pointer"
                    onMouseEnter={() => handleMouseEnter(anime)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredAnime(null)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                        {anime.title}
                      </h4>
                      {anime.score && anime.score > 0 && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                          {anime.score}/10
                        </span>
                      )}
                    </div>
                    {anime.year && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">({anime.year})</p>
                    )}
                    {anime.genres && anime.genres.length > 0 && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {anime.genres.join(' • ')}
                      </div>
                    )}
                  </article>
                ))}
              </div>
              
              {/* Divider */}
              <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-12"></div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search anime..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" />
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <Filter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Filters</span>
                    {(selectedGenres.length > 0 || statusFilter) && (
                      <span className="bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {selectedGenres.length + (statusFilter ? 1 : 0)}
                      </span>
                    )}
                  </button>
                  
                  {(selectedGenres.length > 0 || statusFilter) && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    >
                      <X className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                      <span className="text-xs text-zinc-700 dark:text-zinc-300">Reset</span>
                    </button>
                  )}

                  {/* Sort Controls */}
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
                
                {/* Filter Panel */}
                {showFilters && (
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                    <div className="mb-4">
                      <h3 className="font-medium text-sm mb-2 dark:text-white">Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {['watched', 'watching', 'plan_to_watch', 'dropped'].map(status => (
                          <button
                            key={status}
                            onClick={() => toggleStatusFilter(status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              statusFilter === status 
                                ? 'bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-800' 
                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {allGenres.length > 0 && (
                      <div>
                        <h3 className="font-medium text-sm mb-2 dark:text-white">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {allGenres.map(genre => (
                            <button
                              key={genre}
                              onClick={() => toggleGenre(genre)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                selectedGenres.includes(genre) 
                                  ? 'bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-800' 
                                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Results Summary */}
              <div className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                Showing {sortedAnime.length} of {animeList.length} anime
              </div>

              {/* Anime List */}
              <div className="space-y-6">
                {sortedAnime.map((anime, index) => (
                  <div key={anime.id}>
                    <article
                      className="group cursor-pointer"
                      onMouseEnter={() => handleMouseEnter(anime)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setHoveredAnime(null)}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                          {anime.title}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                          {anime.year && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">({anime.year})</span>
                          )}
                          {anime.score !== null && anime.score > 0 && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {anime.score}/10
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                        {anime.genres && anime.genres.length > 0 && (
                          <div>{anime.genres.join(' • ')}</div>
                        )}
                        
                        {anime.status && anime.status !== 'watched' && (
                          <div className="capitalize">
                            Status: {anime.status.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    </article>
                    
                    {/* Divider line between anime (except for the last one) */}
                    {index < sortedAnime.length - 1 && (
                      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-6"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {sortedAnime.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-zinc-600 dark:text-zinc-400">No anime found. Try adjusting your filters or search criteria.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Hover Preview */}
      {hoveredAnime && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ top: cursorPosition.y + 20, left: cursorPosition.x + 20 }}
        >
          {loading[hoveredAnime.id] ? (
            <div className="w-40 h-60 bg-zinc-300 dark:bg-zinc-700 rounded shadow-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-600"></div>
            </div>
          ) : imageCache[hoveredAnime.id] ? (
            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded shadow-lg">
              <Image
                src={imageCache[hoveredAnime.id]}
                alt={`${hoveredAnime.title} Cover`}
                width={160}
                height={240}
                className="rounded object-cover"
              />
              <div className="mt-2 text-center">
                <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[160px]">
                  {hoveredAnime.title}
                </p>
                {hoveredAnime.score && hoveredAnime.score > 0 && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Score: {hoveredAnime.score}/10
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-40 h-60 bg-zinc-300 dark:bg-zinc-700 rounded shadow-lg flex items-center justify-center">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Loading...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAnimeList;