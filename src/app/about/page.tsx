"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';

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
              I&apos;m a software engineer and computer science graduate student who loves building things that matter. Currently pursuing my Masters at the University of Cincinnati while working part-time as a developer at Cincinnati Children&apos;s Hospital, where I contribute to healthcare technology solutions that impact real lives.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/links" className="group p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                  On the Internet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Find me across platforms
                </p>
              </div>
              <FaArrowRight className="text-zinc-400 dark:text-zinc-500 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
          
          <Link href="/guestbook" className="group p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                  Guest Book
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Leave a message
                </p>
              </div>
              <FaArrowRight className="text-zinc-400 dark:text-zinc-500 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
          
          <Link href="/stack" className="group p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                  Resume
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  View my experience
                </p>
              </div>
              <FaArrowRight className="text-zinc-400 dark:text-zinc-500 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
          
          <a href="mailto:hi@rohanpothuru.com" className="group p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                  Contact
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Let&apos;s connect
                </p>
              </div>
              <FaArrowRight className="text-zinc-400 dark:text-zinc-500 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;