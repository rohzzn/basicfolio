'use client';

import React, { useEffect, useState } from 'react';
import { Video, Play, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MedalClip {
  contentId: string;
  contentTitle: string;
  contentViews: number;
  contentThumbnail: string;
  embedIframeUrl: string;
  createdTimestamp: number;
  categoryId: number;
  categoryName: string;
  directClipUrl: string;
  videoLengthSeconds: number;
}

export default function ClipsPage() {
  const [clips, setClips] = useState<MedalClip[]>([]);
  const [filteredClips, setFilteredClips] = useState<MedalClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Filter clips based on the active filter
  useEffect(() => {
    if (clips.length === 0) return;
    
    if (activeFilter === "all") {
      setFilteredClips(clips);
      return;
    }
    
    const filtered = clips.filter(clip => {
      const title = clip.contentTitle.toLowerCase();
      
      switch(activeFilter) {
        case "2k":
          return title.includes("2k") || title.includes(" 2 ") || title.includes("double") || title.includes("2 kill");
        case "3k":
          return title.includes("3k") || title.includes(" 3 ") || title.includes("triple") || title.includes("3 kill");
        case "4k":
          return title.includes("4k") || title.includes(" 4 ") || title.includes("quad") || title.includes("4 kill");
        case "5k":
          return title.includes("5k") || title.includes(" 5 ") || title.includes("penta") || 
                 title.includes("ace") || title.includes("5 kill") || title.includes("pentakill");
        case "other":
          // Check if title doesn't contain any of the number patterns
          const hasNumberPattern = /\b[1-5]k\b|\b[1-5] kill|\b[1-5]\b|single|double|triple|quad|penta|ace/.test(title);
          return !hasNumberPattern;
        default:
          return true;
      }
    });
    
    setFilteredClips(filtered);
  }, [activeFilter, clips]);

  useEffect(() => {
    const fetchClips = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/medal');
        
        if (!response.ok) {
          throw new Error('Failed to fetch clips');
        }
        
        const data = await response.json();
        setClips(data.clips);
        setFilteredClips(data.clips);
      } catch (err) {
        setError('Failed to load clips. Please try again later.');
        console.error('Error fetching clips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClips();
  }, []);


  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Filter options
  const filterOptions = [
    { id: "all", label: "All Clips" },
    { id: "2k", label: "2 Kills" },
    { id: "3k", label: "3 Kills" },
    { id: "4k", label: "4 Kills" },
    { id: "5k", label: "Ace" },
    { id: "other", label: "Others" }
  ];

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-lg font-medium dark:text-white">Gaming Clips</h2>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {filterOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setActiveFilter(option.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeFilter === option.id 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span>{option.label}</span>
              {option.id !== 'all' && activeFilter === option.id && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  ({filteredClips.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-300"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Video className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">Unable to load clips</h3>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            There was an issue connecting to Medal.tv. This could be due to API rate limits or temporary server issues.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs font-medium px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      
      {!loading && !error && clips.length === 0 && (
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-8 text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
          <p className="text-zinc-600 dark:text-zinc-400">No clips found</p>
        </div>
      )}
      
      {!loading && !error && clips.length > 0 && filteredClips.length === 0 && (
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-8 text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-500" />
          <p className="text-zinc-600 dark:text-zinc-400">No clips match the selected filter</p>
          <button 
            onClick={() => setActiveFilter('all')}
            className="mt-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Show All Clips
          </button>
        </div>
      )}
      
      {!loading && filteredClips.length > 0 && (
        <div className="space-y-8">
          
          {/* Clips grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip) => (
              <Link
                key={clip.contentId}
                href={clip.directClipUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
              >
                <div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-700">
                  <Image
                    src={clip.contentThumbnail}
                    alt={clip.contentTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-black/70 rounded-full p-4">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                  {clip.videoLengthSeconds > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
                      {formatDuration(clip.videoLengthSeconds)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white mb-2 line-clamp-2" title={clip.contentTitle}>
                    {clip.contentTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(clip.createdTimestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
