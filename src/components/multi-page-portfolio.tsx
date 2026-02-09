"use client";
import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Menu, X, Gamepad, Music, Loader2, Focus, VolumeX } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SpotifyCurrentlyPlaying from './SpotifyCurrentlyPlaying';
import CommandPalette from './CommandPalette';
import CursorSound from './CursorSound';
import EReaderEasterEgg from "./EReaderEasterEgg";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

interface DiscordActivity {
  name: string;
  state?: string;
  details?: string;
  type: number;
  application_id?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

interface LanyardData {
  spotify?: {
    track_id: string;
    timestamps: {
      start: number;
      end: number;
    };
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: DiscordActivity[];
  discord_user: {
    username: string;
    public_flags: number;
    id: string;
    discriminator: string;
    avatar: string;
  };
}

interface LayoutProps {
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = memo(({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-4 py-3 text-sm sm:text-sm font-medium rounded-md transition-colors capitalize w-full text-left
        ${isActive
          ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        }`}
    >
      {children}
    </Link>
  );
});
NavLink.displayName = 'NavLink';

const getStatusColor = (status: string): string => {
  switch (status) {
    case "online":
      return "#22C55E";
    case "idle":
      return "#F59E0B";
    case "dnd":
      return "#EF4444";
    case "offline":
      return "#6B7280";
    default:
      return "#6B7280";
  }
};

const getActivityIcon = (type: number) => {
  switch (type) {
    case 0:
      return <Gamepad className="w-3 h-3" />;
    case 2:
      return <Music className="w-3 h-3" />;
    default:
      return <Focus className="w-3 h-3" />;
  }
};

const formatElapsedTime = (startTimestamp: number): string => {
  const now = Date.now();
  const elapsed = now - startTimestamp;
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')} elapsed`;
  } else if (minutes > 0) {
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')} elapsed`;
  } else {
    return `${seconds}s elapsed`;
  }
};

const ActivityElapsedTime: React.FC<{ startTimestamp: number }> = memo(({ startTimestamp }) => {
  const [elapsed, setElapsed] = useState(() => formatElapsedTime(startTimestamp));

  useEffect(() => {
    // Update immediately on mount to ensure sync
    setElapsed(formatElapsedTime(startTimestamp));
    
    const interval = setInterval(() => {
      setElapsed(formatElapsedTime(startTimestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTimestamp]);

  return <span>{elapsed}</span>;
});
ActivityElapsedTime.displayName = 'ActivityElapsedTime';

const ActivityIcon: React.FC<{ 
  activity: DiscordActivity;
}> = memo(({ activity }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImagesFailed, setAllImagesFailed] = useState(false);
  const [smallImageError, setSmallImageError] = useState(false);

  // Helper to parse image URL with fallbacks
  const parseImageUrl = (imageHash: string): string[] => {
    const urls: string[] = [];
    
    if (imageHash.startsWith("mp:")) {
      urls.push(`https://media.discordapp.net/${imageHash.replace('mp:', '')}`);
    } else if (imageHash.startsWith("spotify:")) {
      urls.push(`https://i.scdn.co/image/${imageHash.replace('spotify:', '')}`);
    } else if (imageHash.startsWith("attachments://")) {
      urls.push(imageHash.replace("attachments://", "https://cdn.discordapp.com/attachments/"));
    } else if (imageHash.startsWith("external:")) {
      const externalUrl = imageHash.replace("external:", "");
      if (externalUrl.startsWith("//")) {
        urls.push(`https:${externalUrl}`);
      } else if (!externalUrl.startsWith("http")) {
        urls.push(`https://${externalUrl}`);
      } else {
        urls.push(externalUrl);
      }
    } else if (imageHash.startsWith("http://") || imageHash.startsWith("https://")) {
      urls.push(imageHash);
    } else if (activity.application_id) {
      const hasExtension = /\.(png|jpg|jpeg|gif|webp)$/i.test(imageHash);
      if (hasExtension) {
        urls.push(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${imageHash}`);
      } else {
        urls.push(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${imageHash}.png`);
        urls.push(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${imageHash}.webp`);
      }
    }
    return urls;
  };

  // Get small image URL
  const getSmallImageUrl = (): string | null => {
    if (!activity.assets?.small_image) return null;
    const urls = parseImageUrl(activity.assets.small_image);
    return urls[0] || null;
  };

  // Build fallback image URLs for large image
  const getImageUrls = (): string[] => {
    const urls: string[] = [];
    
    if (activity.assets?.large_image) {
      urls.push(...parseImageUrl(activity.assets.large_image));
    }
    
    // Fallback to small image
    if (activity.assets?.small_image) {
      urls.push(...parseImageUrl(activity.assets.small_image));
    }
    
    // Fallback to application icon
    if (activity.application_id) {
      urls.push(`https://dcdn.dstn.to/app-icons/${activity.application_id}`);
      urls.push(`https://cdn.discordapp.com/app-icons/${activity.application_id}/icon.png`);
    }
    
    return urls.filter(url => url && url.length > 0);
  };

  const imageUrls = getImageUrls();
  const currentImageUrl = imageUrls[currentImageIndex];
  const smallImageUrl = getSmallImageUrl();

  const handleImageError = () => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setAllImagesFailed(true);
    }
  };

  // Reset when activity changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setAllImagesFailed(false);
    setSmallImageError(false);
  }, [activity.name, activity.application_id, activity.assets?.large_image, activity.assets?.small_image]);

  if (!currentImageUrl || allImagesFailed || imageUrls.length === 0) {
    return (
      <div className="w-10 h-10 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <Image 
        key={currentImageUrl}
        src={currentImageUrl}
        alt={activity.assets?.large_text || activity.name}
        width={40}
        height={40}
        className="rounded-md object-cover"
        onError={handleImageError}
      />
      {smallImageUrl && !smallImageError && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
          <Image 
            src={smallImageUrl}
            alt={activity.assets?.small_text || ""}
            width={16}
            height={16}
            className="rounded-full object-cover"
            onError={() => setSmallImageError(true)}
          />
        </div>
      )}
    </div>
  );
});
ActivityIcon.displayName = 'ActivityIcon';

const MultiPagePortfolio: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lanyardData, setLanyardData] = useState<LanyardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const discordId = "407922731645009932";
  const pathname = usePathname();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      if (isMenuOpen && sidebar && menuButton && 
          !sidebar.contains(event.target as Node) && 
          !menuButton.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const fetchLanyardData = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        if (!response.ok) throw new Error('Failed to fetch Discord status');
        const data = await response.json();
        if (data.success) {
          setLanyardData(data.data);
        } else {
          throw new Error('Invalid response from Lanyard API');
        }
      } catch (error) {
        console.error("Error fetching Lanyard data:", error);
        setError(error instanceof Error ? error.message : 'Failed to load Discord status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanyardData();
    const interval = setInterval(fetchLanyardData, 60000); // Poll every 60 seconds instead of 30
    return () => clearInterval(interval);
  }, [discordId]);

  // Background music setup
  useEffect(() => {
    try {
      // Create audio element
      const audio = new Audio('/lofi-background.mp3');
      
      // Add event listeners
      audio.addEventListener('loadeddata', () => {
        setAudioLoaded(true);
      });

      audio.addEventListener('error', () => {
        console.error('Audio failed to load');
      });

      // Configure audio
      audio.loop = true;
      audio.volume = 0.7;
      audio.preload = 'auto';

      audioRef.current = audio;

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  // Toggle play/pause for background music
  const togglePlay = useCallback(async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error('Failed to play audio:', error);
            });
          }
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error toggling audio:', error);
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <CommandPalette />
      <CursorSound />
      <EReaderEasterEgg />
      
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <button
        id="menu-button"
        onClick={useCallback(() => setIsMenuOpen(prev => !prev), [])}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 text-zinc-600 dark:text-zinc-400 bg-zinc-50/90 dark:bg-zinc-800/90 rounded-md shadow-md backdrop-blur-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        aria-label="Toggle Menu"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        id="sidebar"
        className={`
          fixed top-0 bottom-0 left-0 w-[280px] sm:w-[300px] lg:w-64 bg-zinc-50/95 dark:bg-zinc-900/95
          border-r border-zinc-200 dark:border-zinc-800 
          flex flex-col h-screen backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          z-40 overflow-y-auto overflow-x-hidden
          safe-area-inset
        `}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 sm:px-5 lg:px-6 overflow-y-auto pb-4 pt-16 sm:pt-20 lg:pt-8">
            <div className="space-y-1">
              {              [
                { path: "/", label: "About" },
                { path: "/projects", label: "Projects" },
                { path: "/writing", label: "Writing" },
                { path: "/hobbies", label: "Hobbies" },
              ].map((item) => (
                <NavLink key={item.path} href={item.path}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="p-4 sm:p-5 lg:p-6 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            ) : error ? (
              <div className="text-xs text-zinc-400 text-center py-2">
                Unable to load status
              </div>
            ) : lanyardData && (
              <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: getStatusColor(lanyardData.discord_status),
                      boxShadow: `0 0 8px ${getStatusColor(lanyardData.discord_status)}`,
                    }}
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">
                    {lanyardData.discord_status === "offline" ? "Away from Keyboard" : lanyardData.discord_status}
                  </span>
                </div>

                <SpotifyCurrentlyPlaying />

                {lanyardData.activities?.length > 0 && 
                 lanyardData.activities.filter(activity => activity.name !== "Spotify").length > 0 && (
                  <div className="space-y-3 w-full mt-2">
                    {lanyardData.activities
                      .filter(activity => activity.name !== "Spotify")
                      .slice(0, 2)
                      .map((activity, index) => (
                      <div
                        key={index}
                          className="w-full"
                      >
                        <div className="flex items-center gap-2">
                            <ActivityIcon activity={activity} />
                            <div className="flex-1">
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 line-clamp-1">
                            {activity.name}
                          </span>
                        {activity.state && (
                                <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                            {activity.state}
                          </p>
                        )}
                        {activity.details && (
                                <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                            {activity.details}
                          </p>
                        )}
                        {activity.timestamps?.start && (
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">
                                  <ActivityElapsedTime startTimestamp={activity.timestamps.start} />
                          </p>
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
        </div>
      </div>

      <main className="flex-1 lg:pl-64 w-full">
        <div className="max-w-full w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 pt-16 lg:pt-6 sm:pt-16 lg:py-8">
          {children}
        </div>
      </main>
      
      {/* Bottom Controls - Hidden on mobile */}
      <div className="hidden md:flex fixed bottom-4 right-4 z-40 flex-row items-center space-x-3">
        <Link 
          href="/focus"
          className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
          aria-label="Focus mode"
        >
          <Focus className="w-3.5 h-3.5" />
        </Link>
        
        <button
          onClick={togglePlay}
          disabled={!audioLoaded}
          className={`flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 ${!audioLoaded ? 'opacity-50' : ''}`}
          aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
        >
          {isPlaying ? (
            <Music className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      

    </div>
  );
};

export default MultiPagePortfolio;