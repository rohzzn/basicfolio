"use client";
import React from "react";

const LightBeamsOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div className="absolute inset-0 overflow-hidden">
        {/* Beam 1 */}
        <div className="absolute inset-0 animate-beam1">
          <div className="h-[250%] w-[250%] bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-[20deg] translate-x-[-50%] translate-y-[-50%] mix-blend-screen" />
        </div>
        {/* Beam 2 */}
        <div className="absolute inset-0 animate-beam2">
          <div className="h-[250%] w-[250%] bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-[20deg] translate-x-[-50%] translate-y-[-50%] mix-blend-screen" />
        </div>
      </div>

      <style jsx>{`
        @keyframes beam1 {
          0% {
            transform: translateX(-100%) translateY(-50%) skewX(-20deg);
          }
          100% {
            transform: translateX(100%) translateY(-50%) skewX(-20deg);
          }
        }
        @keyframes beam2 {
          0% {
            transform: translateX(-150%) translateY(-50%) skewX(-20deg);
          }
          100% {
            transform: translateX(50%) translateY(-50%) skewX(-20deg);
          }
        }
        .animate-beam1 {
          animation: beam1 15s linear infinite;
        }
        .animate-beam2 {
          animation: beam2 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LightBeamsOverlay;
