"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { posts } from '@/data/writing';

interface Note {
  id: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  date: string;
  displayDate: string;
  published: boolean;
}

const INITIAL_NOTES_SHOWN = 3;

const WritingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const fetchedRef = React.useRef(false);

  const fetchNotes = React.useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setNotesLoading(true);
    fetch('/api/notes')
      .then(r => r.json())
      .then(data => setNotes(data.notes || []))
      .catch(() => {})
      .finally(() => setNotesLoading(false));
  }, []);

  // Prefetch in background on mount so notes tab feels instant
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (selectedCategory === 'notes') fetchNotes();
  }, [selectedCategory, fetchNotes]);

  const filtered = useMemo(() => {
    return posts.filter(p =>
      selectedCategory === 'all' ? true : p.category === selectedCategory
    );
  }, [selectedCategory]);

  const categories = ['all', 'tech', 'life', 'notes'];

  const visibleNotes = showAllNotes ? notes : notes.slice(0, INITIAL_NOTES_SHOWN);
  const hiddenCount = Math.max(0, notes.length - INITIAL_NOTES_SHOWN);

  return (
    <div style={{ maxWidth: '75ch' }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Writing</h2>
        <div className="flex gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setShowAllNotes(false); }}
              className={`text-sm capitalize transition-colors ${
                selectedCategory === cat
                  ? 'text-zinc-900 dark:text-white font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory === 'notes' ? (
        <div>
          {notesLoading ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Nothing here yet.</p>
          ) : (
            <>
              {visibleNotes.map((note) => (
                <div
                  key={note.id}
                  className="py-3 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
                >
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug mb-1.5">
                    {note.text}
                  </p>
                  {note.mediaUrl && note.mediaType === 'image' && (
                    <div className="mt-2 mb-2 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
                      <Image
                        src={note.mediaUrl}
                        alt=""
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  {note.mediaUrl && note.mediaType === 'video' && (
                    <div className="mt-2 mb-2 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
                      <video src={note.mediaUrl} controls className="w-full" />
                    </div>
                  )}
                  <span className="text-xs text-zinc-400 dark:text-zinc-600">
                    {note.displayDate}
                  </span>
                </div>
              ))}

              {!showAllNotes && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllNotes(true)}
                  className="mt-3 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                >
                  {hiddenCount} more
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div>
          {filtered.map((item) => (
            <Link
              key={item.slug}
              href={`/writing/${item.slug}`}
              className="group flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {item.title}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors flex-shrink-0 ml-4">
                {item.displayDate}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WritingPage;
