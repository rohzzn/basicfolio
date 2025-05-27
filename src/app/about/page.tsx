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
    <div className="max-w-4xl relative">
      <div className="mb-10">
        <h2 
          className="text-lg font-medium dark:text-white inline-block"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowImage(false)}
        >
          Hey, I&apos;m Rohan Pothuru
        </h2>
        
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
            {/* Replace with your actual image path - using a placeholder for now */}
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
        
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          This is my digital garden — a cozy corner of the internet where I share my thoughts, projects, and journey.
        </p>
      </div>
      
      {/* Summary Points */}
      <div className="mb-12">
        <h3 className="text-base font-medium mb-6 dark:text-white">Summary</h3>
        
        <ul className="space-y-4 list-disc pl-5 text-zinc-600 dark:text-zinc-400">
          <li>Grad CS student at UC, hanging on to that 4.0 GPA</li>
          <li>Part-time dev at Cincinnati Children&apos;s — typing, debugging, surviving</li>
          <li>Previously at ixigo, mostly vibing and learning the ropes</li>
          <li>Always tinkering with side projects — for fun, learning, and maybe clout</li>
          <li>Turning 24 this year — holy moly, where did the time go?</li>
        </ul>
      </div>
      
      {/* Simple card links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/links" className="block p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
          <div className="flex justify-between items-center">
            <span className="font-medium dark:text-white">On the Internet</span>
            <FaArrowRight className="text-zinc-500 dark:text-zinc-400" />
          </div>
        </Link>
        
        <Link href="/guestbook" className="block p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
          <div className="flex justify-between items-center">
            <span className="font-medium dark:text-white">Guest Book</span>
            <FaArrowRight className="text-zinc-500 dark:text-zinc-400" />
          </div>
        </Link>
        
        <Link href="/stack" className="block p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
          <div className="flex justify-between items-center">
            <span className="font-medium dark:text-white">Resume</span>
            <FaArrowRight className="text-zinc-500 dark:text-zinc-400" />
          </div>
        </Link>
        
        <a href="mailto:pothurrs@mail.uc.edu" className="block p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
          <div className="flex justify-between items-center">
            <span className="font-medium dark:text-white">Contact</span>
            <FaArrowRight className="text-zinc-500 dark:text-zinc-400" />
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;