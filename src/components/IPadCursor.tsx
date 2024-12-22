// src/components/IPadCursor.tsx

import React, { useEffect, useState } from 'react';

const IPadCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 }); // Start offscreen
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

    // Clean up
    return () => {
      document.head.removeChild(style);
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousemove', showCursor);
    };
  }, []);

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