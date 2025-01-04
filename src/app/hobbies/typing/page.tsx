"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCcw, Timer } from 'lucide-react';

// Expanded word list including 5 and 6 letter words
const commonWords = [
  // Common 2-4 letter words
  'the', 'be', 'to', 'of', 'and', 'in', 'it', 'for', 'not', 'on', 'with', 'as', 'you', 'do', 'at',
  
  // 5 letter words
  'about', 'above', 'after', 'again', 'alone', 'along', 'apple', 'beach', 'begin', 'black', 'bring',
  'carry', 'cease', 'chain', 'chair', 'clean', 'clear', 'climb', 'close', 'cloud', 'color', 'dream',
  'drink', 'drive', 'early', 'earth', 'email', 'empty', 'enter', 'equal', 'every', 'focus', 'force',
  'frame', 'fresh', 'front', 'grass', 'great', 'green', 'group', 'guard', 'guest', 'happy', 'heart',
  'horse', 'house', 'image', 'index', 'input', 'knife', 'large', 'learn', 'level', 'light', 'limit',
  'local', 'logic', 'magic', 'metro', 'money', 'mouse', 'music', 'night', 'noise', 'north', 'novel',
  'ocean', 'order', 'other', 'paper', 'party', 'peace', 'phone', 'pilot', 'place', 'plane', 'plant',
  'plate', 'point', 'power', 'press', 'price', 'prize', 'quiet', 'quick', 'radio', 'range', 'ratio',
  'reply', 'river', 'route', 'scope', 'score', 'shape', 'share', 'sharp', 'sheep', 'shelf', 'shell',
  'shine', 'shirt', 'shock', 'shoot', 'sleep', 'smile', 'smoke', 'solid', 'sound', 'south', 'space',
  'speak', 'speed', 'sport', 'squad', 'staff', 'stage', 'stake', 'stand', 'start', 'state', 'steam',
  'steel', 'stick', 'still', 'stock', 'stone', 'store', 'storm', 'story', 'style', 'sugar', 'table',
  'taste', 'theme', 'thing', 'thumb', 'tiger', 'title', 'total', 'touch', 'tower', 'track', 'trade',
  
  // 6 letter words
  'action', 'agenda', 'almost', 'always', 'animal', 'answer', 'anyone', 'appear', 'around', 'arrive',
  'artist', 'aspect', 'assess', 'assign', 'assist', 'assume', 'attack', 'attend', 'author', 'backed',
  'backup', 'battle', 'beauty', 'became', 'become', 'before', 'behind', 'better', 'beyond', 'binary',
  'breath', 'bridge', 'bright', 'broken', 'budget', 'button', 'camera', 'cancer', 'cannot', 'carbon',
  'career', 'castle', 'casual', 'caught', 'center', 'chance', 'change', 'charge', 'choice', 'choose',
  'chosen', 'church', 'circle', 'client', 'closed', 'closer', 'coffee', 'column', 'combat', 'coming',
  'common', 'cookie', 'copper', 'corner', 'costly', 'county', 'couple', 'course', 'covers', 'create',
  'credit', 'crisis', 'custom', 'damage', 'danger', 'dealer', 'debate', 'decade', 'decide', 'defeat',
  'defend', 'define', 'degree', 'delete', 'demand', 'depend', 'design', 'desire', 'detail', 'detect',
  'device', 'differ', 'dinner', 'direct', 'doctor', 'dollar', 'domain', 'double', 'driven', 'driver',
  'during', 'easily', 'eating', 'editor', 'effect', 'effort', 'either', 'energy', 'engage', 'engine',
  'enough', 'ensure', 'entire', 'entity', 'equity', 'escape', 'estate', 'ethnic', 'exceed', 'except',
  'excess', 'expand', 'expect', 'expert', 'export', 'extend', 'extent', 'fabric', 'facing', 'factor',
  'failed', 'fairly', 'family', 'famous', 'father', 'fellow', 'female', 'figure', 'filing', 'finger',
  'finish', 'fiscal', 'flight', 'flying', 'follow', 'forced', 'forest', 'forget', 'formal', 'format',
  'former', 'foster', 'fought', 'fourth', 'friend', 'future', 'garden', 'gather', 'gender', 'gentle'
];

const keyboardLayout = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  [' ']
];

const generateWords = (count: number): string => {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
  }
  return words.join(' ');
};

const TypingTest = () => {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentChar, setCurrentChar] = useState('');
  const [results, setResults] = useState<{
    wpm: number;
    raw: number;
    accuracy: number;
    diffFromRohan: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  // Wrap calculateResults in useCallback, since it's used inside endTest
  const calculateResults = useCallback(() => {
    const words = input.trim().split(' ');
    const targetWords = text.split(' ').slice(0, words.length);
    const correctWords = words.filter((word, i) => word === targetWords[i]).length;
    const totalChars = input.length;
    const wpm = Math.round((totalChars / 5) * (60 / 15));
    const accuracy = Math.round((correctWords / words.length) * 100) || 0;

    return {
      wpm,
      raw: wpm,
      accuracy,
      diffFromRohan: wpm - 115
    };
  }, [input, text]);

  // Wrap endTest in useCallback so it remains stable, 
  // and include calculateResults in the dependency array
  const endTest = useCallback(() => {
    setIsRunning(false);
    setResults(calculateResults());
  }, [calculateResults]);

  useEffect(() => {
    resetTest();
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
    // We call resetTest() only once on mount/unmount, so no dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add endTest to the dependency array
  useEffect(() => {
    if (timer === 0 && isRunning) {
      endTest();
    }
  }, [timer, isRunning, endTest]);

  const resetTest = () => {
    const newText = generateWords(100);
    setText(newText);
    setInput('');
    setTimer(15);
    setIsRunning(false);
    setHasStarted(false);
    setResults(null);
    setCurrentChar('');

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  const startTimer = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setIsRunning(true);
      intervalRef.current = window.setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            if (intervalRef.current !== null) {
              window.clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    // If the user hasn't started yet and presses a character key, start the timer
    if (!isRunning && !hasStarted && e.key.length === 1) {
      startTimer();
    }

    if (e.key.length === 1) {
      setCurrentChar(e.key);
      setInput((prev) => prev + e.key);
    } else if (e.key === 'Backspace') {
      setInput((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Typing Speed</h2>

      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        Match my speed! Start typing below and see how you compare to my best: 115 WPM with 100% accuracy 
        in 15 seconds. The test will start automatically when you begin typing.
      </p>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Timer className="w-4 h-4" />
          <span>{timer}s</span>
        </div>
        <button
          onClick={resetTest}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Typing Area */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyPress}
        className="mb-8 outline-none"
      >
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 sm:p-6 mb-4 relative min-h-[150px] sm:min-h-[200px]">
          <div className="font-mono text-base sm:text-lg whitespace-pre-wrap">
            {text.split('').map((char, index) => {
              const typedChar = input[index];
              let colorClass = 'text-zinc-400 dark:text-zinc-500';
              if (typedChar !== undefined) {
                colorClass =
                  typedChar === char
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-red-500 dark:text-red-400';
              }

              const highlightClass =
                index === input.length ? 'border-b-2 border-blue-500' : '';

              return (
                <span key={index} className={`${colorClass} ${highlightClass}`}>
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Virtual Keyboard */}
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2 sm:p-4 lg:p-6 overflow-x-auto">
          <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-[320px]">
            {keyboardLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 sm:gap-2 justify-center w-full">
                {row.map((key) => (
                  <div
                    key={key}
                    className={`
                      ${key === ' ' ? 'w-24 sm:w-32' : 'w-8 sm:w-10'} 
                      h-8 sm:h-10
                      flex 
                      items-center 
                      justify-center 
                      rounded 
                      font-mono 
                      text-xs sm:text-sm
                      ${
                        currentChar === key
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }
                      transition-colors
                      duration-150
                      shrink-0
                    `}
                  >
                    {key === ' ' ? 'space' : key}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">WPM</div>
            <div className="text-2xl font-semibold dark:text-white">{results.wpm}</div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Raw</div>
            <div className="text-2xl font-semibold dark:text-white">{results.raw}</div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Accuracy</div>
            <div className="text-2xl font-semibold dark:text-white">
              {results.accuracy}%
            </div>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">vs Rohan</div>
            <div
              className={`text-2xl font-semibold ${
                results.diffFromRohan > 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {results.diffFromRohan > 0 ? '+' : ''}
              {results.diffFromRohan}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
