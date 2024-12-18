// src/app/hobbies/art/page.tsx

"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ArtProject {
  title: string;
  platform: 'Behance' | 'Dribbble';
  imageSrc: string; // Path to the image in public/images/art/
  projectUrl: string; // URL to the project on Behance or Dribbble
}

const artProjects: ArtProject[] = [
  {
    title: 'Modern UI Design',
    platform: 'Behance',
    imageSrc: '/images/art/behance-project1.jpg',
    projectUrl: 'https://www.behance.net/gallery/your-behance-project1',
  },
  {
    title: 'Creative Illustration',
    platform: 'Dribbble',
    imageSrc: '/images/art/dribbble-project1.jpg',
    projectUrl: 'https://dribbble.com/shots/your-dribbble-project1',
  },
  {
    title: 'Responsive Web Design',
    platform: 'Behance',
    imageSrc: '/images/art/behance-project2.jpg',
    projectUrl: 'https://www.behance.net/gallery/your-behance-project2',
  },
  {
    title: 'Icon Set Collection',
    platform: 'Dribbble',
    imageSrc: '/images/art/dribbble-project2.jpg',
    projectUrl: 'https://dribbble.com/shots/your-dribbble-project2',
  },
  // Add more projects as needed
];

const Art: React.FC = () => (
  <div className="max-w-7xl mx-auto p-6">
    <h2 className="text-3xl font-bold mb-6 dark:text-white">Design</h2>
    <p className="text-zinc-600 dark:text-zinc-400 mb-8">
      Welcome to my Design page! Here you will find my designs showcased on Behance and Dribbble.
    </p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {artProjects.map((project, index) => (
        <div key={index} className="bg-paper dark:bg-zinc-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
            <div className="relative w-full h-48">
              <Image
                src={project.imageSrc}
                alt={project.title}
                layout="fill"
                objectFit="cover"
                className="transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold dark:text-white">{project.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{project.platform}</p>
            </div>
          </Link>
        </div>
      ))}
    </div>

    {/* Links to Behance and Dribbble Profiles */}
    <div className="mt-12 flex justify-center space-x-6">
      <Link href="https://www.behance.net/rohzzn" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline">
        {/* Behance Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm6.929 17.071a8.004 8.004 0 01-5.657 2.343 8.004 8.004 0 01-5.657-2.343 8.004 8.004 0 010-11.314 8.004 8.004 0 015.657-2.343 8.004 8.004 0 015.657 2.343 8.004 8.004 0 010 11.314zm-5.657-2.343a2 2 0 10-2.828-2.828 2 2 0 002.828 2.828z" />
        </svg>
        <span>View on Behance</span>
      </Link>
      <Link href="https://dribbble.com/rohzzn" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-pink-600 dark:text-pink-400 hover:underline">
        {/* Dribbble Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.627-5.373-12-12-12zm5.165 7.998a.996.996 0 00-.706.293 7.916 7.916 0 00-1.907 2.387 7.916 7.916 0 00-1.907-2.387.996.996 0 00-1.414 1.414 5.925 5.925 0 012.714 3.388 5.925 5.925 0 012.714-3.388.996.996 0 00-.706-1.707zm-10.33 0a.996.996 0 00-.706.293A7.916 7.916 0 004.96 10.38a7.916 7.916 0 001.907-2.387.996.996 0 00-1.414-1.414 5.925 5.925 0 012.714 3.388 5.925 5.925 0 01-2.714-3.388.996.996 0 00-.706-1.707zm10.33 8.004a.996.996 0 00-.706-.293 7.916 7.916 0 00-1.907 2.387 7.916 7.916 0 00-1.907-2.387.996.996 0 00-1.414 1.414 5.925 5.925 0 012.714 3.388 5.925 5.925 0 012.714-3.388.996.996 0 00-.706-1.707zm-10.33 0a.996.996 0 00-.706-.293 7.916 7.916 0 00-1.907 2.387 7.916 7.916 0 001.907-2.387.996.996 0 00-1.414-1.414 5.925 5.925 0 012.714 3.388 5.925 5.925 0 01-2.714-3.388.996.996 0 00-.706-1.707z" />
        </svg>
        <span>View on Dribbble</span>
      </Link>
    </div>
  </div>
);

export default Art;
