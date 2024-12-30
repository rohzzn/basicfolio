"use client";
import React from "react";

const SoftNoiseOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <div className="h-full w-full bg-noisePattern" />
      <style jsx>{`
        .bg-noisePattern {
          /* Base color overlay */
          background-color: rgba(0, 0, 0, 0.05);
          /* Noise texture repeated */
          background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' version='1.1' xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23ffffff' width='1' height='1' x='13' y='13'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px 200px;
          mix-blend-mode: overlay;
        }
      `}</style>
    </div>
  );
};

export default SoftNoiseOverlay;
