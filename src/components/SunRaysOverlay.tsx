"use client";
import React from "react";

const DiagonalShadowOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div className="h-full w-full bg-diagonalStripes" />
      <style jsx>{`
        .bg-diagonalStripes {
          background: repeating-linear-gradient(
            330deg,
            rgba(0, 0, 0, 0.4) 0,
            rgba(0, 0, 0, 0.4) 200px,
            transparent 200px,
            transparent 400px
          );
          filter: blur(30px);
          opacity: 0.4;
          width: 100%;
          height: 100%;
          background-size: 300% 300%;
          animation: diagonalShift 20s ease-in-out infinite;
        }
        @keyframes diagonalShift {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DiagonalShadowOverlay;
