"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Book as BookIcon, Star, BarChart3, TrendingUp } from 'lucide-react';

interface Book {
  title: string;
  review: string;
  score: number;
}

const books: Book[] = [
  { title: "The Subtle Art of Not Giving a F*ck", review: "Refreshing honesty about priorities.", score: 4 },
  { title: "Shoe Dog", review: "A raw look into Nike's origin.", score: 5 },
  { title: "Make Time by Jake Knapp", review: "Tactical tips for focusing on what matters.", score: 4 },
  { title: "Show Your Work", review: "Encourages sharing your process openly.", score: 4 },
  { title: "The Song of Achilles", review: "A beautiful retelling of myth with depth.", score: 5 },
  { title: "The Sailor Who Fell from Grace with the Sea", review: "Haunting exploration of honor and morality.", score: 4 },
  { title: "The Psychology of Money", review: "Insights into how we think about wealth.", score: 5 },
  { title: "The Design of Everyday Things", review: "Essential principles of user-centered design.", score: 5 },
  { title: "Man's Search for Meaning", review: "Profound reflections on purpose and suffering.", score: 5 },
  { title: "Beyond Good and Evil", review: "Challenges conventional morality frameworks.", score: 4 },
  { title: "Die with Zero", review: "Optimizing life experiences over accumulation.", score: 4 },
  { title: "The Four Agreements", review: "A simple guide to personal freedom.", score: 4 },
  { title: "Creative Confidence", review: "Inspiring methods to unlock creativity.", score: 4 },
  { title: "The Black Swan", review: "Understanding rare, impactful events.", score: 5 },
  { title: "Feel Good Productivity", review: "Finding joy in achieving personal goals.", score: 3 },
  { title: "The Creative Act", review: "A fresh look at artistry in everyday life.", score: 4 },
  { title: "Steal Like an Artist", review: "Inspiring creative thinking.", score: 4 },
  { title: "Keep Going", review: "A reminder to stay consistent.", score: 4 },
  { title: "The Almanack of Naval Ravikant", review: "Timeless wisdom on wealth and happiness.", score: 5 },
  { title: "The Book of Five Rings", review: "Strategies and philosophy from a legendary samurai.", score: 4 },
  { title: "Flowers for Algernon", review: "A touching, tragic look at intelligence and empathy.", score: 5 },
  { title: "Atomic Habits", review: "Practical steps to build better habits.", score: 5 },
  { title: "Why We Sleep", review: "Eye-opening insights into sleep's crucial role.", score: 5 },
  { title: "The 4-Hour Workweek", review: "Rethinking productivity and lifestyle design.", score: 4 },
  { title: "Sapiens: A Brief History of Humankind", review: "A sweeping overview of our species' journey.", score: 5 }
];

const Readings: React.FC = () => {
  const [covers, setCovers] = useState<{ [title: string]: string }>({});
  const [sortBy, setSortBy] = useState<'score' | 'title'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Calculate stats
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const avgScore = books.reduce((acc, book) => acc + book.score, 0) / totalBooks;
    const fiveStarBooks = books.filter(book => book.score === 5).length;
    const topGenres = ["Self Development", "Philosophy", "Psychology", "Business"];

    return {
      totalBooks,
      avgScore: avgScore.toFixed(1),
      fiveStarBooks,
      topGenres
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

  useEffect(() => {
    let isMounted = true;

    const loadCover = async (book: Book) => {
      try {
        const query = encodeURIComponent(book.title);
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await res.json();
        if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail && isMounted) {
          // Use higher quality image
          let imageUrl = data.items[0].volumeInfo.imageLinks.thumbnail;
          // Replace zoom=1 with zoom=0 for better quality
          imageUrl = imageUrl.replace('zoom=1', 'zoom=0');
          setCovers(prev => ({ ...prev, [book.title]: imageUrl }));
        }
      } catch (error) {
        console.error("Error fetching book cover:", error);
      }
    };

    const fetchCovers = async () => {
      // Load first 6 books immediately for above-the-fold content
      const priorityBooks = sortedBooks.slice(0, 6);
      const remainingBooks = sortedBooks.slice(6);
      
      // Load priority books first
      await Promise.all(priorityBooks.map(loadCover));
      
      // Then load remaining books in smaller batches for better performance
      for (let i = 0; i < remainingBooks.length; i += 3) {
        const chunk = remainingBooks.slice(i, i + 3);
        await Promise.all(chunk.map(loadCover));
        // Small delay to prevent API rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    fetchCovers();

    return () => {
      isMounted = false;
    };
  }, [sortedBooks]);

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Readings</h2>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <BookIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">Total Books</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{stats.totalBooks}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">Average Rating</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{stats.avgScore}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">5★ Books</h3>
          </div>
          <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">{stats.fiveStarBooks}</p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h3 className="text-sm font-medium dark:text-white">Top Genre</h3>
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{stats.topGenres[0]}</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            if (sortBy === 'title') {
              setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('title');
              setSortDirection('asc');
            }
          }}
          className={`px-4 py-2 rounded-lg ${
            sortBy === 'title' ? 'bg-zinc-200 dark:bg-zinc-700' : 'bg-zinc-100 dark:bg-zinc-800'
          }`}
        >
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Title</span>
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
          className={`px-4 py-2 rounded-lg ${
            sortBy === 'score' ? 'bg-zinc-200 dark:bg-zinc-700' : 'bg-zinc-100 dark:bg-zinc-800'
          }`}
        >
          <span className="text-sm text-zinc-700 dark:text-zinc-300">Rating</span>
        </button>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedBooks.map((book, index) => (
          <div 
            key={index} 
            className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
          >
            <div className="flex gap-4">
              <div className="relative w-16 h-24 flex-shrink-0 bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 rounded-md overflow-hidden shadow-md">
                {covers[book.title] ? (
                  <Image
                    src={covers[book.title]}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                    priority={index < 6}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium dark:text-white mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">{book.review}</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < book.score
                            ? "fill-zinc-700 text-zinc-700 dark:fill-zinc-300 dark:text-zinc-300"
                            : "text-zinc-300 dark:text-zinc-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {book.score}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Readings;