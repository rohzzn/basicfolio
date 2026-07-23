export type FeltQuote = {
  id: string;
  text: string;
  /** Where you heard it — film, song, book, game, conversation, etc. */
  source?: string;
  sourceUrl?: string;
  /** Optional note on why it hit */
  context?: string;
  date?: string;
  displayDate?: string;
};

/** Lines heard elsewhere that hit. Not things you wrote. */
export const feltQuotes: FeltQuote[] = [
  {
    id: "odyssey-2026-01",
    text: "What you most want is what you can't have and what you most can't have is what you already had, and lost.",
    source: "Odyssey",
  },
];
