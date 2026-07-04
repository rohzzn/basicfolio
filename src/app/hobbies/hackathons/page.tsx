"use client";

import React, { useState } from "react";

interface Event {
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  audience?: string;
  participants?: number;
  technologies?: string[];
  achievement?: string;
  role?: string;
  projectUrl?: string;
  duration?: number;
  liveDemo?: string;
}

const hackathonsParticipated: Event[] = [
  {
    title: "RevolutionUC 2026",
    date: "March 2026",
    time: "24 hours",
    location: "University of Cincinnati, OH",
    description:
      "Built 'StudyPulse' — a cross-platform clinical trial recruitment engine. Patients use a React Native app with voice/text search; clinicians use a React dashboard with AI-powered triage. Both sync via Supabase. Built for the Medpace challenge track.",
    technologies: ["Expo", "React Native", "React", "Vite", "Supabase", "Gemini API", "ElevenLabs"],
    role: "Full Stack Developer",
    projectUrl: "https://devpost.com/software/studypulse-ik341d",
    liveDemo: "https://devpost.com/software/studypulse-ik341d",
    duration: 24,
  },
  {
    title: "Namaste Jupiverse HYD",
    date: "June 2025",
    time: "12 hours",
    location: "CoKarma, Hyderabad",
    description:
      "Built 'Jupiter Router' — an analytics and visualization tool for swap routes on Solana's leading liquidity aggregator. Features interactive route visualization, multi-route comparison, and protocol identification.",
    technologies: ["Next.js", "React", "Jupiter API", "Solana", "Web3"],
    role: "Team Lead & Backend",
    projectUrl: "https://github.com/rohzzn/token_routes",
    liveDemo: "https://token-routes.vercel.app/",
    duration: 12,
  },
  {
    title: "Vishesh MREC",
    date: "October 2022",
    time: "72 hours",
    location: "MREC, Hyderabad",
    description:
      "Developed 'Meet' — a video calling app with Google/Slack/Microsoft auth, one-to-one or group calls, screen sharing, real-time messaging, and support for up to 30 users.",
    technologies: ["TypeScript", "Go", "NodeJS", "Agora", "Docker", "SQL"],
    achievement: "Winner",
    role: "Full Stack Developer",
    projectUrl: "https://github.com/rohzzn/meet",
    liveDemo: "https://ckvyqugj7184663idk0i811d0su-8rbb2fvau-calatop.vercel.app/authenticate",
    duration: 72,
  },
  {
    title: "HackMIT 2021",
    date: "September 2021",
    time: "36 hours",
    location: "MIT (Virtual)",
    description:
      "Created 'Alert' — a safety app where users volunteer as companions, upload photos of danger zones, view interactive maps, and get insights about safe travel times.",
    technologies: ["Node.js", "Express", "MongoDB", "Maps API"],
    achievement: "Finalist",
    role: "Team Lead & Full Stack",
    liveDemo: "https://rohzzn.github.io/Alert_HackMIT-2021/",
    duration: 36,
  },
];

const eventsOrganized: Event[] = [
  {
    title: "CodeChef MREC Advanced DSA Challenge 2023",
    date: "January 2023",
    time: "09:00 – 21:00",
    location: "MREC Main Auditorium",
    description:
      "Comprehensive day-long workshop and coding contest focused on advanced data structures and algorithms with industry-relevant problem sets.",
    audience: "All Engineering Students",
    participants: 1100,
    technologies: ["Dynamic Programming", "Graph Algorithms", "Computational Geometry"],
  },
  {
    title: "Competitive Programming Bootcamp 2022",
    date: "November 2022",
    location: "MREC CS Department",
    description:
      "Intensive bootcamp covering algorithmic problem-solving strategies and optimization techniques used in competitive programming contests.",
    audience: "CS & IT Students",
    participants: 320,
  },
  {
    title: "CodeChef MREC Hackathon 2.0",
    date: "September 2022",
    location: "MREC Innovation Lab",
    description:
      "Second edition with industry mentors from leading tech companies and workshops on efficient algorithmic implementations.",
    audience: "All Engineering Students",
    participants: 1100,
    achievement: "Sponsored by Newton School",
  },
  {
    title: "AI Algorithms Workshop",
    date: "August 2022",
    location: "MREC Seminar Hall",
    description:
      "Implementing AI algorithms from scratch — custom ML models, computer vision, NLP, with hands-on optimization sessions.",
    audience: "3rd & 4th Year Students",
    participants: 310,
    technologies: ["Python", "ML Algorithms", "Computer Vision", "NLP"],
    achievement: "Sponsored by Newton School",
  },
  {
    title: "Summer DSA Intensive",
    date: "May 2022",
    location: "MREC Central Library",
    description:
      "Full-day intensive training on data structures with implementation challenges and competitive problem-solving sessions.",
    audience: "All Engineering Students",
    participants: 1100,
  },
  {
    title: "Version Control Masterclass",
    date: "June 2022",
    time: "10:00 – 13:00",
    location: "Major Auditorium",
    description:
      "Git fundamentals, advanced branching strategies, and GitHub collaboration workflows for effective team development.",
    audience: "All Students",
    participants: 1100,
  },
  {
    title: "CodeChef MREC Algorithm Challenge 1.0",
    date: "March 2022",
    time: "09:00 – 21:00",
    location: "MREC Main Hall",
    description:
      "Inaugural algorithmic challenge of the CodeChef MREC Chapter. Day-long contest with prizes worth ₹50,000.",
    audience: "All Engineering Students",
    participants: 1100,
    technologies: ["Dynamic Programming", "Greedy", "Searching", "Sorting"],
    achievement: "Sponsored by Newton School",
  },
  {
    title: "Data Science Algorithms Workshop",
    date: "February 2022",
    location: "MREC Computer Labs",
    description:
      "Core algorithms in data analysis, statistical modeling, and predictive analytics with hands-on problem solving.",
    audience: "CS, IT & ECE Students",
    participants: 350,
    technologies: ["Python", "Statistical Algorithms", "Machine Learning"],
    achievement: "Sponsored by Newton School",
  },
  {
    title: "Freshman DSA Fundamentals",
    date: "December 2021",
    location: "MREC Seminar Hall",
    description:
      "Workshop for first-year students to build a solid foundation in data structures and algorithms with beginner-friendly problems.",
    audience: "First Year Students",
    participants: 320,
    achievement: "Sponsored by Newton School",
  },
];

const Hackathons = () => {
  const [activeTab, setActiveTab] = useState<"participated" | "organized">("participated");

  const totalHours = hackathonsParticipated.reduce((s, h) => s + (h.duration ?? 0), 0);
  const awards = hackathonsParticipated.filter((h) => h.achievement).length;
  const totalParticipants = eventsOrganized.reduce((s, e) => s + (e.participants ?? 0), 0);

  return (
    <div style={{ maxWidth: "75ch" }}>
      <header className="mb-8">
        <h2 className="text-lg font-medium dark:text-white">Hackathons</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Hackathon builds and events I helped organize at MREC.
        </p>
      </header>

      <div className="mb-8 flex gap-4">
        {(["participated", "organized"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`text-sm capitalize transition-colors ${
              activeTab === tab
                ? "font-medium text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "participated" && (
        <>
          <div className="mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
            {[
              { label: "Hackathons", value: hackathonsParticipated.length },
              { label: "Awards", value: awards },
              { label: "Total hours", value: totalHours },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-50 p-3 dark:bg-zinc-900/50">
                <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-400">{label}</p>
                <p className="text-base font-medium tabular-nums dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="relative space-y-8 border-l border-zinc-200 pl-4 dark:border-zinc-700">
            {hackathonsParticipated.map((h) => (
              <div key={h.title} className="relative">
                <div className="absolute -left-[21px] mt-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900" />
                <div className="mb-1 flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-medium leading-snug dark:text-white">{h.title}</h3>
                  <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-400">{h.date}</span>
                </div>
                <div className="mb-2 flex flex-wrap gap-2">
                  {h.achievement ? (
                    <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {h.achievement}
                    </span>
                  ) : null}
                  {h.role ? <span className="text-[10px] text-zinc-400 dark:text-zinc-400">{h.role}</span> : null}
                  {h.time ? <span className="text-[10px] text-zinc-400 dark:text-zinc-400">{h.time}</span> : null}
                </div>
                <p className="mb-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{h.description}</p>
                {h.technologies?.length ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-400">{h.technologies.join(" · ")}</p>
                ) : null}
                {h.projectUrl || h.liveDemo ? (
                  <div className="mt-2 flex gap-4">
                    {h.projectUrl ? (
                      <a
                        href={h.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                      >
                        {h.projectUrl.includes("devpost") ? "Devpost" : "Source"} ↗
                      </a>
                    ) : null}
                    {h.liveDemo && h.liveDemo !== h.projectUrl ? (
                      <a
                        href={h.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                      >
                        Live demo ↗
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "organized" && (
        <>
          <div className="mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
            {[
              { label: "Events", value: eventsOrganized.length },
              { label: "Total participants", value: `${(totalParticipants / 1000).toFixed(0)}k+` },
              { label: "Workshops", value: eventsOrganized.filter((e) => !e.achievement).length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-50 p-3 dark:bg-zinc-900/50">
                <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-400">{label}</p>
                <p className="text-base font-medium tabular-nums dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="relative space-y-6 border-l border-zinc-200 pl-4 dark:border-zinc-700">
            {eventsOrganized.map((e) => (
              <div key={e.title} className="relative">
                <div className="absolute -left-[21px] mt-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-300 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900" />
                <div className="mb-1 flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-medium leading-snug dark:text-white">{e.title}</h3>
                  <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-400">{e.date}</span>
                </div>
                <div className="mb-1.5 flex flex-wrap gap-3 text-[10px] text-zinc-400 dark:text-zinc-400">
                  {e.participants ? <span>{e.participants.toLocaleString()} participants</span> : null}
                  {e.achievement ? <span className="font-medium text-zinc-500 dark:text-zinc-400">{e.achievement}</span> : null}
                </div>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{e.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Hackathons;
