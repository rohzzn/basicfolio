"use client";
import React, { useEffect, useRef, useState } from 'react';
import Image from '@/components/SiteImage';
import Link from 'next/link';
import InkCalendar from '@/components/InkCalendar';
import type { CalendarActivity } from '@/lib/github-calendar';
import type { LanguageCalendar } from '@/lib/github-languages';

const PROFILE_PNG = '/images/profile/rohan.png';

type AboutClientProps = {
  calendarData: CalendarActivity[];
  languageCalendar: LanguageCalendar;
};

const AboutClient: React.FC<AboutClientProps> = ({ calendarData, languageCalendar }) => {
  const [isDark, setIsDark] = React.useState(false);
  const [showImage, setShowImage] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const ageRef = useRef<HTMLSpanElement>(null);

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
    setShowImage((prev) => !prev);
  };

  useEffect(() => {
    const birthday = new Date(2001, 10, 12, 5, 30, 0); // Nov 12 2001, 5:30 AM

    const tick = () => {
      if (ageRef.current) {
        const diff = Date.now() - birthday.getTime();
        const years = diff / (1000 * 60 * 60 * 24 * 365.25);
        ageRef.current.textContent = years.toFixed(10);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
    <div style={{ maxWidth: '52ch' }}>

      {/* Bio */}
      <div className="mb-10">
        <h1
          className={`text-lg font-medium mb-5 dark:text-paper ${isDesktop ? 'cursor-pointer hover:text-zinc-500 dark:hover:text-neutral-400 transition-colors' : ''}`}
          onClick={handleNameClick}
        >
          Rohan Pothuru
        </h1>

        <div className="mb-6 flex items-start gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-500 dark:text-neutral-400 leading-relaxed mb-3">
              Software engineer and CS grad student who loves building things that matter. <span ref={ageRef} style={{ fontVariantNumeric: 'tabular-nums' }} /> years old, currently pursuing my Masters at the University of Cincinnati while working part-time in healthcare tech.
            </p>
            <p className="text-sm text-zinc-500 dark:text-neutral-400 leading-relaxed">
              When I&apos;m not coding, you&apos;ll find me taking photos, gaming with friends, or working on random design projects. I also spend way too much time tweaking my setup.
            </p>
          </div>

          {showImage && isDesktop && (
            <div className="animate-fade-in flex-shrink-0">
              <Image
                src={PROFILE_PNG}
                alt="Rohan Pothuru"
                width={160}
                height={160}
                className="rounded-lg"
              />
            </div>
          )}
        </div>

        <p className="text-sm text-zinc-500 dark:text-neutral-400 leading-relaxed">
          See my{' '}
          <Link
            href="/resume"
            className="text-zinc-700 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-paper transition-colors"
          >
            resume
          </Link>
          ,{' '}
          <span className="relative inline-block">
            <span
              onClick={copyEmail}
              className="text-zinc-700 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-paper transition-colors cursor-pointer"
            >
              email me
            </span>
            {emailCopied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs px-2.5 py-1 rounded-md pointer-events-none z-10">
                copied
              </span>
            )}
          </span>
          ,{' '}
          <Link
            href="/meet"
            className="text-zinc-700 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-paper transition-colors"
          >
            book a meet
          </Link>
          , or sign the{' '}
          <Link
            href="/guestbook"
            className="text-zinc-700 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-paper transition-colors"
          >
            guestbook
          </Link>
          .
        </p>
      </div>

      {/* GitHub Contributions */}
      <InkCalendar isDark={isDark} data={calendarData} languages={languageCalendar} />


    </div>
  );
};

export default AboutClient;
