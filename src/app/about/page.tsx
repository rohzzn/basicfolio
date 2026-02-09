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
      <div className="mb-12">
        <div className="max-w-3xl">
          <h1 
            className="text-lg font-medium mb-6 dark:text-white inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowImage(false)}
          >
            Hey, I&apos;m Rohan Pothuru
          </h1>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            I&apos;m a software engineer and computer science graduate student who loves building things that matter. Currently pursuing my Masters at the University of Cincinnati while working part-time as a developer, where I contribute to healthcare tech.
          </p>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
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

      {/* Navigation Links */}
      <div className="max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/links" className="group cursor-pointer block">
            <article>
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-1">
                On the Internet
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Find me across platforms
              </p>
            </article>
          </Link>
          
          <Link href="/guestbook" className="group cursor-pointer block">
            <article>
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-1">
                Guest Book
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Leave a message
              </p>
            </article>
          </Link>
          
          <Link href="/stack" className="group cursor-pointer block">
            <article>
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-1">
                Resume
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                View my experience
              </p>
            </article>
          </Link>
          
          <a 
            href="mailto:hi@rohanpothuru.com" 
            className="group cursor-pointer block"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = 'mailto:hi@rohanpothuru.com';
            }}
          >
            <article>
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors mb-1">
                Let&apos;s connect
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Get in touch
              </p>
            </article>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
