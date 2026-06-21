import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Writing — Rohan',
  description:
    'Essays and deep dives on tech, security, side projects, and building software.',
  openGraph: {
    title: 'Writing — Rohan',
    description:
      'Essays and deep dives on tech, security, side projects, and building software.',
    url: 'https://rohan.run/writing',
  },
  alternates: {
    canonical: 'https://rohan.run/writing',
  },
};

export default function WritingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
