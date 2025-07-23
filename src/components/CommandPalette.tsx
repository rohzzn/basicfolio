import React, { useEffect, useState, useMemo } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import './CommandPalette.css';
import {
  Search,
  FileText,
  Laptop,
  User,
  Clock,
  Bookmark,
  Code,
  Music,
  Gamepad2,
  Film,
  BookOpen,
  PenTool,
  Keyboard,
  Activity,
  Youtube,
  Link2,
  Home,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Moon,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  History
} from 'lucide-react';

interface CommandPaletteProps {
  links?: {
    title: string;
    href: string;
    icon?: React.ReactNode;
    keywords?: string[];
    shortcut?: string;
  }[];
}

const defaultLinks = [
  { title: 'Home', href: '/', icon: <Home className="w-4 h-4" />, keywords: ['about', 'main', 'index'] },
  { title: 'Projects', href: '/projects', icon: <Code className="w-4 h-4" />, keywords: ['work', 'portfolio', 'code'] },
  { title: 'Writing', href: '/writing', icon: <FileText className="w-4 h-4" />, keywords: ['blog', 'articles', 'posts'] },
  { title: 'Links', href: '/links', icon: <Link2 className="w-4 h-4" />, keywords: ['social', 'contact', 'networks'] },
  { title: 'Timeline', href: '/timeline', icon: <Clock className="w-4 h-4" />, keywords: ['history', 'experience'] },
  { title: 'Resume', href: '/stack', icon: <Laptop className="w-4 h-4" />, keywords: ['technology', 'tools'] },
  { title: 'Focus', href: '/focus', icon: <Clock className="w-4 h-4" />, keywords: ['pomodoro', 'timer'], shortcut: 'F' },
  // Hobby pages
  { title: 'Activities', href: '/hobbies/strava', icon: <Activity className="w-4 h-4" />, keywords: ['strava', 'workout', 'running'] },
  { title: 'Anime', href: '/hobbies/myanimelist', icon: <Film className="w-4 h-4" />, keywords: ['myanimelist', 'anime', 'shows'] },
  { title: 'Books', href: '/hobbies/readings', icon: <BookOpen className="w-4 h-4" />, keywords: ['reading', 'books', 'literature'] },
  { title: 'Content', href: '/hobbies/content', icon: <Youtube className="w-4 h-4" />, keywords: ['youtube', 'videos', 'content'] },
  { title: 'Designs', href: '/hobbies/art', icon: <PenTool className="w-4 h-4" />, keywords: ['art', 'design', 'creative'] },
  { title: 'Gaming', href: '/hobbies/games', icon: <Gamepad2 className="w-4 h-4" />, keywords: ['games', 'gaming', 'steam'] },
  { title: 'Hackathons', href: '/hobbies/hackathons', icon: <Code className="w-4 h-4" />, keywords: ['hackathon', 'competition', 'coding'] },
  { title: 'Music', href: '/hobbies/music', icon: <Music className="w-4 h-4" />, keywords: ['songs', 'playlist', 'spotify'] },
  { title: 'Setup', href: '/hobbies/uses', icon: <Laptop className="w-4 h-4" />, keywords: ['setup', 'workspace', 'tools'] },
  { title: 'Typing', href: '/hobbies/typing', icon: <Keyboard className="w-4 h-4" />, keywords: ['typing', 'speed', 'test'] },
  { title: 'About', href: '/about', icon: <User className="w-4 h-4" />, keywords: ['profile', 'bio', 'personal'] },
  { title: 'Guestbook', href: '/guestbook', icon: <Bookmark className="w-4 h-4" />, keywords: ['comments', 'visitor', 'messages'] },
];

interface QuickLink {
  title: string;
  keywords?: string[];
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
  children?: QuickLink[];
}

const quickLinks: QuickLink[] = [
  { 
    title: 'Toggle Dark Mode', 
    keywords: ['theme', 'light', 'dark', 'switch'],
    icon: <Moon className="w-4 h-4" />, 
    action: () => {
      document.documentElement.classList.toggle('dark');
      // Save preference
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  },
  { 
    title: 'GitHub', 
    keywords: ['code', 'repo', 'git', 'source'],
    icon: <Github className="w-4 h-4" />, 
    href: 'https://github.com/rohzzn' 
  },
  { 
    title: 'Twitter', 
    keywords: ['social', 'tweet', 'x'],
    icon: <Twitter className="w-4 h-4" />, 
    href: 'https://twitter.com/rohzzn' 
  },
  { 
    title: 'LinkedIn', 
    keywords: ['job', 'work', 'professional', 'career'],
    icon: <Linkedin className="w-4 h-4" />, 
    href: 'https://linkedin.com/in/rohzzn' 
  },
  { 
    title: 'Instagram', 
    keywords: ['social', 'photos', 'pictures'],
    icon: <Instagram className="w-4 h-4" />, 
    href: 'https://instagram.com/rohzzn' 
  }
];

// Create a new type for recent commands
interface RecentCommand {
  title: string;
  type: 'link' | 'action';
  timestamp: number;
}

export default function CommandPalette({ links = defaultLinks }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const [recentCommands, setRecentCommands] = useState<RecentCommand[]>([]);
  
  const allItems = useMemo(() => {
    return [...links, ...quickLinks];
  }, [links]);

  // Load recent commands from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRecents = localStorage.getItem('commandPaletteRecents');
      if (savedRecents) {
        try {
          setRecentCommands(JSON.parse(savedRecents));
        } catch (e) {
          console.error('Failed to parse recent commands', e);
        }
      }
    }
  }, []);

  // Custom filter function for better search results
  const customFilter = (value: string, search: string, keywords?: string[]) => {
    if (!search) return 1;
    
    // Create a search score based on different factors
    let score = 0;
    const normalizedValue = value.toLowerCase();
    const normalizedSearch = search.toLowerCase();
    
    // Direct matches get highest score
    if (normalizedValue === normalizedSearch) return 2;
    
    // Starting with the search term gets high score
    if (normalizedValue.startsWith(normalizedSearch)) {
      score += 1.5;
    }
    
    // Contains the search term gets medium score
    if (normalizedValue.includes(normalizedSearch)) {
      score += 1;
    }
    
    // Check keywords for matches
    if (keywords && keywords.length) {
      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase();
        if (normalizedKeyword === normalizedSearch) {
          score += 1;
        } else if (normalizedKeyword.startsWith(normalizedSearch)) {
          score += 0.8;
        } else if (normalizedKeyword.includes(normalizedSearch)) {
          score += 0.5;
        }
      }
    }
    
    return score;
  };

  // Save a command to recent history
  const saveToRecents = (title: string, type: 'link' | 'action') => {
    const newRecent: RecentCommand = {
      title,
      type,
      timestamp: Date.now()
    };
    
    // Add to recents, keeping only the most recent 5 unique commands
    setRecentCommands(prev => {
      // Filter out any existing entry with the same title
      const filtered = prev.filter(item => item.title !== title);
      // Add new entry at the beginning
      const updated = [newRecent, ...filtered].slice(0, 5);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('commandPaletteRecents', JSON.stringify(updated));
      }
      
      return updated;
    });
  };

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      } else if (e.key === 'Escape') {
        if (pages.length > 0) {
          setPages(pages.slice(0, -1));
          return;
        }
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [pages]);

  useEffect(() => {
    // Reset input value when dialog opens/closes
    if (!open) {
      setTimeout(() => {
        setInputValue('');
        setPages([]);
      }, 200);
    }
  }, [open]);

  const isMac = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return navigator.platform.toLowerCase().includes('mac');
  }, []);

  const handleSelect = (value: string) => {
    const item = allItems.find((item) => 
      item.title === value || 
      (item.keywords && item.keywords.some(k => k === value))
    );
    
    if (!item) return;
    
    // If item has children, navigate to that page
    if ('children' in item && item.children && item.children.length > 0) {
      setPages([...pages, item.title]);
      setInputValue('');
      return;
    }
    
    // Save to recent commands
    const commandType = 'href' in item ? 'link' : 'action';
    saveToRecents(item.title, commandType);
    
    if ('href' in item && item.href) {
      if (item.href.startsWith('http')) {
        window.open(item.href, '_blank');
      } else {
        router.push(item.href);
      }
      setOpen(false);
    } else if ('action' in item && typeof item.action === 'function') {
      item.action();
      setOpen(false);
    }
  };

  const getCurrentItems = () => {
    if (pages.length === 0) {
      return allItems;
    }

    // Navigate through the pages
    let current = [...allItems];
    
    for (const page of pages) {
      const parentItem = current.find(item => item.title === page);
      if (parentItem && 'children' in parentItem && parentItem.children) {
        current = parentItem.children;
      } else {
        return [];
      }
    }
    
    return current;
  };

  // Get recent items with their full details
  const getRecentItems = () => {
    return recentCommands
      .map(recent => {
        const item = allItems.find(item => item.title === recent.title);
        return item ? { ...item, timestamp: recent.timestamp } : null;
      })
      .filter(Boolean) as Array<(typeof allItems[0] & { timestamp: number })>;
  };

  const currentItems = getCurrentItems();
  const recentItems = getRecentItems();
  const currentPageTitle = pages.length > 0 ? pages[pages.length - 1] : null;
  
  const goBack = () => {
    setPages(prev => prev.slice(0, -1));
    setInputValue('');
  };

  return (
    <>
      <kbd
        className="fixed right-4 top-4 hidden h-6 items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 font-mono text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 md:flex"
        onClick={() => setOpen(true)}
      >
        {isMac ? (
          <>
            <span className="text-xs">⌘</span>K
          </>
        ) : (
          <>
            <span className="text-xs">Ctrl</span>K
          </>
        )}
      </kbd>

      {open && (
        <div
          className="fixed inset-0 bg-zinc-900/30 backdrop-blur-[1px] z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command Menu"
        filter={customFilter}
        className="fixed top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-[600px] bg-zinc-100 dark:bg-zinc-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50 transition-all"
      >
        <div className="border-b border-zinc-200 dark:border-zinc-700 flex items-center px-3">
          {pages.length > 0 && (
            <button 
              onClick={goBack} 
              className="flex items-center mr-2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Search className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" />
          <Command.Input
            value={inputValue}
            onValueChange={setInputValue}
            placeholder={currentPageTitle ? `Search in ${currentPageTitle}...` : "Search pages, features, navigation..."}
            className="w-full h-12 bg-transparent text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 outline-none"
          />
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          <Command.Empty className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center">
            <Sparkles className="w-5 h-5 mb-2 text-zinc-400 dark:text-zinc-500" />
            <p>No results found for &ldquo;{inputValue}&rdquo;</p>
          </Command.Empty>

          {pages.length === 0 ? (
            <>
              {recentItems.length > 0 && !inputValue && (
                <>
                  <Command.Group heading="Recent" className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 pb-1 pt-2">
                    {recentItems.map((item, index) => (
                      <Command.Item
                        key={`recent-${index}`}
                        value={`${item.title} ${item.keywords?.join(' ')}`}
                        onSelect={() => handleSelect(item.title)}
                        className="flex items-center justify-between gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 aria-selected:bg-zinc-200 dark:aria-selected:bg-zinc-700 aria-selected:!text-zinc-900 dark:aria-selected:!text-zinc-100"
                      >
                        <div className="flex items-center gap-2">
                          {item.icon || <History className="w-4 h-4" />}
                          <span>{item.title}</span>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                  <Command.Separator className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />
                </>
              )}

              <Command.Group heading="Pages" className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 pb-1 pt-2">
                {links.map((link) => (
                  <Command.Item
                    key={link.href}
                    value={`${link.title} ${link.keywords?.join(' ')}`}
                    onSelect={() => handleSelect(link.title)}
                    className="flex items-center justify-between gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 aria-selected:bg-zinc-200 dark:aria-selected:bg-zinc-700 aria-selected:!text-zinc-900 dark:aria-selected:!text-zinc-100"
                  >
                    <div className="flex items-center gap-2">
                      {link.icon || <div className="w-4 h-4" />}
                      <span>{link.title}</span>
                    </div>

                    {link.shortcut && (
                      <kbd className="bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 text-xs rounded">
                        {link.shortcut}
                      </kbd>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Separator className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />

              <Command.Group heading="Actions" className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 pb-1 pt-2">
                {quickLinks.map((item, index) => (
                  <Command.Item
                    key={index}
                    value={`${item.title} ${item.keywords?.join(' ')}`}
                    onSelect={() => handleSelect(item.title)}
                    className="flex items-center justify-between gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 aria-selected:bg-zinc-200 dark:aria-selected:bg-zinc-700 aria-selected:!text-zinc-900 dark:aria-selected:!text-zinc-100"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon || <div className="w-4 h-4" />}
                      <span>{item.title}</span>
                    </div>
                    
                    {item.children && item.children.length > 0 && (
                      <ChevronRight className="w-3 h-3 text-zinc-400" />
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            </>
          ) : (
            <Command.Group heading={currentPageTitle || 'Items'} className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2 pb-1 pt-2">
              {currentItems.map((item, index) => (
                <Command.Item
                  key={index}
                  value={`${item.title} ${item.keywords?.join(' ')}`}
                  onSelect={() => handleSelect(item.title)}
                  className="flex items-center justify-between gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 aria-selected:bg-zinc-200 dark:aria-selected:bg-zinc-700 aria-selected:!text-zinc-900 dark:aria-selected:!text-zinc-100"
                >
                  <div className="flex items-center gap-2">
                    {item.icon || <div className="w-4 h-4" />}
                    <span>{item.title}</span>
                  </div>
                  
                  {('children' in item && item.children && item.children.length > 0) && (
                    <ChevronRight className="w-3 h-3 text-zinc-400" />
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <div className="py-2 px-2 text-xs border-t border-zinc-200 dark:border-zinc-700 mt-2 text-zinc-500 dark:text-zinc-400 flex justify-between">
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <kbd className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] rounded">↑</kbd>
                <kbd className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] rounded">↓</kbd>
                <span className="text-[10px]">Navigate</span>
              </div>
              
              <div className="flex items-center gap-1">
                <kbd className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] rounded">Enter</kbd>
                <span className="text-[10px]">Select</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <kbd className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] rounded">Esc</kbd>
              <span className="text-[10px]">{pages.length > 0 ? 'Back' : 'Close'}</span>
            </div>
          </div>
        </Command.List>
      </Command.Dialog>
    </>
  );
} 