"use client";

import React, { useState, useEffect } from 'react';

type Comment = {
  id: number;
  body: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const REPO_OWNER = 'rohzzn';
const REPO_NAME = 'basicfolio';
const ISSUE_NUMBER = 2;

export default function GuestbookPage() {
  const [name, setName] = useState<string>(''); // State for the user's name
  const [message, setMessage] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch comments');
      
      const data = await response.json();
      setComments(data.reverse()); // Display latest comments first
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      // Include the user's name in the comment body
      const commentBody = `**Name:** ${name.trim()}\n\n${message.trim()}`;
      const response = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body: commentBody }),
        }
      );

      if (!response.ok) throw new Error('Failed to post comment');

      // Reset form fields
      setName('');
      setMessage('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Guestbook</h2>
      
      <div className="max-w-2xl">
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Leave a message! It can be anything – appreciation, suggestions, or just a friendly hello.
        </p>

        {/* Updated Message Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex flex-col gap-4">
            {/* Name Input */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={isSending}
              required
            />
            {/* Message Textarea */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={isSending}
              required
            />
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending || !name.trim() || !message.trim()}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>

        {/* Comments Section */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center text-zinc-500">Loading messages...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-zinc-500">No messages yet. Be the first!</div>
          ) : (
            comments.map((comment, index) => {
              // Extract the user's name using regex
              const nameMatch = comment.body.match(/^\*\*Name:\*\* (.+)\n\n/);
              const displayName = nameMatch ? nameMatch[1] : 'Anonymous';
              // Extract the message by removing the name portion
              const messageBody = comment.body.replace(/^\*\*Name:\*\* .+\n\n/, '');

              return (
                <div key={comment.id} className="flex gap-4">
                  
                  {/* Numbering Section */}
                  <div className="flex-shrink-0 text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold">{comments.length - index}.</span>
                  </div>

                  {/* Comment Content */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      {/* Display the user's name */}
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{displayName}</span>
                      {/* Display the formatted date */}
                      <span className="text-xs text-zinc-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    {/* Display the user's message */}
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                      {messageBody}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
