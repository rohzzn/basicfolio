"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, Gamepad, Music, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IPadCursor from './IPadCursor';
import BackgroundMusic from './BackgroundMusic';

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
      className={`block px-2 py-1.5 text-sm transition-colors capitalize w-full text-left
        ${isActive
          ? "text-black dark:text-white"
          : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
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

const formatTime = (timestamp: number): string => {
  const minutes = Math.floor(timestamp / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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

const MultiPagePortfolio: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lanyardData, setLanyardData] = useState<LanyardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
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
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        id="sidebar"
        className={`
          fixed lg:fixed top-0 bottom-0 w-[280px] sm:w-64 bg-zinc-50/95 dark:bg-zinc-900/95
          border-r border-zinc-200 dark:border-zinc-800 
          flex flex-col h-screen backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          z-40
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-8">
            <h1 className="text-2xl font-bold dark:text-white">Rohan</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">Software Engineer</p>
          </div>

          <nav className="flex-1 px-8 overflow-y-auto">
            <div className="space-y-1">
              {[
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

          <div className="p-8 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              </div>
            ) : error ? (
              <div className="text-xs text-zinc-400 text-center py-2">
                Unable to load status
              </div>
            ) : lanyardData && (
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: getStatusColor(lanyardData.discord_status),
                      boxShadow: `0 0 8px ${getStatusColor(lanyardData.discord_status)}`,
                    }}
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">
                    {lanyardData.discord_status}
                  </span>
                </div>

                {lanyardData.activities?.length > 0 && (
                  <div className="space-y-2 w-full">
                    {lanyardData.activities.map((activity, index) => (
                      <div
                        key={index}
                        className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-2 w-full"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getActivityIcon(activity.type)}
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {activity.name}
                          </span>
                        </div>
                        {activity.state && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {activity.state}
                          </p>
                        )}
                        {activity.details && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {activity.details}
                          </p>
                        )}
                        {activity.timestamps?.start && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                            {formatTime(Date.now() - activity.timestamps.start)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      
      <IPadCursor />
      <BackgroundMusic />
    </div>
  );
};

export default MultiPagePortfolio;