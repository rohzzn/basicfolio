// src/app/hobbies/page.tsx

"use client";
import React from 'react';

const Hobbies: React.FC = () => (
  <div className="max-w-2xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hobbies</h2>
    <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
      <p>
        When I&#39;m not coding, you can find me exploring mechanical keyboards,
        contributing to open-source projects, and learning about system design.
      </p>
      <p>
        I also enjoy reading technical blogs, participating in hackathons,
        and experimenting with new programming languages.
      </p>
    </div>
  </div>
);

export default Hobbies;
