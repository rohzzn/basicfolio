// src/components/multi-page-portfolio.tsx

"use client";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block px-2 py-1.5 text-sm transition-colors capitalize w-full text-left
        ${
          isActive
            ? "text-black dark:text-white"
            : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
        }`}
    >
      {children}
    </Link>
  );
};

// Helper Function for Discord Status
const getStatusColor = (status: string): string => {
  switch (status) {
    case "online":
      return "#22C55E"; // green-500
    case "idle":
      return "#F59E0B"; // yellow-500
    case "dnd":
      return "#EF4444"; // red-500
    case "offline":
      return "#6B7280"; // gray-500
    default:
      return "#6B7280"; // default to gray-500
  }
};

interface LayoutProps {
  children: React.ReactNode;
}

const MultiPagePortfolio: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lanyardData, setLanyardData] = useState<{
    discord_status: string;
    activities?: { name: string; state: string; details?: string }[];
  } | null>(null);
  const discordId = "407922731645009932"; // Your Discord ID

  useEffect(() => {
    const fetchLanyardData = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const data = await response.json();
        if (data.success) {
          setLanyardData(data.data);
        } else {
          console.error("Failed to fetch Lanyard data:", data);
        }
      } catch (error) {
        console.error("Error fetching Lanyard data:", error);
      }
    };

    fetchLanyardData();

    const interval = setInterval(fetchLanyardData, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [discordId]);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-md shadow-md"
        aria-label="Toggle Menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-0 w-64 bg-zinc-50 dark:bg-zinc-900 
          border-r border-zinc-200 dark:border-zinc-800 
          flex flex-col 
          transform lg:transform-none transition-transform duration-200 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          z-40
        `}
      >
        {/* Top Section: Header and Navigation */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-2xl font-bold dark:text-white">Rohan</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">Software Engineer</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { path: "/", label: "About" },
              { path: "/projects", label: "Projects" },
              { path: "/stack", label: "Stack" },
              { path: "/hobbies", label: "Hobbies" },
              { path: "/writing", label: "Writing" },
            ].map((item) => (
              <NavLink key={item.path} href={item.path}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Social Text Links & Discord Status */}
        <div className="sticky bottom-0 p-8 bg-zinc-50 dark:bg-zinc-900">
          <div className="mb-4 flex items-center gap-4 justify-start">
            {/* Instagram */}
            <a
              href="https://instagram.com/rohzzn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-zinc-600 dark:text-zinc-400 hover:text-pink-500 dark:hover:text-pink-300 transition-colors text-sm font-medium"
            >
              IG.
            </a>

            {/* Twitter */}
            <a
              href="https://twitter.com/rohzzn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors text-sm font-medium"
            >
              TW.
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/in/rohzzn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-zinc-600 dark:text-zinc-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors text-sm font-medium"
            >
              IN.
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/rohzzn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium"
            >
              GH.
            </a>
          </div>

          {/* Discord Status */}
          {lanyardData && (
            <div className="py-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-col items-start gap-1">
                {/* Status Indicator and Text on the Same Line */}
                <div className="flex items-center gap-2">
                  {/* Filled Circle with Glow */}
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: getStatusColor(lanyardData.discord_status),
                      boxShadow: `0 0 8px ${getStatusColor(lanyardData.discord_status)}`,
                    }}
                  ></div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">
                    {lanyardData.discord_status}
                  </span>
                </div>

                {/* Activity Details on Separate Lines */}
                {lanyardData.activities && lanyardData.activities.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {lanyardData.activities[0].name}
                    </div>
                    {lanyardData.activities[0].state && (
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {lanyardData.activities[0].state}
                      </div>
                    )}
                    {lanyardData.activities[0].details && (
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {lanyardData.activities[0].details}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-12 overflow-y-auto">{children}</div>
    </div>
  );
};

export default MultiPagePortfolio;
