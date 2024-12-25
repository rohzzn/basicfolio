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
          opacity: 0.6;
          width: 100%;
          height: 100%;
          background-size: 400% 400%;
          animation: diagonalShift 240s ease-in-out infinite;
        }

        @keyframes diagonalShift {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 50% 10%;
          }
          50% {
            background-position: 100% 0%;
          }
          75% {
            background-position: 50% -10%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default DiagonalShadowOverlay;
