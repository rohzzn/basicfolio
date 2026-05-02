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
  { title: "12 Rules for Life", review: "Practical wisdom on order and meaning.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780345816023-L.jpg" },
  { title: "Freakonomics", review: "Unconventional insights into hidden economic forces.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780061234002-L.jpg" },
  { title: "The Subtle Art of Not Giving a F*ck", review: "Refreshing honesty about priorities.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780062457714-L.jpg" },
  { title: "Shoe Dog", review: "A raw look into Nike's origin.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9781501135910-L.jpg" },
  { title: "Make Time", review: "Tactical tips for focusing on what matters.", score: 4, cover: "https://covers.openlibrary.org/b/isbn/9780525572428-L.jpg" },
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
  { title: "Sapiens", review: "A sweeping overview of our species' journey.", score: 5, cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg" },
];

type FilterVal = 'all' | 5 | 4;

export default function Readings() {
  const [filter, setFilter] = useState<FilterVal>('all');
  const [active, setActive] = useState<string | null>(null);

  const displayed = useMemo(() => {
    const list = filter === 'all' ? [...books] : books.filter(b => b.score === (filter as number));
    return list.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }, [filter]);

  const counts = { all: books.length, 5: books.filter(b => b.score === 5).length, 4: books.filter(b => b.score === 4).length };
  const tabs: { id: FilterVal; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 5, label: '5★' },
    { id: 4, label: '4★' },
  ];

  return (
    <div className="w-full min-w-0 max-w-[75ch]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white shrink-0">Books</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setFilter(id); setActive(null); }}
              className={`text-sm transition-colors ${
                filter === id
                  ? 'text-zinc-900 dark:text-white font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {label}{' '}
              <span className="tabular-nums font-normal opacity-50">{counts[id]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {displayed.map(book => {
          const isActive = active === book.title;
          return (
            <div
              key={book.title}
              onClick={() => setActive(isActive ? null : book.title)}
              className="relative aspect-[2/3] rounded overflow-hidden cursor-pointer group select-none"
            >
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 42vw, (max-width: 768px) 28vw, (max-width: 1024px) 20vw, 180px"
                unoptimized
              />

              {/* Fallback background */}
              <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 -z-10" />

              {/* Gradient overlay — shows on hover (desktop) or tap (mobile) */}
              <div
                className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.05) 100%)',
                }}
              >
                <div className="p-2.5 sm:p-3">
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-[10px] leading-none ${i < book.score ? 'text-amber-300' : 'text-white/25'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-white text-[11px] sm:text-xs font-medium leading-snug line-clamp-2">
                    {book.title}
                  </p>
                  <p className="text-white/65 text-[10px] mt-1 leading-snug line-clamp-2 hidden sm:block">
                    {book.review}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-6">
        {displayed.length} {displayed.length === 1 ? 'book' : 'books'} · hover or tap to read notes
      </p>
    </div>
  );
}
