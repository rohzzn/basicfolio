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
    category: "On the Desk",
    items: [
      // Screens
      { name: "Koorui 27\" 300Hz", description: "Main Monitor", url: "https://www.amazon.com/dp/B0BQJBQZQX" },
      { name: "BenQ Mobiuz 27\" 165Hz", description: "Old Monitor", url: "https://www.benq.com/en-us/monitor/gaming/ex270qm.html" },

      // Devices
      { name: 'MacBook Air 13" M2 Air', description: "Personal Laptop", url: "https://www.apple.com/macbook-air-m2/" },
      { name: 'MacBook Pro 14" M3 Pro', description: "Work Laptop", url: "https://www.apple.com/macbook-pro-14-and-16/" },
      { name: "iPad 10th Gen", description: "Design & Notes", url: "https://www.apple.com/ipad-10.9/" },
      { name: "Steam Deck OLED", description: "Handheld Gaming", url: "https://store.steampowered.com/steamdeck" },

      // Desk gear
      { name: "Insta360 Link 2", description: "4K Webcam", url: "https://www.amazon.com/Insta360-Link-Tracking-Noise-Canceling-Streaming/dp/B0FPR2G17Z?th=1" },

      // Peripherals
      { name: "Razer Viper V3 Pro", description: "Mouse", url: "https://www.razer.com/gaming-mice/razer-viper-v3-pro" },
      { name: "Razer DeathAdder V2", description: "Mouse", url: "https://www.razer.com/gaming-mice/razer-deathadder-v2" },
      { name: "Glorious Model O", description: "Wired Mouse", url: "https://www.gloriousgaming.com/products/glorious-model-o-black" },
      { name: "Keychron K8", description: "Gateron Brown Wireless Keyboard", url: "https://www.keychron.com/products/keychron-k8-wireless-mechanical-keyboard" },
      { name: "GK61", description: "Gateron Brown Keyboard", url: "https://www.amazon.com/dp/B07JBQZPX6" },

      // Audio
      { name: "HyperX Cloud 2", description: "Wireless Headset", url: "https://www.hyperxgaming.com/us/headsets/cloud-flight-wireless-gaming-headset" },
      { name: "Apple EarPods", description: "Earphones", url: "https://www.apple.com/us/shop/product/MMTN2AM/A/earpods-with-35-mm-headphone-plug" },
      { name: "HyperX SoloCast", description: "Microphone", url: "https://www.hyperxgaming.com/us/microphones/hyperx-solocast-usb-microphone" },

      // Mousepads
      { name: "Artisan FX Zero XSOFT", description: "Mousepad", url: "https://www.artisan-jp.com/fx-zero-eng.html" },
      { name: "Razer Gigantus", description: "Mousepad", url: "https://www.razer.com/gaming-mouse-mats/razer-gigantus-v2" }
    ]
  },
  {
    category: "PC Specs",
    items: [
      {
        name: "Motherboard",
        description: "Gigabyte B650 Gaming X AX V2 (ATX)",
      },
      {
        name: "CPU",
        description: "AMD Ryzen 7 7700X",
      },
      {
        name: "GPU",
        description: "NVIDIA GeForce RTX 3060 Ti",
      },
      {
        name: "RAM",
        description: "Crucial 32 GB (2×16 GB) DDR5-6000 CL36",
      },
      {
        name: "Storage",
        description: "Crucial 1 TB P3 NVMe Gen4 SSD",
      },
      {
        name: "PSU",
        description: "Lian Li RB650W 650 W 80+ Bronze (ATX 3.1)",
      },
      {
        name: "Case",
        description: "NZXT H5 Flow RGB ATX White (2024)",
      },
    ],
  },
  {
    category: "Dev Tools",
    items: [
      { name: "Visual Studio Code", description: "Primary Editor", url: "https://code.visualstudio.com" },
      { name: "Warp", description: "Terminal", url: "https://www.warp.dev/" },
      { name: "Docker Desktop", description: "Container Management", url: "https://www.docker.com/products/docker-desktop/" },
      { name: "Burp Suite", description: "Security Assessment", url: "https://portswigger.net/burp" },
      { name: "Postman", description: "API Testing Tool", url: "https://www.postman.com/" }
    ]
  },
  {
    category: "Apps I Use",
    items: [
      { name: "Flighty", description: "Flight Tracker", url: "https://www.flightyapp.com/" },
      { name: "Balatro", description: "Poker Roguelike Game", url: "https://store.steampowered.com/app/2379780/Balatro/" },
      { name: "Fold", description: "Money Manager", url: "https://fold.money/" },
      { name: "Hevy", description: "Workout Tracker", url: "https://www.hevyapp.com/" },
      { name: "Raycast", description: "Spotlight Replacement", url: "https://www.raycast.com/" },
      { name: "Authy", description: "Two Factor Auth", url: "https://authy.com/" },
      { name: "CheatSheet", description: "Keyboard Shortcuts", url: "https://www.mediaatelier.com/CheatSheet/" },
      { name: "Bitwarden", description: "Password Manager", url: "https://bitwarden.com/" },
      { name: "Photoshop", description: "Editing", url: "https://www.adobe.com/products/photoshop.html" },
      { name: "Discord", description: "Community Chat", url: "https://discord.com/" },
      { name: "Spotify", description: "Music Streaming", url: "https://www.spotify.com/" },
      { name: "Typora", description: "Markdown Editor", url: "https://typora.io/" }
    ]
  },
  {
    category: "Bookmarks",
    items: [
      { name: "Shorts.so", description: "Screenshot Editor", url: "https://shorts.so/" },
      { name: "Globe Explorer", description: "Fun Visualizations", url: "https://explorer.globe.engineer/" },
      { name: "Fontshare", description: "Free Quality Fonts", url: "https://www.fontshare.com/" },
      { name: "Free Faces", description: "Font Gallery", url: "https://www.freefaces.gallery/" },
      { name: "SVGL", description: "SVG Logo Library", url: "https://svgl.app/" },
      { name: "Curated Supply", description: "Well Designed Things", url: "https://curated.supply/" },
      { name: "Rotato", description: "3D Device Mockups", url: "https://rotato.app/" },
      { name: "Adobe Podcast Enhance", description: "Audio Enhancement", url: "https://podcast.adobe.com/enhance" },
      { name: "ElevenLabs", description: "AI Voice Generation", url: "https://elevenlabs.io/" }
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
      
      <div className="md:columns-2 md:gap-16 space-y-12">
        {/* Setup Categories */}
        {setup.map((category, index) => (
          <div key={index} className="break-inside-avoid mb-12">
            <h3 className="text-base font-medium mb-8 dark:text-white">{category.category}</h3>
            
            <div className="space-y-4">
              {category.items.map((item, itemIndex) => (
                <article key={itemIndex} className="group">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block hover:opacity-70 transition-opacity"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-sm font-medium dark:text-white flex-shrink-0">{item.name}</h4>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
                          {item.description}
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-medium dark:text-white flex-shrink-0">{item.name}</h4>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
                        {item.description}
                      </span>
                    </div>
                  )}
                  {itemIndex !== category.items.length - 1 && (
                    <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mt-4"></div>
                  )}
                </article>
              ))}
            </div>
            
            {/* Divider between categories */}
            {index !== setup.length - 1 && (
              <div className="w-full h-px bg-zinc-200/50 dark:bg-zinc-800/50 mt-8"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Uses;