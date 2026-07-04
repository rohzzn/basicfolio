"use client";

import React from "react";
import Image from "@/components/SiteImage";

interface GearItem {
  name: string;
  description?: string;
  url?: string;
}

const SETUP_PHOTOS = [
  { src: "/images/setup/1.png", alt: "Desk overview" },
  { src: "/images/setup/2.png", alt: "Monitor and peripherals" },
  { src: "/images/setup/3.png", alt: "Keyboard and mouse" },
  { src: "/images/setup/4.png", alt: "Desk detail" },
];

const deskGroups: { label: string; items: GearItem[] }[] = [
  {
    label: "Displays",
    items: [
      { name: 'Koorui 27" 300Hz', description: "Main monitor", url: "https://www.amazon.com/dp/B0BQJBQZQX" },
      { name: 'BenQ Mobiuz 27" 165Hz', description: "Secondary monitor", url: "https://www.benq.com/en-us/monitor/gaming/ex270qm.html" },
    ],
  },
  {
    label: "Devices",
    items: [
      { name: 'MacBook Air 13" M2', description: "Personal laptop", url: "https://www.apple.com/macbook-air-m2/" },
      { name: 'MacBook Pro 14" M3 Pro', description: "Work laptop", url: "https://www.apple.com/macbook-pro-14-and-16/" },
      { name: "iPad 10th Gen", description: "Design & notes", url: "https://www.apple.com/ipad-10.9/" },
      { name: "PS5 Slim", description: "Console", url: "https://www.playstation.com/en-us/ps5/ps5/" },
    ],
  },
  {
    label: "Peripherals",
    items: [
      { name: "Razer Viper V3 Pro", description: "Main mouse", url: "https://www.razer.com/gaming-mice/razer-viper-v3-pro" },
      { name: "Razer DeathAdder V2", description: "Backup mouse", url: "https://www.razer.com/gaming-mice/razer-deathadder-v2" },
      { name: "Glorious Model O", description: "Wired mouse", url: "https://www.gloriousgaming.com/products/glorious-model-o-black" },
      { name: "Keychron K8", description: "Wireless keyboard", url: "https://www.keychron.com/products/keychron-k8-wireless-mechanical-keyboard" },
      { name: "GK61", description: "Compact keyboard", url: "https://www.amazon.com/dp/B07JBQZPX6" },
      { name: "Artisan FX Zero XSOFT", description: "Mousepad", url: "https://www.artisan-jp.com/fx-zero-eng.html" },
      { name: "Razer Gigantus", description: "Desk pad", url: "https://www.razer.com/gaming-mouse-mats/razer-gigantus-v2" },
    ],
  },
  {
    label: "Audio & video",
    items: [
      { name: "Insta360 Link 2", description: "4K webcam", url: "https://www.amazon.com/Insta360-Link-Tracking-Noise-Canceling-Streaming/dp/B0FPR2G17Z?th=1" },
      { name: "HyperX Cloud 2", description: "Wireless headset", url: "https://www.hyperxgaming.com/us/headsets/cloud-flight-wireless-gaming-headset" },
      { name: "HyperX SoloCast", description: "Microphone", url: "https://www.hyperxgaming.com/us/microphones/hyperx-solocast-usb-microphone" },
      { name: "Apple EarPods", description: "Earphones", url: "https://www.apple.com/us/shop/product/MMTN2AM/A/earpods-with-35-mm-headphone-plug" },
    ],
  },
];

const pcSpecs: GearItem[] = [
  { name: "CPU", description: "AMD Ryzen 7 7700X" },
  { name: "GPU", description: "NVIDIA GeForce RTX 3060 Ti" },
  { name: "Motherboard", description: "Gigabyte B650 Gaming X AX V2 (ATX)" },
  { name: "RAM", description: "Crucial 32 GB (2×16 GB) DDR5-6000 CL36" },
  { name: "Storage", description: "Crucial 1 TB P3 NVMe Gen4 SSD" },
  { name: "PSU", description: "Lian Li RB650W 650 W 80+ Bronze (ATX 3.1)" },
  { name: "Case", description: "NZXT H5 Flow RGB ATX White (2024)" },
];

const devTools: GearItem[] = [
  { name: "Visual Studio Code", description: "Primary editor", url: "https://code.visualstudio.com" },
  { name: "Warp", description: "Terminal", url: "https://www.warp.dev/" },
  { name: "Docker Desktop", description: "Containers", url: "https://www.docker.com/products/docker-desktop/" },
  { name: "Burp Suite", description: "Security testing", url: "https://portswigger.net/burp" },
  { name: "Postman", description: "API testing", url: "https://www.postman.com/" },
];

const apps: GearItem[] = [
  { name: "Raycast", description: "Launcher", url: "https://www.raycast.com/" },
  { name: "Flighty", description: "Flights", url: "https://www.flightyapp.com/" },
  { name: "Hevy", description: "Workouts", url: "https://www.hevyapp.com/" },
  { name: "Fold", description: "Money", url: "https://fold.money/" },
  { name: "Bitwarden", description: "Passwords", url: "https://bitwarden.com/" },
  { name: "Typora", description: "Markdown", url: "https://typora.io/" },
  { name: "Photoshop", description: "Editing", url: "https://www.adobe.com/products/photoshop.html" },
  { name: "Spotify", description: "Music", url: "https://www.spotify.com/" },
  { name: "Discord", description: "Chat", url: "https://discord.com/" },
  { name: "Balatro", description: "Game", url: "https://store.steampowered.com/app/2379780/Balatro/" },
  { name: "Authy", description: "2FA", url: "https://authy.com/" },
  { name: "CheatSheet", description: "Shortcuts", url: "https://www.mediaatelier.com/CheatSheet/" },
];

const bookmarks: GearItem[] = [
  { name: "Fontshare", description: "Free fonts", url: "https://www.fontshare.com/" },
  { name: "Free Faces", description: "Font gallery", url: "https://www.freefaces.gallery/" },
  { name: "SVGL", description: "Logo library", url: "https://svgl.app/" },
  { name: "Rotato", description: "Device mockups", url: "https://rotato.app/" },
  { name: "Shorts.so", description: "Screenshots", url: "https://shorts.so/" },
  { name: "Globe Explorer", description: "Visualizations", url: "https://explorer.globe.engineer/" },
  { name: "Curated Supply", description: "Designed objects", url: "https://curated.supply/" },
  { name: "Adobe Podcast Enhance", description: "Audio cleanup", url: "https://podcast.adobe.com/enhance" },
  { name: "ElevenLabs", description: "Voice AI", url: "https://elevenlabs.io/" },
];

function GearLink({ item }: { item: GearItem }) {
  const row = (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="min-w-0 text-sm text-zinc-800 dark:text-zinc-200">{item.name}</span>
      {item.description ? (
        <span className="shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400">{item.description}</span>
      ) : null}
    </div>
  );

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block rounded-md transition-opacity hover:opacity-70">
        {row}
      </a>
    );
  }

  return row;
}

function GearGroup({ label, items }: { label: string; items: GearItem[] }) {
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
        {label}
      </h4>
      <div className="space-y-0.5">
        {items.map((item) => (
          <GearLink key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function UsesPage() {
  return (
    <div className="w-full min-w-0 max-w-6xl">
      <header className="mb-6 max-w-xl">
        <h2 className="text-lg font-medium dark:text-white">Setup</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          The desk, the tower, and the software that keeps me going.
        </p>
      </header>

      <section className="mb-12 grid grid-cols-4 gap-2">
        {SETUP_PHOTOS.map((photo, i) => (
          <div
            key={photo.src}
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>
        ))}
      </section>

      <div className="space-y-12">
        <div>
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-400">
            Hardware
          </p>

          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
            <SectionBlock title="On the desk" subtitle="Monitors, machines, and peripherals.">
              <div className="grid gap-8 sm:grid-cols-2">
                {deskGroups.map((group) => (
                  <GearGroup key={group.label} label={group.label} items={group.items} />
                ))}
              </div>
            </SectionBlock>

            <SectionBlock title="PC build" subtitle="The tower on the floor.">
              <div className="rounded-lg border border-zinc-100 px-4 py-2 dark:border-zinc-800">
                {pcSpecs.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2.5 last:border-0 dark:border-zinc-800/80"
                  >
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                      {item.name}
                    </span>
                    <span className="text-right text-sm text-zinc-700 dark:text-zinc-300">{item.description}</span>
                  </div>
                ))}
              </div>
            </SectionBlock>
          </div>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-400">
            Software
          </p>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <SectionBlock title="Dev tools">
              <div className="space-y-0.5">
                {devTools.map((item) => (
                  <GearLink key={item.name} item={item} />
                ))}
              </div>
            </SectionBlock>

            <SectionBlock title="Apps">
              <div className="grid gap-x-8 sm:grid-cols-2">
                {apps.map((item) => (
                  <GearLink key={item.name} item={item} />
                ))}
              </div>
            </SectionBlock>
          </div>

          <div className="mt-10">
            <SectionBlock title="Bookmarks">
              <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {bookmarks.map((item) => (
                  <GearLink key={item.name} item={item} />
                ))}
              </div>
            </SectionBlock>
          </div>
        </div>
      </div>
    </div>
  );
}
