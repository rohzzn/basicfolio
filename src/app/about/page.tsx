"use client";
import React, { useEffect, useState } from 'react';
import GitHubCalendar from 'react-github-calendar';
import Image from 'next/image';

const Home: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [showImage, setShowImage] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [imageType, setImageType] = useState<'normal' | 'gif'>('normal');
  const [emailCopied, setEmailCopied] = useState(false);
  
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
    
    // Check if desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);
  
  const handleNameClick = () => {
    if (isDesktop) {
      const newCount = tapCount + 1;
      
      if (newCount === 1) {
        setShowImage(true);
        setImageType('normal');
        setTapCount(1);
      } else if (newCount === 2) {
        setShowImage(false);
        setTapCount(2);
      } else if (newCount === 3) {
        setShowImage(true);
        setImageType('gif');
        setTapCount(3);
      } else {
        setShowImage(false);
        setTapCount(0);
      }
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hi@rohanpothuru.com');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };
  
  return (
    <div className="max-w-7xl relative">
      {/* Hero Section */}
      <div className="mb-12">
        <div style={{ maxWidth: '75ch' }}>
          <h1 
            className={`text-lg font-medium mb-6 dark:text-white ${isDesktop ? 'cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors' : ''}`}
            onClick={handleNameClick}
          >
            Rohan Pothuru
          </h1>
          
          <div className="flex gap-6 items-start">
            <div className="flex-1">
              <p className="text-base text-zinc-600 dark:text-zinc-400 mb-4">
                I&apos;m a software engineer and computer science graduate student who loves building things that matter. Currently pursuing my Masters at the University of Cincinnati while working part-time as a developer, where I contribute to healthcare tech.
              </p>
              
              <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8">
                When I&apos;m not coding, you&apos;ll find me taking photos, gaming with friends, or working on random design projects that catch my interest. I also spend way too much time tweaking my setup and discovering new tools that probably don&apos;t make me more productive but are fun to play with.
              </p>
            </div>
            
            {/* Image appears beside paragraphs */}
            {showImage && isDesktop && (
              <div className="animate-fade-in flex-shrink-0 flex flex-col items-center">
                {imageType === 'normal' ? (
                  <Image
                    src="/images/profile/rohan.png"
                    alt="Rohan Pothuru"
                    width={180}
                    height={180}
                    className="rounded-lg"
                  />
                ) : (
                  <Image
                    src="/images/profile/rohan_gif.gif"
                    alt="Rohan Pothuru"
                    width={180}
                    height={180}
                    className="rounded-lg"
                    unoptimized
                  />
                )}
                <div className="handwritten-text mt-2 text-zinc-500 dark:text-zinc-400">
                  ↑ you found me
                </div>
              </div>
            )}
          </div>
          
          <p className="text-base text-zinc-600 dark:text-zinc-400 mt-4">
            To befriend me or hire me, reach out on{' '}
            <a 
              href="https://www.linkedin.com/in/rohzzn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              LinkedIn
            </a>
            ,{' '}
            <a 
              href="https://x.com/rohzzn" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              X
            </a>
            , or by <span className="relative">
              <span
                onClick={copyEmail}
                className="text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                email
              </span>
              {emailCopied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-3 py-1.5 rounded-md animate-fade-in pointer-events-none z-10">
                  Email copied to clipboard
                </span>
              )}
            </span>.
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

    </div>
  );
};

export default Home;
