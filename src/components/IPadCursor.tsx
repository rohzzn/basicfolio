"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";

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
  const [isVisible, setIsVisible] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [showGreeting, setShowGreeting] = useState(false);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  const UC_COORDS: Coordinates = { lat: 39.1329, lon: -84.5150 };

  const getTimeBasedGreeting = useCallback((): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): Distance => {
      const R = 6371; 
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const kmDistance = R * c;
      const milesDistance = kmDistance * 0.621371;
      return { km: Math.round(kmDistance), miles: Math.round(milesDistance) };
    },
    []
  );

  const getRandomGreeting = useCallback(
    (data: LocationData): string => {
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
        if (!isp) return "unknown";
        const firstWord = isp.split(" ")[0];
        return firstWord || "unknown";
      };

      const distanceGreetings: GreetingArray = [
        `${distance.miles} miles away from Rohan📍`,
        `${distance.km} kilometers away from Rohan📍`,
        distance.miles < 5
          ? `you're only ${distance.miles} miles away neighbor! 👋`
          : null,
      ];

      const ispGreetings: GreetingArray = data.isp
        ? [
            `${data.isp} user spotted! 👀`,
            `browsing with ${getIspName(data.isp)} ⚡`,
            `powered by ${getIspName(data.isp)} 🚀`,
          ]
        : [];

      const timeGreetings: GreetingArray = [
        isNightTime ? "night owl spotted! 🦉" : "day explorer! ☀️",
        userHour < 5 ? "burning the midnight oil? ✨" : null,
      ];

      const regionGreetings: GreetingArray = [
        data.continent_code === "NA" ? "hello fellow North American! 🌎" : null,
        data.country_code === "US"
          ? "greetings from across the states! 🇺🇸"
          : `visiting from ${data.country_code}! 🌍`,
      ];

      const networkGreetings: GreetingArray = [
        data.connection_type === "cellular" ? "mobile surfer! 📱" : null,
        data.org ? `connected via ${data.org.split(" ")[0]}! 🔌` : null,
      ];

      const greetingTypes: GreetingArray[] = [
        distanceGreetings,
        ispGreetings,
        timeGreetings,
        regionGreetings,
        networkGreetings,
      ];

      const selectedType =
        greetingTypes[Math.floor(Math.random() * greetingTypes.length)].filter(
          (greeting): greeting is string => greeting !== null
        );

      if (selectedType.length === 0) {
        return getRandomGreeting(data);
      }

      return selectedType[Math.floor(Math.random() * selectedType.length)];
    },
    [calculateDistance, UC_COORDS.lat, UC_COORDS.lon]
  );

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    ) {
      return;
    }

    clickSoundRef.current = new Audio("/click.wav");
    clickSoundRef.current.volume = 0.2;

    const fetchLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data: LocationData = await response.json();
        const timeGreeting = getTimeBasedGreeting();
        const customGreeting = getRandomGreeting(data);

        const showGreetingSequence = () => {
          setGreeting(`${timeGreeting}! 👋`);
          setShowGreeting(true);

          setTimeout(() => {
            setShowGreeting(false);
            setTimeout(() => {
              setGreeting(customGreeting);
              setShowGreeting(true);
              setTimeout(() => setShowGreeting(false), 2000);
            }, 300);
          }, 2000);
        };

        showGreetingSequence();
      } catch (error) {
        console.error("Error fetching location:", error);
        setGreeting("Hello there! 👋");
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 3000);
      }
    };

    fetchLocation();

    const playClickSound = () => {
      if (clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch((err) =>
          console.debug("Click sound error:", err)
        );
      }
    };

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, select, textarea")
      ) {
        playClickSound();
      }
    };

    const style = document.createElement("style");
    style.textContent = `* { cursor: none !important; }`;
    document.head.appendChild(style);

    document.addEventListener("mousemove", updatePosition, { passive: true });
    document.addEventListener("click", handleClick);

    return () => {
      document.head.removeChild(style);
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("click", handleClick);
    };
  }, [getTimeBasedGreeting, getRandomGreeting]);

  if (!isVisible) return null;

  return (
    <>
      {showGreeting && (
        <div
          className="cursor-greeting animate-fade-in"
          style={{
            position: "fixed",
            top: position.y + 20,
            left: position.x + 20,
            whiteSpace: "nowrap",
            background: "rgba(0, 0, 0, 0.75)",
            color: "#fff",
            fontSize: "12px",
            padding: "4px 8px",
            borderRadius: "4px",
            pointerEvents: "none",
          }}
        >
          {greeting}
        </div>
      )}

      <div
        className="custom-cursor"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: "transform 0.1s ease-out",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <defs>
            <filter
              id="cursorShadow"
              x="-25%"
              y="-25%"
              width="150%"
              height="150%"
              filterUnits="objectBoundingBox"
            >
              <feDropShadow
                dx="2"
                dy="2"
                stdDeviation="1"
                floodColor="#000000"
                floodOpacity="0.15"
              />
            </filter>
          </defs>
          <path
            d="M8 8L24 16L8 24L8 8Z"
            fill="#000000"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
            filter="url(#cursorShadow)"
          />
        </svg>
      </div>

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default CustomCursor;