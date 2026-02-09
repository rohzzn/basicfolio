"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import GitHubCalendar from 'react-github-calendar';

const Home: React.FC = () => {
  const [showImage, setShowImage] = useState(false);
  const [emoji, setEmoji] = useState('👋');
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Check initial dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Function to get a random emoji for visitor greeting
  const getRandomEmoji = () => {
    const emojis = ['👋', '👀', '✨', '🎉', '🚀', '🔥', '😊', '🙌', '💯', '🌟'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };
  
  const handleMouseEnter = () => {
    setEmoji(getRandomEmoji());
    setShowImage(true);
  };
  
  return (
    <div className="max-w-7xl relative">
      {/* Hero Section */}
      <div className="mb-12">
        <div style={{ maxWidth: '75ch' }}>
          <h1 
            className="text-lg font-medium mb-6 dark:text-white inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowImage(false)}
          >
            Rohan Pothuru
          </h1>
          
          <p className="text-base text-zinc-600 dark:text-zinc-400 mb-4">
            I&apos;m a software engineer and computer science graduate student who loves building things that matter. Currently pursuing my Masters at the University of Cincinnati while working part-time as a developer, where I contribute to healthcare tech.
          </p>
          
          <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
            When I&apos;m not coding, you&apos;ll find me taking photos, gaming with friends, or working on random design projects that catch my interest. I also spend way too much time tweaking my setup and discovering new tools that probably don&apos;t make me more productive but are fun to play with.
          </p>
        </div>
        
        {/* GitHub Calendar */}
        <div style={{ maxWidth: '75ch' }} className="mt-16 overflow-hidden">
          <GitHubCalendar 
            username="rohzzn"
            colorScheme={isDark ? 'dark' : 'light'}
            theme={{
              light: ['#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'],
              dark: ['#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8'],
            }}
            blockSize={14}
            blockMargin={4}
            fontSize={12}
            hideColorLegend
            hideMonthLabels
            hideTotalCount
            showWeekdayLabels={false}
            transformData={(data) => {
              const now = new Date();
              const eightMonthsAgo = new Date(now);
              eightMonthsAgo.setMonth(now.getMonth() - 8);
              return data.filter(day => new Date(day.date) >= eightMonthsAgo);
            }}
            style={{
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Secret image that appears on hover */}
      <div 
        className={`fixed right-0 top-1/4 transform transition-all duration-300 ease-in-out ${
          showImage 
            ? 'translate-x-0 opacity-100 -rotate-12' 
            : 'translate-x-full opacity-0 rotate-12'
        }`}
        style={{ zIndex: 50, transformOrigin: 'bottom right' }}
      >
        <div className="relative w-64 h-80 overflow-hidden rounded-lg shadow-xl">
          <Image 
            src="/images/profile/profile-photo.JPG" 
            alt="Rohan's photo" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          {showImage && (
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium px-3 py-1 bg-black/40 backdrop-blur-sm">
              You found me! {emoji}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;
