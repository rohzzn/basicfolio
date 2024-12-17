// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import MultiPagePortfolio from '../components/multi-page-portfolio';
import NoiseOverlay from '../components/NoiseOverlay'; // Import the component

export const metadata: Metadata = {
  title: "Rohan",
  description: "Everything about Rohan",
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
        <NoiseOverlay /> {/* Add the NoiseOverlay here */}
      </body>
    </html>
  );
}