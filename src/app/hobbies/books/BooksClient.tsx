'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from '@/components/SiteImage';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import bookQuotesData from '@/data/book-quotes.json';
import {
  books,
  BOOK_CATEGORY_LABELS,
  bookCoverSources,
  marqueeQuotes,
  type Book,
  type BookQuotesData,
} from '@/data/books';
import './books.css';

function StarRow({ score, className = '' }: { score: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${score} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-[11px] leading-none ${i < score ? 'text-amber-400' : 'text-zinc-300 dark:text-neutral-500'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const MARQUEE_SECONDS_PER_LINE = 5.5;

function QuoteMarquee({ quotes }: { quotes: string[] }) {
  const [items, setItems] = useState<string[] | null>(null);
  const [delay, setDelay] = useState('0s');
  const [duration, setDuration] = useState('200s');

  useEffect(() => {
    const shuffled = shuffle(quotes);
    const totalDuration = Math.max(300, quotes.length * MARQUEE_SECONDS_PER_LINE);
    setItems([...shuffled, ...shuffled]);
    setDelay(`-${Math.random() * totalDuration}s`);
    setDuration(`${totalDuration}s`);
  }, [quotes]);

  if (!items) {
    return <div className="mb-6 h-[52px]" aria-hidden />;
  }

  return (
    <div
      className="relative mb-6 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50/90 py-3.5 dark:border-neutral-800 dark:bg-neutral-900/50"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-zinc-50/98 to-transparent dark:from-neutral-950/98" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-zinc-50/98 to-transparent dark:from-neutral-950/98" />
      <div
        className="books-marquee-track"
        style={{ animationDelay: delay, ['--marquee-duration' as string]: duration }}
      >
        {items.map((line, i) => (
          <span
            key={`${line}-${i}`}
            className={`mx-10 shrink-0 text-sm leading-relaxed text-zinc-600 dark:text-neutral-300 ${i >= items.length / 2 ? 'books-marquee-duplicate' : ''}`}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function BookCoverImage({
  book,
  priority = false,
  className = '',
  hoverZoom = false,
}: {
  book: Book;
  priority?: boolean;
  className?: string;
  hoverZoom?: boolean;
}) {
  const sources = useMemo(() => bookCoverSources(book.isbn), [book.isbn]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [book.isbn]);

  const exhausted = sourceIndex >= sources.length;
  const src = sources[sourceIndex];

  return (
    <div className={`relative aspect-[2/3] overflow-hidden bg-zinc-200 dark:bg-neutral-800 ${className}`}>
      {exhausted ? (
        <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-[10px] font-medium leading-snug text-zinc-500 dark:text-neutral-400">
          {book.title}
        </div>
      ) : (
        <Image
          key={src}
          src={src}
          alt={book.title}
          fill
          priority={priority}
          className={`object-cover${hoverZoom ? ' transition-transform duration-500 ease-out group-hover:scale-[1.04]' : ''}`}
          onError={() => setSourceIndex((i) => i + 1)}
        />
      )}
    </div>
  );
}

function BookCover({
  book,
  priority = false,
  className = '',
}: {
  book: Book;
  priority?: boolean;
  className?: string;
}) {
  return <BookCoverImage book={book} priority={priority} className={className} hoverZoom />;
}

function BookDetailModal({ book, onClose }: { book: Book; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-[#faf8f5] shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      >
        <div className="flex min-h-[280px] sm:min-h-[320px]">
          <div className="hidden w-[38%] shrink-0 border-r border-zinc-200/80 bg-zinc-100/60 p-4 dark:border-neutral-700 dark:bg-neutral-800/50 sm:flex sm:flex-col sm:justify-between">
            <BookCoverImage book={book} className="mx-auto w-full max-w-[140px] rounded shadow-md ring-1 ring-black/5" />
            <StarRow score={book.score} className="mt-4 justify-center" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
            <div className="mb-3 flex items-start justify-between gap-3 sm:hidden">
              <StarRow score={book.score} />
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-200/80 hover:text-zinc-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-neutral-400">
              {BOOK_CATEGORY_LABELS[book.category]}
            </p>
            <h3
              id="book-detail-title"
              className="font-serif text-lg font-medium leading-snug text-zinc-900 dark:text-paper"
            >
              {book.title}
            </h3>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-neutral-300">
              {book.review}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-200/80 pt-4 dark:border-neutral-700">
              <StarRow score={book.score} className="hidden sm:flex" />
              <a
                href={`https://openlibrary.org/isbn/${book.isbn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-800 hover:underline dark:hover:text-neutral-200"
              >
                Open Library ↗
              </a>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 hidden rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-200/80 hover:text-zinc-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 sm:block"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function BooksClient() {
  const [selected, setSelected] = useState<Book | null>(null);

  const quotes = useMemo(
    () => marqueeQuotes(books, bookQuotesData as BookQuotesData),
    [],
  );

  const displayed = useMemo(
    () => [...books].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)),
    []
  );

  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <div className="w-full min-w-0 max-w-[75ch]">
      <header className="mb-5">
        <h2 className="text-lg font-medium dark:text-paper">Books</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-neutral-400">
          A few books I&apos;ve read
        </p>
      </header>

      {quotes.length > 0 ? <QuoteMarquee quotes={quotes} /> : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
        {displayed.map((book, i) => (
          <button
            key={book.id}
            type="button"
            onClick={() => setSelected(book)}
            className="group relative overflow-hidden rounded-lg text-left ring-1 ring-zinc-100 transition-shadow hover:shadow-lg dark:ring-neutral-800"
          >
            <BookCover book={book} priority={i < 8} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <StarRow score={book.score} className="mb-1 [&_span]:text-amber-300" />
              <p className="line-clamp-2 text-[11px] font-medium leading-snug text-white">
                {book.title}
              </p>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs text-zinc-400 dark:text-neutral-400">
        {displayed.length} books · tap for notes
      </p>

      <AnimatePresence>
        {selected ? <BookDetailModal book={selected} onClose={closeModal} /> : null}
      </AnimatePresence>
    </div>
  );
}
