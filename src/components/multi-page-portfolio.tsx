"use client";
import React, { useState, useEffect } from 'react';
import { Github, ExternalLink, Circle, Menu, X, Sun, Moon } from 'lucide-react';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, currentPage, setCurrentPage }) => (
  <Link
    href={href}
    className={`block px-2 py-1.5 text-sm transition-colors capitalize w-full text-left
      ${
        currentPage === href
          ? 'text-black dark:text-white'
          : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
      }`}
    onClick={() => setCurrentPage(href)}
  >
    {children}
  </Link>
);

// Layout Component
interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage, isDarkMode, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lanyardData, setLanyardData] = useState<any>(null);
  const discordId = "407922731645009932"; // Your Discord ID

  useEffect(() => {
    // Fetch Lanyard Data using REST API
    const fetchLanyardData = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const data = await response.json();
        if (data.success) {
          setLanyardData(data.data);
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

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || '/';
      setCurrentPage(path === '' ? '/' : `/${path}`);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPage]);

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
            { path: '/blog', label: 'Blog' }
          ].map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Theme Toggle Button */}
        <div className="mt-6">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Discord Status */}
        {lanyardData && (
          <div className="py-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Circle 
                size={8} 
                fill={lanyardData.discord_status === 'online' ? '#43b581' : '#747f8d'} 
                className={lanyardData.discord_status === 'online' ? 'text-green-500' : 'text-gray-500'}
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {lanyardData.discord_status.charAt(0).toUpperCase() + lanyardData.discord_status.slice(1)}
              </span>
            </div>
            {lanyardData.activities && lanyardData.activities.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {lanyardData.activities[0].name}: {lanyardData.activities[0].state}
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

// Page Components

interface AboutProps {
  lanyardData: any;
}

const About: React.FC<AboutProps> = ({ lanyardData }) => (
  <div className="max-w-2xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">About</h2>
    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
      I'm a software engineer focused on building exceptional digital experiences. 
      Currently, I'm working on creating accessible, human-centered products.
    </p>

    {/* Discord Status and Activity */}
    {lanyardData && (
      <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <h3 className="text-sm font-medium mb-2 dark:text-white">Discord Status</h3>
        <div className="flex items-center gap-2">
          <Circle 
            size={8} 
            fill={lanyardData.discord_status === 'online' ? '#43b581' : '#747f8d'} 
            className={lanyardData.discord_status === 'online' ? 'text-green-500' : 'text-gray-500'}
          />
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            {lanyardData.discord_status.charAt(0).toUpperCase() + lanyardData.discord_status.slice(1)}
          </span>
        </div>
        {lanyardData.activities && lanyardData.activities.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium dark:text-white">Current Activity</h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {lanyardData.activities[0].name}: {lanyardData.activities[0].state}
            </p>
          </div>
        )}
      </div>
    )}
  </div>
);

const Projects = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Projects</h2>
    <div className="grid gap-8 md:grid-cols-2">
      {[
        {
          title: 'Project One',
          description: 'A minimal task management system built with React and TypeScript.',
          tech: ['React', 'TypeScript', 'Node.js'],
          github: 'https://github.com',
          live: 'https://example.com'
        },
        {
          title: 'Project Two',
          description: 'Real-time collaborative markdown editor using WebSocket.',
          tech: ['Next.js', 'Socket.io', 'PostgreSQL'],
          github: 'https://github.com',
          live: 'https://example.com'
        }
      ].map((project, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-base font-medium dark:text-white">{project.title}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2 mb-4">{project.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-3 ml-auto">
              <a href={project.github} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" target="_blank" rel="noopener noreferrer">
                <Github size={16} />
              </a>
              <a href={project.live} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Stack = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Stack</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        {
          category: 'Languages',
          items: ['TypeScript', 'Python', 'Rust']
        },
        {
          category: 'Frontend',
          items: ['React', 'Next.js', 'Tailwind CSS']
        },
        {
          category: 'Backend',
          items: ['Node.js', 'PostgreSQL', 'Redis']
        },
        {
          category: 'Tools',
          items: ['Git', 'Docker', 'AWS']
        }
      ].map((category, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-sm font-medium mb-4 text-zinc-800 dark:text-zinc-200">{category.category}</h3>
          <ul className="space-y-2">
            {category.items.map((item, i) => (
              <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const Hobbies = () => (
  <div className="max-w-2xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hobbies</h2>
    <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
      <p>
        When I'm not coding, you can find me exploring mechanical keyboards, 
        contributing to open-source projects, and learning about system design.
      </p>
      <p>
        I also enjoy reading technical blogs, participating in hackathons, 
        and experimenting with new programming languages.
      </p>
    </div>
  </div>
);

const Blog = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Blog</h2>
    <div className="grid gap-8 md:grid-cols-2">
      {[
        {
          title: 'Understanding React Server Components',
          date: 'December 10, 2024',
          excerpt: 'An in-depth look at how React Server Components work and when to use them.',
          readTime: '5 min read',
          slug: 'understanding-react-server-components'
        },
        {
          title: 'Building with Web Components',
          date: 'December 5, 2024',
          excerpt: 'Learn how to create reusable web components for modern applications.',
          readTime: '4 min read',
          slug: 'building-with-web-components'
        }
      ].map((post, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-base font-medium dark:text-white">{post.title}</h3>
          <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3">{post.excerpt}</p>
          <Link href={`/blog/${post.slug}`}>
            <span className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              Read more →
            </span>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

// Main App Component
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('/');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lanyardData, setLanyardData] = useState<any>(null);

  useEffect(() => {
    const path = window.location.pathname;
    setCurrentPage(path === '/' ? '/' : path);
  }, []);

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

  const renderContent = () => {
    switch (currentPage) {
      case '/':
      case '/about':
        return <About lanyardData={lanyardData} />;
      case '/projects':
        return <Projects />;
      case '/stack':
        return <Stack />;
      case '/hobbies':
        return <Hobbies />;
      case '/blog':
        return <Blog />;
      default:
        return <About lanyardData={lanyardData} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      setCurrentPage={setCurrentPage} 
      isDarkMode={isDarkMode} 
      toggleTheme={toggleTheme}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
