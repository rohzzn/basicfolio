"use client";
import React, { useState, useEffect } from "react";
import { Github, ExternalLink, Users, Eye, Download, Star, Globe, Gamepad, Cpu, Blocks, GitCommit, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import GitHubCalendar from "react-github-calendar";

interface Project {
  title: string;
  description: string;
  tech: string[];
  links: { label: string; url: string }[];
  metrics?: {
    visits?: number;
    users?: number;
    downloads?: number;
    preAI?: boolean;
    githubStars?: number;
  };
  category: "application" | "web" | "game" | "other";
  image: string; // Path to image in public folder
}

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div 
      className="relative bg-white dark:bg-zinc-800 rounded-xl p-3 sm:p-6 transition-all border border-zinc-100 dark:border-zinc-700 hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-600 h-full flex flex-col w-full"
    >
      {/* Project image */}
      <div className="mb-3 sm:mb-4 w-full">
        <Image
          src={project.image}
          alt={project.title}
          width={600}
          height={315}
          className="rounded-lg w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Title and indicators */}
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white">
          {project.title}
        </h3>
      </div>
      
      {/* Description */}
      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-3 sm:mb-4">
        {project.description}
      </p>

      {/* Tech stack */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-auto">
        {project.tech.map((tech, index) => (
          <span
            key={index}
            className="text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 my-3 sm:my-4"></div>

      {/* Footer with metrics and links */}
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mt-auto">
        {/* Metrics */}
        {project.metrics && (
          <div className="flex flex-wrap gap-1.5 sm:gap-3">
            {project.metrics.users && (
              <div className="inline-flex items-center text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/70 px-1.5 sm:px-2 py-1 rounded">
                <Users className="w-3 h-3 mr-1" />
                {new Intl.NumberFormat().format(project.metrics.users)}
              </div>
            )}
            {project.metrics.visits && (
              <div className="inline-flex items-center text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/70 px-1.5 sm:px-2 py-1 rounded">
                <Eye className="w-3 h-3 mr-1" />
                {new Intl.NumberFormat().format(project.metrics.visits)}
              </div>
            )}
            {project.metrics.downloads && (
              <div className="inline-flex items-center text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/70 px-1.5 sm:px-2 py-1 rounded">
                <Download className="w-3 h-3 mr-1" />
                {new Intl.NumberFormat().format(project.metrics.downloads)}
              </div>
            )}
            {project.metrics.githubStars && (
              <div className="inline-flex items-center text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/70 px-1.5 sm:px-2 py-1 rounded">
                <Star className="w-3 h-3 mr-1" />
                {new Intl.NumberFormat().format(project.metrics.githubStars)}
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
          {project.links.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 sm:gap-1.5 bg-zinc-50 dark:bg-zinc-800/70 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700/70 transition-colors"
            >
              {link.label === "GitHub" ? (
                <>GitHub <Github className="w-3 h-3" /></>
              ) : (
                <>{link.label} <ExternalLink className="w-3 h-3" /></>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom GitHub Stats Component
const GitHubStats = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const githubUsername = "rohzzn";
  const availableYears = [2024, 2023, 2022, 2021, 2020];
  
  // Stats displayed on the commits tab
  const stats = [
    { label: "Total Repositories", value: "32+", icon: <Blocks className="w-4 h-4" /> },
    { label: "Total Commits", value: "1,500+", icon: <GitCommit className="w-4 h-4" /> },
    { label: "Pull Requests", value: "120+", icon: <Github className="w-4 h-4" /> },
    { label: "Stars Received", value: "250+", icon: <Star className="w-4 h-4" /> },
  ];

  useEffect(() => {
    // Check if user prefers dark mode or if the site is in dark mode
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches || 
                      document.documentElement.classList.contains('dark');
    setTheme(isDarkMode ? "dark" : "light");

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleYearChange = (direction: 'prev' | 'next') => {
    const currentIndex = availableYears.indexOf(selectedYear);
    if (direction === 'prev' && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1]);
    }
  };

  const renderCustomCalendar = () => {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white">
              Contributions ({selectedYear})
            </h3>
            <Link
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <Github className="w-3 h-3" />
              {githubUsername}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleYearChange('prev')}
              disabled={availableYears.indexOf(selectedYear) >= availableYears.length - 1}
              className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleYearChange('next')}
              disabled={availableYears.indexOf(selectedYear) <= 0}
              className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 p-4 sm:p-6 mb-8">
          <div className="overflow-x-auto">
            <GitHubCalendar 
              username={githubUsername} 
              colorScheme={theme}
              blockSize={12}
              blockMargin={4}
              fontSize={10}
              year={selectedYear}
              labels={{
                totalCount: '{{count}} contributions in {{year}}'
              }}
              hideColorLegend={false}
            />
          </div>
        </div>
      </>
    );
  };

  const renderStats = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 p-4 flex flex-col items-center text-center"
          >
            <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-full mb-3">
              {stat.icon}
            </div>
            <div className="font-semibold text-xl text-zinc-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTopRepos = () => {
    const topRepos = [
      { name: "basicfolio", description: "A minimal portfolio template for developers", stars: 42, language: "TypeScript" },
      { name: "git-time-machine", description: "CLI tool for git history visualization", stars: 28, language: "JavaScript" },
      { name: "scrapetron", description: "Web scraping framework with processing capabilities", stars: 19, language: "Python" },
    ];

    return (
      <div className="mb-8">
        <h3 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white mb-4">
          Popular Repositories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topRepos.map((repo, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-zinc-900 dark:text-white">
                  {repo.name}
                </h4>
                <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                  <Star className="w-3 h-3 mr-1" />
                  {repo.stars}
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                {repo.description}
              </p>
              <div className="flex items-center text-xs">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                {repo.language}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderStats()}
      {renderCustomCalendar()}
      {renderTopRepos()}
    </div>
  );
};

const Projects = () => {
  const [activeTab, setActiveTab] = useState<"application" | "web" | "game" | "other" | "commits">("application");
  
  const projects: Project[] = [
    {
      title: "API Clinic",
      description: "A powerful API testing tool with real-time response validation and environment management.",
      tech: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/api-clinic" },
        { label: "Live", url: "https://apiclinic.vercel.app/" },
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/api.png"
    },
    {
      title: "DSA Roadmap",
      description: "Path for learning Data Structures and Algorithms with resources and contest updates.",
      tech: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/dsa" },
        { label: "Live", url: "https://dsa.gay" },
      ],
      metrics: {
        visits: 12305,
        preAI: true
      },
      image: "/projects/dsa.png"
    },
    {
      title: "CodeChef MREC",
      description: "Official CodeChef chapter platform for managing coding competitions, resources, and community events.",
      tech: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/mreccodechef/Website" },
        { label: "Chapter", url: "https://github.com/mreccodechef" },
      ],
      metrics: {
        visits: 1200,
        preAI: true
      },
      image: "/projects/codechef.png"
    },
    {
      title: "Git Time Machine",
      description: "CLI tool that provides elegant visualization of git history with intuitive time-based navigation.",
      tech: ["Node.js", "Commander.js", "Inquirer", "Chalk"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/git-time-machine" },
        { label: "Package", url: "https://www.npmjs.com/package/git-time-machine" },
      ],
      metrics: {
        downloads: 225
      },
      image: "/projects/git-time.png"
    },
    {
      title: "Pages",
      description: "Figma plugin that streamlines page creation and layout management with smart templates.",
      tech: ["Figma API", "TypeScript", "React"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/pages" },
        { label: "Plugin", url: "https://www.figma.com/community/plugin/1106104074775818911/pages" },
      ],
      metrics: {
        users: 800,
        preAI: true,
      },
      image: "/projects/pages.png"
    },
    {
      title: "Meet",
      description: "Video conferencing app with screen sharing, session recording, and real-time chat features.",
      tech: ["React", "Node.js", "Socket.io"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/meet" },
        { label: "Live Demo", url: "https://ckvyqugj7184663idk0i811d0su-8rbb2fvau-calatop.vercel.app/authenticate" },
      ],
      metrics: {
        visits: 800,
        preAI: true
      },
      image: "/projects/meet.png"
    },
    {
      title: "Ipynb Image Extractor",
      description: "Python utility for batch extracting and organizing images from Jupyter notebooks.",
      tech: ["Python", "Nbformat", "Pillow"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/ipynb-image-extract" },
        { label: "Package", url: "https://pypi.org/project/ipynb-image-extract/" },
      ],
      metrics: {
        users: 50,
      },
      image: "/projects/ipynb.png"
    },
    {
      title: "Scrapetron",
      description: "Powerful web scraping framework with built-in data processing and export capabilities.",
      tech: ["Python", "BeautifulSoup", "Scrapy"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/scrapetron" },
        { label: "Package", url: "https://pypi.org/project/scrapetron/" },
      ],
      metrics: {
        users: 20,
      },
      image: "/projects/scrapetron.png"
    },
    {
      title: "Todo iOS App",
      description: "Native iOS task manager with cloud sync, reminders, and smart categorization.",
      tech: ["Swift", "UIKit", "CoreData"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/todoapp" },
        { label: "Demo", url: "https://github.com/rohzzn/todoapp" },
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/todo.png"
    },
    {
      title: "Zenitsu Bot",
      description: "Feature-rich Discord bot with moderation tools, mini-games, and server management utilities.",
      tech: ["JavaScript", "Discord.js", "Node.js"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/Zenitsu-bot" },
        { label: "Invite", url: "https://discord.com/oauth2/authorize?client_id=766218598913146901&permissions=8&scope=bot" },
      ],
      metrics: {
        users: 200,
        preAI: true,
      },
      image: "/projects/zenitsu.png"
    },
    {
      title: "Tanoshi",
      description: "Eye-friendly VS Code theme with carefully crafted color palette for reduced strain.",
      tech: ["CSS", "JSON"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/tanoshi" },
        { label: "Marketplace", url: "https://marketplace.visualstudio.com/items?itemName=RohanSanjeev.tanoshi" },
      ],
      metrics: {
        downloads: 1700,
        preAI: true,
        githubStars: 14
      },
      image: "/projects/tanoshi.png"
    },
    {
      title: "Hexr",
      description: "Chrome extension for color picking, palette generation, and color code conversion.",
      tech: ["JavaScript", "Chrome Extensions", "CSS"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/hexpicker" },
        { label: "Marketplace", url: "https://chrome.google.com/webstore/detail/hex-picker/jmnkgndafoldkblpnmmollbgkdfemmfc" },
      ],
      metrics: {
        users: 80,
        preAI: true,
      },
      image: "/projects/hexr.png"
    },
    {
      title: "Dekho Car",
      description: "Modern car rental platform with real-time booking, reviews, and payment integration.",
      tech: ["React", "Node.js", "MongoDB"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/dekhocar" },
        { label: "Live Demo", url: "https://dekhocar.vercel.app/" },
      ],
      metrics: {
        visits: 2000,
        preAI: true
      },
      image: "/projects/dekhocar.png"
    },
    {
      title: "QR Generator",
      description: "QR code generator with custom styling, logo embedding, and batch processing capabilities.",
      tech: ["JavaScript", "HTML5", "CSS3"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/qr" },
        { label: "Live Demo", url: "https://rohzzn.github.io/qr/" },
      ],
      metrics: {
        visits: 3500,
        preAI: true
      },
      image: "/projects/qr.png"
    },
    {
      title: "Pokemon 2d Platformer",
      description: "Explore a vibrant and interactive world filled with detailed maps and smooth gameplay.",
      tech: ["JavaScript", "Tiled"],
      category: 'game',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/pokemon" },
        { label: "Live Demo", url: "https://rohzzn.github.io/pokemon/" },
      ],
      metrics: {
        visits: 6800,
        preAI: true,
      },
      image: "/projects/pokemon.png"
    },
    {
      title: "Pokedex",
      description: "Interactive Pokémon catalog with game mechanics, stats tracking, and collection features.",
      tech: ["JavaScript", "PokéAPI"],
      category: 'game',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/pokedex" },
        { label: "Live Demo", url: "https://rohzzn.github.io/pokedex/" },
      ],
      metrics: {
        visits: 1800,
        preAI: true,
      },
      image: "/projects/pokedex.png"
    },
    {
      title: "Automobile Analytics",
      description: "Data-driven marketing strategy analyzer for automotive industry with predictive insights.",
      tech: ["Python", "Pandas", "Matplotlib"],
      category: 'other',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/automobile" },
        { label: "Notes", url: "https://github.com/rohzzn/automobile/blob/main/colab.ipynb" },
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/auto.png"
    },
    {
      title: "Smart Agriculture",
      description: "IoT-based farming system with automated irrigation, monitoring, and yield optimization.",
      tech: ["Arduino", "C++", "Sensors"],
      category: 'other',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/smart_agriculture" },
        { label: "Paper", url: "https://github.com/rohzzn/smart_agriculture/blob/main/Smart.pdf" },
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/agriculture.png"
    },
    {
      title: "Block-Steam-Invites",
      description: "Script to block Steam invites with options for filtering users by private profiles, VAC bans, or trading bans.",
      tech: ["JavaScript", "Tampermonkey/Greasemonkey"],
      category: "other",
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/block-steam-invites" },
        { label: "YouTube Tutorial", url: "https://www.youtube.com/watch?v=KhLYxv3iry0" }
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/block_steam_invites.png"
    },
    {
      title: "OverTheWire Challenges",
      description: "I solved OTW challenges and wrote down solutions for Bandit (Level 23-24) and Natas (up to Level 5).",
      tech: ["Command-line scripting"], 
      category: "other",
      links: [
        { label: "OverTheWire", url: "https://overthewire.org/wargames/" },
        { label: "GitHub", url: "https://github.com/rohzzn/overthewire" }
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/overthewire.png"
    },
    {
      title: "Discord Mirror",
      description: "Mirror messages from any server to any channel in Discord.",
      tech: ["Node.js"],
      category: "other",
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/discordmirror" }
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/discord_mirror.png"
    },
    {
      title: "GitHub Repo Any Year Any Day",
      description: "Script to create GitHub repositories with backdated commits.",
      tech: ["Shell Script"],
      category: "other",
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/2001-script" },
        { label: "Script File", url: "https://github.com/rohzzn/2001-script/blob/main/index.sh" }
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/commitanyyear.png"
    },
    {
      title: "YouTube Thumbnail Downloader",
      description: "Web app to fetch and download YouTube video thumbnails in various resolutions.",
      tech: ["JavaScript", "HTML", "CSS"],
      category: "web",
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/thumbnails" },
        { label: "Live Demo", url: "https://rohzzn.github.io/thumbnails/" }
      ],
      metrics: {
        visits: 2200,
      },
      image: "/projects/thumbnail_downloader.png"
    },
    {
      title: "Marvel Cinematic Universe Timeline",
      description: "Interactive Marvel Cinematic Universe timeline with CSS animations and responsive design.",
      tech: ["HTML", "CSS", "JavaScript"],
      category: "web",
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/mcu_timeline" },
        { label: "Live Demo", url: "https://rohzzn.github.io/mcu_timeline/" }
      ],
      metrics: {
        visits: 4000,
      },
      image: "/projects/mcutimeline.png"
    },
    {
      title: "Customer Management App",
      description: "React and Node.js-based customer management app with PostgreSQL backend.",
      tech: ["React", "Node.js", "Express", "PostgreSQL"],
      category: "application",
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/CustomerManagement" },
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/customer_management.png"
    },
    {
      title: "Anomaly Detection in Wireless Networks",
      description: "Proposed AS-CNN model using ADASYN and Split-Convolution CNN for enhanced anomaly detection.",
      tech: ["Python", "Machine Learning", "TensorFlow"],
      category: "other",
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/nids" }
      ],
      metrics: {
        preAI: true
      },
      image: "/projects/nids.png"
    },
    {
      title: "Portfolio V5",
      description: "Current portfolio featuring dark mode, responsive design, and modern UI interactions.",
      tech: ["Next.js", "TypeScript", "Tailwind CSS"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/portfolio" },
        { label: "Live Demo", url: "https://portfolio-calatops-projects.vercel.app/" },
      ],
      metrics: {
        visits: 2300
      },
      image: "/projects/portfolio-v5.png"
    },
    {
      title: "Portfolio V4",
      description: "Windows 95-inspired portfolio with authentic retro UI elements and animations.",
      tech: ["React", "Styled Components", "95.css"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/windows95" },
        { label: "Live Demo", url: "https://rohzzn.github.io/windows95/" },
      ],
      metrics: {
        visits: 1200
      },
      image: "/projects/portfolio-v4.png"
    },
    {
      title: "Portfolio V3",
      description: "Clean, minimalist portfolio focused on typography and smooth transitions.",
      tech: ["React", "CSS3", "JavaScript"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v3" },
        { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v3/" },
      ],
      metrics: {
        visits: 1300
      },
      image: "/projects/portfolio-v3.png"
    },
    {
      title: "Portfolio V2",
      description: "Dynamic portfolio with GSAP animations and interactive project showcases.",
      tech: ["React", "GSAP", "Sass"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v2" },
        { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v2/" },
      ],
      metrics: {
        visits: 7000
      },
      image: "/projects/portfolio-v2.png"
    },
    {
      title: "Portfolio V1",
      description: "Anime-inspired portfolio with unique visual effects and creative transitions.",
      tech: ["HTML5", "CSS3", "JavaScript"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v1" },
        { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v1/" },
      ],
      metrics: {
        visits: 500
      },
      image: "/projects/portfolio-v1.png"
    }
  ];

  const categories: Record<typeof activeTab, Project[] | null> = {
    application: projects.filter((p) => p.category === "application"),
    web: projects.filter((p) => p.category === "web"),
    game: projects.filter((p) => p.category === "game"),
    other: projects.filter((p) => p.category === "other"),
    commits: null, // Special case handled separately
  };

  const displayCategories = [
    { id: "application" as const, label: "Applications", icon: <Blocks className="w-4 h-4" /> },
    { id: "web" as const, label: "Websites", icon: <Globe className="w-4 h-4" /> },
    { id: "game" as const, label: "Games", icon: <Gamepad className="w-4 h-4" /> },
    { id: "other" as const, label: "Other", icon: <Cpu className="w-4 h-4" /> },
    { id: "commits" as const, label: "Commits", icon: <GitCommit className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-7xl">
      <div className="mb-8 sm:mb-10">
        <h2 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4 dark:text-white">Projects</h2>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl min-w-fit shadow-sm">
          {displayCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`
                flex items-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap
                ${activeTab === category.id
                  ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm transform scale-[1.02]"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-750"
                }
              `}
            >
              {category.icon}
              <span>{category.label}</span>
              {category.id !== "commits" && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full text-center min-w-[20px]
                  ${activeTab === category.id
                    ? "bg-zinc-100 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }
                `}>
                  {categories[category.id]?.length || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === "commits" ? (
        <GitHubStats />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-10 w-full">
          {categories[activeTab]?.length ? (
            categories[activeTab]!.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">No projects found in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;