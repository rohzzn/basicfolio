"use client";
import React, { useState, useMemo } from 'react';
import Image from 'next/image';

// Custom CSS for 3D book effects
const bookStyles = `
  .book-container {
    perspective: 1000px;
    transform-style: preserve-3d;
  }
  
  .book-3d {
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s ease;
    cursor: pointer;
  }
  
  .book-3d:hover {
    transform: translateZ(20px) rotateY(-15deg);
  }
  
  .book-3d.flipped {
    transform: translateZ(20px) rotateY(-180deg);
  }
  
  .book-cover {
    position: absolute;
    backface-visibility: hidden;
    border-radius: 4px 8px 8px 4px;
    box-shadow: 
      2px 0 10px rgba(0,0,0,0.2),
      0 0 0 1px rgba(0,0,0,0.1);
  }
  
  .book-back {
    position: absolute;
    backface-visibility: hidden;
    transform: rotateY(180deg);
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 8px 4px 4px 8px;
    box-shadow: 
      -2px 0 10px rgba(0,0,0,0.2),
      0 0 0 1px rgba(0,0,0,0.1);
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .book-spine {
    position: absolute;
    right: 0;
    top: 0;
    width: 12px;
    height: 100%;
    background: linear-gradient(90deg, 
      rgba(0,0,0,0.1) 0%, 
      rgba(255,255,255,0.1) 50%, 
      rgba(0,0,0,0.1) 100%);
    transform: rotateY(90deg) translateZ(6px);
    transform-origin: right center;
  }
  
  .book-pages {
    position: absolute;
    right: -2px;
    top: 2px;
    width: 8px;
    height: calc(100% - 4px);
    background: linear-gradient(90deg, #f8f9fa 0%, #ffffff  50%, #f1f3f4 100%);
    transform: translateZ(-1px);
    border-radius: 0 2px 2px 0;
    box-shadow: inset -1px 0 2px rgba(0,0,0,0.1);
  }
  
  .book-pages::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0,0,0,0.03) 3px,
      rgba(0,0,0,0.03) 4px
    );
  }
  
  .rating-stars {
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = bookStyles;
  document.head.appendChild(styleElement);
}

interface Book {
  title: string;
  review: string;
  score: number;
  cover: string;
}

const books: Book[] = [
  { title: "The Subtle Art of Not Giving a F*ck", review: "Refreshing honesty about priorities.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780062457714-L.jpg" },
  { title: "Shoe Dog", review: "A raw look into Nike's origin.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9781501135910-L.jpg" },
  { title: "Make Time by Jake Knapp", review: "Tactical tips for focusing on what matters.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780525572428-L.jpg" },
  { title: "Show Your Work", review: "Encourages sharing your process openly.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780761178972-L.jpg" },
  { title: "The Song of Achilles", review: "A beautiful retelling of myth with depth.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780062060624-L.jpg" },
  { title: "The Sailor Who Fell from Grace with the Sea", review: "Haunting exploration of honor and morality.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780679750154-L.jpg" },
  { title: "The Psychology of Money", review: "Insights into how we think about wealth.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg" },
  { title: "The Design of Everyday Things", review: "Essential principles of user-centered design.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780465050659-L.jpg" },
  { title: "Man's Search for Meaning", review: "Profound reflections on purpose and suffering.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780807014295-L.jpg" },
  { title: "Beyond Good and Evil", review: "Challenges conventional morality frameworks.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780486298689-L.jpg" },
  { title: "Die with Zero", review: "Optimizing life experiences over accumulation.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780358099765-L.jpg" },
  { title: "The Four Agreements", review: "A simple guide to personal freedom.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9781878424310-L.jpg" },
  { title: "Creative Confidence", review: "Inspiring methods to unlock creativity.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780385349369-L.jpg" },
  { title: "The Black Swan", review: "Understanding rare, impactful events.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780812973815-L.jpg" },
  { title: "The Creative Act", review: "A fresh look at artistry in everyday life.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780593652886-L.jpg" },
  { title: "Steal Like an Artist", review: "Inspiring creative thinking.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780761169253-L.jpg" },
  { title: "Keep Going", review: "A reminder to stay consistent.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9781523506644-L.jpg" },
  { title: "The Almanack of Naval Ravikant", review: "Timeless wisdom on wealth and happiness.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9781544514222-L.jpg" },
  { title: "The Book of Five Rings", review: "Strategies and philosophy from a legendary samurai.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9781590302484-L.jpg" },
  { title: "Flowers for Algernon", review: "A touching, tragic look at intelligence and empathy.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780156030304-L.jpg" },
  { title: "Atomic Habits", review: "Practical steps to build better habits.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" },
  { title: "Why We Sleep", review: "Eye-opening insights into sleep's crucial role.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9781501144318-L.jpg" },
  { title: "The 4-Hour Workweek", review: "Rethinking productivity and lifestyle design.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780307465351-L.jpg" },
  { title: "Sapiens: A Brief History of Humankind", review: "A sweeping overview of our species' journey.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg" }
];

const Readings: React.FC = () => {
  const [sortBy, setSortBy] = useState<'score' | 'title'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [flippedBooks, setFlippedBooks] = useState<Set<number>>(new Set());

  const toggleBookFlip = (index: number) => {
    setFlippedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };


  // Sort books
  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      if (sortBy === 'score') {
        return sortDirection === 'desc' ? b.score - a.score : a.score - b.score;
      }
      // Sort by title
      return sortDirection === 'desc' 
        ? b.title.localeCompare(a.title) 
        : a.title.localeCompare(b.title);
    });
  }, [sortBy, sortDirection]);

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Readings</h2>


      {/* Sort Controls */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => {
            if (sortBy === 'title') {
              setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('title');
              setSortDirection('asc');
            }
          }}
          className={`text-sm ${
            sortBy === 'title' ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-600 dark:text-zinc-400'
          } hover:text-zinc-900 dark:hover:text-white transition-colors`}
        >
          Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => {
            if (sortBy === 'score') {
              setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('score');
              setSortDirection('desc');
            }
          }}
          className={`text-sm ${
            sortBy === 'score' ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-600 dark:text-zinc-400'
          } hover:text-zinc-900 dark:hover:text-white transition-colors`}
        >
          Rating {sortBy === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* 3D Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8 py-8">
        {sortedBooks.map((book, index) => {
          const isFlipped = flippedBooks.has(index);
          return (
            <article key={index} className="group">
              <div className="book-container w-full max-w-[160px] mx-auto">
                <div 
                  className={`book-3d aspect-[3/4] ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => toggleBookFlip(index)}
                >
                  {/* Front Cover */}
                  <div className="book-cover w-full h-full">
                    <Image
                      src={book.cover}
                      alt={book.title}
                      fill
                      className="object-cover rounded-[4px_8px_8px_4px]"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-400 dark:from-zinc-700 dark:to-zinc-900 flex items-center justify-center rounded-[4px_8px_8px_4px] text-zinc-600 dark:text-zinc-300">
                              <span class="text-3xl">📚</span>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>

                  {/* Book Spine */}
                  <div className="book-spine"></div>

                  {/* Book Pages */}
                  <div className="book-pages"></div>

                  {/* Back Cover */}
                  <div className="book-back w-full h-full dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-200">
                    <div>
                      <h3 className="text-sm font-medium mb-3 line-clamp-3 text-zinc-800 dark:text-zinc-200">
                        {book.title}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-4 mb-4">
                        {book.review}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5 rating-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < book.score
                                ? "text-amber-400"
                                : "text-zinc-300 dark:text-zinc-600"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {book.score}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Book Title - Always visible */}
              <div className="mt-3 text-center px-2">
                <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  {book.title}
                </h3>
              </div>
            </article>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Click on any book to flip it and see the review
        </p>
      </div>
    </div>
  );
};

export default Readings;