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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group cursor-pointer block"
          >
            <article className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {link.title}
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
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