"use client";
import React from 'react';

const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Subtle gradient mesh */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200/50 via-transparent to-zinc-300/50 dark:from-zinc-800/50 dark:via-transparent dark:to-zinc-700/50 animate-gradient-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,_transparent_0%,_rgba(120,120,120,0.05)_100%)]" />
      </div>

      {/* Grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.15] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          transform: 'translate3d(0, 0, 0)',
        }}
      />

      <style jsx>{`
        @keyframes gradientShift {
          0% { transform: translate(0%, 0%) rotate(0deg); }
          50% { transform: translate(-1%, -1%) rotate(0.5deg); }
          100% { transform: translate(0%, 0%) rotate(0deg); }
        }

        .animate-gradient-shift {
          animation: gradientShift 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AmbientBackground;