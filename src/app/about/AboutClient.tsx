"use client";
import React, { cloneElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import Image from '@/components/SiteImage';
import Link from 'next/link';
import NowStrip from '@/components/NowStrip';
import type { CalendarActivity } from '@/lib/github-calendar';
import { languageColor, languageSwatch, type LanguageCalendar } from '@/lib/github-languages';
import type { NowData } from '@/lib/now';

const CAL_MARGIN = 3;
const MAX_BLOCK = 28;

/** Largest block size so n columns fit in targetPx (grid width = n*(bs+m)-m). */
function blockSizeForWeeks(targetPx: number, weekColumns: number, m: number): number {
  if (targetPx < 16 || weekColumns < 1) return 9;
  const bs = Math.floor((targetPx - (weekColumns - 1) * m) / weekColumns);
  return Math.max(4, Math.min(MAX_BLOCK, bs));
}

function nineMonthsOf(data: CalendarActivity[]): CalendarActivity[] {
  const now = new Date();
  const nineMonthsAgo = new Date(now);
  nineMonthsAgo.setMonth(now.getMonth() - 9);
  return data.filter((day) => new Date(day.date) >= nineMonthsAgo);
}

function ProseGitHubCalendar({
  isDark,
  data,
  languages,
}: {
  isDark: boolean;
  data: CalendarActivity[];
  languages: LanguageCalendar;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [blockSize, setBlockSize] = useState(10);
  const blockSizeRef = useRef(blockSize);
  const containerWidthRef = useRef(containerWidth);
  blockSizeRef.current = blockSize;
  containerWidthRef.current = containerWidth;

  const refit = useCallback(() => {
    const wrap = wrapRef.current;
    const cw = containerWidthRef.current;
    if (!wrap || cw < 24) return;
    const svg = wrap.querySelector<SVGSVGElement>('.react-activity-calendar svg');
    if (!svg) return;
    const gridW = svg.viewBox?.baseVal?.width;
    if (!gridW || gridW < 12) return;

    const m = CAL_MARGIN;
    const bs = blockSizeRef.current;
    const n = Math.max(1, Math.round((gridW + m) / (bs + m)));
    const next = blockSizeForWeeks(cw, n, m);
    if (next !== bs) setBlockSize(next);
  }, []);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const syncWidth = () => {
      const w = el.getBoundingClientRect().width;
      containerWidthRef.current = w;
      setContainerWidth(w);
    };
    syncWidth();
    const ro = new ResizeObserver(syncWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    refit();
  }, [blockSize, containerWidth, refit]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => refit(), 60);
    });
    mo.observe(wrap, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, [refit]);

  if (data.length === 0) return null;

  const scheme = isDark ? 'dark' : 'light';

  return (
    <div ref={wrapRef} className="mb-3 w-full min-w-0">
      <div className="reveal-sweep">
        <ActivityCalendar
          data={nineMonthsOf(data)}
          colorScheme={scheme}
          theme={{
            light: ['#e4e4e7', '#a1a1aa', '#71717a', '#52525b', '#3f3f46'],
            dark: ['#262626', '#525252', '#737373', '#d4d4d4', '#F5F1EC'],
          }}
          blockSize={blockSize}
          blockMargin={CAL_MARGIN}
          fontSize={10}
          hideColorLegend
          hideMonthLabels
          hideTotalCount
          showWeekdayLabels={false}
          renderBlock={(block, activity) => {
            const fill = languageColor(languages.byDate[activity.date], activity.level, scheme);
            return fill ? cloneElement(block, { fill }) : block;
          }}
        />
      </div>
      <LanguageLegend languages={languages.languages} scheme={scheme} />
    </div>
  );
}

function LanguageLegend({ languages, scheme }: { languages: string[]; scheme: 'light' | 'dark' }) {
  if (languages.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400 dark:text-neutral-500">
      {languages.slice(0, 6).map((language) => (
        <li key={language} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-2 w-2 rounded-[2px]"
            style={{ backgroundColor: languageSwatch(language, scheme) }}
          />
          {language.toLowerCase()}
        </li>
      ))}
    </ul>
  );
}

const PROFILE_PNG = '/images/profile/rohan.png';

type AboutClientProps = {
  calendarData: CalendarActivity[];
  languageCalendar: LanguageCalendar;
  now: NowData;
};

const AboutClient: React.FC<AboutClientProps> = ({ calendarData, languageCalendar, now }) => {
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
      <ProseGitHubCalendar isDark={isDark} data={calendarData} languages={languageCalendar} />

      {/* What is true right now */}
      <NowStrip data={now} />

    </div>
  );
};

export default AboutClient;
