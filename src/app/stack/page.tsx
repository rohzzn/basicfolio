// src/app/stack/page.tsx

"use client";
import React from 'react';

const Stack: React.FC = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Stack</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        {
          category: 'Languages',
          items: ['TypeScript', 'Python', 'Rust']
        },
        {
          category: 'Frontend',
          items: ['React', 'Next.js', 'Tailwind CSS']
        },
        {
          category: 'Backend',
          items: ['Node.js', 'PostgreSQL', 'Redis']
        },
        {
          category: 'Tools',
          items: ['Git', 'Docker', 'AWS']
        }
      ].map((category, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-sm font-medium mb-4 text-zinc-800 dark:text-zinc-200">{category.category}</h3>
          <ul className="space-y-2">
            {category.items.map((item, i) => (
              <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

export default Stack;
