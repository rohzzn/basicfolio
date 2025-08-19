"use client";
import React, { useState, useEffect, useRef } from "react";

interface CursorProps {
  color?: string;
  size?: number;
  ringSize?: number;
  ringColor?: string;
  trailEffect?: boolean;
}

const ModernCursor: React.FC<CursorProps> = ({
  size = 8,
  ringSize = 36,
  trailEffect = true,
}) => {
  // Use appropriate colors based on dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for dark mode on initial load
    const checkDarkMode = () => {
      if (typeof window === 'undefined') return false;
      
      // Check for dark mode preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
      
      // Check for dark mode class on html element (for manual toggle)
      return document.documentElement.classList.contains('dark');
    };
    
    setIsDarkMode(checkDarkMode());
    
    // Set up observer to detect dark mode changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [targetPosition, setTargetPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [trails, setTrails] = useState<Array<{ x: number; y: number; opacity: number }>>([]);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const rAF = useRef<number | null>(null);
  const deviceHasMouse = useRef(true);
  const lastTrailTime = useRef(0);

  // Check if device has mouse
  useEffect(() => {
    const checkDeviceType = () => {
      deviceHasMouse.current = !(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0
      );
      
      if (!deviceHasMouse.current) {
        // Exit early if it's a touch device
        return false;
      }
      return true;
    };

    const hasMouse = checkDeviceType();
    if (!hasMouse) return;

    // Load click sound
    clickSoundRef.current = new Audio("/public_sounds_trigger.mp3");
    if (clickSoundRef.current) {
      clickSoundRef.current.volume = 0.2;
    }

    // Hide default cursor
    document.documentElement.style.cursor = "none";
    const links = document.querySelectorAll("a, button, [role='button'], input, textarea, select, [tabindex]");
    links.forEach(el => {
      (el as HTMLElement).style.cursor = "none";
    });

    // Make cursor visible
    setIsVisible(true);

    return () => {
      // Reset cursor on cleanup
      document.documentElement.style.cursor = "";
      links.forEach(el => {
        (el as HTMLElement).style.removeProperty("cursor");
      });
      
      if (rAF.current) {
        cancelAnimationFrame(rAF.current);
      }
    };
  }, []);

  // Smooth cursor animation using requestAnimationFrame
  useEffect(() => {
    if (!deviceHasMouse.current) return;

    const animateCursor = () => {
      if (!cursorDotRef.current || !cursorRingRef.current) {
        rAF.current = requestAnimationFrame(animateCursor);
        return;
      }

      // Smooth movement with easing
      const easeAmount = 0.2;
      
      // Update dot position (follows cursor exactly)
      setPosition(prev => ({
        x: prev.x + (targetPosition.x - prev.x) * easeAmount,
        y: prev.y + (targetPosition.y - prev.y) * easeAmount
      }));

      // Set trail if enough time has passed
      if (trailEffect && Date.now() - lastTrailTime.current > 50) {
        lastTrailTime.current = Date.now();
        setTrails(prevTrails => [
          ...prevTrails.slice(-5).map(trail => ({ ...trail, opacity: trail.opacity * 0.8 })),
          { x: position.x, y: position.y, opacity: 0.5 }
        ]);
      }

      rAF.current = requestAnimationFrame(animateCursor);
    };

    rAF.current = requestAnimationFrame(animateCursor);

    return () => {
      if (rAF.current) {
        cancelAnimationFrame(rAF.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPosition, trailEffect]);

  // Event listeners
  useEffect(() => {
    if (!deviceHasMouse.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      setTargetPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      const isOverClickable = target.closest(
        "a, button, [role='button'], input, textarea, select, [tabindex]"
      );
      setIsPointer(!!isOverClickable);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      
      // Only play sound when clicking on clickable elements
      const target = e.target as HTMLElement;
      const isClickableElement = target.closest(
        "a, button, [role='button'], input, textarea, select, [tabindex]"
      );
      
      if (isClickableElement && clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(err => {
          // Suppress "user didn't interact" errors
          console.debug("Click sound error:", err);
        });
      }
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setTargetPosition({ x: -100, y: -100 });
      setPosition({ x: -100, y: -100 });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible || !deviceHasMouse.current) return null;

  return (
    <div className="cursor-container" style={{ zIndex: 9999, pointerEvents: "none" }}>
      {/* Cursor trails */}
      {trailEffect && trails.map((trail, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            transform: `translate(${trail.x}px, ${trail.y}px)`,
            width: size / 2,
            height: size / 2,
            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)", // Made more opaque
            borderRadius: "50%",
            opacity: trail.opacity,
            transition: "opacity 0.5s ease",
            zIndex: 9997
          }}
        />
      ))}
      
      {/* Cursor ring */}
      <div
        ref={cursorRingRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
          width: isPointer ? ringSize * 0.5 : isClicking ? ringSize * 0.8 : ringSize,
          height: isPointer ? ringSize * 0.5 : isClicking ? ringSize * 0.8 : ringSize,
          borderRadius: "50%",
          border: `2px solid ${isDarkMode ? "#6B7280" : "#4B5563"}`, // Darker border for better visibility
          backgroundColor: isPointer ? (isDarkMode ? "rgba(107, 114, 128, 0.3)" : "rgba(75, 85, 99, 0.3)") : "transparent", // Dark hover background
          transition: "width 0.3s, height 0.3s, background-color 0.3s",
          zIndex: 9998
        }}
      />
      
      {/* Cursor dot */}
      <div
        ref={cursorDotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
          width: isClicking ? size * 1.5 : size,
          height: isClicking ? size * 1.5 : size,
          backgroundColor: isDarkMode ? "#9CA3AF" : "#1F2937", // Dark gray in light mode, lighter gray in dark mode
          borderRadius: "50%",
          transition: "width 0.2s, height 0.2s",
          zIndex: 9999
        }}
      />
    </div>
  );
};

export default ModernCursor;