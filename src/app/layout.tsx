// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import MultiPagePortfolio from '../components/multi-page-portfolio';
import SunRaysOverlay from '../components/SunRaysOverlay'; // Import the new component

export const metadata: Metadata = {
  title: "Rohan",
  description: 'Software Engineer, Designer, and CS student. Building digital experiences and exploring the future of technology through code and creativity.',
  metadataBase: new URL('https://rohan.run'),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Rohan",
    description: 'Software Engineer, Designer, and CS student. Building digital experiences and exploring the future of technology through code and creativity.',
    url: 'https://rohan.run',
    siteName: "Rohan's Personal Website",
    images: [
      {
        url: '/og.png',  // You'll need to add this image in your public folder
        width: 1920,
        height: 1440,
        alt: 'Rohan'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rohan',
    description: 'Software Engineer, Designer, and CS student. Building digital experiences and exploring the future of technology through code and creativity.',
    creator: '@rohzzn',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <MultiPagePortfolio>
          {children}
        </MultiPagePortfolio>
        <SunRaysOverlay /> {/* Replace NoiseOverlay with SunRaysOverlay */}
      </body>
    </html>
  );
}