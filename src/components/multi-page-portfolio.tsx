// src/components/multi-page-portfolio.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { Github, ExternalLink, Circle, Menu, X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-2 py-1.5 text-sm transition-colors capitalize w-full text-left
        ${
          isActive
            ? 'text-black dark:text-white'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
        }`}
    >
      {children}
    </Link>
  );
};
// Add these helper functions above your component or within it

const getStatusColor = (status: string) => {
    switch(status) {
      case 'online':
        return 'text-green-500';
      case 'idle':
        return 'text-yellow-500';
      case 'dnd':
        return 'text-red-500';
      case 'offline':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Idle';
      case 'dnd':
        return 'Do Not Disturb';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };
  
// Layout Component
interface LayoutProps {
  children: React.ReactNode;
}

const MultiPagePortfolio: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lanyardData, setLanyardData] = useState<any>(null);
  const discordId = "407922731645009932"; // Your Discord ID

  useEffect(() => {
    const fetchLanyardData = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const data = await response.json();
        if (data.success) {
          setLanyardData(data.data);
          console.log('Lanyard Data:', data.data); // Add this line
        } else {
          console.error('Failed to fetch Lanyard data:', data);
        }
      } catch (error) {
        console.error('Error fetching Lanyard data:', error);
      }
    };
  
    fetchLanyardData();
  
    const interval = setInterval(fetchLanyardData, 60000); // Refresh every 60 seconds
  
    return () => clearInterval(interval);
  }, [discordId]);
  

  // Handle theme on initial load
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 text-zinc-600 dark:text-zinc-400"
        aria-label="Toggle Menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-0 w-64 bg-zinc-50 dark:bg-zinc-900 
        border-r border-zinc-200 dark:border-zinc-800 p-8 
        transform lg:transform-none transition-transform duration-200 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-40
      `}>
        <div className="mb-12">
          <h1 className="text-2xl font-bold dark:text-white">John Doe</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">Software Engineer</p>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { path: '/', label: 'About' },
            { path: '/projects', label: 'Projects' },
            { path: '/stack', label: 'Stack' },
            { path: '/hobbies', label: 'Hobbies' },
            { path: '/blog', label: 'Blog' },
            { path: '/timeline', label: 'Timeline' }
          ].map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle Button */}
        <div className="mt-6">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors rounded-full"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

{/* Discord Status */}
{lanyardData && (
  <div className="py-4 border-t border-zinc-200 dark:border-zinc-800">
    {/* Status Section */}
    <div className="flex items-center gap-2 mb-2">
      {/* Circle Icon with Dynamic Color */}
      <Circle 
        size={8} 
        className={`text-xs ${getStatusColor(lanyardData.discord_status)}`}
      />
      {/* Status Label */}
      <span className="text-xs text-zinc-600 dark:text-zinc-400">
        {getStatusLabel(lanyardData.discord_status)}
      </span>
    </div>
            {/* Activity Section */}
            {lanyardData.activities && lanyardData.activities.length > 0 && (
              <div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {lanyardData.activities[0].name}:   <br />{lanyardData.activities[0].state} <br />
                  {lanyardData.activities[0].details}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default MultiPagePortfolio;
