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
    const loadedCovers: { [title: string]: string } = {};
    let loadedCount = 0;

    const loadCover = async (book: Book) => {
      try {
        const query = encodeURIComponent(book.title);
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
        const data = await res.json();
        if (data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail && isMounted) {
          loadedCovers[book.title] = data.items[0].volumeInfo.imageLinks.thumbnail;
          loadedCount++;
          if (loadedCount % 5 === 0 || loadedCount === books.length) {
            setCovers(prev => ({ ...prev, ...loadedCovers }));
          }
        }
      } catch (error) {
        console.error("Error fetching book cover:", error);
      }
    };

    const fetchCovers = async () => {
      // Load covers in batches of 5
      const chunks = Array.from({ length: Math.ceil(books.length / 5) }, (_, i) =>
        books.slice(i * 5, (i + 1) * 5)
      );

      for (const chunk of chunks) {
        await Promise.all(chunk.map(loadCover));
      }
    };

    fetchCovers();

    return () => {
      isMounted = false;
    };
  }, []);

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
            className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 flex gap-4"
          >
            <div
              className="relative w-20 h-32 flex-shrink-0 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden"
              style={{
                borderLeft: "4px solid #aaa",
                transform: "perspective(600px) rotateY(-5deg)",
              }}
            >
              {covers[book.title] ? (
                <Image
                  src={covers[book.title]}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                  priority={index < 6}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookIcon className="w-6 h-6 text-zinc-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium dark:text-white mb-1">{book.title}</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{book.review}</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i < book.score
                        ? "bg-zinc-800 dark:bg-zinc-200"
                        : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Readings;