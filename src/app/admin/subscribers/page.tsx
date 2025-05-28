"use client";

import React, { useState } from 'react';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');

  // Simple password authentication - in a real app, use proper authentication
  const ADMIN_PASSWORD = 'newsletter123'; // Change this to a secure password

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchSubscribers();
    } else {
      setError('Invalid password');
    }
  };

  async function fetchSubscribers() {
    setIsLoading(true);
    setFetchError('');
    
    try {
      const response = await fetch('/api/subscribe');
      const data = await response.json();
      
      if (data.success && data.subscribers) {
        setSubscribers(data.subscribers);
      } else {
        setFetchError(data.message || 'Could not retrieve subscribers');
        setSubscribers([]);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setFetchError('Failed to connect to the server. Please try again.');
      setSubscribers([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRefresh = () => {
    fetchSubscribers();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl">
        <h2 className="text-lg font-medium mb-6 dark:text-white">Newsletter Admin</h2>
        <div className="max-w-md">
          <form onSubmit={handleLogin} className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Newsletter Subscribers</h2>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-zinc-600 dark:text-zinc-400">
          Total subscribers: {subscribers.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center py-10">
          <div className="animate-pulse text-zinc-600 dark:text-zinc-400">Loading subscribers...</div>
        </div>
      ) : fetchError ? (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg p-4 mb-6">
          <p>{fetchError}</p>
          <button 
            onClick={handleRefresh}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      ) : subscribers.length > 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
            {subscribers.map((email, index) => (
              <li key={index} className="px-6 py-4 dark:text-white">
                {email}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 rounded-lg p-4">
          <p>No subscribers yet.</p>
          <p className="text-sm mt-1">When people subscribe to your newsletter, they&apos;ll appear here.</p>
        </div>
      )}
    </div>
  );
} 