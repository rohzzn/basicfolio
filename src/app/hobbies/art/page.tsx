// src/app/hobbies/art/page.tsx
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface ArtProject {
  title: string;
  description: string;
  platform: 'Behance' | 'Dribbble';
  imageUrl: string;
  projectUrl: string;
  tags: string[];
}

const artProjects: ArtProject[] = [
  {
    title: 'Windows 95 Portfolio',
    description: 'A nostalgic tribute to the classic Windows 95 interface.',
    platform: 'Behance',
    imageUrl: '/images/design/windows95.jpg',
    projectUrl: 'https://rohzzn.github.io/windows95',
    tags: ['UI/UX', 'Retro', 'Web Design']
  },
  {
    title: 'Minimalist Portfolio',
    description: 'Clean and modern portfolio design with focus on typography.',
    platform: 'Behance',
    imageUrl: '/images/design/portfolio.jpg',
    projectUrl: 'https://rohzzn.github.io/portfolio_v3',
    tags: ['Minimalist', 'Typography', 'Web Design']
  },
  {
    title: 'Tanoshi Theme',
    description: 'Dark theme for VS Code focusing on readability and eye comfort.',
    platform: 'Dribbble',
    imageUrl: '/images/design/tanoshi.jpg',
    projectUrl: 'https://marketplace.visualstudio.com/items?itemName=RohanSanjeev.tanoshi',
    tags: ['Theme', 'Dark Mode', 'VS Code']
  }
];

const ArtPage = () => {
  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Design</h2>
      
      {/* Description */}
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        A collection of my design projects and experiments. I focus on creating clean, 
        user-friendly interfaces with attention to typography and visual hierarchy.
      </p>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artProjects.map((project, index) => (
          <div 
            key={index}
            className="group bg-white dark:bg-zinc-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Project Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Fallback for missing images */}
                <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                  <span className="text-zinc-500 dark:text-zinc-400">Image not found</span>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium dark:text-white">{project.title}</h3>
                <Link 
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                >
                  <ExternalLink size={16} />
                </Link>
              </div>
              
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Platform Badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  project.platform === 'Behance' 
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
                }`}>
                  {project.platform}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Links */}
      <div className="mt-12 flex justify-center space-x-6">
        <Link
          href="https://www.behance.net/rohzzn"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
        >
          View Behance Profile
          <ExternalLink size={16} />
        </Link>
        <Link
          href="https://dribbble.com/rohzzn"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
        >
          View Dribbble Profile
          <ExternalLink size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ArtPage;