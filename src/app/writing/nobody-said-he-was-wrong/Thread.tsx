'use client';

import React, { useState } from 'react';

// ── The thread ───────────────────────────────────────────────────────────────

interface ThreadPost {
  id: string;
  text: string;
}

const THREAD_AUTHOR = {
  name: 'Jacob Coxon',
  handle: 'hilbertspaess',
  bio: 'Pretraining research at OpenAI, then Anthropic',
  monogram: 'JC',
};

const THREAD: ThreadPost[] = [
  {
    id: '2097476196791709843',
    text: 'I resigned from Anthropic today. I spent the last three years doing pretraining research at both OpenAI and Anthropic. Neither company is acting responsibly. They are racing straight to self-improving superintelligence and gambling with our lives. More thoughts below.',
  },
  {
    id: '2097476201283834281',
    text: 'Do not underestimate the power of this technology. These will soon be superhuman systems that can hack anything, revolutionize any field overnight, and acquire real power and resources. We have all witnessed the progress in each of these domains, and progress is not slowing.',
  },
  {
    id: '2097476203863224394',
    text: 'The people building AI earnestly believe that it could kill us all by the end of the decade. This is not a marketing stunt. If anything, many executives and senior researchers will couch their phrasing in the press to sound sensible - but I hear the same people express fear privately. No other human activity poses this level of danger.',
  },
  {
    id: '2097476208908972230',
    text: 'A common response is “if they truly believe this, why are they still building it?” At OpenAI, many have not deeply internalized the civilizational stakes. At Anthropic, the stakes are well-understood, but they are locked in a race to get there first - they believe no one else will act responsibly, so they must do it themselves, despite the risk.',
  },
  {
    id: '2097476213942198651',
    text: 'Accepting this race and entering the “endgame” is a hubristic gamble that should not be launched from a private company’s Slack. Attempting to speedrun alignment should require extraordinary confidence that there are no better trajectories available.',
  },
  {
    id: '2097476216139968662',
    text: 'I am optimistic about the potential for coordination. Warning shots like the Hugging Face attack have made pacing agreements between U.S. labs more viable. I don’t feel like we’re on track to prevent a global race, which may require costly actions such as a temporary ban on improving model capabilities.',
  },
  {
    id: '2097476219138867492',
    text: 'If you are a lab researcher, I urge you to consider what the next few years will actually feel like. Do you want to kick off a superintelligent RL run without a rigorous understanding of its mind? Should you put your head down because “it’s happening anyway” - or take this moment to call for different conditions?',
  },
];

// ── The reply ────────────────────────────────────────────────────────────────

const REPLY = {
  name: 'Evan Hubinger',
  handle: 'EvanHub',
  bio: 'Alignment Science lead, Anthropic — “Opinions my own”',
  monogram: 'EH',
  id: '2097497037956891126',
  text: 'Jacob is correct here—we really do earnestly believe AI could kill all humans! I personally think it is >10% within the next decade. I believe Anthropic is trying its best, but we do not yet have a plan to solve alignment for superintelligence and are not clearly on track to.',
  quoting: THREAD[2],
};

// ── UI ───────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'thread' as const, label: 'The thread' },
  { key: 'reply' as const, label: 'The reply' },
];

const CARD = 'border border-zinc-200 dark:border-neutral-800 rounded-lg overflow-hidden';
const BAND = 'bg-zinc-50 dark:bg-neutral-800/40';
const BODY = 'text-sm text-zinc-700 dark:text-neutral-200 leading-relaxed';

function xLink(handle: string, id: string) {
  return `https://x.com/${handle}/status/${id}`;
}

function Byline({
  name,
  handle,
  bio,
  monogram,
}: {
  name: string;
  handle: string;
  bio: string;
  monogram: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-neutral-800 ${BAND}`}
    >
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border border-zinc-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <span className="text-[10px] font-medium tracking-wide text-zinc-600 dark:text-neutral-300">
          {monogram}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-neutral-100">{name}</span>
          <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">@{handle}</span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-neutral-400 truncate">{bio}</p>
      </div>
    </div>
  );
}

function ViewLink({ href }: { href: string }) {
  return (
    <div className="flex justify-end mt-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-zinc-400 dark:text-neutral-500 hover:text-zinc-700 dark:hover:text-neutral-200 transition-colors"
      >
        view
      </a>
    </div>
  );
}

export default function Thread() {
  const [tab, setTab] = useState<'thread' | 'reply'>('thread');

  return (
    <div className="my-6">
      <div className="flex flex-wrap gap-2 mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tab === t.key
                ? 'bg-zinc-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 hover:bg-zinc-200 dark:hover:bg-neutral-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'thread' ? (
        <div className={CARD}>
          <Byline {...THREAD_AUTHOR} />

          <div className="px-4 py-1">
            {THREAD.map((post, i) => (
              <div key={post.id} className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center flex-shrink-0 pt-4 w-5">
                  <span className="text-[10px] font-mono leading-none text-zinc-400 dark:text-neutral-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-zinc-300 dark:bg-neutral-600" />
                  {i < THREAD.length - 1 && (
                    <div className="w-px flex-1 mt-1.5 bg-zinc-200 dark:bg-neutral-800" />
                  )}
                </div>

                <div
                  className={`flex-1 min-w-0 py-4 ${
                    i < THREAD.length - 1 ? 'border-b border-zinc-100 dark:border-neutral-800' : ''
                  }`}
                >
                  <p className={BODY}>{post.text}</p>
                  <ViewLink href={xLink(THREAD_AUTHOR.handle, post.id)} />
                </div>
              </div>
            ))}
          </div>

          <div className={`px-4 py-2.5 border-t border-zinc-200 dark:border-neutral-800 ${BAND}`}>
            <span className="text-xs text-zinc-500 dark:text-neutral-400">
              Posted 9 September 2026, 00:04 UTC
            </span>
          </div>
        </div>
      ) : (
        <div className={CARD}>
          <Byline {...REPLY} />

          <div className="px-4 py-4">
            <p className={BODY}>{REPLY.text}</p>

            <div className="mt-4 rounded-lg p-3 border border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-800/30">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-xs font-medium text-zinc-700 dark:text-neutral-200">
                  {THREAD_AUTHOR.name}
                </span>
                <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
                  @{THREAD_AUTHOR.handle}
                </span>
                <span className="text-xs font-mono text-zinc-400 dark:text-neutral-500">
                  · post 3
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-neutral-300 leading-relaxed">
                {REPLY.quoting.text}
              </p>
            </div>

            <ViewLink href={xLink(REPLY.handle, REPLY.id)} />
          </div>

          <div className={`px-4 py-2.5 border-t border-zinc-200 dark:border-neutral-800 ${BAND}`}>
            <span className="text-xs text-zinc-500 dark:text-neutral-400">
              Posted 9 September 2026, 01:27 UTC — 83 minutes after the thread
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
