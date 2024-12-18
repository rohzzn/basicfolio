// src/app/projects/page.tsx

"use client";
import React from "react";
import { Github, ExternalLink } from "lucide-react";

interface ProjectLink {
  label: string;
  url: string;
}

interface Project {
  title: string;
  description: string;
  tech: string[];
  links: ProjectLink[];
}

interface Category {
  name: string;
  projects: Project[];
}

const categories: Category[] = [
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
      },
      {
        title: "Pokemon",
        description: "2D platformer featuring beloved Pokémon characters.",
        tech: ["JavaScript", "HTML5", "CSS3"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/pokemon" },
          { label: "Live Demo", url: "https://rohzzn.github.io/pokemon/" },
        ],
      },
    ],
  },
  {
    name: "Applications",
    projects: [
      {
        title: "Meet",
        description:
          "Video call application with advanced features like screen sharing and recording.",
        tech: ["React", "Node.js", "Socket.io"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/meet" },
          {
            label: "Live Demo",
            url: "https://ckvyqugj7184663idk0i811d0su-8rbb2fvau-calatop.vercel.app/authenticate",
          },
        ],
      },
      {
        title: "Scrapetron",
        description: "Python package for web scraping and data extraction.",
        tech: ["Python", "BeautifulSoup", "Scrapy"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/scrapetron" },
          { label: "Live Demo", url: "https://pypi.org/project/scrapetron/" },
        ],
      },
      {
        title: "Todo iOS App",
        description: "Sleek Todo app for iOS devices with synchronization features.",
        tech: ["Swift", "UIKit", "CoreData"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/todoapp" },
          { label: "Live Demo", url: "https://github.com/rohzzn/todoapp" },
        ],
      },
      {
        title: "Zenitsu Bot",
        description: "Versatile Discord moderation bot with games and utilities.",
        tech: ["JavaScript", "Discord.js", "Node.js"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/Zenitsu-bot" },
          {
            label: "Invite",
            url: "https://discord.com/oauth2/authorize?client_id=766218598913146901&permissions=8&scope=bot",
          },
        ],
      },
      {
        title: "Tanoshi",
        description: "Dark scheme for Visual Studio Code to reduce eye strain.",
        tech: ["CSS", "JSON"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/tanoshi" },
          {
            label: "Marketplace",
            url: "https://marketplace.visualstudio.com/items?itemName=RohanSanjeev.tanoshi",
          },
        ],
      },
      {
        title: "Hexr",
        description: "Browser extension for color picking and palette generation.",
        tech: ["JavaScript", "Chrome Extensions", "CSS"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/hexpicker" },
          {
            label: "Marketplace",
            url: "https://chrome.google.com/webstore/detail/hex-picker/jmnkgndafoldkblpnmmollbgkdfemmfc/related?hl=en-GB&authuser=3",
          },
        ],
      },
    ],
  },
  {
    name: "Websites",
    projects: [
      {
        title: "Everything Minimal",
        description: "Minimalistic e-commerce clothing store with a clean design.",
        tech: ["Next.js", "Tailwind CSS", "Stripe"],
        links: [
          { label: "GitHub", url: "https://github.com/EverythingMinimal" },
          { label: "Live Demo", url: "https://github.com/EverythingMinimal" },
        ],
      },
      {
        title: "Dekho Car",
        description: "User-friendly car rental website with real-time booking.",
        tech: ["React", "Node.js", "MongoDB"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/dekhocar" },
          { label: "Live Demo", url: "https://dekhocar.vercel.app/" },
        ],
      },
      {
        title: "QR Generator",
        description: "Tool for generating customizable QR codes.",
        tech: ["JavaScript", "HTML5", "CSS3"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/qr" },
          { label: "Live Demo", url: "https://rohzzn.github.io/qr/" },
        ],
      },
      {
        title: "Pokedex",
        description: "Interactive Pokémon catching game with dynamic data.",
        tech: ["React", "PokéAPI", "Redux"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/pokemon" },
          { label: "Live Demo", url: "https://rohzzn.github.io/pokedex/" },
        ],
      },
      {
        title: "Thumbnailer",
        description: "YouTube video thumbnail downloader and editor.",
        tech: ["React", "Node.js", "FFmpeg"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/thumbnails" },
          { label: "Live Demo", url: "https://rohzzn.github.io/thumbnails/" },
        ],
      },
      {
        title: "College Resume",
        description: "Customizable resume template in MREC format.",
        tech: ["Markdown", "CSS", "React"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/mrec-resume" },
          { label: "Live Demo", url: "https://mrec-resume.vercel.app" },
        ],
      },
      {
        title: "MCU Timeline",
        description: "Marvel Cinematic Universe Timeline showcasing movie releases.",
        tech: ["React", "D3.js", "CSS3"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/mcu_timeline" },
          { label: "Live Demo", url: "https://rohzzn.github.io/mcu_timeline/" },
        ],
      },
    ],
  },
  {
    name: "Machine Learning and Data Analysis",
    projects: [
      {
        title: "Automobile Analytics",
        description: "Marketing strategies for an automobile company using data analysis.",
        tech: ["Python", "Pandas", "Matplotlib"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/automobile" },
          {
            label: "Notes",
            url: "https://github.com/rohzzn/automobile/blob/main/colab.ipynb",
          },
        ],
      },
    ],
  },
  {
    name: "IOT",
    projects: [
      {
        title: "Smart Agriculture",
        description:
          "Agriculture using automation for optimal growth and reduced labor costs.",
        tech: ["Arduino", "C++", "Sensors"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/smart_agriculture" },
          {
            label: "Paper",
            url: "https://github.com/rohzzn/smart_agriculture/blob/main/Smart.pdf",
          },
        ],
      },
    ],
  },
  {
    name: "Portfolios",
    projects: [
      {
        title: "Portfolio V4",
        description: "Portfolio website with a nostalgic Windows 95 style.",
        tech: ["HTML5", "CSS3", "JavaScript"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/windows95" },
          { label: "Live Demo", url: "https://rohzzn.github.io/windows95/" },
        ],
      },
      {
        title: "Portfolio V3",
        description: "Minimalist design portfolio website.",
        tech: ["Next.js", "Tailwind CSS", "React"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v3" },
          { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v3/" },
        ],
      },
      {
        title: "Portfolio V2",
        description: "Professional design portfolio website.",
        tech: ["Next.js", "Tailwind CSS", "React"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v2" },
          { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v2/" },
        ],
      },
      {
        title: "Portfolio V1",
        description: "Anime-themed portfolio with a clean layout.",
        tech: ["HTML5", "CSS3", "JavaScript"],
        links: [
          { label: "GitHub", url: "https://github.com/rohzzn/portfolio_v1" },
          { label: "Live Demo", url: "https://rohzzn.github.io/portfolio_v1/" },
        ],
      },
    ],
  },
];

const Projects: React.FC = () => (
  <div className="p-4">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Projects</h2>
    {categories.map((category, catIndex) => (
      <div key={catIndex} className="mb-8">
        {/* Category Header */}
        <h3 className="text-xl font-semibold mb-4 dark:text-white">{category.name}</h3>
        <div className="grid gap-8 md:grid-cols-2">
          {category.projects.map((project, projIndex) => (
            <div
              key={projIndex}
              className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-gray-700"
            >
              <h4 className="text-base font-medium dark:text-white">{project.title}</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2 mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {/* Tech Stack */}
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
