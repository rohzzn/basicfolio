"use client";

import React, { useState } from 'react';

const NewsletterSubscribe: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    
    // This would typically connect to your newsletter service
    // For now, we'll simulate a successful subscription
    setTimeout(() => {
      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox to confirm.');
      setEmail('');
    }, 1500);
    
    // For actual implementation, you'd use something like:
    // try {
    //   const response = await fetch('/api/subscribe', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     setStatus('success');
    //     setMessage(data.message || 'Thanks for subscribing!');
    //     setEmail('');
    //   } else {
    //     setStatus('error');
    //     setMessage(data.message || 'Something went wrong. Please try again.');
    //   }
    // } catch (error) {
    //   setStatus('error');
    //   setMessage('Something went wrong. Please try again.');
    // }
  };

  return (
    <div id="newsletter" className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 my-8">
      <h3 className="text-base font-medium mb-2 dark:text-white">Subscribe to the Newsletter</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Get notified when I publish new articles. No spam, unsubscribe anytime.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-grow px-4 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={status === 'loading' || status === 'success'}
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            status === 'loading' 
              ? 'bg-zinc-400 dark:bg-zinc-600 text-white cursor-not-allowed'
              : status === 'success'
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
      </form>
      
      {message && (
        <p className={`mt-2 text-sm ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default NewsletterSubscribe; 