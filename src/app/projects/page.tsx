"use client";
import React, { useState } from "react";
import { Github, ExternalLink, Users, Eye, Download, Star, Globe, Gamepad, Cpu, Blocks } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        </div>
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

const Projects = () => {
  const [activeTab, setActiveTab] = useState<"application" | "web" | "game" | "other">("application");

  // Previous code remains the same until the projects array...

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

// Rest of the code remains the same...

  const categories: Record<typeof activeTab, Project[]> = {
    application: projects.filter((p) => p.category === "application"),
    web: projects.filter((p) => p.category === "web"),
    game: projects.filter((p) => p.category === "game"),
    other: projects.filter((p) => p.category === "other"),
  };

  const displayCategories = [
    { id: "application" as const, label: "Applications", icon: <Blocks className="w-4 h-4" /> },
    { id: "web" as const, label: "Websites", icon: <Globe className="w-4 h-4" /> },
    { id: "game" as const, label: "Games", icon: <Gamepad className="w-4 h-4" /> },
    { id: "other" as const, label: "Other", icon: <Cpu className="w-4 h-4" /> },
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
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full text-center min-w-[20px]
                ${activeTab === category.id
                  ? "bg-zinc-100 dark:bg-zinc-600 text-zinc-800 dark:text-zinc-200"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                }
              `}>
                {categories[category.id].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-10 w-full">
        {categories[activeTab].length > 0 ? (
          categories[activeTab].map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No projects found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;