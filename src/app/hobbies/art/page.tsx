"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  platform: 'Behance' | 'Dribbble';
  imageUrl: string;
  projectUrl: string;
  tags: string[];
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Windows 95 Portfolio',
    description: 'A nostalgic tribute to the classic Windows 95 interface, reimagined as a modern portfolio.',
    platform: 'Behance',
    imageUrl: '/images/design/windows95.jpg',
    projectUrl: 'https://rohzzn.github.io/windows95',
    tags: ['UI/UX', 'Retro', 'Web Design']
  },
  {
    id: 2,
    title: 'Minimalist Portfolio',
    description: 'Clean and modern portfolio design with focus on typography and whitespace.',
    platform: 'Behance',
    imageUrl: '/images/design/portfolio.jpg',
    projectUrl: 'https://rohzzn.github.io/portfolio_v3',
    tags: ['Minimalist', 'Typography', 'Web Design']
  },
  {
    id: 3,
    title: 'Tanoshi Theme',
    description: 'A dark theme for VS Code focusing on readability and reduced eye strain.',
    platform: 'Dribbble',
    imageUrl: '/images/design/tanoshi.jpg',
    projectUrl: 'https://marketplace.visualstudio.com/items?itemName=RohanSanjeev.tanoshi',
    tags: ['Theme', 'Dark Mode', 'VS Code']
  },
  // Add more projects here...
];

const ArtPage = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Behance' | 'Dribbble'>('all');

  const filteredProjects = projects.filter(
    project => activeFilter === 'all' || project.platform === activeFilter
  );

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Design</h2>
      
      {/* Description */}
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        A collection of my design work and experiments. I focus on creating clean, 
        user-friendly interfaces with attention to typography and visual hierarchy.
      </p>

      {/* Filter Buttons */}
      <div className="flex gap-4 mb-8">
        {(['all', 'Behance', 'Dribbble'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeFilter === filter
                ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {filter === 'all' ? 'All Projects' : filter}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="group bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden"
          >
            {/* Project Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
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
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Platform Badge */}
              <div className="mt-4">
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