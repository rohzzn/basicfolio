"use client";
import React, { useState, useMemo } from 'react';
import Image from 'next/image';

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

  // Calculate stats
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const avgScore = books.reduce((acc, book) => acc + book.score, 0) / totalBooks;
    const fiveStarBooks = books.filter(book => book.score === 5).length;

    return {
      totalBooks,
      avgScore: avgScore.toFixed(1),
      fiveStarBooks
    };
  }, []);

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

      {/* Books Grid - Original techprep-gh Implementation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 py-8">
        {sortedBooks.map((book, index) => (
          <article key={index} className="group cursor-pointer">
            {/* Book Container - Exact replica of techprep-gh */}
            <div className="w-[200px] h-[260px] m-[30px] flex items-center justify-center perspective-900">
              <div
                className="w-[200px] h-[260px] relative preserve-3d rotate-y-30 transition-transform-075s"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "rotateY(0deg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "rotateY(-30deg)")
                }
              >
                {/* Front Cover */}
                <Image
                  src={book.cover}
                  alt={book.title}
                  width={200}
                  height={260}
                  className="w-full h-full absolute rounded-r rounded-l-[3px] shadow-image-shadow object-cover"
                  priority={index < 12}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center rounded-r rounded-l-[3px]"><span class="text-3xl">📖</span></div>';
                    }
                  }}
                />
                
                {/* Pages */}
                <div className="bg-gradient-to-r from-white via-gray-50 to-gray-100 h-[calc(260px-2*6px)] w-[50px] top-[3px] absolute page-transform border-l border-gray-200 shadow-sm">
                  {/* Page lines effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/30 to-transparent"></div>
                  <div className="absolute top-2 bottom-2 left-1 right-1 bg-gradient-to-r from-gray-100/50 to-transparent"></div>
                </div>
                
                {/* Back Cover */}
                <div className="rounded-r bg-[#01060f] h-[260px] w-[200px] left-0 absolute back-cover-transform shadow-back-cover-shadow" />
              </div>
            </div>
            
            {/* Info Panel - Positioned to account for 3D rotation */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 mt-4 text-center transform group-hover:translate-x-8">
              <h3 className="text-sm font-medium dark:text-white mb-1 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                {book.review}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
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
          </article>
        ))}
      </div>
    </div>
  );
};

export default Readings;