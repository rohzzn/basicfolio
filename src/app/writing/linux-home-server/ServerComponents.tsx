"use client";
import React, { useState } from 'react';

// ─── 1. BUILD CONFIGURATOR ────────────────────────────────────────────────────
const PARTS = [
  { id: 'cpu',  label: 'CPU',         name: 'AMD Ryzen 5 5500',                          price: 86.00,   purpose: '6 cores / 12 threads at 3.6 GHz. More than enough to schedule 20+ containers without them fighting over time.' },
  { id: 'mb',   label: 'Motherboard', name: 'Gigabyte B550M AORUS ELITE AX mATX',        price: 119.99,  purpose: 'PCIe 4.0, two M.2 slots for NVMe drives, and built-in Wi-Fi 6 so I do not have to run Ethernet through the wall.' },
  { id: 'ram',  label: 'RAM',         name: 'Corsair Vengeance LPX 16 GB DDR4',          price: 159.99,  purpose: '16 GB sits comfortably with Docker, a few databases, monitoring, and Pi-hole all running at once.' },
  { id: 'ssd1', label: 'SSD (OS)',    name: 'Kingston NV3 1 TB NVMe',                    price: 164.55,  purpose: 'The OS and all Docker images and volumes live here. Fast random I/O keeps container startup times short.' },
  { id: 'ssd2', label: 'SSD (Media)', name: 'Kingston NV3 1 TB NVMe',                    price: 164.55,  purpose: 'Dedicated to Immich and Jellyfin so photo uploads never crowd out system data.' },
  { id: 'ssd3', label: 'SSD (Backup)',name: 'Kingston NV3 1 TB NVMe',                    price: 164.55,  purpose: 'Local Restic snapshot target. Snapshots deduplicate, so 200 GB of daily data does not cost 200 GB per day.' },
  { id: 'case', label: 'Case',        name: 'Lian Li O11 Dynamic Mini V2 Flow',          price: 99.99,   purpose: 'Great airflow for a compact case, tempered glass side, and USB-C on the front panel.' },
  { id: 'cool', label: 'Cooler',      name: 'Thermalright Peerless Assassin 120 SE ARGB',price: 36.90,   purpose: 'Near-silent under light server loads and handles sustained multi-core workloads without throttling.' },
  { id: 'psu',  label: 'PSU',         name: 'MSI MAG A650GL 650W 80+ Gold',             price: 89.99,   purpose: 'Fully modular and 80+ Gold certified. Servers idle around 20% load where Gold efficiency matters most.' },
];

export function BuildConfigurator() {
  const [selected, setSelected] = useState<string | null>(null);
  const total = PARTS.reduce((s, p) => s + p.price, 0);
  const active = PARTS.find(p => p.id === selected);

  return (
    <div className="my-8 not-prose">
      <div className="border border-zinc-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
          {PARTS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(selected === p.id ? null : p.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                selected === p.id
                  ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'hover:bg-zinc-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-xs w-20 flex-shrink-0 ${selected === p.id ? 'text-zinc-400 dark:text-neutral-400' : 'text-zinc-400 dark:text-neutral-400'}`}>
                  {p.label}
                </span>
                <span className={`text-xs truncate font-medium ${selected === p.id ? '' : 'text-zinc-700 dark:text-neutral-300'}`}>
                  {p.name}
                </span>
              </div>
              <span className={`text-xs font-mono flex-shrink-0 ml-4 ${selected === p.id ? 'text-zinc-300 dark:text-neutral-700' : 'text-zinc-500 dark:text-neutral-400'}`}>
                ${p.price.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
        <div className="border-t border-zinc-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between bg-zinc-50 dark:bg-neutral-900">
          <span className="text-xs text-zinc-500 dark:text-neutral-400">Total (excl. tax &amp; shipping)</span>
          <span className="text-sm font-mono font-semibold dark:text-paper">${total.toFixed(2)}</span>
        </div>
        {active && (
          <div className="border-t border-zinc-200 dark:border-neutral-800 px-4 py-3 bg-zinc-50 dark:bg-neutral-900/60">
            <p className="text-xs text-zinc-500 dark:text-neutral-400">{active.purpose}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. COST COMPARISON ───────────────────────────────────────────────────────
const CLOUD_COSTS = [
  { label: 'Vercel Pro (sites + APIs)',  monthly: 20  },
  { label: 'Railway (backend apps)',     monthly: 15  },
  { label: 'Google Photos (2 TB)',       monthly: 10  },
  { label: 'Managed Postgres',           monthly: 15  },
  { label: 'Uptime monitoring',          monthly: 7   },
  { label: 'VPS for misc containers',   monthly: 50  },
];
const HARDWARE_COST = 1086.51;

export function CostComparison() {
  const [year, setYear] = useState(1);
  const cloudTotal = CLOUD_COSTS.reduce((s, c) => s + c.monthly, 0);
  const cloudCumulative = cloudTotal * 12 * year;
  const selfHostedCumulative = HARDWARE_COST;
  const savings = Math.max(0, cloudCumulative - selfHostedCumulative);
  const breakEvenMonths = Math.ceil(HARDWARE_COST / cloudTotal);

  return (
    <div className="my-8 not-prose">
      <div className="border border-zinc-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="p-4 space-y-2">
          {CLOUD_COSTS.map(c => (
            <div key={c.label} className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-neutral-400">{c.label}</span>
              <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">${c.monthly}/mo</span>
            </div>
          ))}
          <div className="pt-2 border-t border-zinc-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700 dark:text-neutral-300">Cloud total</span>
            <span className="text-xs font-mono font-medium text-zinc-700 dark:text-neutral-300">${cloudTotal}/mo</span>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-zinc-500 dark:text-neutral-400">Year</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`w-8 h-7 text-xs font-medium rounded transition-colors ${
                    year === y
                      ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                      : 'text-zinc-500 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-neutral-900/50 border border-zinc-100 dark:border-neutral-800">
              <p className="text-[10px] text-zinc-400 dark:text-neutral-400 mb-1">Cloud cost</p>
              <p className="text-sm font-mono font-semibold text-zinc-700 dark:text-neutral-300">${cloudCumulative.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-neutral-900/50 border border-zinc-100 dark:border-neutral-800">
              <p className="text-[10px] text-zinc-400 dark:text-neutral-400 mb-1">Self-hosted cost</p>
              <p className="text-sm font-mono font-semibold text-zinc-700 dark:text-neutral-300">${selfHostedCumulative.toLocaleString()}</p>
            </div>
          </div>

          {savings > 0 && (
            <p className="mt-3 text-xs text-zinc-500 dark:text-neutral-400">
              Ahead by <span className="font-medium text-zinc-700 dark:text-neutral-300">${savings.toFixed(0)}</span> after year {year}. Hardware breaks even at month {breakEvenMonths}.
            </p>
          )}
          {savings === 0 && (
            <p className="mt-3 text-xs text-zinc-500 dark:text-neutral-400">
              Hardware pays for itself at month {breakEvenMonths} — about {Math.ceil(breakEvenMonths / 12)} year in.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 3. SERVICE LIST ──────────────────────────────────────────────────────────
type Service = {
  name: string;
  replaces: string;
  access: 'public' | 'private';
  desc: string;
};

const SERVICES: Service[] = [
  { name: 'Nginx Proxy Manager', replaces: 'Vercel routing',    access: 'public',  desc: 'Handles SSL certificates via Let\'s Encrypt and routes subdomains to the right container. The only thing listening on port 80 and 443.' },
  { name: 'Portfolio & APIs',    replaces: 'Vercel + Railway',  access: 'public',  desc: 'My personal sites and backend APIs, running as Docker containers behind the reverse proxy.' },
  { name: 'Immich',              replaces: 'Google Photos',     access: 'private', desc: 'Self-hosted photo backup with a mobile app that works exactly like Google Photos. Reachable through Tailscale only.' },
  { name: 'Pi-hole',             replaces: 'Browser extensions',access: 'private', desc: 'DNS-level ad blocking for every device on the network. No per-device setup needed.' },
  { name: 'Uptime Kuma',         replaces: 'Paid uptime tools', access: 'private', desc: 'Watches every service and sends alerts if anything goes down. Dashboard stays private.' },
  { name: 'Portainer',           replaces: 'SSH commands',      access: 'private', desc: 'Web UI for managing containers, viewing logs, and restarting services without typing long commands.' },
  { name: 'Tailscale',           replaces: 'Manual WireGuard',  access: 'private', desc: 'WireGuard-based VPN mesh that connects all my devices. Every private service sits behind this.' },
  { name: 'PostgreSQL',          replaces: 'Managed Postgres',  access: 'private', desc: 'Shared database instance. Containers connect over the internal Docker network with no public port.' },
  { name: 'Jellyfin',            replaces: 'Streaming services',access: 'private', desc: 'Local media server. V2 — not day one but on the list once the core stack is stable.' },
];

export function ServiceList() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  const shown = SERVICES.filter(s =>
    filter === 'all' ? true : s.access === filter
  );
  const active = SERVICES.find(s => s.name === selected);

  return (
    <div className="my-8 not-prose">
      <div className="border border-zinc-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-zinc-200 dark:border-neutral-800">
          {(['all', 'public', 'private'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelected(null); }}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'text-zinc-500 dark:text-neutral-400 hover:bg-zinc-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-neutral-800">
          {shown.map(s => (
            <button
              key={s.name}
              onClick={() => setSelected(selected === s.name ? null : s.name)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                selected === s.name
                  ? 'bg-zinc-900 dark:bg-neutral-100'
                  : 'hover:bg-zinc-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-xs font-medium truncate ${selected === s.name ? 'text-white dark:text-neutral-900' : 'text-zinc-700 dark:text-neutral-300'}`}>
                  {s.name}
                </span>
                <span className={`text-[10px] flex-shrink-0 ${selected === s.name ? 'text-zinc-400 dark:text-neutral-400' : 'text-zinc-400 dark:text-neutral-400'}`}>
                  replaces {s.replaces}
                </span>
              </div>
              <span className={`text-[10px] flex-shrink-0 ml-3 ${
                selected === s.name
                  ? (s.access === 'public' ? 'text-emerald-400' : 'text-rose-400')
                  : (s.access === 'public' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-neutral-400')
              }`}>
                {s.access}
              </span>
            </button>
          ))}
        </div>

        <div className="border-t border-zinc-100 dark:border-neutral-800 px-4 py-3 min-h-[44px] bg-zinc-50 dark:bg-neutral-900/40">
          {active ? (
            <p className="text-xs text-zinc-500 dark:text-neutral-400">{active.desc}</p>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-neutral-400">Click any row to see what it does</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 4. STORAGE LAYOUT ────────────────────────────────────────────────────────
type Disk = {
  id: string;
  label: string;
  sub: string;
  size: number;
  used: number;
  color: string;
  items: string[];
};

const DISKS: Disk[] = [
  {
    id: 'os',
    label: 'SSD 1',
    sub: 'OS & Docker',
    size: 1000,
    used: 220,
    color: 'bg-zinc-500 dark:bg-neutral-400',
    items: ['Ubuntu Server (~8 GB)', 'Docker engine + images (~80 GB)', 'Container volumes & databases (~130 GB)'],
  },
  {
    id: 'media',
    label: 'SSD 2',
    sub: 'Media',
    size: 1000,
    used: 680,
    color: 'bg-zinc-500 dark:bg-neutral-400',
    items: ['Immich photo library (~500 GB)', 'Jellyfin media files (~180 GB)'],
  },
  {
    id: 'backup',
    label: 'SSD 3',
    sub: 'Backups',
    size: 1000,
    used: 310,
    color: 'bg-zinc-500 dark:bg-neutral-400',
    items: ['Restic snapshots of SSD 1 (~200 GB)', 'Offsite sync staging (~110 GB)'],
  },
];

export function StorageLayout() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="my-8 not-prose">
      <div className="border border-zinc-200 dark:border-neutral-800 rounded-lg overflow-hidden divide-y divide-zinc-100 dark:divide-neutral-800">
        {DISKS.map(d => {
          const pct = Math.round((d.used / d.size) * 100);
          const isActive = selected === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelected(isActive ? null : d.id)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                isActive ? 'bg-zinc-900 dark:bg-neutral-100' : 'hover:bg-zinc-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 flex-shrink-0">
                  <p className={`text-xs font-medium ${isActive ? 'text-white dark:text-neutral-900' : 'text-zinc-700 dark:text-neutral-300'}`}>{d.label}</p>
                  <p className={`text-[10px] ${isActive ? 'text-zinc-400 dark:text-neutral-400' : 'text-zinc-400 dark:text-neutral-400'}`}>{d.sub}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`h-1.5 rounded-full overflow-hidden ${isActive ? 'bg-zinc-700 dark:bg-neutral-300' : 'bg-zinc-100 dark:bg-neutral-800'}`}>
                    <div
                      className={`h-full rounded-full ${isActive ? 'bg-white dark:bg-neutral-900' : d.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={`text-xs font-mono ${isActive ? 'text-zinc-300 dark:text-neutral-400' : 'text-zinc-500 dark:text-neutral-400'}`}>{pct}%</p>
                  <p className={`text-[10px] ${isActive ? 'text-zinc-500 dark:text-neutral-500' : 'text-zinc-400 dark:text-neutral-400'}`}>{d.size - d.used} GB free</p>
                </div>
              </div>
              {isActive && (
                <ul className="mt-3 space-y-1 pl-16">
                  {d.items.map(item => (
                    <li key={item} className="text-xs text-zinc-400 dark:text-neutral-400">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. DOCKER COMPOSE PREVIEW ────────────────────────────────────────────────
const COMPOSE_SERVICES = [
  {
    name: 'nginx-proxy-manager',
    snippet: `  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    ports:
      - "80:80"
      - "443:443"
      - "81:81"
    volumes:
      - ./npm/data:/data
      - ./npm/letsencrypt:/etc/letsencrypt
    restart: unless-stopped`,
  },
  {
    name: 'immich',
    snippet: `  immich-server:
    image: ghcr.io/immich-app/immich-server:release
    ports:
      - "2283:3001"
    volumes:
      - /mnt/media/photos:/usr/src/app/upload
    env_file:
      - .env
    depends_on:
      - redis
      - database
    restart: unless-stopped`,
  },
  {
    name: 'pihole',
    snippet: `  pihole:
    image: pihole/pihole:latest
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "8053:80/tcp"
    environment:
      TZ: "America/New_York"
      WEBPASSWORD: "\${PIHOLE_PASSWORD}"
    volumes:
      - ./pihole/etc:/etc/pihole
      - ./pihole/dnsmasq:/etc/dnsmasq.d
    restart: unless-stopped`,
  },
  {
    name: 'uptime-kuma',
    snippet: `  uptime-kuma:
    image: louislam/uptime-kuma:latest
    ports:
      - "3001:3001"
    volumes:
      - ./uptime-kuma:/app/data
    restart: unless-stopped`,
  },
  {
    name: 'portainer',
    snippet: `  portainer:
    image: portainer/portainer-ce:latest
    ports:
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./portainer:/data
    restart: unless-stopped`,
  },
];

export function ComposePreview() {
  const [active, setActive] = useState('nginx-proxy-manager');
  const current = COMPOSE_SERVICES.find(s => s.name === active)!;

  return (
    <div className="my-8 not-prose">
      <div className="border border-zinc-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-neutral-800">
          {COMPOSE_SERVICES.map(s => (
            <button
              key={s.name}
              onClick={() => setActive(s.name)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-mono transition-colors ${
                active === s.name
                  ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'text-zinc-500 dark:text-neutral-400 hover:bg-zinc-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <pre className="p-4 text-xs font-mono text-zinc-600 dark:text-neutral-300 overflow-x-auto leading-relaxed bg-zinc-50 dark:bg-neutral-900/40 whitespace-pre">
          {`services:\n${current.snippet}`}
        </pre>
      </div>
    </div>
  );
}

// ─── 6. TRAFFIC FLOW ──────────────────────────────────────────────────────────
type FlowStep = { label: string; note: string };

const PUBLIC_PATH: FlowStep[] = [
  { label: 'rohan.run',              note: 'Domain points to home IP via Cloudflare DDNS, updated automatically when the IP changes.' },
  { label: 'Router',                 note: 'Port 80 and 443 are the only open ports. Everything else is firewalled.' },
  { label: 'Nginx Proxy Manager',    note: 'Terminates SSL and routes by subdomain. portfolio.rohan.run goes to the portfolio container, api.rohan.run goes to the API.' },
  { label: 'Public container',       note: 'The actual app. Only reachable through NPM, never directly from the internet.' },
];

const PRIVATE_PATH: FlowStep[] = [
  { label: 'My device (anywhere)',   note: 'Laptop, phone, or tablet with Tailscale installed. Works on any network.' },
  { label: 'Tailscale VPN',         note: 'WireGuard mesh that connects all my devices directly to the server. No open ports required.' },
  { label: 'Private container',      note: 'Immich, Portainer, Pi-hole, Uptime Kuma. Not reachable by anyone without Tailscale.' },
];

export function TrafficFlow() {
  const [active, setActive] = useState<{ path: 'public' | 'private'; index: number } | null>(null);

  const getNote = () => {
    if (!active) return null;
    return active.path === 'public'
      ? PUBLIC_PATH[active.index].note
      : PRIVATE_PATH[active.index].note;
  };

  const note = getNote();

  return (
    <div className="my-8 not-prose">
      <div className="border border-zinc-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-zinc-100 dark:divide-neutral-800">
          <div className="p-4">
            <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">Public traffic</p>
            <div className="space-y-1.5">
              {PUBLIC_PATH.map((step, i) => (
                <React.Fragment key={step.label}>
                  <button
                    onClick={() => setActive(active?.path === 'public' && active.index === i ? null : { path: 'public', index: i })}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                      active?.path === 'public' && active.index === i
                        ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                        : 'text-zinc-600 dark:text-neutral-400 hover:bg-zinc-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    {step.label}
                  </button>
                  {i < PUBLIC_PATH.length - 1 && (
                    <div className="text-center text-zinc-300 dark:text-neutral-700 text-xs leading-none">↓</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-4">
            <p className="text-[10px] font-medium text-zinc-400 dark:text-neutral-400 mb-3 uppercase tracking-wider">Private (VPN only)</p>
            <div className="space-y-1.5">
              {PRIVATE_PATH.map((step, i) => (
                <React.Fragment key={step.label}>
                  <button
                    onClick={() => setActive(active?.path === 'private' && active.index === i ? null : { path: 'private', index: i })}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                      active?.path === 'private' && active.index === i
                        ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                        : 'text-zinc-600 dark:text-neutral-400 hover:bg-zinc-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    {step.label}
                  </button>
                  {i < PRIVATE_PATH.length - 1 && (
                    <div className="text-center text-zinc-300 dark:text-neutral-700 text-xs leading-none">↓</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-neutral-800 px-4 py-3 min-h-[44px] bg-zinc-50 dark:bg-neutral-900/40">
          {note ? (
            <p className="text-xs text-zinc-500 dark:text-neutral-400">{note}</p>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-neutral-400">Click any step to see what it does</p>
          )}
        </div>
      </div>
    </div>
  );
}
