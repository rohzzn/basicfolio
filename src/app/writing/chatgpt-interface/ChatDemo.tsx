"use client";
import React, { useState, useEffect, useRef } from 'react';

const CONVERSATIONS: { role: 'user' | 'ai'; text: string }[][] = [
  [
    { role: 'user', text: 'What is the difference between useEffect and useLayoutEffect?' },
    { role: 'ai',   text: 'useEffect runs after the browser paints the screen — it is non-blocking and best for most side effects like data fetching or subscriptions. useLayoutEffect fires synchronously after DOM mutations but before the paint, so it is useful when you need to measure layout or prevent visual flicker. In practice, start with useEffect and only switch if you see flickering.' },
  ],
  [
    { role: 'user', text: 'Give me a quick Git command to undo my last commit but keep the changes.' },
    { role: 'ai',   text: 'git reset --soft HEAD~1\n\nThis moves HEAD back one commit and leaves your changes staged, ready to re-commit or edit.' },
  ],
  [
    { role: 'user', text: 'Explain async/await in one sentence.' },
    { role: 'ai',   text: 'async/await is syntactic sugar over Promises that lets you write asynchronous code that reads like synchronous code, where await pauses execution of the async function until the Promise resolves.' },
  ],
];

function TypedText({ text, onDone }: { text: string; onDone: () => void }) {
  const [shown, setShown] = useState('');
  useEffect(() => {
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); onDone(); }
    }, 12);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return <>{shown}</>;
}

export default function ChatDemo() {
  const [convoIdx, setConvoIdx] = useState(0);
  const [phase, setPhase] = useState<'user' | 'ai' | 'done'>('user');
  const convo = CONVERSATIONS[convoIdx];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPhase('user');
    const t = setTimeout(() => setPhase('ai'), 600);
    return () => clearTimeout(t);
  }, [convoIdx]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [phase]);

  const next = () => setConvoIdx(i => (i + 1) % CONVERSATIONS.length);

  return (
    <div className="my-8 not-prose">
      <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium mb-3">Custom ChatGPT UI</p>
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">gpt-4o</span>
          </div>
          <button onClick={next} className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            try another →
          </button>
        </div>

        <div className="p-4 space-y-4 min-h-[120px]">
          {(phase === 'user' || phase === 'ai' || phase === 'done') && (
            <div className="flex justify-end">
              <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-3 py-2 rounded-xl rounded-tr-sm max-w-[80%]">
                {convo[0].text}
              </div>
            </div>
          )}
          {(phase === 'ai' || phase === 'done') && (
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                <span className="text-white dark:text-zinc-900 text-[9px] font-bold">G</span>
              </div>
              <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-w-[85%]">
                <TypedText key={convoIdx} text={convo[1].text} onDone={() => setPhase('done')} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 bg-white dark:bg-zinc-800/50">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-1">Message...</span>
            <div className="w-5 h-5 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center flex-shrink-0">
              <span className="text-white dark:text-zinc-900 text-[9px]">↑</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
