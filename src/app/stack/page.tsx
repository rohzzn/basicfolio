// src/app/stack/page.tsx

"use client";
import React from 'react';
import { 
  SiPython, 
  SiCplusplus, 
  SiJavascript, 
  SiHtml5, 
  SiReact, 
  SiDjango, 
  SiTailwindcss, 
  SiBootstrap, 
  SiMysql, 
  SiGit, 
  SiDocker, 
  SiFigma, 
  SiAdobephotoshop, 
  SiAdobeillustrator 
} from 'react-icons/si';
import { FaJava, FaTerminal, FaAws } from 'react-icons/fa'; // Replacing SiJava, SiBash, SiAzure, SiAmazonaws
import { AiOutlineSetting } from 'react-icons/ai'; // Replacing AiOutlineWireframe
import { FiSettings } from 'react-icons/fi'; // For PM2
import { BiUserVoice } from 'react-icons/bi'; // For UI/UX

const Stack: React.FC = () => {
  const techStack = [
    {
      category: 'Programming Languages',
      icon: FaJava, // Using FaJava instead of SiJava
      items: [
        { name: 'Python', icon: SiPython },
        { name: 'Java', icon: FaJava },
        { name: 'C', icon: SiCplusplus }, // Using C++ icon for C
        { name: 'JavaScript', icon: SiJavascript },
        { name: 'HTML/CSS', icon: SiHtml5 },
      ],
    },
    {
      category: 'Frameworks',
      icon: SiReact,
      items: [
        { name: 'ReactJS', icon: SiReact },
        { name: 'Django', icon: SiDjango },
        { name: 'TailwindCSS', icon: SiTailwindcss },
        { name: 'Bootstrap', icon: SiBootstrap },
      ],
    },
    {
      category: 'Other Technologies',
      icon: SiMysql,
      items: [
        { name: 'MySQL', icon: SiMysql },
        { name: 'Git', icon: SiGit },
        { name: 'Bash', icon: FaTerminal }, // Using FaTerminal instead of SiBash
        { name: 'Docker', icon: SiDocker },
        { name: 'PM2', icon: FiSettings }, // Using Settings icon for PM2
        { name: 'AWS', icon: FaAws }, // Using FaAws instead of SiAmazonaws
      ],
    },
    {
      category: 'Design',
      icon: SiFigma,
      items: [
        { name: 'Wireframing', icon: AiOutlineSetting }, // Using AiOutlineSetting instead of AiOutlineWireframe
        { name: 'UI/UX', icon: BiUserVoice },
        { name: 'Figma', icon: SiFigma },
        { name: 'Adobe Photoshop', icon: SiAdobephotoshop },
        { name: 'Adobe Illustrator', icon: SiAdobeillustrator },
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-medium mb-6 dark:text-white">Stack</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {techStack.map((category, index) => (
          <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <category.icon className="text-2xl text-indigo-500 mr-2" />
              <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{category.category}</h3>
            </div>
            <ul className="space-y-2">
              {category.items.map((item, i) => (
                <li key={i} className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <item.icon className="text-lg" />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stack;
