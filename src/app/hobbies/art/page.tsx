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
  // Behance Projects
  {
    id: 1,
    title: 'Sarojini Gastro',
    description: 'Branding design for Hospital.',
    platform: 'Behance',
    imageUrl: '/images/design/sarojini.png',
    projectUrl: 'https://www.behance.net/gallery/127106007/Sarojini-Gastro-BRANDING',
    tags: ['Branding', 'Logo Design', 'Hospital']
  },
  {
    id: 2,
    title: 'Kōhī',
    description: 'Brand identity design for a Japanese-inspired coffee beans.',
    platform: 'Behance',
    imageUrl: '/images/design/kohi.png',
    projectUrl: 'https://www.behance.net/gallery/109291517/Kohi-BRANDING',
    tags: ['Branding', 'Japanese', 'Coffee']
  },
  {
    id: 3,
    title: 'Merch Design',
    description: 'Collection of merchandise designs featuring unique illustrations and patterns.',
    platform: 'Behance',
    imageUrl: '/images/design/merch.png',
    projectUrl: 'https://www.behance.net/gallery/109299665/Merch-Design',
    tags: ['Merchandise', 'Illustration', 'Fashion']
  },
  {
    id: 4,
    title: 'Mascots Folio',
    description: 'A collection of character mascots designed for various brands and projects.',
    platform: 'Behance',
    imageUrl: '/images/design/mascots.png',
    projectUrl: 'https://www.behance.net/gallery/97663207/Mascots-01',
    tags: ['Character Design', 'Mascots', 'Illustration']
  },
  {
    id: 5,
    title: 'Game Backgrounds',
    description: 'Environmental designs and background artwork for gaming projects.',
    platform: 'Behance',
    imageUrl: '/images/design/gamebg.png',
    projectUrl: 'https://www.behance.net/gallery/107259111/Game-Backgrounds',
    tags: ['Game Art', 'Environment Design', 'Digital Art']
  },
  {
    id: 6,
    title: 'Logofolio 01',
    description: 'Collection of logo designs and brand marks for various clients.',
    platform: 'Behance',
    imageUrl: '/images/design/logofolio.png',
    projectUrl: 'https://www.behance.net/gallery/96981231/Logofolio-01',
    tags: ['Logo Design', 'Branding', 'Identity']
  },
  {
    id: 7,
    title: 'Pirate King',
    description: 'Illustration of Pirate King YouTuber.',
    platform: 'Behance',
    imageUrl: '/images/design/pirateking.png',
    projectUrl: 'https://www.behance.net/gallery/134277689/Pirate-King-BANNER',
    tags: ['Cover Art', 'Branding', 'Identity']
  },

  // Dribbble Projects
  {
    id: 8,
    title: 'Zenitsu',
    description: 'Character illustration inspired by Demon Slayer.',
    platform: 'Dribbble',
    imageUrl: '/images/design/zenitsu.jpg',
    projectUrl: 'https://dribbble.com/shots/14276575-Zenitsu-x-Calatop',
    tags: ['Illustration', 'Anime', 'Character Design']
  },
  {
    id: 9,
    title: 'Sushi',
    description: 'Food illustration and packaging design concept.',
    platform: 'Dribbble',
    imageUrl: '/images/design/sushi.jpg',
    projectUrl: 'https://dribbble.com/shots/14520503-Sushi',
    tags: ['Food', 'Illustration', 'Packaging']
  },
  {
    id: 10,
    title: 'Taj Mahal',
    description: 'Architectural illustration of the iconic monument.',
    platform: 'Dribbble',
    imageUrl: '/images/design/tajmahal.jpg',
    projectUrl: 'https://dribbble.com/shots/14520610-Taj-Mahal',
    tags: ['Architecture', 'Illustration', 'Landmarks']
  },
  {
    id: 11,
    title: 'Cat Illustration',
    description: 'Playful cat character design and illustration.',
    platform: 'Dribbble',
    imageUrl: '/images/design/cat.jpg',
    projectUrl: 'https://dribbble.com/shots/14520857-Cat',
    tags: ['Character Design', 'Animals', 'Illustration']
  },
 
  {
    id: 12,
    title: 'Dog Illustration',
    description: 'Playful dog Illustration design.',
    platform: 'Dribbble',
    imageUrl: '/images/design/dog.jpg',
    projectUrl: 'https://dribbble.com/shots/14537048-Dog',
    tags: ['Mascot', 'Character Design', 'Branding']
  },
  {
    id: 13,
    title: 'Wallpaper Engine UI',
    description: 'User interface design for a wallpaper customization app.',
    platform: 'Dribbble',
    imageUrl: '/images/design/wallpaperengine.jpg',
    projectUrl: 'https://dribbble.com/shots/14535866-UI-Concept-Wallpaper-Engine',
    tags: ['UI Design', 'Desktop', 'Application']
  },
  {
    id: 14,
    title: 'Delivery App UI',
    description: 'Modern interface design for a food delivery application.',
    platform: 'Dribbble',
    imageUrl: '/images/design/packageui.jpg',
    projectUrl: 'https://dribbble.com/shots/22380216-Delivery-Tracking',
    tags: ['UI Design', 'Mobile', 'Food Delivery']
  },
  {
    id: 15,
    title: 'Finance App UI',
    description: 'Clean and modern finance application interface.',
    platform: 'Dribbble',
    imageUrl: '/images/design/cash.jpg',
    projectUrl: 'https://dribbble.com/shots/21392007-Finance',
    tags: ['UI Design', 'Finance', 'Mobile']
  },
  {
    id: 16,
    title: 'Rohan Mascot',
    description: 'Personal brand mascot design.',
    platform: 'Dribbble',
    imageUrl: '/images/design/mascot.jpg',
    projectUrl: 'https://dribbble.com/shots/14977365-Calatop',
    tags: ['Mascot', 'Personal Brand', 'Character Design']
  }
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
        A collection of my design work and experiments. This page still WIP 🪴.
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

     
    </div>
  );
};

export default ArtPage;