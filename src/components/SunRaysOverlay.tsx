"use client";
import React, { useState, useEffect } from "react";
import { Sun } from "lucide-react";

const SunRaysOverlay = () => {
  // 'day', 'night', or 'disabled'
  // Default to "disabled" so the site loads with no overlay
  const [mode, setMode] = useState<"day" | "night" | "disabled">("disabled");
  const [isMobile, setIsMobile] = useState(true);
  // For the button's "blinds" animation
  const [animateBlinds, setAnimateBlinds] = useState<"none" | "open" | "close">("none");

  useEffect(() => {
    // Check if we're on desktop
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is typically tablet/desktop breakpoint
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Don't render anything on mobile
  if (isMobile) return null;

  const toggleMode = () => {
    // Decide open vs close based on next mode
    setAnimateBlinds(
      mode === "disabled" ? "open" : mode === "day" ? "close" : "open"
    );
    
    // Cycle day -> night -> disabled -> day
    setMode((prev) => {
      if (prev === "day") return "night";
      if (prev === "night") return "disabled";
      return "day";
    });
  };

  // Convenience booleans
  const isDay = mode === "day";
  const isNight = mode === "night";
  const isDisabled = mode === "disabled";

  // If disabled, skip overlays
  const showOverlays = !isDisabled;

  return (
    <>
      {/* Toggle Button - Desktop Only */}
      <div className="fixed bottom-8 right-24 z-50 hidden lg:block">
        <button
          onClick={toggleMode}
          onAnimationEnd={() => setAnimateBlinds("none")} // Reset animation
          className={`
            p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full shadow-lg 
            hover:scale-105 transition-transform duration-200 ease-in-out group
            ${isDay ? "text-amber-500" : isNight ? "text-blue-400" : "text-gray-400"}
            ${animateBlinds === "open" ? "animate-blindsOpen" : ""}
            ${animateBlinds === "close" ? "animate-blindsClose" : ""}
          `}
          aria-label={
            isDay
              ? "Switch to night mode"
              : isNight
              ? "Disable effects"
              : "Switch to day mode"
          }
        >
          <Sun
            className={`w-5 h-5 transform transition-transform duration-500
              ${
                isDay
                  ? "rotate-0"
                  : isNight
                  ? "-rotate-90"
                  : "rotate-180"
              }
            `}
          />
        </button>
      </div>

      {/* Overlay Effects - Desktop Only */}
      {showOverlays && (
        <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block">
          {/* Warm/Cool Overlay */}
          <div
            className={`absolute inset-0 transition-opacity duration-700
              ${
                isDay
                  ? "opacity-20 bg-gradient-to-l from-amber-500/30 via-orange-300/20 to-transparent"
                  : "opacity-30 bg-gradient-to-l from-blue-900/40 via-blue-800/20 to-transparent"
              }
            `}
          />

          {/* Light Rays - Sun top-right, half outside */}
          <div
            className={`absolute inset-0 transition-opacity duration-700
              ${isDay ? "opacity-100" : "opacity-0"}`}
          >
            {/* Move the "sun" so half is off-screen to the right */}
            <div className="absolute top-[5%] -right-[25%] w-[700px] h-[700px] rounded-full bg-gradient-radial from-amber-500/30 via-orange-300/20 to-transparent blur-xl" />
            {/* Rays from the right side */}
            <div className="absolute top-0 right-0 w-[50vw] h-full bg-gradient-to-l from-amber-500/10 via-transparent to-transparent blur-lg" />
          </div>

          {/* Night Mode Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-l from-blue-900/30 via-blue-800/20 to-transparent
              transition-opacity duration-700 ${isNight ? "opacity-60" : "opacity-0"}`}
          >
            {/* Stars */}
            <div
              className={`absolute inset-0 stars transition-opacity duration-700 ${
                isNight ? "twinkle" : ""
              }`}
              style={{ opacity: isNight ? 0.7 : 0 }}
            />
          </div>

          {/* Diagonal Stripes (blinds effect + subtle animation) */}
          <div
            className={`h-full w-full bg-diagonalStripes transition-opacity duration-700
            ${isDay ? "opacity-20" : isNight ? "opacity-10" : "opacity-0"}`}
          />

          {/* Color Temperature (slight tint) */}
          <div
            className={`fixed inset-0 pointer-events-none mix-blend-multiply transition-opacity duration-700
              ${
                isDay
                  ? "opacity-20 bg-[#fff3e0]" // Warm
                  : "opacity-15 bg-[#b3e5fc]"  // Cool
              }
            `}
          />
        </div>
      )}

      <style jsx>{`
        /* Diagonal stripes with slow horizontal shift
           to mimic "blinds shadow" gently moving */
        .bg-diagonalStripes {
          background: repeating-linear-gradient(
            300deg,
            rgba(0, 0, 0, 0.3) 0,
            rgba(0, 0, 0, 0.3) 200px,
            transparent 200px,
            transparent 400px
          );
          filter: blur(20px);
          width: 100%;
          height: 100%;
          animation: diagonalShift 40s linear infinite;
          background-size: 200%;
        }

        @keyframes diagonalShift {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 100% 0;
          }
        }

        /* Stars & twinkle */
        .stars {
          background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
        }
        .twinkle {
          animation: twinkle 6s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.9; }
        }

        /* Blinds animations for the button */
        @keyframes blindsOpen {
          0% {
            transform: scale(1) rotateX(0deg);
          }
          50% {
            transform: scale(1.05) rotateX(15deg);
          }
          100% {
            transform: scale(1) rotateX(0deg);
          }
        }
        @keyframes blindsClose {
          0% {
            transform: scale(1) rotateX(0deg);
          }
          50% {
            transform: scale(0.95) rotateX(-15deg);
          }
          100% {
            transform: scale(1) rotateX(0deg);
          }
        }
        .animate-blindsOpen {
          animation: blindsOpen 0.5s ease-in-out forwards;
        }
        .animate-blindsClose {
          animation: blindsClose 0.5s ease-in-out forwards;
        }
      `}</style>
    </>
  );
};

export default SunRaysOverlay;
