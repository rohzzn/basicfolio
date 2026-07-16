import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Command } from 'cmdk';
import { useRouter, usePathname } from 'next/navigation';
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
  ArrowLeft,
  History,
  Mail,
  Target,
  Camera,
  Calendar,
  Image as ImageIcon,
  ChevronRight,
  Rss,
} from 'lucide-react';
import { writingArticles, projectLinks, type PaletteItem } from '@/lib/command-palette-data';
import { toggleEReaderMode } from '@/lib/ereader-mode';
import { toggleTheme } from '@/lib/theme-mode';

interface CommandPaletteProps {
  links?: PaletteItem[];
}

type PalettePage = 'pages' | 'writing' | 'projects' | 'hobbies' | 'external' | 'actions';

const PAGE_LABELS: Record<PalettePage, string> = {
  pages: 'Pages',
  writing: 'Writing',
  projects: 'Projects',
  hobbies: 'Hobbies',
  external: 'External links',
  actions: 'Actions',
};

const mainLinks: PaletteItem[] = [
  { title: 'Home', href: '/', icon: <Home className="w-4 h-4" />, keywords: ['about', 'main', 'index'] },
  { title: 'Projects', href: '/projects', icon: <Code className="w-4 h-4" />, keywords: ['work', 'portfolio', 'code'] },
  { title: 'Writing', href: '/writing', icon: <FileText className="w-4 h-4" />, keywords: ['blog', 'articles', 'posts'] },
  { title: 'Hobbies', href: '/hobbies', icon: <Sparkles className="w-4 h-4" />, keywords: ['interests', 'fun', 'activities'] },
  { title: 'Links', href: '/links', icon: <Link2 className="w-4 h-4" />, keywords: ['social', 'contact', 'networks'] },
  { title: 'Timeline', href: '/timeline', icon: <Clock className="w-4 h-4" />, keywords: ['history', 'experience'] },
  { title: 'Resume', href: '/resume', icon: <Laptop className="w-4 h-4" />, keywords: ['cv', 'work', 'experience', 'jobs'] },
  { title: 'About', href: '/about', icon: <User className="w-4 h-4" />, keywords: ['profile', 'bio', 'personal'] },
  { title: 'Meet', href: '/meet', icon: <Calendar className="w-4 h-4" />, keywords: ['meet', 'schedule', 'calendar', 'book'] },
  { title: 'Guestbook', href: '/guestbook', icon: <Bookmark className="w-4 h-4" />, keywords: ['comments', 'visitor', 'messages'] },
];

const hobbyLinks: PaletteItem[] = [
  { title: 'Move', href: '/hobbies/move', icon: <Activity className="w-4 h-4" />, keywords: ['workout', 'gym', 'hevy', 'lifting', 'activities'] },
  { title: 'Books', href: '/hobbies/books', icon: <BookOpen className="w-4 h-4" />, keywords: ['reading', 'books', 'literature'] },
  { title: 'Content', href: '/hobbies/content', icon: <Youtube className="w-4 h-4" />, keywords: ['youtube', 'videos', 'content'] },
  { title: 'Designs', href: '/hobbies/art', icon: <PenTool className="w-4 h-4" />, keywords: ['art', 'design', 'creative'] },
  { title: 'Watchlist', href: '/hobbies/watchlist', icon: <Film className="w-4 h-4" />, keywords: ['tmdb', 'movies', 'tv', 'anime', 'watchlist', 'streaming', 'letterboxd', 'myanimelist'] },
  { title: 'Gaming', href: '/hobbies/games', icon: <Gamepad2 className="w-4 h-4" />, keywords: ['games', 'gaming', 'steam', 'cs2', 'csgo', 'leetify', 'stats', 'clips', 'highlights'] },
  { title: 'Hackathons', href: '/hobbies/hackathons', icon: <Code className="w-4 h-4" />, keywords: ['hackathon', 'competition', 'coding'] },
  { title: 'Music', href: '/hobbies/music', icon: <Music className="w-4 h-4" />, keywords: ['songs', 'playlist', 'spotify'] },
  { title: 'Seen', href: '/hobbies/seen', icon: <Camera className="w-4 h-4" />, keywords: ['seen', 'frames', 'photos', 'instagram', 'gallery'] },
  { title: 'Setup', href: '/hobbies/uses', icon: <Laptop className="w-4 h-4" />, keywords: ['setup', 'workspace', 'tools', 'uses', 'screen', 'display', 'monitor'] },
  { title: 'Stills', href: '/hobbies/stills', icon: <ImageIcon className="w-4 h-4" />, keywords: ['stills', 'photos', 'images', 'frames'] },
  { title: 'Typing', href: '/hobbies/typing', icon: <Keyboard className="w-4 h-4" />, keywords: ['typing', 'speed', 'test', 'wpm'] },
];

const externalLinks: PaletteItem[] = [
  { title: 'GitHub', keywords: ['code', 'repo', 'git', 'source'], icon: <Github className="w-4 h-4" />, href: 'https://github.com/rohzzn' },
  { title: 'Twitter', keywords: ['social', 'tweet', 'x'], icon: <Twitter className="w-4 h-4" />, href: 'https://twitter.com/rohzzn' },
  { title: 'LinkedIn', keywords: ['job', 'work', 'professional', 'career'], icon: <Linkedin className="w-4 h-4" />, href: 'https://linkedin.com/in/rohzzn' },
  { title: 'Instagram', keywords: ['social', 'photos', 'pictures'], icon: <Instagram className="w-4 h-4" />, href: 'https://instagram.com/rohzzn' },
  { title: 'Email', keywords: ['contact', 'mail', 'reach', 'message'], icon: <Mail className="w-4 h-4" />, href: 'mailto:contact@rohzzn.com' },
  { title: 'Steam Profile', keywords: ['steam', 'gaming', 'games', 'valve'], icon: <Gamepad2 className="w-4 h-4" />, href: 'https://steamcommunity.com/id/rohzzn' },
  { title: 'Spotify', keywords: ['music', 'spotify', 'playlist', 'songs'], icon: <Music className="w-4 h-4" />, href: 'https://open.spotify.com/user/rohzzn' },
  { title: 'Leetify Profile', keywords: ['leetify', 'cs2', 'csgo', 'stats'], icon: <Target className="w-4 h-4" />, href: 'https://leetify.com/@rohzzn' },
  { title: 'Medal.tv', keywords: ['medal', 'clips', 'gaming', 'highlights'], icon: <Film className="w-4 h-4" />, href: 'https://medal.tv/u/rohzzn' },
  { title: 'YouTube', keywords: ['youtube', 'videos', 'channel'], icon: <Youtube className="w-4 h-4" />, href: 'https://youtube.com/@rohzzn' },
  { title: 'MyAnimeList', keywords: ['anime', 'mal', 'myanimelist', 'shows'], icon: <Film className="w-4 h-4" />, href: 'https://myanimelist.net/profile/rohzzn' },
  { title: 'Settings.gg', keywords: ['settings', 'config', 'csgo', 'valorant'], icon: <Laptop className="w-4 h-4" />, href: 'https://settings.gg/rohzzn' },
];

const quickActions: PaletteItem[] = [
  {
    title: 'Toggle Dark Mode',
    keywords: ['theme', 'light', 'dark', 'switch'],
    icon: <Moon className="w-4 h-4" />,
    action: () => {
      toggleTheme();
    },
  },
  {
    title: 'Toggle E-Reader Mode',
    keywords: ['ereader', 'e-reader', 'reading', 'sepia', 'eink'],
    icon: <BookOpen className="w-4 h-4" />,
    action: () => {
      toggleEReaderMode();
    },
  },
  {
    title: 'Open RSS Feed',
    keywords: ['rss', 'feed', 'subscribe', 'writing', 'blog', 'xml'],
    icon: <Rss className="w-4 h-4" />,
    action: () => {
      window.open('/feed.xml', '_blank');
    },
  },
];

const sectionItems: Record<PalettePage, PaletteItem[]> = {
  pages: mainLinks,
  writing: writingArticles,
  projects: projectLinks,
  hobbies: hobbyLinks,
  external: externalLinks,
  actions: quickActions,
};

const categories: { id: PalettePage; title: string; icon: React.ReactNode; count: number; keywords: string[] }[] = [
  { id: 'pages', title: 'Pages', icon: <Home className="w-4 h-4" />, count: mainLinks.length, keywords: ['pages', 'navigate', 'site'] },
  { id: 'writing', title: 'Writing', icon: <FileText className="w-4 h-4" />, count: writingArticles.length, keywords: ['writing', 'blog', 'articles', 'posts'] },
  { id: 'projects', title: 'Projects', icon: <Code className="w-4 h-4" />, count: projectLinks.length, keywords: ['projects', 'work', 'portfolio'] },
  { id: 'hobbies', title: 'Hobbies', icon: <Sparkles className="w-4 h-4" />, count: hobbyLinks.length, keywords: ['hobbies', 'interests', 'fun'] },
  { id: 'external', title: 'External links', icon: <Link2 className="w-4 h-4" />, count: externalLinks.length, keywords: ['external', 'social', 'links'] },
  { id: 'actions', title: 'Actions', icon: <Moon className="w-4 h-4" />, count: quickActions.length, keywords: ['actions', 'theme', 'dark mode'] },
];

const searchGroups: { heading: string; page: PalettePage }[] = [
  { heading: 'Pages', page: 'pages' },
  { heading: 'Writing', page: 'writing' },
  { heading: 'Projects', page: 'projects' },
  { heading: 'Hobbies', page: 'hobbies' },
  { heading: 'External links', page: 'external' },
  { heading: 'Actions', page: 'actions' },
];

const defaultLinks: PaletteItem[] = [
  ...mainLinks,
  ...hobbyLinks,
  ...writingArticles,
  ...projectLinks,
  ...externalLinks,
  ...quickActions,
];

interface RecentCommand {
  title: string;
  type: 'link' | 'action';
  timestamp: number;
}

const itemClassName =
  'flex items-center justify-between gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer text-zinc-700 dark:text-neutral-200 hover:bg-zinc-200 dark:hover:bg-neutral-700 aria-selected:bg-zinc-200 dark:aria-selected:bg-neutral-700 aria-selected:!text-zinc-900 dark:aria-selected:!text-zinc-100';

export default function CommandPalette({ links = defaultLinks }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setInputValue] = useState('');
  const [pages, setPages] = useState<PalettePage[]>([]);
  const [recentCommands, setRecentCommands] = useState<RecentCommand[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentPage = pages[pages.length - 1] ?? null;
  const isSearching = inputValue.trim().length > 0;

  const allItems = useMemo(() => [...links], [links]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const customFilter = (value: string, search: string) => {
    if (!search) return 1;

    let score = 0;
    const normalizedValue = value.toLowerCase();
    const normalizedSearch = search.toLowerCase();

    if (normalizedValue === normalizedSearch) return 2;
    if (normalizedValue.startsWith(normalizedSearch)) score += 1.5;
    if (normalizedValue.includes(normalizedSearch)) score += 1;

    return score;
  };

  const saveToRecents = useCallback((title: string, type: 'link' | 'action') => {
    const newRecent: RecentCommand = { title, type, timestamp: Date.now() };

    setRecentCommands((prev) => {
      const updated = [{ ...newRecent }, ...prev.filter((item) => item.title !== title)].slice(0, 5);
      if (typeof window !== 'undefined') {
        localStorage.setItem('commandPaletteRecents', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      } else if (e.key === 'Escape') {
        if (pages.length > 0) {
          e.preventDefault();
          setPages((prev) => prev.slice(0, -1));
          setInputValue('');
          return;
        }
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [pages]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setInputValue('');
        setPages([]);
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, currentPage]);

  const isMac = useMemo(() => {
    if (typeof window === 'undefined' || !isMounted) return false;
    return navigator.platform.toLowerCase().includes('mac');
  }, [isMounted]);

  const navigateToItem = useCallback(
    (item: PaletteItem) => {
      const commandType = item.href ? 'link' : 'action';
      saveToRecents(item.title, commandType);

      if (item.href) {
        if (item.href.startsWith('http')) {
          window.open(item.href, '_blank');
        } else {
          router.push(item.href);
        }
        setOpen(false);
      } else if (item.action) {
        item.action();
        setOpen(false);
      }
    },
    [router, saveToRecents]
  );

  const handleSelect = useCallback(
    (title: string) => {
      const item = allItems.find((entry) => entry.title === title);
      if (item) navigateToItem(item);
    },
    [allItems, navigateToItem]
  );

  const openCategory = useCallback((page: PalettePage) => {
    setPages([page]);
    setInputValue('');
  }, []);

  const recentItems = useMemo(() => {
    return recentCommands
      .map((recent) => {
        const item = allItems.find((entry) => entry.title === recent.title);
        return item ? { ...item, timestamp: recent.timestamp } : null;
      })
      .filter(Boolean) as Array<(typeof allItems)[0] & { timestamp: number }>;
  }, [recentCommands, allItems]);

  const goBack = useCallback(() => {
    setPages((prev) => prev.slice(0, -1));
    setInputValue('');
  }, []);

  const placeholder = isSearching
    ? 'Search everything...'
    : currentPage
      ? `Search in ${PAGE_LABELS[currentPage]}...`
      : 'Search or pick a category...';

  const renderItems = (items: PaletteItem[], keyPrefix: string) =>
    items.map((item) => (
      <Command.Item
        key={`${keyPrefix}-${item.href ?? item.title}`}
        value={`${item.title} ${item.keywords?.join(' ') ?? ''}`}
        onSelect={() => handleSelect(item.title)}
        className={itemClassName}
      >
        <div className="flex items-center gap-2 min-w-0">
          {item.icon || <div className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate">{item.title}</span>
        </div>
      </Command.Item>
    ));

  return (
    <>
      {pathname !== '/guestbook' && (
        <kbd
          className="fixed right-4 top-4 hidden h-6 items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 font-mono text-xs text-zinc-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 md:flex"
          onClick={() => setOpen(true)}
        >
          {!isMounted ? (
            <>
              <span className="text-xs">⌘</span>K
            </>
          ) : isMac ? (
            <>
              <span className="text-xs">⌘</span>K
            </>
          ) : (
            <>
              <span className="text-xs">Ctrl</span>K
            </>
          )}
        </kbd>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md z-[9999]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {open && (
        <Command
          label="Command Menu"
          filter={customFilter}
          loop
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] bg-zinc-100 dark:bg-neutral-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-200 dark:border-neutral-700 overflow-hidden z-[10000]"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div className="sr-only">
            <h2>Command Menu</h2>
          </div>

          <div className="border-b border-zinc-200 dark:border-neutral-700 flex items-center px-3 gap-2">
            {currentPage && !isSearching && (
              <button
                onClick={goBack}
                className="flex items-center p-1 hover:bg-zinc-200 dark:hover:bg-neutral-700 rounded text-zinc-500 dark:text-neutral-400"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <Search className="w-4 h-4 text-zinc-500 dark:text-neutral-400 flex-shrink-0" />
            {currentPage && !isSearching && (
              <span className="text-xs text-zinc-500 dark:text-neutral-400 flex-shrink-0">
                {PAGE_LABELS[currentPage]}
              </span>
            )}
            <Command.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              placeholder={placeholder}
              className="w-full h-12 bg-transparent text-zinc-700 dark:text-neutral-200 placeholder:text-zinc-500 dark:placeholder:text-neutral-400 outline-none"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
            <Command.Empty className="py-6 text-center text-sm text-zinc-500 dark:text-neutral-400 flex flex-col items-center justify-center">
              <Sparkles className="w-5 h-5 mb-2 text-zinc-400 dark:text-neutral-400" />
              <p>No results found for &ldquo;{inputValue}&rdquo;</p>
            </Command.Empty>

            {isSearching &&
              searchGroups.map(({ heading, page }) => (
                <Command.Group
                  key={`search-${page}`}
                  heading={heading}
                  className="text-[11px] font-medium text-zinc-500 dark:text-neutral-400 px-2 pb-1 pt-2"
                >
                  {renderItems(sectionItems[page], `search-${page}`)}
                </Command.Group>
              ))}

            {!isSearching && !currentPage && (
              <>
                {recentItems.length > 0 && (
                  <>
                    <Command.Group heading="Recent" className="text-[11px] font-medium text-zinc-500 dark:text-neutral-400 px-2 pb-1 pt-2">
                      {recentItems.map((item, index) => (
                        <Command.Item
                          key={`recent-${index}`}
                          value={`${item.title} ${item.keywords?.join(' ') ?? ''}`}
                          onSelect={() => handleSelect(item.title)}
                          className={itemClassName}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {item.icon || <History className="w-4 h-4 flex-shrink-0" />}
                            <span className="truncate">{item.title}</span>
                          </div>
                        </Command.Item>
                      ))}
                    </Command.Group>
                    <Command.Separator className="my-2 h-px bg-zinc-200 dark:bg-neutral-700" />
                  </>
                )}

                <Command.Group heading="Browse" className="text-[11px] font-medium text-zinc-500 dark:text-neutral-400 px-2 pb-1 pt-2">
                  {categories.map((category) => (
                    <Command.Item
                      key={category.id}
                      value={`${category.title} ${category.keywords.join(' ')}`}
                      onSelect={() => openCategory(category.id)}
                      className={itemClassName}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {category.icon}
                        <span>{category.title}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 text-zinc-400 dark:text-neutral-400">
                        <span className="text-[11px]">{category.count}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}

            {!isSearching && currentPage && (
              <Command.Group
                heading={PAGE_LABELS[currentPage]}
                className="text-[11px] font-medium text-zinc-500 dark:text-neutral-400 px-2 pb-1 pt-2"
              >
                {renderItems(sectionItems[currentPage], currentPage)}
              </Command.Group>
            )}

            <div className="py-2 px-2 text-xs border-t border-zinc-200 dark:border-neutral-700 mt-2 text-zinc-500 dark:text-neutral-400 flex justify-between">
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <kbd className="bg-zinc-200 dark:bg-neutral-700 px-1.5 py-0.5 text-[10px] rounded">↑</kbd>
                  <kbd className="bg-zinc-200 dark:bg-neutral-700 px-1.5 py-0.5 text-[10px] rounded">↓</kbd>
                  <span className="text-[10px]">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="bg-zinc-200 dark:bg-neutral-700 px-1.5 py-0.5 text-[10px] rounded">Enter</kbd>
                  <span className="text-[10px]">Select</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-zinc-200 dark:bg-neutral-700 px-1.5 py-0.5 text-[10px] rounded">Esc</kbd>
                <span className="text-[10px]">{currentPage && !isSearching ? 'Back' : 'Close'}</span>
              </div>
            </div>
          </Command.List>
        </Command>
      )}
    </>
  );
}
