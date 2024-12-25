// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import MultiPagePortfolio from '../components/multi-page-portfolio';
import SunRaysOverlay from '../components/SunRaysOverlay'; // Import the new component

export const metadata: Metadata = {
  title: "Rohan",
  description: "Everything about Rohan",
  icons: {
    icon: "/favicon.ico",
  },
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