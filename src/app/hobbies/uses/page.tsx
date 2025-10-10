"use client";
import React from 'react';
import Image from 'next/image';

interface Setup {
  category: string;
  items: Array<{
    name: string;
    description?: string;
    url?: string;
  }>;
}

const setup: Setup[] = [
  {
    category: "Workstation",
    items: [
      { name: 'MacBook Air 13" (2022)', description: 'M2, 8GB RAM, 128GB SSD', url: 'https://www.apple.com/macbook-air-m2/' },    
      { name: "BenQ PD2700U", description: "27\" IPS Monitor", url: "https://www.benq.com/en-us/monitor/designer/pd2700u.html" },
      { name: "Keychron K8", description: "Mechanical Keyboard with Brown Switches", url: "https://www.keychron.com/products/keychron-k8-wireless-mechanical-keyboard" },
      { name: "Razor Death Adder V2", description: "Wireless Mouse", url: "https://www.razer.com/gaming-mice/razer-deathadder-v2" },
      { name: "Airpods Pro 2", description: "Noise Cancelling Earbuds", url: "https://www.apple.com/airpods-pro/" },
      { name: "Logitech C920", description: "HD Webcam", url: "https://www.logitech.com/en-us/products/webcams/c920-pro-hd-webcam.html" },
      { name: "IKEA Markus", description: "Office Chair", url: "https://www.ikea.com/us/en/p/markus-office-chair-vissle-dark-gray-90289172/" }
    ]
  },
  {
    category: "Development",
    items: [
      { name: "Visual Studio Code", description: "Primary Editor", url: "https://code.visualstudio.com" },
      { name: "Warp", description: "Terminal", url: "https://www.warp.dev/" },
      { name: "Docker Desktop", description: "Container Management", url: "https://www.docker.com/products/docker-desktop/" },
      { name: "Burp Suite", description: "Security Assessment", url: "https://portswigger.net/burp" },
      { name: "Postman", description: "API Testing Tool", url: "https://www.postman.com/" },
      { name: "GitHub Desktop", description: "Git GUI", url: "https://desktop.github.com/" },
      { name: "MongoDB Compass", description: "Database GUI", url: "https://www.mongodb.com/products/compass" },
      { name: "TablePlus", description: "Database Management", url: "https://tableplus.com/" },
      { name: "Insomnia", description: "API Design Platform", url: "https://insomnia.rest/" }
    ]
  },
  {
    category: "Mac Dock",
    items: [
      { name: "Arc", description: "Primary Browser", url: "https://arc.net/" },
      { name: "Raycast", description: "Spotlight Replacement", url: "https://www.raycast.com/" },
      { name: "Teams", description: "Work Collaboration", url: "https://www.microsoft.com/en-us/microsoft-teams/download-app" },
      { name: "Notion", description: "Notes & Documentation", url: "https://www.notion.so/" },
      { name: "Typora", description: "Markdown Editor", url: "https://typora.io/" },
      { name: "Spotify", description: "Music Streaming", url: "https://www.spotify.com/" },
      { name: "Discord", description: "Community and Chat", url: "https://discord.com/" },
      { name: "Adobe Photoshop", description: "Image Editing", url: "https://www.adobe.com/products/photoshop.html" },
      { name: "Figma", description: "UI/UX Design", url: "https://www.figma.com/" },
      { name: "Bitwarden", description: "Password Manager", url: "https://bitwarden.com/" },
      { name: "Authy", description: "Two Factor Auth", url: "https://authy.com/" },
      { name: "Clean My Mac", description: "System Cleaner", url: "https://macpaw.com/cleanmymac" },
      { name: "Cheatsheet", description: "Shortcuts", url: "https://www.mediaatelier.com/CheatSheet/" },
      { name: "Shottr", description: "Screenshot Tool", url: "https://shottr.cc/" },
      { name: "Rectangle", description: "Window Manager", url: "https://rectangleapp.com/" },
      { name: "Numi", description: "Calculator", url: "https://numi.app/" },
      { name: "Slack", description: "Team Communication", url: "https://slack.com/" }
    ]
  },
  {
    category: "Mobile Setup",
    items: [
      { name: "iPhone 16 Pro", description: "Daily Driver", url: "https://www.apple.com/iphone-14-pro/" },
      { name: "Perplexity", description: "AI Search Engine", url: "https://www.perplexity.ai/" },
      { name: "Apple Calendar", description: "Planning & Tasks", url: "https://apps.apple.com/us/app/calendar/id1108185179" },
      { name: "Kino", description: "Camera App", url: "https://apps.apple.com/us/app/kino-analog-film-camera/id1473600853" },
      { name: "Fold", description: "Money Management", url: "https://fold.money/" },
      { name: "Flighty", description: "Flights Tracker", url: "https://www.flightyapp.com/" },
      { name: "Robinhood", description: "Stocks & Crypto", url: "https://robinhood.com/us/en/" },
      { name: "Phantom", description: "Crypto Wallet", url: "https://phantom.app/" },
      { name: "Apollo", description: "Reddit Client", url: "https://apolloapp.io/" },
      { name: "Things", description: "Task Management", url: "https://culturedcode.com/things/" },
      { name: "Halide", description: "Pro Camera", url: "https://halide.cam/" }
    ]
  },
  {
    category: "Editor Setup",
    items: [
      { name: "Theme", description: "Gruvbox Hard Theme", url: "https://marketplace.visualstudio.com/items?itemName=jdinhlife.gruvbox" },
      { name: "Font", description: "JetBrains Mono", url: "https://www.jetbrains.com/lp/mono/" },
      { name: "File Icons", description: "Material Icon Theme", url: "https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme" },
      { name: "Prettier", description: "Code Formatter", url: "https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode" },
      { name: "ESLint", description: "Linting", url: "https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint" },
      { name: "GitLens", description: "Git Supercharged", url: "https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens" },
      { name: "Path Intellisense", description: "Autocomplete", url: "https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense" },
      { name: "Error Lens", description: "Error Highlighting", url: "https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens" },
      { name: "GitHub Copilot", description: "AI Assistant", url: "https://github.com/features/copilot" },
      { name: "Live Share", description: "Collaboration", url: "https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare" }
    ]
  }
];

const Uses = () => {
  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-8 dark:text-white">Uses</h2>
      
      {/* Setup Images */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={`/images/setup/${num}.png`}
              alt={`Setup ${num}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
        {/* Setup Categories */}
        {setup.map((category, index) => (
          <div key={index}>
            <h3 className="text-base font-medium mb-6 dark:text-white">{category.category}</h3>
            
            <div className="space-y-6">
              {category.items.map((item, itemIndex) => (
                <article key={itemIndex} className="group">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-70 transition-opacity"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium dark:text-white">{item.name}</h4>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {item.description}
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium dark:text-white">{item.name}</h4>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.description}
                      </span>
                    </div>
                  )}
                  {itemIndex !== category.items.length - 1 && (
                    <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mt-6"></div>
                  )}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Uses;