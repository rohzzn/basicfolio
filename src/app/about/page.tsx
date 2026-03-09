"use client";
import React, { useEffect, useState } from 'react';
import GitHubCalendar from 'react-github-calendar';
import Image from 'next/image';
import Link from 'next/link';

const recentProjects = [
  {
    title: "Keel",
    description: "Subscription tracking app",
    url: "https://usekeel.co",
  },
  {
    title: "Dock Poker",
    description: "Texas Hold'em for private games",
    url: "https://dock.poker",
  },
  {
    title: "Contests",
    description: "Programming contests & hackathon tracker",
    url: "http://contests.dev/",
  },
  {
    title: "ShutTab",
    description: "Website blocker Chrome extension",
    url: "https://chromewebstore.google.com/detail/shuttab-%E2%80%93-free-site-block/lmkjcljgmcbechfhpkpamniadalgjojc",
  },
];

const Home: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [showImage, setShowImage] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [imageType, setImageType] = useState<'normal' | 'gif'>('normal');
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  const handleNameClick = () => {
    if (!isDesktop) return;
    const newCount = tapCount + 1;
    if (newCount === 1) { setShowImage(true); setImageType('normal'); setTapCount(1); }
    else if (newCount === 2) { setShowImage(false); setTapCount(2); }
    else if (newCount === 3) { setShowImage(true); setImageType('gif'); setTapCount(3); }
    else { setShowImage(false); setTapCount(0); }
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
    <div style={{ maxWidth: '75ch' }}>

      {/* Bio */}
      <div className="mb-10">
        <div className="flex gap-6 items-start mb-6">
          <div className="flex-1">
            <h1
              className={`text-lg font-medium mb-5 dark:text-white ${isDesktop ? 'cursor-pointer hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors' : ''}`}
              onClick={handleNameClick}
            >
              Rohan Pothuru
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
              Software engineer and CS grad student who loves building things that matter. Currently pursuing my Masters at the University of Cincinnati while working part-time in healthcare tech.
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              When I&apos;m not coding, you&apos;ll find me taking photos, gaming with friends, or working on random design projects. I also spend way too much time tweaking my setup.
            </p>
          </div>

          {showImage && isDesktop && (
            <div className="animate-fade-in flex-shrink-0 flex flex-col items-center">
              {imageType === 'normal' ? (
                <Image
                  src="/images/profile/rohan.png"
                  alt="Rohan Pothuru"
                  width={120}
                  height={120}
                  className="rounded-lg"
                />
              ) : (
                <Image
                  src="/images/profile/rohan_gif.gif"
                  alt="Rohan Pothuru"
                  width={120}
                  height={120}
                  className="rounded-lg"
                  unoptimized
                />
              )}
              <span className="handwritten-text mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                ↑ you found me
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Reach out on{' '}
          <a href="https://www.linkedin.com/in/rohzzn/" target="_blank" rel="noopener noreferrer"
            className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
            LinkedIn
          </a>
          ,{' '}
          <a href="https://x.com/rohzzn" target="_blank" rel="noopener noreferrer"
            className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
            X
          </a>
          ,{' '}
          <span className="relative inline-block">
            <span onClick={copyEmail}
              className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer">
              email
            </span>
            {emailCopied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-2.5 py-1 rounded-md pointer-events-none z-10">
                copied
              </span>
            )}
          </span>
          , or view my{' '}
          <Link href="/resume"
            className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
            resume
          </Link>
          .
        </p>
      </div>

      {/* GitHub Contributions */}
      <div className="mb-10 overflow-hidden">
        <GitHubCalendar
          username="rohzzn"
          colorScheme={isDark ? 'dark' : 'light'}
          theme={{
            light: ['#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'],
            dark: ['#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8'],
          }}
          blockSize={13}
          blockMargin={4}
          fontSize={11}
          hideColorLegend
          hideMonthLabels
          hideTotalCount
          showWeekdayLabels={false}
          transformData={(data) => {
            const now = new Date();
            const eightMonthsAgo = new Date(now);
            eightMonthsAgo.setMonth(now.getMonth() - 8);
            return data.filter((day) => new Date(day.date) >= eightMonthsAgo);
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Recent Projects */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Recent Projects
          </span>
          <Link href="/projects"
            className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            all →
          </Link>
        </div>
        <div>
          {recentProjects.map((project) => (
            <a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-shrink-0">
                {project.title}
              </span>
              <span className="text-sm text-zinc-400 dark:text-zinc-500 truncate ml-4 text-right hidden sm:block">
                {project.description}
              </span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
