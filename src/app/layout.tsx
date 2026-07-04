// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import MultiPagePortfolio from '../components/multi-page-portfolio';
export const metadata: Metadata = {
  title: "Rohan",
  description: 'Software Engineer, Designer, and CS student. Building digital experiences and exploring the future of technology through code and creativity.',
  metadataBase: new URL('https://rohan.run'),
  icons: {
    icon: "/icon.svg",
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
    canonical: 'https://rohan.run',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: "Rohan's Writing" }],
    },
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
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <MultiPagePortfolio>
          {children}
        </MultiPagePortfolio>
      </body>
    </html>
  );
}