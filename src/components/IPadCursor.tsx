// src/components/IPadCursor.tsx

import React, { useEffect, useState, useCallback } from 'react';

const IPadCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 }); // Start offscreen
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [clickSound] = useState(() => typeof Audio !== 'undefined' ? new Audio('/click.wav') : null);

  // Configure click sound
  useEffect(() => {
    if (clickSound) {
      clickSound.volume = 0.2; // Adjust volume to 20%
      // Preload the sound for better performance
      clickSound.load();
    }
  }, [clickSound]);

  // Handle click sound playback
  const playClickSound = useCallback(() => {
    if (clickSound) {
      // Reset the audio to start if it's already playing
      clickSound.currentTime = 0;
      // Play the sound
      clickSound.play().catch(error => {
        // Handle any autoplay restrictions or errors silently
        console.debug('Click sound playback error:', error);
      });
    }
  }, [clickSound]);

  useEffect(() => {
    // Only show cursor after initial position is set
    const showCursor = () => setIsVisible(true);
    window.addEventListener('mousemove', showCursor);

    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, select, textarea')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, select, textarea')) {
        setIsHovering(false);
      }
    };

    // Click handler - only play sound on interactive elements
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if the clicked element is interactive
      if (target.closest('a, button, [role="button"], input, select, textarea, [tabindex="0"]')) {
        playClickSound();
      }
    };

    // Add global styles to hide cursor
    const style = document.createElement('style');
    style.textContent = `
      * {
        cursor: none !important;
      }
      a, button, [role="button"], input, select, textarea {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    document.addEventListener('mousemove', updateCursorPosition, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick);

    // Clean up
    return () => {
      document.head.removeChild(style);
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', showCursor);
    };
  }, [playClickSound]);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed pointer-events-none z-[9999]"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.2s ease, height 0.2s ease',
      }}
    >
      <div
        className="rounded-full bg-black/50 dark:bg-white/50"
        style={{
          width: isHovering ? '40px' : '20px',
          height: isHovering ? '40px' : '20px',
          transition: 'all 0.2s ease',
        }}
      />
    </div>
  );
};

export default IPadCursor;