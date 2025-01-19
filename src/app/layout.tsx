// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import MultiPagePortfolio from '../components/multi-page-portfolio';
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
        url: '/og.png',  // Changed to .jpg and added a new optimized image
        width: 1200,     // Changed to WhatsApp's preferred dimensions
        height: 630,     // Standard OG image ratio
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
    images: ['/og.png'], // Use the same optimized image
  },
  alternates: {
    canonical: 'https://rohan.run'
  },
  other: {
    'og:image:type': 'image/png',
    'og:image:width': '1200',
    'og:image:height': '630',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
      </body>
    </html>
  );
}