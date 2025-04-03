"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface VariablesExposureProps {
  onBack?: () => void;
}

const VariablesExposure: React.FC<VariablesExposureProps> = ({ onBack }) => {
  return (
    <article className="max-w-7xl py-8 px-4 sm:px-0">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to writing</span>
      </button>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 dark:text-white">
          Your Environment Variables Are Lying to You
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400">
          <time dateTime="2024-12-29">December 29, 2024</time>
        </div>
      </header>

      <div className="prose dark:prose-invert prose-zinc max-w-3xl">
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-lg font-medium">
          That super-secret API key you&#39;ve just tucked away in a Vercel environment variable? Yeah, it might not be as hidden as you think. I spent a weekend playing security researcher with Burp Suite, and what I found should make every web developer a little nervous.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Let&#39;s be real: we&#39;ve all been there. You&#39;ve got some sensitive API keys, maybe a webhook URL or two, and you do the responsible thing — you throw them in environment variables. No more hardcoded secrets in your Git repository, right? Except here&#39;s the thing: that might be the digital equivalent of hiding your house key under a doormat that&#39;s made of clear plastic.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The False Promise of .env Files</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Environment variables are the darling of modern web development. They&#39;re the go-to solution for keeping secrets out of your code, and every deployment platform from Vercel to Netlify treats them like digital Fort Knox. The problem isn&#39;t with the concept — it&#39;s with how we&#39;re using them. And trust me, we&#39;re using them wrong.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">Breaking Into My Own App</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Armed with nothing but Burp Suite (think of it as Chrome DevTools on steroids) and a healthy dose of curiosity, I decided to see just how secure those environment variables really were. Spoiler alert: it took less than an hour to expose every single secret in my test application.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3 dark:text-white">The Setup: A Perfect Storm</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          I built what looks like a typical modern web app: React frontend, Node.js API routes, all deployed on Vercel. Everything by the book, including environment variables for all the sensitive stuff. The kind of setup you&#39;d find in thousands of production applications right now.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3 dark:text-white">The Hunt: Following the Data</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          With Burp Suite watching every network request, the truth started to emerge. Those environment variables? They were leaking everywhere. Every time the app made an API call, bits of sensitive data were hitching a ride in the response. It&#39;s like having a secret conversation in a room full of people wearing parabolic microphones.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The Wake-Up Call</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Here&#39;s the uncomfortable truth: environment variables aren&#39;t magic. They&#39;re just variables, and they&#39;re only as secure as the code that handles them. When your client-side application needs to make an authenticated API call, those credentials have to exist somewhere. And somewhere is usually a lot more accessible than you&#39;d think.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">How to Actually Keep Secrets</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          After thoroughly breaking my own security, I put together a battle plan for keeping sensitive data actually sensitive:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 mb-6">
          <li><strong>Trust No One:</strong> Treat your frontend like it&#39;s already compromised. Because it is. Any secret that touches client-side code isn&#39;t a secret anymore.</li>
          <li><strong>Fortress Your Backend:</strong> Build an API that never, ever returns raw environment variables. Instead, use them to generate limited-scope tokens or filtered responses.</li>
          <li><strong>Segment Everything:</strong> Different environments, different secrets. Your staging API key getting leaked should be annoying, not catastrophic.</li>
          <li><strong>Watch Like a Hawk:</strong> Set up monitoring that alerts you when environment variables are accessed in unusual ways. Better paranoid than pwned.</li>
          <li><strong>Encrypt What Matters:</strong> Add encryption at rest and in transit. It&#39;s not foolproof, but it makes an attacker&#39;s job significantly harder.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4 dark:text-white">The New Reality</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          We&#39;re building web applications in an era where the line between frontend and backend is increasingly blurry. Environment variables are a useful tool, but they&#39;re not a security panacea. The sooner we stop treating them like one, the better our applications will be.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          The next time you&#39;re about to stash a secret in an environment variable, ask yourself: do I really understand where this data might end up? Because in the world of modern web development, what&#39;s hidden server-side doesn&#39;t always stay server-side. And that&#39;s a lesson better learned in a controlled experiment than from a security breach notification.
        </p>
      </div>
    </article>
  );
};

export default VariablesExposure;