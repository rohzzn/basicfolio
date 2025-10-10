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
      <h3 className="text-lg font-medium mb-6 dark:text-white">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group cursor-pointer block"
          >
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                  {link.title}
                </h4>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  →
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {link.description}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LinkGroup;