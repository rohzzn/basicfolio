"use client";
import React, { useState } from 'react';

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
    description: "Built 'StudyPulse' — a cross-platform clinical trial recruitment engine. Patients use a React Native app with voice/text search; clinicians use a React dashboard with AI-powered triage. Both sync via Supabase. Built for the Medpace challenge track.",
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
    description: "Built 'Jupiter Router' — an analytics and visualization tool for swap routes on Solana's leading liquidity aggregator. Features interactive route visualization, multi-route comparison, and protocol identification.",
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
    description: "Developed 'Meet' — a video calling app with Google/Slack/Microsoft auth, one-to-one or group calls, screen sharing, real-time messaging, and support for up to 30 users.",
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
    description: "Created 'Alert' — a safety app where users volunteer as companions, upload photos of danger zones, view interactive maps, and get insights about safe travel times.",
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
    description: "Comprehensive day-long workshop and coding contest focused on advanced data structures and algorithms with industry-relevant problem sets.",
    audience: "All Engineering Students",
    participants: 1100,
    technologies: ["Dynamic Programming", "Graph Algorithms", "Computational Geometry"],
  },
  {
    title: "Competitive Programming Bootcamp 2022",
    date: "November 2022",
    location: "MREC CS Department",
    description: "Intensive bootcamp covering algorithmic problem-solving strategies and optimization techniques used in competitive programming contests.",
    audience: "CS & IT Students",
    participants: 320,
  },
  {
    title: "CodeChef MREC Hackathon 2.0",
    date: "September 2022",
    location: "MREC Innovation Lab",
    description: "Second edition with industry mentors from leading tech companies and workshops on efficient algorithmic implementations.",
    audience: "All Engineering Students",
    participants: 1100,
    achievement: "Sponsored by Newton School",
  },
  {
    title: "AI Algorithms Workshop",
    date: "August 2022",
    location: "MREC Seminar Hall",
    description: "Implementing AI algorithms from scratch — custom ML models, computer vision, NLP, with hands-on optimization sessions.",
    audience: "3rd & 4th Year Students",
    participants: 310,
    technologies: ["Python", "ML Algorithms", "Computer Vision", "NLP"],
    achievement: "Sponsored by Newton School",
  },
  {
    title: "Summer DSA Intensive",
    date: "May 2022",
    location: "MREC Central Library",
    description: "Full-day intensive training on data structures with implementation challenges and competitive problem-solving sessions.",
    audience: "All Engineering Students",
    participants: 1100,
  },
  {
    title: "Version Control Masterclass",
    date: "June 2022",
    time: "10:00 – 13:00",
    location: "Major Auditorium",
    description: "Git fundamentals, advanced branching strategies, and GitHub collaboration workflows for effective team development.",
    audience: "All Students",
    participants: 1100,
  },
  {
    title: "CodeChef MREC Algorithm Challenge 1.0",
    date: "March 2022",
    time: "09:00 – 21:00",
    location: "MREC Main Hall",
    description: "Inaugural algorithmic challenge of the CodeChef MREC Chapter. Day-long contest with prizes worth ₹50,000.",
    audience: "All Engineering Students",
    participants: 1100,
    technologies: ["Dynamic Programming", "Greedy", "Searching", "Sorting"],
    achievement: "Sponsored by Newton School",
  },
  {
    title: "Data Science Algorithms Workshop",
    date: "February 2022",
    location: "MREC Computer Labs",
    description: "Core algorithms in data analysis, statistical modeling, and predictive analytics with hands-on problem solving.",
    audience: "CS, IT & ECE Students",
    participants: 350,
    technologies: ["Python", "Statistical Algorithms", "Machine Learning"],
    achievement: "Sponsored by Newton School",
  },
  {
    title: "Freshman DSA Fundamentals",
    date: "December 2021",
    location: "MREC Seminar Hall",
    description: "Workshop for first-year students to build a solid foundation in data structures and algorithms with beginner-friendly problems.",
    audience: "First Year Students",
    participants: 320,
    achievement: "Sponsored by Newton School",
  },
];

const Hackathons = () => {
  const [activeTab, setActiveTab] = useState<'participated' | 'organized'>('participated');

  const totalHours = hackathonsParticipated.reduce((s, h) => s + (h.duration ?? 0), 0);
  const awards = hackathonsParticipated.filter(h => h.achievement).length;
  const totalParticipants = eventsOrganized.reduce((s, e) => s + (e.participants ?? 0), 0);

  return (
    <div style={{ maxWidth: '75ch' }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Hackathons</h2>
        <div className="flex gap-4">
          {(['participated', 'organized'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'text-zinc-900 dark:text-white font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'participated' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-px mb-8 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
            {[
              { label: 'Hackathons', value: hackathonsParticipated.length },
              { label: 'Awards', value: awards },
              { label: 'Total hours', value: totalHours },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-50 dark:bg-zinc-900/50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{label}</p>
                <p className="text-base font-medium dark:text-white tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative pl-4 border-l border-zinc-200 dark:border-zinc-700 space-y-8">
            {hackathonsParticipated.map((h, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 mt-1" />
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <h3 className="text-sm font-medium dark:text-white leading-snug">{h.title}</h3>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">{h.date}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {h.achievement && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm">
                      {h.achievement}
                    </span>
                  )}
                  {h.role && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {h.role}
                    </span>
                  )}
                  {h.time && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {h.time}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
                  {h.description}
                </p>
                {h.technologies && h.technologies.length > 0 && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {h.technologies.join(' · ')}
                  </p>
                )}
                {(h.projectUrl || h.liveDemo) && (
                  <div className="flex gap-4 mt-2">
                    {h.projectUrl && (
                      <a
                        href={h.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      >
                        Devpost ↗
                      </a>
                    )}
                    {h.liveDemo && h.liveDemo !== h.projectUrl && (
                      <a
                        href={h.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      >
                        Live Demo ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'organized' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-px mb-8 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
            {[
              { label: 'Events', value: eventsOrganized.length },
              { label: 'Total participants', value: `${(totalParticipants / 1000).toFixed(0)}k+` },
              { label: 'Workshops', value: eventsOrganized.filter(e => !e.achievement).length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-50 dark:bg-zinc-900/50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{label}</p>
                <p className="text-base font-medium dark:text-white tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative pl-4 border-l border-zinc-200 dark:border-zinc-700 space-y-6">
            {eventsOrganized.map((e, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 mt-1" />
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <h3 className="text-sm font-medium dark:text-white leading-snug">{e.title}</h3>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">{e.date}</span>
                </div>
                <div className="flex flex-wrap gap-3 mb-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                  {e.participants && <span>{e.participants.toLocaleString()} participants</span>}
                  {e.achievement && (
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">{e.achievement}</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Hackathons;
