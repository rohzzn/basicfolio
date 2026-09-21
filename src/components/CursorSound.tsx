"use client";

import React, { useEffect, useRef } from 'react';

const CursorSound: React.FC = () => {
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Load click sound
    clickSoundRef.current = new Audio("/public_sounds_trigger.mp3");
    if (clickSoundRef.current) {
      clickSoundRef.current.volume = 0.2;
    }
    
    // Function to handle click events
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element is clickable
      const isClickableElement = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') || 
        target.getAttribute('role') === 'button' ||
        target.classList.contains('clickable');
      
      // Only play sound when clicking on clickable elements
      if (isClickableElement && clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(err => {
          console.debug("Click sound error:", err);
        });
      }
    };
    
    // Add event listener
    document.addEventListener('click', handleClick);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default CursorSound;
