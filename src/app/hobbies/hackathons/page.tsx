"use client";
import React, { useState } from 'react';
import { Calendar, Users, MapPin, Clock, User, Award, Code, Trophy, Github, ExternalLink } from 'lucide-react';

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
  duration?: number; // Added duration for hackathons
  liveDemo?: string; // Added liveDemo for hackathons
}

// Hackathons the user participated in
const hackathonsParticipated: Event[] = [
  {
    title: "Namaste Jupiverse - Hackathon Edition (HYD)",
    date: "June 21, 2025",
    time: "10:00 AM - 10:00 PM",
    location: "CoKarma - Coworking Space, Kothaguda, Hyderabad",
    description: "Built 'Jupiter Router' - an advanced visualization and analytics tool for exploring swap routes on Solana's leading liquidity aggregator. Features include interactive route visualization, multi-route comparison, protocol identification, and advanced analytics for optimizing trading strategies.",
    technologies: ["Next.js", "React", "Tailwind CSS", "Jupiter API", "Solana", "Web3"],
    role: "Team Lead & Backend Developer",
    projectUrl: "https://github.com/rohzzn/token_routes",
    liveDemo: "https://token-routes.vercel.app/",
    duration: 12
  },
  {
    title: "Vishesh MREC",
    date: "October 14-16, 2022",
    time: "72 hours",
    location: "MREC, Hyderabad",
    description: "Developed 'Meet' - a comprehensive video calling application with features including Google/Slack/Microsoft authentication, crystal-clear one-to-one or group voice/video calls, screen sharing, real-time messaging, and support for up to 30 users with host/attendee management.",
    technologies: ["TypeScript", "JavaScript", "Go", "NodeJS", "Agora", "Docker", "SQL"],
    achievement: "Winner",
    role: "Full Stack Developer",
    projectUrl: "https://github.com/rohzzn/meet",
    liveDemo: "https://ckvyqugj7184663idk0i811d0su-8rbb2fvau-calatop.vercel.app/authenticate",
    duration: 72
  },
  {
    title: "HackMIT 2021",
    date: "September 18-19, 2021",
    time: "36 hours",
    location: "Massachusetts Institute of Technology (Virtual)",
    description: "Created 'Alert' - a safety-focused application that prioritizes user safety and helps with planning safe travels. Users can volunteer as companions, upload photos of danger locations, view interactive maps of danger zones, share experiences, and get insights about the safest times to travel in particular areas.",
    technologies: ["Node.js", "Express", "MongoDB", "Interactive Maps"],
    achievement: "Finalist",
    role: "Team Lead & Full Stack Developer",
    liveDemo: "https://rohzzn.github.io/Alert_HackMIT-2021/",
    duration: 36
  }
];

// Hackathons and events the user organized
const eventsOrganized: Event[] = [
  {
    title: "CodeChef MREC Advanced DSA Challenge 2023",
    date: "January 3, 2023",
    time: "09:00 AM - 09:00 PM",
    location: "MREC Main Auditorium",
    description: "Comprehensive day-long workshop and coding contest focused on advanced data structures and algorithms with industry-relevant problem sets.",
    audience: "All Engineering Students",
    participants: 1100,
    technologies: ["Dynamic Programming", "Graph Algorithms", "Computational Geometry", "Advanced Data Structures"]
  },
  {
    title: "Competitive Programming Bootcamp 2022",
    date: "November 15, 2022",
    time: "10:00 AM - 06:00 PM",
    location: "MREC CS Department",
    description: "Intensive bootcamp covering algorithmic problem-solving strategies and optimization techniques used in competitive programming contests.",
    audience: "CS & IT Students",
    participants: 320,
    technologies: ["Algorithms", "Data Structures", "Problem Solving", "Time Complexity Analysis"]
  },
  {
    title: "CodeChef MREC Hackathon 2.0",
    date: "September 24, 2022",
    time: "09:00 AM - 06:00 PM",
    location: "MREC Innovation Lab",
    description: "Second edition of our flagship coding event featuring industry mentors from leading tech companies and workshops on efficient algorithmic implementations.",
    audience: "All Engineering Students",
    participants: 1100,
    technologies: ["Algorithmic Efficiency", "Full Stack", "APIs", "DevOps"],
    achievement: "Goodies sponsored by Newton School"
  },
  {
    title: "AI Algorithms Workshop",
    date: "August 12, 2022",
    time: "10:00 AM - 05:00 PM",
    location: "MREC Seminar Hall",
    description: "Specialized workshop on implementing AI algorithms from scratch, with hands-on sessions building custom ML models and optimizing for performance.",
    audience: "3rd & 4th Year Students",
    participants: 310,
    technologies: ["Python", "ML Algorithms", "Optimization Techniques", "Computer Vision", "NLP"],
    achievement: "Goodies sponsored by Newton School"
  },
  {
    title: "Summer DSA Intensive",
    date: "May 28, 2022",
    time: "11:00 AM - 08:00 PM",
    location: "MREC Central Library",
    description: "Full-day intensive training on data structures with implementation challenges and competitive problem-solving sessions.",
    audience: "All Engineering Students",
    participants: 1100,
    technologies: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hashing"]
  },
  {
    title: "Version Control Masterclass",
    date: "June 16, 2022",
    time: "10:00 AM - 01:00 PM",
    location: "Major Auditorium",
    description: "Comprehensive workshop covering Git fundamentals, advanced branching strategies, and GitHub collaboration workflows for effective team development.",
    audience: "All Students",
    participants: 1100
  },
  {
    title: "Git & GitHub for Beginners",
    date: "June 4, 2022",
    time: "10:00 AM - 01:00 PM",
    location: "Major Auditorium",
    description: "Introductory workshop on version control fundamentals, repository management, and collaborative development using Git and GitHub.",
    audience: "All Students",
    participants: 1100
  },
  {
    title: "CodeChef MREC Algorithm Challenge 1.0",
    date: "March 18, 2022",
    time: "09:00 AM - 09:00 PM",
    location: "MREC Main Hall",
    description: "Inaugural algorithmic challenge of the CodeChef MREC Chapter. Day-long contest featuring complex problem sets with prizes worth ₹50,000.",
    audience: "All Engineering Students",
    participants: 1100,
    technologies: ["Dynamic Programming", "Greedy Algorithms", "Searching", "Sorting"],
    achievement: "Goodies sponsored by Newton School"
  },
  {
    title: "String Algorithms Workshop",
    date: "May 21, 2022",
    time: "17:00 PM - 19:00 PM",
    location: "Hackerrank",
    description: "Specialized workshop focused on string manipulation algorithms, pattern matching, and optimization techniques for text processing problems.",
    audience: "Sophomore & Junior Students",
    participants: 320
  },
  {
    title: "Array Data Structures Deep Dive",
    date: "January 24, 2022",
    time: "17:00 PM - 19:00 PM",
    location: "Hackerrank",
    description: "In-depth workshop covering array manipulation techniques, multidimensional arrays, and efficient algorithms for array-based problem solving.",
    audience: "Sophomore & Junior Students",
    participants: 320
  },
  {
    title: "Data Science Algorithms Workshop",
    date: "February 5, 2022",
    time: "10:00 AM - 07:00 PM",
    location: "MREC Computer Labs",
    description: "Workshop on implementing core algorithms used in data analysis, statistical modeling, and predictive analytics with hands-on problem solving.",
    audience: "CS, IT & ECE Students",
    participants: 350,
    technologies: ["Data Structures", "Python", "Statistical Algorithms", "Visualization", "Machine Learning"],
    achievement: "Goodies sponsored by Newton School"
  },
  {
    title: "Beginner's Coding Bootcamp",
    date: "January 16, 2022",
    time: "14:00 PM - 19:00 PM",
    location: "Hackerrank",
    description: "Introductory coding bootcamp for students new to competitive programming, covering fundamental algorithms and data structures with practical examples.",
    audience: "Sophomore & Junior Students",
    participants: 320
  },
  {
    title: "Freshman DSA Fundamentals",
    date: "December 10, 2021",
    time: "10:00 AM - 06:00 PM",
    location: "MREC Seminar Hall",
    description: "Workshop designed specifically for first-year students to build a solid foundation in data structures and algorithms with beginner-friendly problems.",
    audience: "First Year Students",
    participants: 320,
    technologies: ["Basic Algorithms", "Elementary Data Structures", "Problem Solving Techniques"],
    achievement: "Goodies sponsored by Newton School"
  },
  {
    title: "Algorithmic Problem Solving",
    date: "November 30, 2021",
    time: "14:00 PM - 16:00 PM",
    location: "MREC",
    description: "Intensive workshop on problem-solving approaches and algorithmic thinking for competitive programming contests.",
    audience: "Sophomore & Junior Students",
    participants: 320
  }
];

const Hackathons = () => {
  const [activeTab, setActiveTab] = useState<'participated' | 'organized'>('participated');
  
  // Filter events that are actually hackathons (for statistics)
  const hackathonsOnly = eventsOrganized.filter(event => 
    event.title.toLowerCase().includes('hack') || 
    event.title.toLowerCase().includes('challenge') ||
    (event.technologies && event.technologies.length > 0)
  );

  // Filter events that are contests/workshops (not hackathons)
  const otherEvents = eventsOrganized.filter(event => 
    !event.title.toLowerCase().includes('hack') && 
    !event.title.toLowerCase().includes('challenge') &&
    !(event.technologies && event.technologies.length > 0)
  );
  
  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Hackathons & Tech Events</h2>
      
      {/* Tabs */}
      <div className="flex mb-8">
        <button
          onClick={() => setActiveTab('participated')}
          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
            activeTab === 'participated'
            ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          Participated
        </button>
        <button
          onClick={() => setActiveTab('organized')}
          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
            activeTab === 'organized'
            ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          Organized
        </button>
      </div>
      
      {activeTab === 'participated' && (
        <>
          {/* Stats overview for participated */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold dark:text-white">{hackathonsParticipated.length}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Hackathons</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold dark:text-white">
                {hackathonsParticipated.filter(h => h.achievement).length}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Awards</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold dark:text-white">
                {hackathonsParticipated.reduce((sum, h) => sum + (h.duration || 0), 0)}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Total Hours</p>
            </div>
          </div>

          {/* Timeline view of participated hackathons */}
          <div className="relative border-l-2 border-zinc-200 dark:border-zinc-700 pl-6 ml-3 space-y-10">
            {hackathonsParticipated.map((hackathon, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[29px] p-1 bg-zinc-100 dark:bg-zinc-800 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
                
                {/* Hackathon card */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-5 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-medium dark:text-white">{hackathon.title}</h3>
                    <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {hackathon.date}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {hackathon.time && (
                      <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-3 h-3 mr-1 shrink-0" />
                        <span>{hackathon.time}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <MapPin className="w-3 h-3 mr-1 shrink-0" />
                      <span>{hackathon.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    {hackathon.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {hackathon.role && (
                      <div className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {hackathon.role}
                      </div>
                    )}
                    
                    {hackathon.achievement && (
                      <div className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded flex items-center">
                        <Trophy className="w-3 h-3 mr-1" />
                        {hackathon.achievement}
                      </div>
                    )}
                  </div>
                  
                  {hackathon.technologies && hackathon.technologies.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 flex items-center">
                        <Code className="w-3 h-3 mr-1" />
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {hackathon.technologies.map((tech, i) => (
                          <span 
                            key={i} 
                            className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(hackathon.projectUrl || hackathon.liveDemo) && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
                      <div className="flex flex-wrap gap-3">
                        {hackathon.projectUrl && (
                          <a 
                            href={hackathon.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                          >
                            <Github className="w-3 h-3 mr-1" /> View Project on GitHub
                          </a>
                        )}
                        {hackathon.liveDemo && (
                          <a 
                            href={hackathon.liveDemo} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {activeTab === 'organized' && (
        <>
          {/* Stats overview for organized */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold dark:text-white">{hackathonsOnly.length}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Challenges</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold dark:text-white">
                {otherEvents.length}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Workshops</p>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold dark:text-white">
                {eventsOrganized.reduce((sum, e) => sum + (e.participants || 0), 0)}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Participants</p>
            </div>
          </div>
          
          {/* Timeline view of organized events */}
          <div className="relative border-l-2 border-zinc-200 dark:border-zinc-700 pl-6 ml-3 space-y-10">
            {eventsOrganized.map((event, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[29px] p-1 bg-zinc-100 dark:bg-zinc-800 border-4 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
                
                {/* Event card */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-5 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-medium dark:text-white">{event.title}</h3>
                    <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {event.date}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {event.time && (
                      <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-3 h-3 mr-1 shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                      <MapPin className="w-3 h-3 mr-1 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {event.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {event.audience && (
                      <div className="text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 px-2 py-1 rounded flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {event.audience}
                      </div>
                    )}
                    
                    {event.participants && (
                      <div className="text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 px-2 py-1 rounded flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {event.participants} Participants
                      </div>
                    )}
                    
                    {event.achievement && (
                      <div className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded flex items-center">
                        <Award className="w-3 h-3 mr-1" />
                        {event.achievement}
                      </div>
                    )}
                  </div>
                  
                  {event.technologies && event.technologies.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 flex items-center">
                        <Code className="w-3 h-3 mr-1" />
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {event.technologies.map((tech, i) => (
                          <span 
                            key={i} 
                            className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Hackathons; 