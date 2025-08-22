'use client';

import React, { useEffect, useState } from 'react';
import { Medal, Video, ExternalLink } from 'lucide-react';
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
  const username = 'rohzzn'; // Your Medal.tv username
  const [clips, setClips] = useState<MedalClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeClip, setActiveClip] = useState<string | null>(null);

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

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Gaming Clips</h2>
      
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
      
      {!loading && clips.length > 0 && (
        <div>
          
          {/* Featured clip (first clip) */}
          {activeClip ? (
            <div className="mb-8">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                <iframe 
                  src={activeClip}
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                  title="Medal.tv Clip"
                  allowFullScreen
                  allow="autoplay"
                />
              </div>
            </div>
          ) : clips[0] && (
            <div className="mb-8">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                <iframe 
                  src={clips[0].embedIframeUrl}
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                  title="Medal.tv Clip"
                  allowFullScreen
                  allow="autoplay"
                />
              </div>
              <div className="mt-4">
                <h4 className="text-base font-medium dark:text-white">{clips[0].contentTitle}</h4>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span>{clips[0].categoryName}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Grid of other clips */}
          {clips.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clips.slice(1).map((clip) => (
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
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <span>{clip.categoryName}</span>
                    </div>
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
