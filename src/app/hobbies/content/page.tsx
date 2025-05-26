"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Calendar, Play, Eye, ThumbsUp, MessageCircle, X, Wifi, Clock } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  description: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  isStream?: boolean;
  actualStartTime?: string;
  scheduledStartTime?: string;
  concurrentViewers?: string;
}

interface YouTubeData {
  videos: YouTubeVideo[];
  liveStreams: YouTubeVideo[];
  completedStreams: YouTubeVideo[];
}

export default function ContentPage() {
  const [data, setData] = useState<YouTubeData>({
    videos: [],
    liveStreams: [],
    completedStreams: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [activeTab, setActiveTab] = useState<'videos' | 'streams'>('videos');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/youtube');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch videos');
        }
        
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCount = (count: string) => {
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const playVideo = (videoId: string) => {
    setCurrentVideoId(videoId);
    setShowPlayer(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closePlayer = () => {
    setShowPlayer(false);
    document.body.style.overflow = 'auto';
  };

  // Get the latest video and the rest
  const latestVideo = data.videos.length > 0 ? data.videos[0] : null;
  const remainingVideos = data.videos.length > 0 ? data.videos.slice(1) : [];

  return (
    <div className="max-w-4xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Content</h2>
      
      {/* Tabs for videos and streams */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'videos'
                ? 'border-b-2 border-red-500 text-zinc-900 dark:text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setActiveTab('streams')}
            className={`pb-2 px-1 text-sm font-medium transition-colors flex items-center ${
              activeTab === 'streams'
                ? 'border-b-2 border-red-500 text-zinc-900 dark:text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 mr-1" />
            Streams {data.liveStreams.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-2">LIVE</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Video Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={closePlayer}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none"
              aria-label="Close video player"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-2">
            Falling back to embedded player...
          </p>
          <div className="mt-6 relative aspect-[16/9] w-full rounded-lg overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed?listType=user_uploads&list=UCIal5uyyIBPUFq5rLkhLqjg"
              title="YouTube videos"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {!isLoading && !error && activeTab === 'videos' && (
        <div className="space-y-8">
          {latestVideo && (
            <>
              {/* Featured latest video */}
              <div className="mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-2/5 aspect-video group">
                    <Image
                      src={latestVideo.thumbnail}
                      alt={latestVideo.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => playVideo(latestVideo.id)}
                        className="bg-red-600 text-white rounded-full p-3 transform hover:scale-110 transition-transform"
                        aria-label={`Play ${latestVideo.title}`}
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                      Latest
                    </div>
                  </div>
                  <div className="p-4 md:w-3/5">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      {latestVideo.title}
                    </h3>
                    <div className="flex flex-wrap items-center text-zinc-500 dark:text-zinc-400 text-xs mb-3 gap-x-3 gap-y-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(latestVideo.publishedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>{formatCount(latestVideo.viewCount)} views</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <span>{formatCount(latestVideo.likeCount)}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        <span>{formatCount(latestVideo.commentCount)}</span>
                      </div>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 text-xs line-clamp-2 mb-3">
                      {latestVideo.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => playVideo(latestVideo.id)}
                        className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Watch Here
                      </button>
                      <a
                        href={`https://www.youtube.com/watch?v=${latestVideo.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-zinc-600 px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        Watch on YouTube
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* More videos heading */}
          {remainingVideos.length > 0 && (
            <h3 className="text-base font-medium mb-3 dark:text-white border-b border-zinc-200 dark:border-zinc-700 pb-2">
              More Videos
            </h3>
          )}

          {/* Grid of remaining videos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {remainingVideos.map((video) => (
              <a
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors h-full flex flex-col shadow-sm">
                  <div className="relative aspect-video">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-red-600 text-white rounded-full p-2">
                        <Play className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {formatCount(video.viewCount)}
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 text-sm group-hover:text-zinc-700 dark:group-hover:text-white transition-colors mb-1">
                      {video.title}
                    </h3>
                    <div className="flex justify-between items-center mt-auto">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(video.publishedAt)}
                      </p>
                      <div className="flex text-xs text-zinc-500 dark:text-zinc-400 space-x-2">
                        <span className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {formatCount(video.likeCount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Streams Tab Content */}
      {!isLoading && !error && activeTab === 'streams' && (
        <div className="space-y-8">
          {/* Live streams section */}
          {data.liveStreams.length > 0 && (
            <div className="mb-8">
              <h3 className="text-base font-medium mb-4 dark:text-white border-b border-zinc-200 dark:border-zinc-700 pb-2 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                Live Now
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {data.liveStreams.map((stream) => (
                  <a
                    key={stream.id}
                    href={`https://www.youtube.com/watch?v=${stream.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex flex-col md:flex-row shadow-md border-l-4 border-red-500">
                      <div className="relative md:w-1/3">
                        <div className="aspect-video relative">
                          <Image
                            src={stream.thumbnail}
                            alt={stream.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            <span className="w-2 h-2 bg-white rounded-full mr-1 animate-ping"></span>
                            <span>LIVE</span>
                          </div>
                          {stream.concurrentViewers && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {formatCount(stream.concurrentViewers)} watching
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-white transition-colors mb-2">
                            {stream.title}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
                            {stream.description}
                          </p>
                        </div>
                        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Started {formatDate(stream.actualStartTime || '')}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Past streams section */}
          {data.completedStreams.length > 0 && (
            <div>
              <h3 className="text-base font-medium mb-4 dark:text-white border-b border-zinc-200 dark:border-zinc-700 pb-2">
                Past Streams
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.completedStreams.map((stream) => (
                  <a
                    key={stream.id}
                    href={`https://www.youtube.com/watch?v=${stream.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors h-full flex flex-col shadow-sm">
                      <div className="relative aspect-video">
                        <Image
                          src={stream.thumbnail}
                          alt={stream.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>PAST STREAM</span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {formatCount(stream.viewCount)}
                        </div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 text-sm group-hover:text-zinc-700 dark:group-hover:text-white transition-colors mb-1">
                          {stream.title}
                        </h3>
                        <div className="flex justify-between items-center mt-auto">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatDate(stream.publishedAt)}
                          </p>
                          <div className="flex text-xs text-zinc-500 dark:text-zinc-400 space-x-2">
                            <span className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {formatCount(stream.likeCount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* No streams message */}
          {data.liveStreams.length === 0 && data.completedStreams.length === 0 && (
            <div className="text-center py-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Wifi className="h-10 w-10 mx-auto text-zinc-400 dark:text-zinc-500 mb-3" />
              <h3 className="text-zinc-700 dark:text-zinc-300 font-medium mb-1">No streams found</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Check back later for live or past streams
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 