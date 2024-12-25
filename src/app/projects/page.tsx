"use client";
import React from "react";
import { Github, ExternalLink, Users, Eye, Download, Star, Code } from "lucide-react";

interface ProjectMetrics {
  visits?: number;
  users?: number;
  downloads?: number;
  preAI?: boolean;
  githubStars?: number;
}

interface ProjectLink {
  label: string;
  url: string;
}

interface Project {
  title: string;
  description: string;
  tech: string[];
  links: ProjectLink[];
  metrics?: ProjectMetrics;
}

interface Category {
  name: string;
  projects: Project[];
}

const categories: Category[] = [
  {
    name: "",
    projects: [
      {
        title: "CodeChef MREC",
        description: "Central hub for facilitating coding competitions and community engagement.",
        tech: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
        links: [
          { label: "GitHub", url: "https://github.com/mreccodechef/Website" },
          { label: "Chapter", url: "https://github.com/mreccodechef" },
        ],
        metrics: {
          visits: 1200,
          preAI: true
        }
      }
    ]
  },
  {
    name: "Applications",
    projects: [
      {
        title: "Pages",
        description: "Figma plugin for rapid page creation and layout management.",
        tech: ["Figma API", "TypeScript", "React"],
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
        title: "Scrapetron",
        description: "Python package for web scraping and data extraction.",
        tech: ["Python", "BeautifulSoup", "Scrapy"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/scrapetron" },
          { label: "Live Demo", url: "https://pypi.org/project/scrapetron/" },
        ],
        metrics: {
          users: 20,
        }
      },
      {
        title: "Todo iOS App",
        description: "Sleek Todo app for iOS devices with synchronization features.",
        tech: ["Swift", "UIKit", "CoreData"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/todoapp" },
          { label: "Live Demo", url: "https://github.com/rohzzn/todoapp" },
        ],
        metrics: {
          preAI: true
        }
      },
      {
        title: "Zenitsu Bot",
        description: "Versatile Discord moderation bot with games and utilities.",
        tech: ["JavaScript", "Discord.js", "Node.js"],
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
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/hexpicker" },
          { label: "Marketplace", url: "https://chrome.google.com/webstore/detail/hex-picker/jmnkgndafoldkblpnmmollbgkdfemmfc/related" },
        ],
        metrics: {
          users: 80,
          preAI: true,
        }
      },
    ],
  },
  {
    name: "Websites",
    projects: [
      {
        title: "Dekho Car",
        description: "User-friendly car rental website with real-time booking.",
        tech: ["React", "Node.js", "MongoDB"],
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
        title: "CodeChef MREC",
        description: "Central hub for facilitating coding competitions and community engagement.",
        tech: ["Next.js", "React", "Tailwind CSS", "TypeScript"],
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
        title: "Pokedex",
        description: "Interactive Pokémon catching game with dynamic data.",
        tech: ["React", "PokéAPI", "Redux"],
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
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/mrec-resume" },
          { label: "Live Demo", url: "https://mrec-resume.vercel.app" },
        ],
        metrics: {
          users: 400,
          visits: 1200,
          preAI: true
        }
      }
    ],
  },
  {
    name: "Games",
    projects: [
      {
        title: "Krueger's Treasure",
        description: "VR horror game with challenging puzzles and dark secrets.",
        tech: ["Unity", "C#", "VR"],
        links: [
          { label: "GitHub", url: "https://github.com/KlepticGames/KruegersTreasue" },
          { label: "Live Demo", url: "https://github.com/KlepticGames/" },
        ],
        metrics: {
          preAI: true,
          users: 50
        }
      },
      {
        title: "Pokemon",
        description: "2D platformer featuring beloved Pokémon characters.",
        tech: ["JavaScript", "HTML5", "CSS3"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/pokemon" },
          { label: "Live Demo", url: "https://rohzzn.github.io/pokemon/" },
        ],
        metrics: {
          visits: 5000,
          preAI: true,
        }
      },
    ],
  },
  {
    name: "Other",
    projects: [
      {
        title: "Automobile Analytics",
        description: "Marketing strategies for an automobile company using data analysis.",
        tech: ["Python", "Pandas", "Matplotlib"],
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
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/smart_agriculture" },
          { label: "Paper", url: "https://github.com/rohzzn/smart_agriculture/blob/main/Smart.pdf" },
        ],
        metrics: {
          preAI: true
        }
      },
    ],
  },
];

const Projects: React.FC = () => (
  <div className="max-w-7xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Projects</h2>
    {categories.map((category, catIndex) => (
      <div key={catIndex} className="mb-8">
        <h3 className="text-base font-medium mb-4 dark:text-white">{category.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {category.projects.map((project, projIndex) => (
            <div
              key={projIndex}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm dark:shadow-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium dark:text-white">{project.title}</h4>
                {project.metrics?.preAI && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <Code className="w-3 h-3 mr-1 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Pre-AI</span>
                  </span>
                )}
              </div>
              
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{project.description}</p>

              {/* Metrics Section */}
              {project.metrics && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {project.metrics.users && (
                    <div className="inline-flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <Users className="w-3 h-3 mr-1" />
                      {project.metrics.users.toLocaleString()}+ users
                    </div>
                  )}
                  {project.metrics.visits && (
                    <div className="inline-flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <Eye className="w-3 h-3 mr-1" />
                      {project.metrics.visits.toLocaleString()}+ visits
                    </div>
                  )}
                  {project.metrics.downloads && (
                    <div className="inline-flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <Download className="w-3 h-3 mr-1" />
                      {project.metrics.downloads.toLocaleString()}+ downloads
                    </div>
                  )}
                  {project.metrics.githubStars && (
                    <div className="inline-flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <Star className="w-3 h-3 mr-1" />
                      {project.metrics.githubStars} stars
                    </div>
                  )}
                </div>
              )}

              {/* Tech Stack */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-3 ml-auto">
                  {project.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                    >
                      {link.label === "GitHub" ? (
                        <Github size={16} />
                      ) : (
                        <ExternalLink size={16} />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default Projects;