"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Book {
  title: string;
  review: string;
  score: number; // out of 5
}

const books: Book[] = [
 
  { title: "The Subtle Art of Not Giving a F*ck", review: "Refreshing honesty about priorities.", score: 4 },
  { title: "Shoe Dog", review: "A raw look into Nike’s origin.", score: 5 },
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
  { title: "Why We Sleep", review: "Eye-opening insights into sleep’s crucial role.", score: 5 },
  { title: "The 4-Hour Workweek", review: "Rethinking productivity and lifestyle design.", score: 4 },
  { title: "Sapiens: A Brief History of Humankind", review: "A sweeping overview of our species’ journey.", score: 5 },
];

const Readings: React.FC = () => {
  const [covers, setCovers] = useState<{ [title: string]: string }>({});

  useEffect(() => {
    const fetchCovers = async () => {
      const newCovers: { [title: string]: string } = {};

      for (const book of books) {
        try {
          const query = encodeURIComponent(book.title);
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            const volume = data.items[0].volumeInfo;
            if (volume.imageLinks && volume.imageLinks.thumbnail) {
              // Usually imageLinks.thumbnail is something like `http://books.google.com/...`
              newCovers[book.title] = volume.imageLinks.thumbnail;
            } else {
              newCovers[book.title] = "";
            }
          } else {
            newCovers[book.title] = "";
          }
        } catch (error) {
          console.error("Error fetching book cover:", error);
          newCovers[book.title] = "";
        }
      }

      setCovers(newCovers);
    };

    fetchCovers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Readings</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        A quick snapshot of books I’ve read, each with a one-liner and a score out of 5.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book, index) => {
          const coverUrl = covers[book.title];

          return (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div
                className="relative w-32 h-48 bg-zinc-100 dark:bg-zinc-800 rounded shadow-lg overflow-hidden"
                style={{
                  borderLeft: "8px solid #aaa",
                  transform: "perspective(600px) rotateY(-5deg)",
                }}
              >
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {book.title}
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-zinc-800 dark:text-zinc-200 font-medium">{book.title}</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{book.review}</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">Score: {book.score}/5</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Readings;
