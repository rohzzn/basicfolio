"use client";
import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize click sound
    clickSoundRef.current = new Audio('/click.wav');
    clickSoundRef.current.volume = 0.2;

    const playClickSound = () => {
      if (clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(err => console.debug('Click sound error:', err));
      }
    };

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('a, button, [role="button"], input, select, textarea'));
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, select, textarea')) {
        playClickSound();
      }
    };

    const style = document.createElement('style');
    style.textContent = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    document.addEventListener('mousemove', updatePosition, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick);

    return () => {
      document.head.removeChild(style);
      document.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <div
          className={`relative -ml-1 -mt-1 rounded-full bg-white transition-all duration-200 ease-out ${
            isHovering ? 'w-5 h-5 -ml-2.5 -mt-2.5' : 'w-2 h-2'
          }`}
        />
      </div>
      
      {/* Trail effect */}
      <div
        className="fixed pointer-events-none z-[9998] mix-blend-difference"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          className={`relative rounded-full bg-white opacity-25 transition-all duration-200 ease-out ${
            isHovering ? 'w-7 h-7 -ml-3.5 -mt-3.5' : 'w-4 h-4 -ml-2 -mt-2'
          }`}
        />
      </div>
    </>
  );
};

export default CustomCursor;