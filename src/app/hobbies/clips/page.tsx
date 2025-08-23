'use client';

import React, { useEffect, useState } from 'react';
import { Video, ExternalLink } from 'lucide-react';
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
  const [activeClip, setActiveClip] = useState<string | null>(null);
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
    
    // Reset active clip if it's not in the filtered clips
    if (activeClip && !filtered.some(clip => clip.embedIframeUrl === activeClip)) {
      setActiveClip(filtered.length > 0 ? filtered[0].embedIframeUrl : null);
    }
  }, [activeFilter, clips, activeClip]);

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
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeFilter === option.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {option.label}
              {option.id !== 'all' && activeFilter === option.id && filteredClips.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {filteredClips.length}
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
        <div className="bg-yellow-50 dark:bg-zinc-800 p-4 rounded-lg mb-6">
          <p className="text-yellow-800 dark:text-yellow-400">{error}</p>
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Show All Clips
          </button>
        </div>
      )}
      
      {!loading && filteredClips.length > 0 && (
        <div>
          
          {/* Featured clip */}
          <div className="mb-8">
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              <iframe 
                src={activeClip || (filteredClips[0] && filteredClips[0].embedIframeUrl)}
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
                title="Medal.tv Clip"
                allowFullScreen
                allow="autoplay"
              />
            </div>
            <div className="mt-4 flex justify-between items-start">
              <div>
                <h4 className="text-base font-medium dark:text-white">
                  {activeClip 
                    ? clips.find(clip => clip.embedIframeUrl === activeClip)?.contentTitle 
                    : filteredClips[0]?.contentTitle}
                </h4>
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                  {activeClip 
                    ? new Date(clips.find(clip => clip.embedIframeUrl === activeClip)?.createdTimestamp || 0).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : new Date(filteredClips[0]?.createdTimestamp || 0).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                </div>
              </div>
              {activeClip && (
                <button 
                  onClick={() => setActiveClip(null)}
                  className="text-xs font-medium px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-800 dark:text-zinc-200"
                >
                  Back to Latest
                </button>
              )}
            </div>
          </div>
          
          {/* Grid of other clips */}
          {filteredClips.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClips.slice(1).map((clip) => (
                <div 
                  key={clip.contentId} 
                  className="flex flex-col rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  onClick={() => setActiveClip(clip.embedIframeUrl)}
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={clip.contentThumbnail}
                      alt={clip.contentTitle}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    {clip.videoLengthSeconds > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white">
                        {formatDuration(clip.videoLengthSeconds)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-zinc-800 dark:text-white truncate" title={clip.contentTitle}>
                      {clip.contentTitle}
                    </h3>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {new Date(clip.createdTimestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {clip.directClipUrl && (
                        <Link 
                          href={clip.directClipUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="mr-1">View on Medal</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
