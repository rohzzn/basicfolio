import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChatDemo from './ChatDemo';

export const metadata: Metadata = {
  title: 'Building My Own ChatGPT UI — Rohan',
  description: 'Why I built a custom ChatGPT interface instead of using the default, and what I learned about AI tooling along the way.',
  openGraph: {
    title: 'Building My Own ChatGPT UI',
    description: 'Why I built a custom ChatGPT interface instead of using the default, and what I learned about AI tooling along the way.',
    url: 'https://rohan.run/writing/chatgpt-interface',
  },
  alternates: { canonical: 'https://rohan.run/writing/chatgpt-interface' },
};

const ChatGPTInterface: React.FC = () => {
  return (
    <article className="max-w-3xl py-8 px-4 sm:px-0">
      <Link href="/writing"
        className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to writing</span>
      </Link>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-lg font-medium mb-4 dark:text-white">
          Building My Own ChatGPT UI
        </h1>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2024-01-20">January 20, 2024</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          I use ChatGPT every day for coding, writing, and research. Early on I found the default interface frustrating in small but consistent ways: no persistent system prompts per conversation type, no keyboard shortcuts, text that renders as a wall of markdown, and no way to see token counts before I burn through a context window. So I built my own wrapper around the OpenAI API. It is not complicated, but the process taught me a lot about what makes AI interfaces feel good versus feel annoying.
        </p>

        <ChatDemo />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Streaming is Not Optional</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The single biggest thing that makes an AI chat interface feel fast or slow is whether you stream the response. Without streaming you wait for the full response, then it appears all at once. With streaming you see characters appear almost immediately, which makes a 10-second response feel acceptable in a way a 10-second blank wait never does. The OpenAI API supports server-sent events for streaming. Wiring it up in a Next.js app takes about 20 lines.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg mb-8">
          <h3 className="text-sm font-medium mb-4 dark:text-white">Streaming response in a Next.js route handler</h3>
          <pre className="bg-zinc-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`// app/api/chat/route.ts
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? '';
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}`}
          </pre>
        </div>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">System Prompts Per Context</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          One of the most useful features I added was the ability to save system prompts as presets. When I am asking coding questions I want a different prompt than when I am asking for writing feedback. Storing a handful of named system prompts in localStorage and letting me switch between them with a dropdown took maybe an hour to build and improved how useful the tool felt for me personally by a lot.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The specific system prompts I use for coding work tell the model to keep responses concise, prefer TypeScript, assume Next.js App Router, and not repeat the question back to me. Small constraints like these make the output much more useful than the default general-purpose behavior.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Context Window Management</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The default ChatGPT interface gives you no visibility into how much context you have used. In a long conversation you can hit the limit and suddenly the model starts losing track of earlier parts of the discussion, often without making it obvious. I added a simple token counter (using the <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">tiktoken</code> library) that shows a bar filling up as the conversation grows and warns you when you are getting close. When the conversation is approaching the limit I automatically summarize older messages and replace them with the summary to keep the most relevant context.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What I Learned</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Building the interface made me a lot more aware of how much of the AI experience is actually UI rather than model quality. The model is the same. But whether responses feel fast or slow, whether you feel in control or confused, whether you can find a conversation from last week — all of that is interface design. The underlying model could double in capability and a bad interface would still make it frustrating to use.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          I also stopped using my custom wrapper after about three months when the official ChatGPT app improved enough to cover most of what I had built. That is fine. The exercise was still worth it. I understand the API well enough now that integrating GPT into other projects feels straightforward rather than mysterious.
        </p>
      </div>
    </article>
  );
};

export default ChatGPTInterface;
