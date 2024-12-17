"use client";
import React from "react";

const NoiseOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        className="opacity-10 dark:opacity-10"
      >
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="10s"
              values="0.8;0.85;0.8"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix
            type="matrix"
            values="
              0.5 0 0 0 0
              0 0.5 0 0 0
              0 0 0.5 0 0
              0 0 0 1 0
            "
          />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
};

export default NoiseOverlay;
