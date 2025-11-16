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
      <h3 className="text-base font-medium mb-8 dark:text-white">{title}</h3>
      <div className="space-y-4">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group cursor-pointer block hover:opacity-70 transition-opacity"
          >
            <article className="flex items-start justify-between gap-4">
              <h4 className="text-sm font-medium dark:text-white flex-shrink-0">
                  {link.title}
                </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
                {link.description}
              </p>
            </article>
            {index !== links.length - 1 && (
              <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mt-4"></div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LinkGroup;