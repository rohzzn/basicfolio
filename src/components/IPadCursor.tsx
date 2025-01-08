"use client";
import React, { useEffect, useState, useRef } from 'react';

interface LocationData {
  city: string;
  country_name: string;
  latitude: number;
  longitude: number;
  isp: string;
  org: string;
  asn: string;
  region: string;
  timezone: string;
  country_code: string;
  continent_code: string;
  connection_type: string;
}

interface Distance {
  km: number;
  miles: number;
}

interface Coordinates {
  lat: number;
  lon: number;
}

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingPhase, setGreetingPhase] = useState(0);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  const UC_COORDS: Coordinates = {
    lat: 39.1329,
    lon: -84.5150
  };

  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): Distance => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const kmDistance = R * c;
    const milesDistance = kmDistance * 0.621371;
    
    return {
      km: Math.round(kmDistance),
      miles: Math.round(milesDistance)
    };
  };

  const getRandomGreeting = (data: LocationData): string => {
    const distance = calculateDistance(
      data.latitude,
      data.longitude,
      UC_COORDS.lat,
      UC_COORDS.lon
    );

    const userHour = new Date().getHours();
    const isNightTime = userHour >= 18 || userHour < 6;

    type GreetingArray = (string | null)[];

    const getIspName = (isp: string | undefined): string => {
      if (!isp) return 'unknown';
      const firstWord = isp.split(' ')[0];
      return firstWord || 'unknown';
    };

    // Create different types of greetings
    const distanceGreetings: GreetingArray = [
      `${distance.miles} miles away 🎯`,
      `${distance.km} kilometers away 🌎`,
      distance.miles < 5 ? `you're only ${distance.miles} miles away neighbor! 👋` : null
    ];

    const ispGreetings: GreetingArray = data.isp ? [
      `${data.isp} user spotted! 👀`,
      `browsing with ${getIspName(data.isp)} ⚡`,
      `powered by ${getIspName(data.isp)} 🚀`
    ] : [];

    const timeGreetings: GreetingArray = [
      isNightTime ? "night owl spotted! 🦉" : "day explorer! ☀️",
      userHour < 5 ? "burning the midnight oil? ✨" : null
    ];

    const regionGreetings: GreetingArray = [
      data.continent_code === "NA" ? "hello fellow North American! 🌎" : null,
      data.country_code === "US" ? "greetings from across the states! 🇺🇸" : `visiting from ${data.country_code}! 🌍`
    ];

    const networkGreetings: GreetingArray = [
      data.connection_type === "cellular" ? "mobile surfer! 📱" : null,
      data.org ? `connected via ${data.org.split(' ')[0]}! 🔌` : null
    ];

    // Combine all greeting types
    const greetingTypes: GreetingArray[] = [
      distanceGreetings,
      ispGreetings,
      timeGreetings,
      regionGreetings,
      networkGreetings
    ];

    // Randomly select a greeting type and filter out null values
    const selectedType = greetingTypes[Math.floor(Math.random() * greetingTypes.length)]
      .filter((greeting): greeting is string => greeting !== null);

    // If the selected type has no valid greetings, try another type
    if (selectedType.length === 0) {
      return getRandomGreeting(data);
    }

    // Select a random greeting from the chosen type
    return selectedType[Math.floor(Math.random() * selectedType.length)];
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 
        ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      return;
    }

    clickSoundRef.current = new Audio('/click.wav');
    clickSoundRef.current.volume = 0.2;

    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data: LocationData = await response.json();
        
        const timeGreeting = getTimeBasedGreeting();
        const customGreeting = getRandomGreeting(data);
        
        // Ensure we show both greetings in sequence
        const showGreetingSequence = () => {
          // First greeting
          setGreeting(`${timeGreeting}! 👋`);
          setShowGreeting(true);
          setGreetingPhase(0);

          // Second greeting after delay
          setTimeout(() => {
            setShowGreeting(false);
            setTimeout(() => {
              setGreeting(customGreeting);
              setShowGreeting(true);
              setGreetingPhase(1);
              setTimeout(() => setShowGreeting(false), 2000);
            }, 300);
          }, 2000);
        };

        showGreetingSequence();
      } catch (error) {
        console.error('Error fetching location:', error);
        setGreeting("Hello there! 👋");
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 3000);
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
  }, [UC_COORDS.lat, UC_COORDS.lon]); // Including coordinates as they're used in the effect via getRandomGreeting

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
            className={`absolute left-8 top-0 whitespace-nowrap bg-black/75 text-white/90 text-xs px-2 py-0.5 rounded backdrop-blur-sm
              ${showGreeting ? 'animate-fade-in' : ''}`}
            style={{
              opacity: showGreeting ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              fontWeight: 300,
              letterSpacing: '0.02em'
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
          style={{
            filter: `hue-rotate(${greetingPhase * 90}deg)`
          }}
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.3233 12.0217L7.48781 12.0217L7.29681 12.0525L7.14778 12.1822L5.65376 12.3673Z"
            fill={isHovering ? '#2563eb' : 'white'}
            stroke={isHovering ? '#2563eb' : 'black'}
            strokeWidth="1"
          />
        </svg>
      </div>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateX(-10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CustomCursor;