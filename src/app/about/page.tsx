"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Home: React.FC = () => {
  const [showImage, setShowImage] = useState(false);
  const [emoji, setEmoji] = useState('👋');
  
  // Function to get a random emoji for visitor greeting
  const getRandomEmoji = () => {
    const emojis = ['👋', '👀', '✨', '🎉', '🚀', '🔥', '😊', '🙌', '💯', '🌟'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };
  
  const handleMouseEnter = () => {
    setEmoji(getRandomEmoji());
    setShowImage(true);
  };
  
  return (
    <div className="max-w-7xl relative">
      {/* Hero Section */}
      <div className="mb-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12">
          <div className="flex-1">
            <h1 
              className="text-lg font-medium mb-6 dark:text-white inline-block"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowImage(false)}
            >
              Hey, I&apos;m Rohan Pothuru
            </h1>
            
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              I&apos;m a software engineer and computer science graduate student who loves building things that matter. Currently pursuing my Masters at the University of Cincinnati while working part-time as a developer at Cincinnati Children&apos;s Hospital, where I contribute to healthcare tech.
            </p>
            
            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mt-4">
              When I&apos;m not coding, you&apos;ll find me taking photos, gaming with friends, or working on random design projects that catch my interest. I also spend way too much time tweaking my setup and discovering new tools that probably don&apos;t make me more productive but are fun to play with.
            </p>
          </div>
        </div>

        {/* Secret image that appears on hover */}
        <div 
          className={`fixed right-0 top-1/4 transform transition-all duration-300 ease-in-out ${
            showImage 
              ? 'translate-x-0 opacity-100 -rotate-12' 
              : 'translate-x-full opacity-0 rotate-12'
          }`}
          style={{ zIndex: 50, transformOrigin: 'bottom right' }}
        >
          <div className="relative w-64 h-80 overflow-hidden rounded-lg shadow-xl">
            <Image 
              src="/images/profile/profile-photo.JPG" 
              alt="Rohan's photo" 
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            {showImage && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium px-3 py-1 bg-black/40 backdrop-blur-sm">
                You found me! {emoji}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div>
        <h2 className="text-lg font-medium mb-6 dark:text-white">Explore</h2>
        <div className="space-y-6">
          <Link href="/links" className="group cursor-pointer block">
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                  On the Internet
                </h3>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  →
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                Find me across platforms
              </p>
            </article>
          </Link>
          
          <Link href="/guestbook" className="group cursor-pointer block">
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                  Guest Book
                </h3>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  →
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                Leave a message
              </p>
            </article>
          </Link>
          
          <Link href="/stack" className="group cursor-pointer block">
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                  Resume
                </h3>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  →
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                View my experience
              </p>
            </article>
          </Link>
          
          <a href="mailto:hi@rohanpothuru.com" className="group cursor-pointer block">
            <article>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                  Contact
                </h3>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  →
                </div>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                Let&apos;s connect
              </p>
            </article>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
