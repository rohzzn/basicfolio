import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Courier_Prime } from 'next/font/google';

// The typewriter's typeface, loaded here so only this page pays for it.
const courier = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-typewriter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Typing',
  description: 'A typing test on a typewriter. Race my 115 wpm.',
};

export default function TypingLayout({ children }: { children: ReactNode }) {
  return <div className={courier.variable}>{children}</div>;
}
