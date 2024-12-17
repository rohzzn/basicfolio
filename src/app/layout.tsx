// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MultiPagePortfolio from '../components/multi-page-portfolio';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
      <body className={`${inter.variable} antialiased`}>
        <MultiPagePortfolio>
          {children}
        </MultiPagePortfolio>
      </body>
    </html>
  );
}
