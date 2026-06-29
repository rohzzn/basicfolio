"use client";

import React from "react";
import Link from "next/link";

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
    <section className="rounded-lg border border-zinc-100 p-4 sm:p-5 dark:border-zinc-800/80">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {title}
      </h3>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group min-w-0"
          >
            <p className="text-sm font-medium text-zinc-800 transition-colors group-hover:text-zinc-600 dark:text-zinc-200 dark:group-hover:text-white">
              {link.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LinkGroup;
