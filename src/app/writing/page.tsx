import React from 'react';
import Link from 'next/link';

const Writing: React.FC = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Writing</h2>
    <div className="grid gap-8 md:grid-cols-2">
      {[
        {
          title: 'Ixigo Experience',
          date: 'March 5, 2024',
          slug: 'ixigo-experience'
        }
      ].map((post, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-base font-medium dark:text-white">{post.title}</h3>
          <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            <span>{post.date}</span>
            <span>•</span>
          </div>
          <Link href={`/writing/${post.slug}`}>
            <span className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              Read more →
            </span>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

export default Writing;
