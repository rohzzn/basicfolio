'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Image from '@/components/SiteImage';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import bookQuotesData from '@/data/book-quotes.json';
import {
  books,
  BOOK_CATEGORY_LABELS,
  bookCoverSources,
  type Book,
  type BookCategory,
  type BookQuotesData,
} from '@/data/books';
import './books.css';

// The books stand on hand-drawn shelves, one group per category with a hand-lettered label under
// it, packed onto as many shelves as the page is wide enough for. Hovering a spine lifts it a
// little off the shelf; clicking pulls it out and it falls open underneath, the review on the left
// page and the book's takeaways on the right.

const HAND = '"Bradley Hand", "Segoe Script", "Chalkboard", "Comic Sans MS", cursive';
const SPINE_COLORS = ['#c8473f', '#2b5fb8', '#e8c84a', '#518e9d', '#91906a', '#7a5c8e', '#e4a05c', '#3a3945', '#d98c7a', '#6f8f4f'];
const SPINE_GAP = 2;
const GROUP_GAP = 32;
const LIFT = 14; // room above the tallest spine for one to lift into

function hashOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}

function inkOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? '#24232e' : '#fffdf7';
}

type Spine = { book: Book; width: number; height: number; color: string; lean: boolean };
type Group = { category: BookCategory; label: string; spines: Spine[]; width: number };

function spineOf(book: Book, last: boolean): Spine {
  const h = hashOf(book.id);
  return {
    book,
    width: Math.round(26 + Math.min(12, book.title.length * 0.3) + hashOf(book.id + 'w') * 6),
    // tall enough for the whole title, as a book with a long title is
    height: Math.round(Math.min(232, Math.max(148 + h * 42, book.shortTitle.length * 7.2 + 48))),
    color: SPINE_COLORS[Math.floor(hashOf(book.id + 'c') * SPINE_COLORS.length)],
    lean: last && h > 0.45,
  };
}

function buildGroups(): Group[] {
  const byCategory = new Map<BookCategory, Book[]>();
  for (const b of books) byCategory.set(b.category, [...(byCategory.get(b.category) ?? []), b]);
  return [...byCategory.entries()]
    .map(([category, list]) => {
      const sorted = [...list].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
      const spines = sorted.map((b, i) => spineOf(b, i === sorted.length - 1));
      const label = BOOK_CATEGORY_LABELS[category];
      const spinesW = spines.reduce((s, x) => s + x.width, 0) + (spines.length - 1) * SPINE_GAP + 10;
      return { category, label, spines, width: Math.max(spinesW, label.length * 9 + 10) };
    })
    .sort((a, b) => b.spines.length - a.spines.length || a.label.localeCompare(b.label));
}

// Greedy packing: as many whole categories on a shelf as fit its width.
function packShelves(groups: Group[], width: number): Group[][] {
  if (width <= 0) return groups.map((g) => [g]);
  const rows: Group[][] = [];
  let row: Group[] = [];
  let used = 0;
  for (const g of groups) {
    const need = row.length ? used + GROUP_GAP + g.width : g.width;
    if (row.length && need > width) {
      rows.push(row);
      row = [g];
      used = g.width;
    } else {
      row.push(g);
      used = need;
    }
  }
  if (row.length) rows.push(row);
  return rows;
}

function Stars({ score }: { score: number }) {
  return (
    <span className="text-[13px] tracking-[0.1em] text-amber-500 dark:text-amber-400" aria-label={`${score} out of 5`}>
      {'★'.repeat(score)}
      <span className="text-zinc-300 dark:text-neutral-600">{'★'.repeat(5 - score)}</span>
    </span>
  );
}

function Cover({ book }: { book: Book }) {
  const sources = useMemo(() => bookCoverSources(book.isbn), [book.isbn]);
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [book.isbn]);
  const src = sources[i];
  return (
    <div className="shelf-cover relative aspect-[2/3] w-24 shrink-0 overflow-hidden sm:w-28">
      {src ? (
        <Image key={src} src={src} alt={book.title} fill sizes="112px" className="object-cover" onError={() => setI((n) => n + 1)} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-[11px] font-medium leading-snug">
          {book.title}
        </div>
      )}
    </div>
  );
}

const takeawaysByTitle = new Map(
  (bookQuotesData as BookQuotesData).books.map((b) => [b.book_name, b.quotes])
);

// The book, fallen open: the review on the left page, its takeaways on the right.
function OpenBook({ book, onClose }: { book: Book; onClose: () => void }) {
  const takeaways = (takeawaysByTitle.get(book.title) ?? []).slice(0, 5);
  return (
    <motion.div
      key={book.id}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      className="overflow-hidden"
    >
      <div className="relative pb-2 pt-5 [perspective:1400px]" role="region" aria-label={book.title}>
        <div className="flex flex-col sm:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="shelf-page shelf-page-left flex-1 p-5"
          >
            <div className="flex gap-4">
              <Cover book={book} />
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 dark:text-neutral-400">{BOOK_CATEGORY_LABELS[book.category]}</p>
                <h3 className="mt-0.5 text-base font-medium leading-snug text-zinc-900 dark:text-paper">{book.title}</h3>
                <div className="mt-1.5">
                  <Stars score={book.score} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-neutral-300">{book.review}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ rotateY: -80, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: 'left center' }}
            className="shelf-page shelf-page-right shelf-ruled flex-1 px-5 pb-5 pt-4"
          >
            <p className="mb-1 text-[15px] text-zinc-500 dark:text-neutral-400" style={{ fontFamily: HAND }}>
              Takeaways
            </p>
            {takeaways.length ? (
              <ul className="space-y-0">
                {takeaways.map((t) => (
                  <li key={t} className="text-sm leading-6 text-zinc-700 dark:text-neutral-300">
                    <span className="mr-1.5 text-zinc-400 dark:text-neutral-500">-</span>
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-6 text-zinc-500 dark:text-neutral-400">No notes on this one yet.</p>
            )}
          </motion.div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Put the book back"
          className="absolute right-2 top-7 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function Shelf({
  row,
  openId,
  onPick,
}: {
  row: Group[];
  openId: string | null;
  onPick: (b: Book) => void;
}) {
  const tallest = Math.max(...row.flatMap((g) => g.spines.map((s) => s.height)));
  return (
    <div className="relative">
      <div className="flex items-end" style={{ gap: GROUP_GAP }}>
        {row.map((g) => (
          <div key={g.category} className="flex shrink-0 flex-col" style={{ width: g.width }}>
            <div className="flex items-end" style={{ height: tallest + LIFT, gap: SPINE_GAP }}>
              {g.spines.map((s) => {
                const open = s.book.id === openId;
                const ink = inkOn(s.color);
                return (
                  <button
                    key={s.book.id}
                    type="button"
                    onClick={() => onPick(s.book)}
                    aria-expanded={open}
                    aria-label={`${s.book.title}, ${s.book.score} out of 5`}
                    title={s.book.title}
                    className={`shelf-spine group relative shrink-0 ${open ? 'shelf-spine-out' : ''}`}
                    style={{
                      width: s.width,
                      height: s.height,
                      background: open ? 'transparent' : s.color,
                      color: ink,
                      transform: s.lean && !open ? 'rotate(4deg)' : undefined,
                      transformOrigin: 'bottom left',
                    }}
                  >
                    {open ? null : (
                      <>
                        <span className="shelf-band" style={{ top: 10, background: ink }} />
                        <span className="shelf-band" style={{ bottom: 12, background: ink }} />
                        <span
                          className="absolute left-1/2 top-5 -translate-x-1/2 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold leading-none tracking-[0.02em]"
                          style={{ writingMode: 'vertical-rl', maxHeight: s.height - 36 }}
                        >
                          {s.book.shortTitle}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="h-3" />
            <p className="mt-2 text-[15px] leading-none text-zinc-500 dark:text-neutral-400" style={{ fontFamily: HAND }}>
              {g.label}
            </p>
          </div>
        ))}
      </div>
      {/* the plank */}
      <div className="shelf-plank absolute left-0 right-0" style={{ top: tallest + LIFT, height: 12 }} />
    </div>
  );
}

export default function BooksClient() {
  const groups = useMemo(buildGroups, []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState<Book | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () => setWidth(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const rows = useMemo(() => packShelves(groups, width), [groups, width]);
  const pick = useCallback((b: Book) => setOpen((cur) => (cur?.id === b.id ? null : b)), []);
  const close = useCallback(() => setOpen(null), []);

  return (
    <div className="w-full min-w-0 max-w-[75ch]">
      <header className="mb-8">
        <h2 className="text-lg font-medium dark:text-paper">Books</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-neutral-400">A few books I&apos;ve read</p>
      </header>

      <div ref={wrapRef} className="shelves space-y-12">
        {rows.map((row) => {
          const here = open && row.some((g) => g.spines.some((s) => s.book.id === open.id));
          return (
            <div key={row.map((g) => g.category).join('-')}>
              <Shelf row={row} openId={open?.id ?? null} onPick={pick} />
              <AnimatePresence initial={false}>{here && open ? <OpenBook key={open.id} book={open} onClose={close} /> : null}</AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
