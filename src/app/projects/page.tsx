"use client";
import React, { useState } from "react";
import { Github, ExternalLink, Users, Eye, Download, Star, Globe, Gamepad, Cpu, Blocks } from "lucide-react";
import Link from "next/link";

interface Project {
  title: string;
  description: string;
  tech: string[];
  links: { label: string; url: string; }[];
  metrics?: {
    visits?: number;
    users?: number;
    downloads?: number;
    preAI?: boolean;
    githubStars?: number;
  };
  category: 'application' | 'web' | 'game' | 'other';
}

const ProjectCard = ({ project }: { project: Project }) => (
  <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md dark:shadow-zinc-900/30 transition-all border border-zinc-100 dark:border-zinc-700">
    {/* Title */}
    <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
      {project.title}
    </h3>
    
    {/* Description */}
    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{project.description}</p>

    {/* Tech stack */}
    <div className="flex flex-wrap gap-2 mb-4">
      {project.tech.map((tech, index) => (
        <span
          key={index}
          className="text-xs font-medium px-2.5 py-1 bg-zinc-100 dark:bg-zinc-700/50 text-zinc-700 dark:text-zinc-300 rounded-full"
        >
          {tech}
        </span>
      ))}
    </div>

    {/* Divider */}
    <div className="border-t border-zinc-200 dark:border-zinc-700 my-4"></div>

    {/* Footer with metrics and links */}
    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
      {/* Metrics */}
      {project.metrics && (
        <div className="flex flex-wrap gap-2">
          {project.metrics.users && (
            <div className="inline-flex items-center text-xs text-zinc-600 dark:text-zinc-400">
              <Users className="w-3 h-3 mr-1" />
              {project.metrics.users}
            </div>
          )}
          {project.metrics.visits && (
            <div className="inline-flex items-center text-xs text-zinc-600 dark:text-zinc-400">
              <Eye className="w-3 h-3 mr-1" />
              {project.metrics.visits}
            </div>
          )}
          {project.metrics.downloads && (
            <div className="inline-flex items-center text-xs text-zinc-600 dark:text-zinc-400">
              <Download className="w-3 h-3 mr-1" />
              {project.metrics.downloads}
            </div>
          )}
          {project.metrics.githubStars && (
            <div className="inline-flex items-center text-xs text-zinc-600 dark:text-zinc-400">
              <Star className="w-3 h-3 mr-1" />
              {project.metrics.githubStars}
            </div>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex items-center gap-3">
        {project.links.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5"
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

const Projects = () => {
  const [activeTab, setActiveTab] = useState<'application' | 'web' | 'game' | 'other'>('application');
  const projects: Project[] = [
    {
      title: "DSA Roadmap",
      description: "Learn Data Structures and Algorithms.",
      tech: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/dsa" },
        { label: "Live", url: "https://dsa.gay" },
      ],
      metrics: {
        visits: 30000,
        preAI: true
      }
    },
    {
      title: "CodeChef MREC",
      description: "Central hub for facilitating coding competitions and engagement.",
      tech: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/mreccodechef/Website" },
        { label: "Chapter", url: "https://github.com/mreccodechef" },
      ],
      metrics: {
        visits: 1200,
        preAI: true
      }
    },
    {
      title: "Git Time Machine",
      description: "Interactive CLI tool for visualizing git history with real-time analysis.",
      tech: ["Node.js", "Commander.js", "Inquirer", "Chalk"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/git-time-machine" },
        { label: "Package", url: "https://www.npmjs.com/package/git-time-machine" },
      ],
      metrics: {
        downloads: 225, 

      }
    },
    {
      title: "Pages",
      description: "Figma plugin for rapid page creation and layout management.",
      tech: ["Figma API", "TypeScript", "React"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/pages" },
        { label: "Plugin", url: "https://www.figma.com/community/plugin/1106104074775818911/pages" },
      ],
      metrics: {
        users: 800,
        preAI: true,
      }
    },
    
    {
      title: "Meet",
      description: "Video call application with features like screen sharing and recording.",
      tech: ["React", "Node.js", "Socket.io"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/meet" },
        { label: "Live Demo", url: "https://ckvyqugj7184663idk0i811d0su-8rbb2fvau-calatop.vercel.app/authenticate" },
      ],
      metrics: {
        visits: 800,
        preAI: true
      }
    },
    {
      title: "Ipynb Image Extractor",
      description: "Python package for extracting images from Notebooks.",
      tech: ["Python", "Nbformat", "Pillow"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/ipynb-image-extract" },
        { label: "Package", url: "https://pypi.org/project/ipynb-image-extract//" },
      ],
      metrics: {
        users: 50,
      }
    },
    {
      title: "Scrapetron",
      description: "Python package for web scraping and data extraction.",
      tech: ["Python", "BeautifulSoup", "Scrapy"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/scrapetron" },
        { label: "Package", url: "https://pypi.org/project/scrapetron/" },
      ],
      metrics: {
        users: 20,
      }
    },
    {
      title: "Todo iOS App",
      description: "Sleek Todo app for iOS devices with synchronization features.",
      tech: ["Swift", "UIKit", "CoreData"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/todoapp" },
        { label: "Demo", url: "https://github.com/rohzzn/todoapp" },
      ],
      metrics: {
        preAI: true
      }
    },
    {
      title: "Zenitsu Bot",
      description: "Versatile Discord moderation bot with games and utilities.",
      tech: ["JavaScript", "Discord.js", "Node.js"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/Zenitsu-bot" },
        { label: "Invite", url: "https://discord.com/oauth2/authorize?client_id=766218598913146901&permissions=8&scope=bot" },
      ],
      metrics: {
        users: 200,
        preAI: true,
      }
    },
    {
      title: "Tanoshi",
      description: "Dark scheme for Visual Studio Code to reduce eye strain.",
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
      }
    },
    {
      title: "Hexr",
      description: "Browser extension for color picking and palette generation.",
      tech: ["JavaScript", "Chrome Extensions", "CSS"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/hexpicker" },
        { label: "Marketplace", url: "https://chrome.google.com/webstore/detail/hex-picker/jmnkgndafoldkblpnmmollbgkdfemmfc/related" },
      ],
      metrics: {
        users: 80,
        preAI: true,
      }
    },
    {
      title: "Dekho Car",
      description: "User-friendly car rental website with real-time booking.",
      tech: ["React", "Node.js", "MongoDB"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/dekhocar" },
        { label: "Live Demo", url: "https://dekhocar.vercel.app/" },
      ],
      metrics: {
        visits: 2000,
        preAI: true
      }
    },
    {
      title: "QR Generator",
      description: "Tool for generating customizable QR codes.",
      tech: ["JavaScript", "HTML5", "CSS3"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/qr" },
        { label: "Live Demo", url: "https://rohzzn.github.io/qr/" },
      ],
      metrics: {
        visits: 3500,
        preAI: true
      }
    },
    {
      title: "Pokedex",
      description: "Interactive Pokémon catching game with dynamic data.",
      tech: ["React", "PokéAPI", "Redux"],
      category: 'game',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/pokemon" },
        { label: "Live Demo", url: "https://rohzzn.github.io/pokedex/" },
      ],
      metrics: {
        visits: 1800,
        preAI: true,
      }
    },
    {
      title: "College Resume",
      description: "Customizable resume template in MREC format.",
      tech: ["Markdown", "CSS", "React"],
      category: 'web',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/mrec-resume" },
        { label: "Live Demo", url: "https://mrec-resume.vercel.app" },
      ],
      metrics: {
        users: 400,
        visits: 1200,
        preAI: true
      }
    },
    {
      title: "Krueger's Treasure",
      description: "VR horror game with challenging puzzles and dark secrets.",
      tech: ["Unity", "C#", "VR"],
      category: 'game',
      links: [
        { label: "GitHub", url: "https://github.com/KlepticGames/KruegersTreasue" },
        { label: "Demo", url: "https://github.com/KlepticGames/" },
      ],
      metrics: {
        preAI: true,
        users: 50
      }
    },
    {
      title: "Automobile Analytics",
      description: "Marketing strategies for an automobile company using data analysis.",
      tech: ["Python", "Pandas", "Matplotlib"],
      category: 'other',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/automobile" },
        { label: "Notes", url: "https://github.com/rohzzn/automobile/blob/main/colab.ipynb" },
      ],
      metrics: {
        preAI: true
      }
    },
    {
      title: "Smart Agriculture",
      description: "Agriculture using automation for optimal growth and reduced costs.",
      tech: ["Arduino", "C++", "Sensors"],
      category: 'other',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/smart_agriculture" },
        { label: "Paper", url: "https://github.com/rohzzn/smart_agriculture/blob/main/Smart.pdf" },
      ],
      metrics: {
        preAI: true
      }
    },
    // Add these to your projects array
{
  title: "Portfolio V5",
  description: "Current iteration of my portfolio with dark mode and modern UI.",
  tech: ["Next.js", "TypeScript", "Tailwind CSS"],
  category: 'web',
  links: [
    { label: "GitHub", url: "https://github.com/rohzzn/portfolio" },
    { label: "Live Demo", url: "https://portfolio-calatops-projects.vercel.app/" },
  ],
  metrics: {
    visits: 2300
  }
},
{
  title: "Portfolio V4",
  description: "Windows 95 style portfolio with retro aesthetics.",
  tech: ["React", "Styled Components", "95.css"],
  category: 'web',
  links: [
    { label: "GitHub", url: "https://github.com/rohzzn/windows95" },
    { label: "Live Demo", url: "https://rohzzn.github.io/windows95/" },
  ],
  metrics: {
    visits: 1200
  }
},
{
  title: "Portfolio V3",
  description: "Minimalist design portfolio focused on clean aesthetics.",
  tech: ["React", "CSS3", "JavaScript"],
  category: 'web',
  links: [
    { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v3" },
    { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v3/" },
  ],
  metrics: {
    visits: 1300
  }
},
{
  title: "Portfolio V2",
  description: "Professional design portfolio with modern animations.",
  tech: ["React", "GSAP", "Sass"],
  category: 'web',
  links: [
    { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v2" },
    { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v2/" },
  ],
  metrics: {
    visits: 7000
  }
},
{
  title: "Portfolio V1",
  description: "Anime-themed portfolio with unique visual style.",
  tech: ["HTML5", "CSS3", "JavaScript"],
  category: 'web',
  links: [
    { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v1" },
    { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v1/" },
  ],
  metrics: {
    visits: 500
  }
}
];

  const categories: Record<typeof activeTab, Project[]> = {
    'application': projects.filter(p => p.category === 'application'),
    'web': projects.filter(p => p.category === 'web'),
    'game': projects.filter(p => p.category === 'game'),
    'other': projects.filter(p => p.category === 'other')
  };

  const displayCategories = [
    { id: 'application' as const, label: 'Applications', icon: <Blocks className="w-4 h-4" /> },
    { id: 'web' as const, label: 'Websites', icon: <Globe className="w-4 h-4" /> },
    { id: 'game' as const, label: 'Games', icon: <Gamepad className="w-4 h-4" /> },
    { id: 'other' as const, label: 'Research', icon: <Cpu className="w-4 h-4" /> }
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Projects</h2>

      </div>

      {/* Category Tabs - Scrollable container */}
      <div className="mb-8 -mx-4 sm:mx-0 overflow-x-auto">
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg min-w-fit">
          {displayCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                ${activeTab === category.id
                  ? 'bg-white dark:bg-zinc-700 text-black dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }
              `}
            >
              {category.icon}
              {category.label}
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {categories[category.id].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid - Full width on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-0">
        {categories[activeTab].map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;