// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import MultiPagePortfolio from '../components/multi-page-portfolio';

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
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
    // Images come from the per-route opengraph-image.tsx files, so every page
    // gets its own card instead of sharing one static png.
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rohan',
    description: 'Software Engineer, Designer, and CS student. Building digital experiences and exploring the future of technology through code and creativity.',
    creator: '@rohzzn',
  },
  alternates: {
    canonical: 'https://rohan.run',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: "Rohan's Writing" }],
    },
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

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* The sidebar's Discord status hits Lanyard on every cold load, so get
            the DNS and TLS handshake out of the way while the page is parsing. */}
        <link rel="preconnect" href="https://api.lanyard.rest" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.lanyard.rest" />
        {/* Analytics waits for the page to go idle rather than competing with
            hydration for the main thread. */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "y2sttmvhkc");`}
        </Script>
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <MultiPagePortfolio>
          {children}
        </MultiPagePortfolio>
      </body>
    </html>
  );
}