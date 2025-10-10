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
      { name: 'MacBook Air 13" (2022) (Home Server)', description: 'M2, 8GB RAM, 128GB SSD', url: 'https://www.apple.com/macbook-air-m2/' },
      { name: 'MacBook Pro 14" M3 Pro', description: 'Work Laptop', url: 'https://www.apple.com/macbook-pro-14-and-16/' },    
      { name: "Koorui 27\" 300Hz", description: "Gaming Monitor", url: "https://www.amazon.com/dp/B0BQJBQZQX" },
      { name: "BenQ Mobiuz 27\" 165Hz", description: "Secondary Monitor", url: "https://www.benq.com/en-us/monitor/gaming/ex270qm.html" },
      { name: "GTRACING Gaming Chair", description: "Ergonomic Gaming Chair", url: "https://www.gtracingchair.com/" },
      { name: "Logitech C920", description: "HD Webcam", url: "https://www.logitech.com/en-us/products/webcams/c920-pro-hd-webcam.html" },
      { name: "iPad 10th Gen", description: "Tablet for Design & Notes", url: "https://www.apple.com/ipad-10.9/" },
      { name: "Steam Deck OLED", description: "Handheld Gaming", url: "https://store.steampowered.com/steamdeck" }
    ]
  },
  {
    category: "Peripherals",
    items: [
      { name: "Razer Viper V3 Pro", description: "Primary Gaming Mouse", url: "https://www.razer.com/gaming-mice/razer-viper-v3-pro" },
      { name: "Razer DeathAdder V2", description: "Secondary Mouse", url: "https://www.razer.com/gaming-mice/razer-deathadder-v2" },
      { name: "Glorious Model O", description: "Lightweight Gaming Mouse", url: "https://www.gloriousgaming.com/products/glorious-model-o-black" },
      { name: "Logitech G102", description: "Budget Gaming Mouse", url: "https://www.logitechg.com/en-us/products/gaming-mice/g102-lightsync-rgb-gaming-mouse.html" },
      { name: "Keychron K8", description: "Wireless Mechanical Keyboard", url: "https://www.keychron.com/products/keychron-k8-wireless-mechanical-keyboard" },
      { name: "GK61 (Gateron Browns)", description: "60% Mechanical Keyboard", url: "https://www.amazon.com/dp/B07JBQZPX6" },
      { name: "HyperX Cloud 2 (Wireless)", description: "Primary Gaming Headset", url: "https://www.hyperxgaming.com/us/headsets/cloud-flight-wireless-gaming-headset" },
      { name: "Apple EarPods", description: "Wired Earphones", url: "https://www.apple.com/us/shop/product/MMTN2AM/A/earpods-with-35-mm-headphone-plug" },
      { name: "Razer Kraken", description: "Gaming Headset", url: "https://www.razer.com/gaming-headsets/razer-kraken" },
      { name: "HyperX Cloud", description: "Gaming Headset", url: "https://www.hyperxgaming.com/us/headsets/cloud-gaming-headset" },
      { name: "HyperX SoloCast", description: "USB Microphone", url: "https://www.hyperxgaming.com/us/microphones/hyperx-solocast-usb-microphone" },
      { name: "Blue Snowball", description: "USB Microphone", url: "https://www.bluemic.com/en-us/products/snowball/" },
      { name: "Artisan FX Zero XSOFT", description: "Premium Gaming Mousepad", url: "https://www.artisan-jp.com/fx-zero-eng.html" },
      { name: "Razer Gigantus", description: "Large Gaming Mousepad", url: "https://www.razer.com/gaming-mouse-mats/razer-gigantus-v2" }
    ]
  },
  {
    category: "Development",
    items: [
      { name: "Visual Studio Code", description: "Primary Editor", url: "https://code.visualstudio.com" },
      { name: "Warp", description: "Terminal", url: "https://www.warp.dev/" },
      { name: "Docker Desktop", description: "Container Management", url: "https://www.docker.com/products/docker-desktop/" },
      { name: "Burp Suite", description: "Security Assessment", url: "https://portswigger.net/burp" },
      { name: "Postman", description: "API Testing Tool", url: "https://www.postman.com/" }
    ]
  },
  {
    category: "Apps I Like",
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
    category: "Bookmarks (Cool Finds)",
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