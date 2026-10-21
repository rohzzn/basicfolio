import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy · Rohan',
  description: 'What rohan.run collects, what it shows, and where it goes.',
  alternates: { canonical: 'https://rohan.run/privacy' },
};

const P = 'text-zinc-600 dark:text-neutral-400 mb-4';
const H2 = 'text-base font-medium mt-10 mb-4 dark:text-paper';

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <h1 className="text-lg font-medium mb-4 dark:text-paper">Privacy</h1>
        <p className="text-zinc-600 dark:text-neutral-400 text-sm">Last updated October 21, 2026</p>
      </header>

      <div className="text-sm max-w-3xl">
        <p className={P}>
          rohan.run is my personal website. It does not have accounts, does not sell anything, and does not sell or
          share anyone&apos;s data. This page lists everything it does collect and where it goes.
        </p>

        <h2 className={H2}>Visiting the site</h2>
        <p className={P}>
          The site is hosted on Vercel, which keeps standard server logs. I use Microsoft Clarity to see how pages are
          used, which records anonymous page interactions such as clicks and scrolling and sets its own cookies. Each
          post counts how many times it has been read; that is a single number per post, with nothing about who read
          it. Your browser keeps a few settings locally, like light or dark mode and recent searches, and they never
          leave your device.
        </p>

        <h2 className={H2}>The guestbook</h2>
        <p className={P}>
          A guestbook entry stores the name and message you write as a comment on a public GitHub issue, so anything
          you post there is public. If you sign in with Discord to post, the site only asks Discord for your basic
          profile (your user ID, name and avatar), shows your avatar next to your message, and keeps a sign-in cookie
          for a day.
        </p>

        <h2 className={H2}>Booking a meeting</h2>
        <p className={P}>
          Booking a time on the meet page sends your name, email, time zone and any notes to Cal.com, which creates the
          booking and emails us both. That data is handled under Cal.com&apos;s own privacy policy.
        </p>

        <h2 className={H2}>My own data on the site</h2>
        <p className={P}>
          Some of what you see is my own data, read from services I use: what I am playing or listening to (Discord and
          Spotify), my workouts (Hevy), my GitHub activity, what I watch and read, and my heart rate and activity from
          my Fitbit through the Google Health API. Access to the Google Health API is read-only and covers only my own
          account. It is used for nothing except showing those numbers on this site, it is never sold, shared or used
          for advertising, and no visitor&apos;s health data is ever requested or seen.
        </p>

        <h2 className={H2}>Contact</h2>
        <p className={P}>
          Questions, or want a guestbook entry of yours removed? Email{' '}
          <a
            href="mailto:hi@rohanpothuru.com"
            className="underline decoration-zinc-300 dark:decoration-neutral-600 underline-offset-2 hover:decoration-zinc-500"
          >
            hi@rohanpothuru.com
          </a>
          .
        </p>
      </div>
    </article>
  );
}
