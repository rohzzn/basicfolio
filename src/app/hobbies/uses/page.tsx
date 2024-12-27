import React from 'react';
import { Laptop, Monitor, Code, Terminal, Smartphone } from 'lucide-react';
interface Setup {
  category: string;
  icon: React.ReactNode;
  items: Array<{
    name: string;
    description?: string;
    url?: string;
  }>;
}

const setup: Setup[] = [
  {
    category: "Workstation",
    icon: <Monitor className="w-4 h-4" />,  // Changed from Display to Monitor
    items: [
        { name: 'MacBook Air 13" (2022)', description: 'M2, 8GB RAM, 128GB SSD' },    
          { name: "BenQ", description: "27\" IPS Monitor" },
      { name: "Keychron K8", description: "Mechanical Keyboard with Brown Switches" },
      { name: "Razor Death Adder V2", description: "Wireless Mouse" },
      { name: "Airpods Pro 2", description: "Noise Cancelling Earbuds" }
    ]
  },
  {
    category: "Development",
    icon: <Code className="w-4 h-4" />,
    items: [
      { name: "Visual Studio Code", description: "Primary Editor", url: "https://code.visualstudio.com" },
      { name: "Warp", description: "Terminal", url: "https://www.warp.dev/" },
      { name: "GitHub Copilot", description: "AI Pair Programming" },
      { name: "Docker Desktop", description: "Container Management" },
      { name: "TablePlus", description: "Database Management" }
    ]
  },
  {
    category: "Editor Setup",
    icon: <Terminal className="w-4 h-4" />,
    items: [
      { name: "Theme", description: "GitHub Dark Default" },
      { name: "Font", description: "JetBrains Mono" },
      { name: "Terminal", description: "Oh My Zsh with Starship prompt" },
      { name: "File Icons", description: "Material Icon Theme" }
    ]
  },
  {
    category: "Applications",
    icon: <Laptop className="w-4 h-4" />,
    items: [
      { name: "Arc", description: "Primary Browser" },
      { name: "Raycast", description: "Spotlight Replacement" },
      { name: "CleanShot X", description: "Screenshot Tool" },
      { name: "Notion", description: "Notes & Documentation" },
      { name: "Fig", description: "Terminal Autocomplete" }
    ]
  },
  {
    category: "Mobile Setup",
    icon: <Smartphone className="w-4 h-4" />,
    items: [
      { name: "iPhone 15 Pro", description: "Daily Driver" },
      { name: "Apollo", description: "Reddit Client" },
      { name: "Things", description: "Task Management" },
      { name: "Halide", description: "Camera App" }
    ]
  }
];

const Uses = () => {
  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Uses</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        A list of hardware, software, and tools I use on a daily basis.
      </p>

      <div className="space-y-12">
        {setup.map((category, index) => (
          <div key={index}>
            <div className="flex items-center gap-2 mb-4">
              {category.icon}
              <h3 className="text-base font-medium dark:text-white">{category.category}</h3>
            </div>
            
            <div className="grid gap-4">
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-zinc-900 dark:hover:text-white"
                          >
                            {item.name}
                          </a>
                        ) : (
                          item.name
                        )}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Uses;