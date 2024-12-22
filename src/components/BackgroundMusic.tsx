// src/components/BackgroundMusic.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      // Create audio element
      const audio = new Audio('/lofi-background.mp3');
      
      // Add event listeners for debugging
      audio.addEventListener('loadeddata', () => {
        console.log('Audio loaded successfully');
        setIsLoaded(true);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        setError('Failed to load audio');
      });

      audio.addEventListener('playing', () => {
        console.log('Audio started playing');
      });

      audio.addEventListener('pause', () => {
        console.log('Audio paused');
      });

      // Configure audio
      audio.loop = true;
      audio.volume = 0.1;
      audio.preload = 'auto';

      audioRef.current = audio;

      // Show controls after delay
      const timer = setTimeout(() => {
        setShowControls(true);
      }, 2000);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('loadeddata', () => {});
          audioRef.current.removeEventListener('error', () => {});
          audioRef.current.removeEventListener('playing', () => {});
          audioRef.current.removeEventListener('pause', () => {});
          audioRef.current = null;
        }
        clearTimeout(timer);
      };
    } catch (err) {
      console.error('Error setting up audio:', err);
      setError('Failed to initialize audio');
    }
  }, []);

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Audio playback started successfully');
              })
              .catch((error) => {
                console.error('Playback failed:', error);
                setError('Failed to play audio');
              });
          }
        }
        setIsPlaying(!isPlaying);
      } catch (err) {
        console.error('Toggle play error:', err);
        setError('Failed to toggle audio');
      }
    }
  };

  if (!showControls) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {error && (
        <div className="mb-2 text-xs text-red-500 bg-white dark:bg-zinc-800 p-2 rounded">
          {error}
        </div>
      )}
      <button
        onClick={togglePlay}
        disabled={!isLoaded}
        className={`p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full shadow-lg 
          hover:scale-105 transition-transform duration-200 ease-in-out
          ${!isLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        ) : (
          <VolumeX className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        )}
      </button>
    </div>
  );
};

export default BackgroundMusic;