export type BookCategory =
  | 'philosophy'
  | 'design'
  | 'fiction'
  | 'business'
  | 'productivity'
  | 'science'
  | 'self-help';

export interface Book {
  id: string;
  title: string;
  /** Shorter label for the quote marquee. */
  shortTitle: string;
  /** One-line note shown in the book detail modal. */
  review: string;
  score: 4 | 5;
  isbn: string;
  category: BookCategory;
}

export interface BookQuotesData {
  note: string;
  total_books: number;
  quotes_per_book: number;
  books: {
    id: number;
    book_name: string;
    quotes: string[];
  }[];
}

export const BOOK_CATEGORY_LABELS: Record<BookCategory, string> = {
  philosophy: 'Philosophy',
  design: 'Design',
  fiction: 'Fiction',
  business: 'Business',
  productivity: 'Productivity',
  science: 'Science',
  'self-help': 'Self-help',
};

/** Medium cover — smaller payload than -L, still sharp in the grid. */
export function bookCoverUrl(isbn: string, size: 'S' | 'M' = 'M'): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

export const books: Book[] = [
  { id: '12-rules', title: '12 Rules for Life', shortTitle: '12 Rules', review: 'Practical wisdom on order and meaning.', score: 5, isbn: '9780345816023', category: 'philosophy' },
  { id: 'freakonomics', title: 'Freakonomics', shortTitle: 'Freakonomics', review: 'Unconventional insights into hidden economic forces.', score: 5, isbn: '9780061234002', category: 'science' },
  { id: 'subtle-art', title: 'The Subtle Art of Not Giving a F*ck', shortTitle: 'Subtle Art', review: 'Refreshing honesty about priorities.', score: 4, isbn: '9780062457714', category: 'self-help' },
  { id: 'shoe-dog', title: 'Shoe Dog', shortTitle: 'Shoe Dog', review: "A raw look into Nike's origin.", score: 5, isbn: '9781501135910', category: 'business' },
  { id: 'make-time', title: 'Make Time', shortTitle: 'Make Time', review: 'Tactical tips for focusing on what matters.', score: 4, isbn: '9780525572428', category: 'productivity' },
  { id: 'show-your-work', title: 'Show Your Work', shortTitle: 'Show Your Work', review: 'Encourages sharing your process openly.', score: 4, isbn: '9780761178972', category: 'design' },
  { id: 'song-of-achilles', title: 'The Song of Achilles', shortTitle: 'Song of Achilles', review: 'A beautiful retelling of myth with depth.', score: 5, isbn: '9780062060624', category: 'fiction' },
  { id: 'sailor', title: 'The Sailor Who Fell from Grace with the Sea', shortTitle: 'The Sailor', review: 'Haunting exploration of honor and morality.', score: 4, isbn: '9780679750154', category: 'fiction' },
  { id: 'psychology-of-money', title: 'The Psychology of Money', shortTitle: 'Psychology of Money', review: 'Insights into how we think about wealth.', score: 5, isbn: '9780857197689', category: 'business' },
  { id: 'design-everyday', title: 'The Design of Everyday Things', shortTitle: 'Design of Everyday Things', review: 'Essential principles of user-centered design.', score: 5, isbn: '9780465050659', category: 'design' },
  { id: 'mans-search', title: "Man's Search for Meaning", shortTitle: "Man's Search", review: 'Profound reflections on purpose and suffering.', score: 5, isbn: '9780807014295', category: 'philosophy' },
  { id: 'beyond-good-evil', title: 'Beyond Good and Evil', shortTitle: 'Beyond Good and Evil', review: 'Challenges conventional morality frameworks.', score: 4, isbn: '9780486298689', category: 'philosophy' },
  { id: 'die-with-zero', title: 'Die with Zero', shortTitle: 'Die with Zero', review: 'Optimizing life experiences over accumulation.', score: 4, isbn: '9780358099765', category: 'business' },
  { id: 'four-agreements', title: 'The Four Agreements', shortTitle: 'Four Agreements', review: 'A simple guide to personal freedom.', score: 4, isbn: '9781878424310', category: 'self-help' },
  { id: 'creative-confidence', title: 'Creative Confidence', shortTitle: 'Creative Confidence', review: 'Inspiring methods to unlock creativity.', score: 4, isbn: '9780385349369', category: 'design' },
  { id: 'black-swan', title: 'The Black Swan', shortTitle: 'Black Swan', review: 'Understanding rare, impactful events.', score: 5, isbn: '9780812973815', category: 'business' },
  { id: 'creative-act', title: 'The Creative Act', shortTitle: 'Creative Act', review: 'A fresh look at artistry in everyday life.', score: 4, isbn: '9780593652886', category: 'design' },
  { id: 'steal-like-artist', title: 'Steal Like an Artist', shortTitle: 'Steal Like an Artist', review: 'Inspiring creative thinking.', score: 4, isbn: '9780761169253', category: 'design' },
  { id: 'keep-going', title: 'Keep Going', shortTitle: 'Keep Going', review: 'A reminder to stay consistent.', score: 4, isbn: '9781523506644', category: 'design' },
  { id: 'naval', title: 'The Almanack of Naval Ravikant', shortTitle: 'Naval', review: 'Timeless wisdom on wealth and happiness.', score: 5, isbn: '9781544514222', category: 'business' },
  { id: 'five-rings', title: 'The Book of Five Rings', shortTitle: 'Five Rings', review: 'Strategies and philosophy from a legendary samurai.', score: 4, isbn: '9781590302484', category: 'philosophy' },
  { id: 'flowers-algernon', title: 'Flowers for Algernon', shortTitle: 'Flowers for Algernon', review: 'A touching, tragic look at intelligence and empathy.', score: 5, isbn: '9780156030304', category: 'fiction' },
  { id: 'atomic-habits', title: 'Atomic Habits', shortTitle: 'Atomic Habits', review: 'Practical steps to build better habits.', score: 5, isbn: '9780735211292', category: 'productivity' },
  { id: 'why-we-sleep', title: 'Why We Sleep', shortTitle: 'Why We Sleep', review: "Eye-opening insights into sleep's crucial role.", score: 5, isbn: '9781501144318', category: 'science' },
  { id: '4-hour-workweek', title: 'The 4-Hour Workweek', shortTitle: '4-Hour Workweek', review: 'Rethinking productivity and lifestyle design.', score: 4, isbn: '9780307465351', category: 'productivity' },
  { id: 'sapiens', title: 'Sapiens', shortTitle: 'Sapiens', review: "A sweeping overview of our species' journey.", score: 5, isbn: '9780062316097', category: 'science' },
];

export function marqueeQuotes(allBooks: Book[], data: BookQuotesData): string[] {
  const shortByTitle = new Map(allBooks.map(b => [b.title, b.shortTitle]));
  const lines: string[] = [];

  for (const entry of data.books) {
    const short = shortByTitle.get(entry.book_name);
    if (!short) continue;
    for (const quote of entry.quotes) {
      lines.push(`${quote} - ${short}`);
    }
  }

  return lines;
}
