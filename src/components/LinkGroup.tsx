"use client";
import React from 'react';
import Link from 'next/link';

interface LinkItem {
  title: string;
  description: string;
  url: string;
}

interface LinkGroupProps {
  title: string;
  links: LinkItem[];
}

const LinkGroup: React.FC<LinkGroupProps> = ({ title, links }) => {
  return (
    <div>
      <h3 className="text-base font-medium mb-4 dark:text-white">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                  {link.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {link.description}
                </p>
              </div>
              <div className="text-zinc-400 dark:text-zinc-500 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LinkGroup;