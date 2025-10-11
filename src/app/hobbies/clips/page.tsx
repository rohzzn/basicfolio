'use client';

import React, { useEffect, useState } from 'react';
import { Video, Play, Calendar, X } from 'lucide-react';
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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<MedalClip | null>(null);

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

  const openVideoModal = (clip: MedalClip) => {
    setCurrentVideo(clip);
    setShowVideoModal(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setCurrentVideo(null);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showVideoModal) {
        closeVideoModal();
      }
    };

    if (showVideoModal) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [showVideoModal]);

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
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold dark:text-white mb-2">Gaming Clips</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {!loading && clips.length > 0 && (
                <>Showing {filteredClips.length} of {clips.length} clips</>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {filterOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border ${
                  activeFilter === option.id 
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span>{option.label}</span>
                {option.id !== 'all' && activeFilter === option.id && (
                  <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full">
                    {filteredClips.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="flex flex-col justify-center items-center h-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-300"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading clips...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Unable to load clips</h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">
            There was an issue connecting to Medal.tv. This could be due to API rate limits or temporary server issues.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-medium px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      
      {!loading && !error && clips.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
          <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">No clips found</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Check back later for new gaming highlights!</p>
        </div>
      )}
      
      {!loading && !error && clips.length > 0 && filteredClips.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
          <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">No clips match the selected filter</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Try a different filter or view all clips</p>
          <button 
            onClick={() => setActiveFilter('all')}
            className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium"
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
              <div
                key={clip.contentId}
                onClick={() => openVideoModal(clip)}
                className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={clip.contentThumbnail}
                    alt={clip.contentTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/70 rounded-full p-4">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                  {clip.videoLengthSeconds > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs text-white font-medium">
                      {formatDuration(clip.videoLengthSeconds)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2 leading-relaxed" title={clip.contentTitle}>
                    {clip.contentTitle}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(clip.createdTimestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {clip.contentViews > 0 && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {clip.contentViews.toLocaleString()} views
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && currentVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-4">
                {currentVideo.contentTitle}
              </h3>
              <button
                onClick={closeVideoModal}
                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Video Container */}
            <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
              {currentVideo.embedIframeUrl ? (
                <iframe
                  src={currentVideo.embedIframeUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  title={currentVideo.contentTitle}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Video className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                    <p className="text-zinc-600 dark:text-zinc-400">Video not available for embedding</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(currentVideo.createdTimestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {currentVideo.videoLengthSeconds > 0 && (
                    <div>Duration: {formatDuration(currentVideo.videoLengthSeconds)}</div>
                  )}
                </div>
                {currentVideo.contentViews > 0 && (
                  <div>{currentVideo.contentViews.toLocaleString()} views</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
