"use client";
import React, { useEffect, useState, useRef } from 'react';

interface LocationData {
  city: string;
  country_name: string;
}

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if it's a mobile device
    if (typeof window !== 'undefined' && 
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      return; // Don't initialize on mobile
    }

    // Initialize click sound
    clickSoundRef.current = new Audio('/click.wav');
    clickSoundRef.current.volume = 0.2;

    // Fetch IP location data
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data: LocationData = await response.json();
        setGreeting(`Hello from ${data.city}, ${data.country_name}!`);
        setShowGreeting(true);
        
        // Hide greeting after 3 seconds
        setTimeout(() => {
          setShowGreeting(false);
        }, 3000);
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();

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
    <div
      className="fixed pointer-events-none z-[9999] hidden md:block"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <div className="relative">
        {showGreeting && (
          <div 
            className="absolute -top-8 -left-2 whitespace-nowrap bg-black text-white px-3 py-1 rounded-lg text-sm"
            style={{
              transform: 'translate(-50%, -100%)',
              opacity: showGreeting ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            {greeting}
          </div>
        )}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className={`transform transition-transform duration-200 ${
            isHovering ? 'scale-110' : 'scale-100'
          }`}
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.3233 12.0217L7.48781 12.0217L7.29681 12.0525L7.14778 12.1822L5.65376 12.3673Z"
            fill={isHovering ? '#2563eb' : 'white'}
            stroke={isHovering ? '#2563eb' : 'black'}
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};

export default CustomCursor;