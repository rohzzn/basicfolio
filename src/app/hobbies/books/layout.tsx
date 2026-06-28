import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Books',
  description: 'A few books I have read — ratings and notes.',
};

export default function BooksLayout({ children }: { children: ReactNode }) {
  return children;
}
