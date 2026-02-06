"use client";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Gamepad, Music, Loader2, Volume2, VolumeX, Focus, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SpotifyCurrentlyPlaying from './SpotifyCurrentlyPlaying';
import CommandPalette from './CommandPalette';
import CursorSound from './CursorSound';
import WeatherIcon from './WeatherIcon';
import DigitalClock from './Clock';
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

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-3 py-2.5 text-sm font-medium rounded-md transition-colors capitalize w-full text-left
        ${isActive
          ? "bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        }`}
    >
      {children}
    </Link>
  );
};

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
      return <Clock className="w-3 h-3" />;
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

const ActivityElapsedTime: React.FC<{ startTimestamp: number }> = ({ startTimestamp }) => {
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
};

const ActivityIcon: React.FC<{ 
  activity: DiscordActivity;
}> = ({ activity }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImagesFailed, setAllImagesFailed] = useState(false);

  // Build fallback image URLs in priority order
  const getImageUrls = (): string[] => {
    const urls: string[] = [];
    
    // Priority 1: Large image from assets
    if (activity.assets?.large_image) {
      const largeImg = activity.assets.large_image;
      
      if (largeImg.startsWith("mp:")) {
        urls.push(`https://media.discordapp.net/${largeImg.replace('mp:', '')}`);
      } else if (largeImg.startsWith("spotify:")) {
        urls.push(`https://i.scdn.co/image/${largeImg.replace('spotify:', '')}`);
      } else if (largeImg.startsWith("attachments://")) {
        urls.push(largeImg.replace("attachments://", "https://cdn.discordapp.com/attachments/"));
      } else if (largeImg.startsWith("external:")) {
        const externalUrl = largeImg.replace("external:", "");
        // Ensure it has a protocol
        if (externalUrl.startsWith("//")) {
          urls.push(`https:${externalUrl}`);
        } else if (!externalUrl.startsWith("http")) {
          urls.push(`https://${externalUrl}`);
        } else {
          urls.push(externalUrl);
        }
      } else if (largeImg.startsWith("http://") || largeImg.startsWith("https://")) {
        urls.push(largeImg);
      } else if (activity.application_id) {
        const hasExtension = /\.(png|jpg|jpeg|gif|webp)$/i.test(largeImg);
        
        if (hasExtension) {
          // Already has extension, use as-is
          urls.push(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImg}`);
        } else {
          // Try different extensions
          urls.push(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImg}.png`);
          urls.push(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImg}.webp`);
          urls.push(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImg}.jpg`);
        }
      }
    }
    
    // Priority 2: Small image from assets as backup
    if (activity.assets?.small_image && activity.application_id) {
      const smallImg = activity.assets.small_image;
      if (!smallImg.startsWith("mp:") && !smallImg.startsWith("spotify:") && !smallImg.startsWith("external:")) {
        urls.push(`https://cdn.discordapp.com/app-assets/${activity.application_id}/${smallImg}.png`);
      }
    }
    
    // Priority 3: Application icon from Discord
    if (activity.application_id) {
      urls.push(`https://dcdn.dstn.to/app-icons/${activity.application_id}`);
      urls.push(`https://cdn.discordapp.com/app-icons/${activity.application_id}/icon.png`);
    }
    
    return urls.filter(url => url && url.length > 0);
  };

  const imageUrls = getImageUrls();
  const currentImageUrl = imageUrls[currentImageIndex];

  const handleImageError = () => {
    if (currentImageIndex < imageUrls.length - 1) {
      // Try next fallback URL
      setCurrentImageIndex(prev => prev + 1);
    } else {
      // All images failed, show icon fallback
      setAllImagesFailed(true);
    }
  };

  // Reset when activity changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setAllImagesFailed(false);
  }, [activity.name, activity.application_id, activity.assets?.large_image]);

  if (!currentImageUrl || allImagesFailed || imageUrls.length === 0) {
    return (
      <div className="w-10 h-10 rounded-md bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
    );
  }

  return (
    <Image 
      key={currentImageUrl} // Force remount on URL change
      src={currentImageUrl}
      alt={activity.assets?.large_text || activity.name}
      width={40}
      height={40}
      className="rounded-md object-cover flex-shrink-0"
      unoptimized
      onError={handleImageError}
    />
  );
};

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
    const interval = setInterval(fetchLanyardData, 30000);
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
  const togglePlay = async () => {
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
  };

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
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 text-zinc-600 dark:text-zinc-400 bg-zinc-50/90 dark:bg-zinc-800/90 rounded-md shadow-md backdrop-blur-sm"
        aria-label="Toggle Menu"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        id="sidebar"
        className={`
          fixed lg:fixed top-0 bottom-0 w-[85vw] max-w-[260px] sm:w-64 bg-zinc-50/95 dark:bg-zinc-900/95
          border-r border-zinc-200 dark:border-zinc-800 
          flex flex-col h-screen backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          z-40 overflow-y-auto
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold dark:text-white">Rohan</h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">Software Engineer</p>
          </div>

          <nav className="flex-1 px-4 sm:px-6 lg:px-8 overflow-y-auto pb-4">
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

          <div className="p-4 sm:p-6 lg:p-8 border-t border-zinc-200 dark:border-zinc-800">
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
        <div className="max-w-full w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8">
          {children}
        </div>
      </main>
      
      {/* Bottom Controls */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-row items-center space-x-3">
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
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>
        
        <div className="pl-2 border-l border-zinc-200 dark:border-zinc-700">
          <WeatherIcon />
        </div>
        
        <div>
          <DigitalClock />
        </div>
      </div>
      

    </div>
  );
};

export default MultiPagePortfolio;