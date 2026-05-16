import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { BuildConfigurator, CostComparison, ServiceList, StorageLayout, ComposePreview, TrafficFlow } from './ServerComponents';

export const metadata: Metadata = {
  title: 'Building a Linux Home Server — Rohan',
  description: 'I want to build a Linux home server this year to run all my self-hosted services, personal websites, and side projects from one machine.',
  openGraph: {
    title: 'Building a Linux Home Server',
    description: 'I want to build a Linux home server this year to run all my self-hosted services, personal websites, and side projects from one machine.',
    url: 'https://rohan.run/writing/linux-home-server',
  },
  alternates: { canonical: 'https://rohan.run/writing/linux-home-server' },
};

const LinuxHomeServer: React.FC = () => {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Building a Linux Home Server</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2026-05-16">May 16, 2026</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          Sometime this year I want to build a home server. Not because I need one right now, but because I have been thinking about it long enough that it has gone from a vague idea to something I have actually planned out. This post is that plan, written down before the parts are ordered and the machine is assembled, so I have something concrete to look back on when it is actually running.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The core idea is simple. I want one machine at home that runs everything I currently pay for or go without because the costs add up month after month. A machine that handles my personal websites, photo backups, ad blocking for the whole network, file storage, monitoring, and whatever side projects I am working on at the time. Pay for the hardware once and that is it.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The case for self-hosting</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The honest reason is money. Right now I pay for Vercel, Railway, Google Photos storage, a managed database, and a handful of other things. None of them are expensive on their own, but together they add up to a real monthly number that never goes away. A home server replaces all of it for the cost of the hardware, which you pay once.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The break-even is somewhere around fourteen months. After that, every service running on the machine is effectively free. The numbers below are rough estimates but close enough to make the math obvious.
        </p>

        <CostComparison />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The hardware</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          A home server has different constraints than a gaming build. It will be on around the clock, so power efficiency matters more than peak performance. It needs to be quiet enough to sit in a room. And it needs enough headroom to run two dozen containers simultaneously without struggling, without being so powerful it becomes wasteful.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The Ryzen 5 5500 checks all of those boxes. Six cores and twelve threads means Docker can schedule containers without them waiting on each other, and the 65 W TDP stays well below that under typical server workloads. The B550M AORUS ELITE AX comes with Wi-Fi 6 built in, which matters for where this machine will probably live. Three Kingston NV3 drives at 1 TB each give me room to keep different categories of data completely isolated from one another.
        </p>

        <BuildConfigurator />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What I want to run</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The services split into two groups. Some things should be reachable from the internet: my portfolio, APIs, web apps I want to share. Everything else should only be accessible to me through a VPN. Admin dashboards, photo storage, the ad blocker, databases, monitoring. None of those should have a public port. The table below shows what each service does and what it replaces.
        </p>

        <ServiceList />

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Immich is the one I am most excited about. It is a self-hosted photo library that behaves almost identically to Google Photos, including mobile backup. Right now my photos are split across too many places. Having them all in one place on hardware I own is something I have wanted for a while. Pi-hole will handle DNS-level ad blocking for every device on the network, which is cleaner than running browser extensions on each one.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Storage</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Three drives might seem like a lot but the reasoning is straightforward. I want each category of data on its own drive so that a full photo library never crowds out the OS, and a misbehaving container never eats into backup space. Each drive has one job.
        </p>

        <StorageLayout />

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The third drive is purely for backups. Restic will take daily snapshots of the OS drive and deduplicate them, so the storage cost grows slowly rather than linearly. From there, snapshots push offsite to Backblaze B2 automatically. If the machine fails completely, nothing important is lost.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Everything runs in Docker</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Every service on this machine will live in a Docker container. Containers keep dependencies isolated so different apps can use different versions of the same runtime without conflicting. Updates become safe because rolling back means pulling the previous image. And Docker Compose means every service group is described in a file that I can read, version control, and reproduce on a new machine if I ever need to.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The Compose setup will be split by category rather than one giant file. One file for the reverse proxy, one for storage services, one for monitoring, one for personal apps. They all share a Docker bridge network so containers can reach each other by name without any of that being exposed externally.
        </p>

        <ComposePreview />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">How traffic gets routed</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The router will open exactly two ports to the internet: 80 and 443. All of that traffic goes to Nginx Proxy Manager, which reads the incoming hostname and routes it to the right container. It also handles SSL certificates automatically through Let&apos;s Encrypt. Private services do not go through the reverse proxy at all. They only exist on the Tailscale network and you need the VPN client running to reach them.
        </p>

        <TrafficFlow />

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The one wrinkle with a home server is that residential IP addresses change. A Dynamic DNS service watches for that and updates the DNS record automatically, usually within a minute or two. Cloudflare offers this for free and there are Docker containers that handle the update via the Cloudflare API so the whole process is hands-off.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What could go wrong</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The hardware could fail. PSUs are a known weak point, which is part of why I picked a proper 80+ Gold unit rather than something cheap. Drives fail eventually, which is exactly why the backup setup pushes offsite rather than staying only on the machine. Power outages will take everything offline. A UPS is on the eventual list but not for day one.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The more serious ongoing risk is misconfiguration. Accidentally exposing something that should be private, leaving default credentials on an admin panel, falling behind on image updates. Running a server is a responsibility that does not end after setup. Uptime Kuma watching every service and a weekly habit of pulling updates covers most of it.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">When it actually happens</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          This is still a plan. The parts are not ordered yet. But writing it out has made the whole thing feel concrete enough to actually do rather than something I keep thinking about. The first milestone is clear: every service in the list above running, my public sites migrated off Vercel, and Immich confirmed backing up photos from my phone.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          When it is built I will write a follow-up covering the actual setup, what was harder than expected, and what I would have done differently. Jellyfin and Nextcloud are waiting for version two. For now, getting the core stack stable is enough.
        </p>

      </div>
    </article>
  );
};

export default LinuxHomeServer;
