"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  login: string;
  avatar_url: string;
};

type Comment = {
  id: number;
  body: string;
  created_at: string;
  user: User;
};

export default function GuestbookAdminPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminSecret, setAdminSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();

  // Function to fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/guestbook/admin', {
        headers: {
          'Authorization': `Bearer ${adminSecret}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setAuthenticated(false);
          throw new Error('Unauthorized. Please check your admin secret.');
        }
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }
      
      const data = await response.json();
      setComments(data.comments || []);
      setAuthenticated(true);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      setError(error.message || 'Failed to load guestbook entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle authentication
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComments();
  };

  // Function to delete a comment
  const deleteComment = async (commentId: number) => {
    setDeletingId(commentId);
    
    try {
      const response = await fetch('/api/guestbook/admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSecret}`
        },
        body: JSON.stringify({ commentId })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.status}`);
      }
      
      // Remove the comment from the state
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      setError(error.message || 'Failed to delete comment');
    } finally {
      setDeletingId(null);
    }
  };

  // Format date for display
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Extract name and message from comment body
  const parseCommentBody = (body: string) => {
    const nameMatch = body.match(/^\*\*Name:\*\* (.+)\n\n/);
    const displayName = nameMatch ? nameMatch[1] : 'Anonymous';
    const messageBody = body.replace(/^\*\*Name:\*\* .+\n\n/, '');
    
    return { displayName, messageBody };
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Guestbook Admin</h2>
      
      {!authenticated ? (
        <div className="max-w-md">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Enter the admin secret to access the guestbook moderation panel.
          </p>
          
          <form onSubmit={handleAuthenticate} className="mb-8">
            <div className="flex flex-col gap-4">
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Admin secret..."
                className="bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              />
              <button
                type="submit"
                disabled={!adminSecret.trim()}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Authenticate
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Manage guestbook entries. You can delete inappropriate or spam comments.
          </p>
          
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
                All Comments
                <span className="ml-2 text-zinc-500 dark:text-zinc-400 text-xs font-normal">
                  ({comments.length} total)
                </span>
              </h3>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-700 dark:border-zinc-300"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                No comments found.
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => {
                  const { displayName, messageBody } = parseCommentBody(comment.body);
                  
                  return (
                    <div key={comment.id} className="flex gap-4 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                      {/* Comment Content */}
                      <div className="flex-grow">
                        <div className="flex items-baseline flex-wrap gap-2 justify-between">
                          <div>
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">
                              {displayName}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-500 ml-2">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            disabled={deletingId === comment.id}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm transition-colors"
                          >
                            {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-1 whitespace-pre-wrap">
                          {messageBody}
                        </p>
                        <div className="mt-2 text-xs text-zinc-500">
                          <span>ID: {comment.id}</span>
                          <span className="ml-2">User: {comment.user.login}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
