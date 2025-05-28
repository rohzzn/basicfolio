"use client";

import React, { useState, useEffect, useCallback } from 'react';

type User = {
  login: string;
  avatarUrl: string;
};

type Comment = {
  id: number;
  displayName: string;
  messageBody: string;
  createdAt: string;
  user: User;
};

type PaginationInfo = {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalCount: string | number;
};

export default function GuestbookPage() {
  const [name, setName] = useState<string>(''); 
  const [message, setMessage] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the fetchComments function
  const fetchComments = useCallback(async (page: number, append: boolean = false) => {
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    
    setError(null);
    
    try {
      const response = await fetch(`/api/guestbook?page=${page}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (append) {
        // Append new comments to existing ones, avoiding duplicates
        setComments(prevComments => {
          const existingIds = new Set(prevComments.map(comment => comment.id));
          const uniqueNewComments = data.comments.filter(
            (comment: Comment) => !existingIds.has(comment.id)
          );
          return [...prevComments, ...uniqueNewComments];
        });
      } else {
        setComments(data.comments || []);
      }
      
      setPagination(data.pagination || {
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false,
        totalCount: data.comments?.length || 0
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load guestbook entries. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []); // No dependencies required as it doesn't use any external state

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]); // Add fetchComments to dependency array

  const loadMoreComments = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchComments(pagination.currentPage + 1, true);
    }
  }, [pagination.hasNextPage, pagination.currentPage, fetchComments]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSending(true);
    setError(null);
    
    // Add optimistic update
    const optimisticComment: Comment = {
      id: Date.now(), // Temporary ID
      displayName: name,
      messageBody: message,
      createdAt: new Date().toISOString(),
      user: { login: 'you', avatarUrl: '' }
    };
    
    // Add the optimistic comment to the beginning since comments are in reverse chronological order
    setComments(prevComments => [optimisticComment, ...prevComments]);
    
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, message }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }
      
      const result = await response.json();
      
      // Reset form fields
      setName('');
      setMessage('');
      
      // Update the optimistic comment with the real ID
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === optimisticComment.id 
            ? { ...comment, id: result.comment.id, createdAt: result.comment.createdAt }
            : comment
        )
      );
      
            // Increment total count if we're tracking it
      if (typeof pagination.totalCount === 'number') {
        setPagination(prev => ({
          ...prev,
          totalCount: Number(prev.totalCount) + 1 
        }));
      }
    } catch (error: unknown) {
      console.error('Error posting comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit your message. Please try again later.';
      setError(errorMessage);
      
      // Remove the optimistic comment on error
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== optimisticComment.id)
      );
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

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={isSending}
              required
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[100px]"
              disabled={isSending}
              required
            />
            <button
              type="submit"
              disabled={isSending || !name.trim() || !message.trim()}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Comments Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm sm:text-base font-medium text-zinc-900 dark:text-white">
              Messages
              {typeof pagination.totalCount === 'number' && pagination.totalCount > 0 && (
                <span className="ml-2 text-zinc-500 dark:text-zinc-400 text-xs font-normal">
                  ({pagination.totalCount} total)
                </span>
              )}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-700 dark:border-zinc-300"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
              No messages yet. Be the first!
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment, index) => (
                <div key={comment.id} className="flex gap-4 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  {/* Numbering Section */}
                  <div className="flex-shrink-0 text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold">{comments.length - index}.</span>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-grow">
                    <div className="flex items-baseline flex-wrap gap-2">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {comment.displayName || 'Anonymous'}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-1 whitespace-pre-wrap">
                      {comment.messageBody}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {pagination.hasNextPage && (
                <div className="text-center pt-4">
                  <button
                    onClick={loadMoreComments}
                    disabled={isLoadingMore}
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-zinc-700 dark:border-zinc-300 mr-2"></span>
                        Loading...
                      </span>
                    ) : (
                      'Load More Messages'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
