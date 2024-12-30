"use client";
import React from "react";
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

const CategoryIcon = ({ category }: { category: Project['category'] }) => {
  switch (category) {
    case 'application':
      return <Blocks className="w-4 h-4" />;
    case 'web':
      return <Globe className="w-4 h-4" />;
    case 'game':
      return <Gamepad className="w-4 h-4" />;
    default:
      return <Cpu className="w-4 h-4" />;
  }
};

const ProjectCard = ({ project }: { project: Project }) => (
  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <CategoryIcon category={project.category} />
        <h3 className="text-sm font-medium dark:text-white">{project.title}</h3>
      </div>
      {project.metrics && (
        <div className="flex items-center gap-2">
          {project.metrics.users && (
            <div className="inline-flex items-center text-xs text-zinc-500 dark:text-zinc-400">
              <Users className="w-3 h-3 mr-1" />
              {project.metrics.users}
            </div>
          )}
          {project.metrics.visits && (
            <div className="inline-flex items-center text-xs text-zinc-500 dark:text-zinc-400">
              <Eye className="w-3 h-3 mr-1" />
              {project.metrics.visits}
            </div>
          )}
          {project.metrics.downloads && (
            <div className="inline-flex items-center text-xs text-zinc-500 dark:text-zinc-400">
              <Download className="w-3 h-3 mr-1" />
              {project.metrics.downloads}
            </div>
          )}
          {project.metrics.githubStars && (
            <div className="inline-flex items-center text-xs text-zinc-500 dark:text-zinc-400">
              <Star className="w-3 h-3 mr-1" />
              {project.metrics.githubStars}
            </div>
          )}
        </div>
      )}
    </div>
    
    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{project.description}</p>

    {/* Tech Stack and Links */}
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {project.tech.map((tech, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-full"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        {project.links.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
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
  const projects: Project[] = [
    {
      title: "CodeChef MREC",
      description: "Central hub for facilitating coding competitions and community engagement.",
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
      description: "Interactive CLI tool for visualizing git repository history with real-time analysis and beautiful formatting.",
      tech: ["Node.js", "Commander.js", "Inquirer", "Chalk"],
      category: 'application',
      links: [
        { label: "GitHub", url: "https://github.com/rohzzn/git-time-machine" },
        { label: "Package", url: "https://www.npmjs.com/package/git-time-machine" },
      ],
      metrics: {
        downloads: 4, 

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
      description: "Video call application with advanced features like screen sharing and recording.",
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
      description: "Agriculture using automation for optimal growth and reduced labor costs.",
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
  const categories = {
    applications: projects.filter(p => p.category === 'application'),
    games: projects.filter(p => p.category === 'game'),
    research: projects.filter(p => p.category === 'other'),
    websites: projects.filter(p => p.category === 'web')
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Projects</h2>


      {Object.entries(categories).map(([category, items]) => 
        items.length > 0 && (
          <div key={category} className="mb-12">
            <h3 className="text-base font-medium mb-6 dark:text-white capitalize">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((project, index) => (
                <ProjectCard key={index} project={project} />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Projects;