// src/app/projects/page.tsx

"use client";
import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

const Projects: React.FC = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Projects</h2>
    <div className="grid gap-8 md:grid-cols-2">
      {[
        {
          title: 'Project One',
          description: 'A minimal task management system built with React and TypeScript.',
          tech: ['React', 'TypeScript', 'Node.js'],
          github: 'https://github.com',
          live: 'https://example.com'
        },
        {
          title: 'Project Two',
          description: 'Real-time collaborative markdown editor using WebSocket.',
          tech: ['Next.js', 'Socket.io', 'PostgreSQL'],
          github: 'https://github.com',
          live: 'https://example.com'
        }
      ].map((project, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-base font-medium dark:text-white">{project.title}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2 mb-4">{project.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-3 ml-auto">
              <a href={project.github} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" target="_blank" rel="noopener noreferrer">
                <Github size={16} />
              </a>
              <a href={project.live} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Projects;
