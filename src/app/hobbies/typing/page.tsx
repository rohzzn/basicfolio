"use client";

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import { clack, ding } from '@/lib/site-sound';
import './typewriter.css';

// The typing test as a typewriter. The words are rolled into the machine on a sheet of paper, faint
// until you strike them; the carriage carries the sheet left a letter at a time so each one lands
// under the type guide, and at the end of a line the bell rings and the carriage runs back. When
// the time is up the sheet comes out with the score typed at the bottom.

const WORDS = [
  'the', 'be', 'to', 'of', 'and', 'in', 'it', 'for', 'not', 'on', 'with', 'as', 'you', 'do', 'at',
  'about', 'above', 'after', 'again', 'alone', 'along', 'apple', 'beach', 'begin', 'black', 'bring',
  'carry', 'cease', 'chain', 'chair', 'clean', 'clear', 'climb', 'close', 'cloud', 'color', 'dream',
  'drink', 'drive', 'early', 'earth', 'email', 'empty', 'enter', 'equal', 'every', 'focus', 'force',
  'frame', 'fresh', 'front', 'grass', 'great', 'green', 'group', 'guard', 'guest', 'happy', 'heart',
  'horse', 'house', 'image', 'index', 'input', 'knife', 'large', 'learn', 'level', 'light', 'limit',
  'local', 'logic', 'magic', 'metro', 'money', 'mouse', 'music', 'night', 'noise', 'north', 'novel',
  'ocean', 'order', 'other', 'paper', 'party', 'peace', 'phone', 'pilot', 'place', 'plane', 'plant',
  'plate', 'point', 'power', 'press', 'price', 'prize', 'quiet', 'quick', 'radio', 'range', 'ratio',
  'reply', 'river', 'route', 'scope', 'score', 'shape', 'share', 'sharp', 'sleep', 'smile', 'smoke',
  'solid', 'sound', 'south', 'space', 'speak', 'speed', 'sport', 'squad', 'staff', 'stage', 'stand',
  'start', 'state', 'steam', 'steel', 'stick', 'still', 'stock', 'stone', 'store', 'storm', 'story',
  'style', 'sugar', 'table', 'taste', 'theme', 'thing', 'thumb', 'tiger', 'title', 'total', 'touch',
  'tower', 'track', 'trade', 'action', 'agenda', 'almost', 'always', 'animal', 'answer', 'anyone',
  'appear', 'around', 'arrive', 'artist', 'aspect', 'assume', 'attack', 'attend', 'author', 'battle',
  'beauty', 'became', 'become', 'before', 'behind', 'better', 'beyond', 'breath', 'bridge', 'bright',
  'broken', 'budget', 'button', 'camera', 'cannot', 'carbon', 'career', 'castle', 'casual', 'caught',
  'center', 'chance', 'change', 'charge', 'choice', 'choose', 'chosen', 'church', 'circle', 'client',
  'closed', 'closer', 'coffee', 'column', 'combat', 'coming', 'common', 'cookie', 'corner', 'couple',
  'course', 'create', 'credit', 'crisis', 'custom', 'damage', 'danger', 'dealer', 'debate', 'decade',
  'decide', 'defeat', 'defend', 'define', 'degree', 'delete', 'demand', 'depend', 'design', 'desire',
  'detail', 'detect', 'device', 'differ', 'dinner', 'direct', 'doctor', 'dollar', 'domain', 'double',
  'driven', 'driver', 'during', 'easily', 'editor', 'effect', 'effort', 'either', 'energy', 'engage',
  'engine', 'enough', 'ensure', 'entire', 'entity', 'escape', 'estate', 'exceed', 'except', 'expand',
  'expect', 'expert', 'export', 'extend', 'facing', 'factor', 'failed', 'fairly', 'family', 'famous',
  'father', 'fellow', 'female', 'figure', 'finger', 'finish', 'flight', 'follow', 'forced', 'forest',
  'forget', 'formal', 'format', 'former', 'foster', 'fourth', 'friend', 'future', 'garden', 'gather',
  'gender', 'gentle', 'getting', 'giving', 'global', 'golden', 'ground', 'growth', 'handle', 'happen',
  'having', 'health', 'hidden', 'higher', 'hinder', 'honest', 'impact', 'income', 'indeed', 'inside',
  'invite', 'island', 'issued', 'itself', 'joined', 'junior', 'justice', 'keeper', 'killed', 'launch',
  'leader', 'length', 'linear', 'linked', 'listen', 'living', 'longer', 'losing', 'lowest', 'making',
  'manage', 'margin', 'market', 'master', 'matter', 'member', 'mental', 'method', 'middle', 'mining',
  'minute', 'mirror', 'mobile', 'modern', 'moment', 'motion', 'moving', 'mutual', 'narrow', 'native',
  'needed', 'nested', 'network', 'normal', 'notice', 'number', 'object', 'office', 'online', 'output',
  'parent', 'passed', 'patent', 'paying', 'person', 'phrase', 'pickup', 'planet', 'player', 'pocket',
  'policy', 'portal', 'posted', 'prefer', 'pretty', 'profit', 'prompt', 'proven', 'public', 'pulled',
  'purple', 'pushed', 'puzzle', 'python', 'raised', 'random', 'rarely', 'reader', 'recent', 'record',
  'reduce', 'render', 'repair', 'repeat', 'report', 'return', 'review', 'reward', 'safely', 'saving',
  'search', 'second', 'secret', 'sector', 'select', 'senior', 'server', 'settle', 'should', 'signal',
  'silent', 'silver', 'simple', 'single', 'skills', 'slowly', 'socket', 'source', 'stable', 'status',
  'steady', 'stream', 'strict', 'string', 'strong', 'struct', 'studio', 'submit', 'supply', 'switch',
  'system', 'target', 'taught', 'tester', 'tested', 'ticket', 'timing', 'toggle', 'toward', 'travel',
  'trying', 'tunnel', 'unique', 'update', 'useful', 'values', 'vector', 'vendor', 'verify', 'viewer',
  'vision', 'visual', 'volume', 'weekly', 'weight', 'window', 'within', 'worker', 'writes', 'yellow',
];

const TIME_OPTIONS = [15, 30, 60] as const;
type TimeOpt = (typeof TIME_OPTIONS)[number];
const ROHAN_WPM = 115;
const LINE = 30; // characters to a line of the sheet
const MARGIN = 3; // characters of paper either side of a line
const LINE_EM = 2; // must match the sheet's line-height
const EXTRA = 8; // letters you can type past the end of a word

const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
] as const;

function pick(n: number): string[] {
  return Array.from({ length: n }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
}

// Whole words onto lines of at most LINE characters, as the bell would have you break them.
function layoutLines(words: string[]): { lines: number[][]; lineOf: number[] } {
  const lines: number[][] = [];
  const lineOf: number[] = [];
  let cur: number[] = [];
  let len = 0;
  words.forEach((w, i) => {
    const need = cur.length ? len + 1 + w.length : w.length;
    if (cur.length && need > LINE) {
      lines.push(cur);
      cur = [];
      len = 0;
    }
    len = cur.length ? len + 1 + w.length : w.length;
    cur.push(i);
    lineOf[i] = lines.length;
  });
  if (cur.length) lines.push(cur);
  return { lines, lineOf };
}

// A typewriter's letters never quite line up: each struck one sits a touch high or low, a touch
// light or dark, the same way every time it is drawn.
function inkOf(word: number, k: number): React.CSSProperties {
  let h = Math.imul(word * 131 + k * 17 + 7, 2654435761) >>> 0;
  const a = (h & 1023) / 1023;
  h = Math.imul(h ^ (h >>> 13), 2246822519) >>> 0;
  const b = (h & 1023) / 1023;
  return { position: 'relative', top: `${((a - 0.5) * 1.3).toFixed(2)}px`, opacity: 0.78 + b * 0.22 };
}

type Mode = 'done' | 'current' | 'todo';

const Word = memo(function Word({
  index,
  target,
  typed,
  mode,
}: {
  index: number;
  target: string;
  typed: string;
  mode: Mode;
}) {
  if (mode === 'todo') return <span className="tw-guide-text">{target}</span>;

  const len = Math.max(target.length, typed.length);
  const letters = [];
  for (let k = 0; k < len; k++) {
    const t = target[k];
    const u = typed[k];
    const caret = mode === 'current' && k === typed.length;
    const cls = [
      u === undefined ? 'tw-guide-text' : u === t ? '' : 'tw-miss',
      caret ? 'tw-caret' : '',
    ]
      .filter(Boolean)
      .join(' ');
    letters.push(
      <span key={k} className={cls || undefined} style={u === undefined ? undefined : inkOf(index, k)}>
        {mode === 'current' && k === typed.length - 1 ? <span className="tw-strike">{u}</span> : u ?? t}
      </span>
    );
  }
  const wrong = mode === 'done' && typed !== target;
  return (
    <span className={wrong ? 'tw-wrong' : undefined}>
      {letters}
      {mode === 'current' && typed.length >= target.length ? <span className="tw-caret-end" /> : null}
    </span>
  );
});

function useWide(): boolean {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const m = window.matchMedia('(min-width: 640px)');
    const sync = () => setWide(m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  }, []);
  return wide;
}

function Machine({ activeKey }: { activeKey: string }) {
  return (
    <svg className="tw-body tw-type" viewBox="0 0 480 196" aria-hidden>
      <path className="tw-body-shell" d="M52 2 L428 2 L468 178 Q470 192 456 192 L24 192 Q10 192 12 178 Z" />
      <path className="tw-body-trim" d="M60 12 L420 12" />
      <rect className="tw-plate" x="206" y="20" width="68" height="16" rx="3" />
      <text x="240" y="32" textAnchor="middle" className="tw-hand" style={{ fontSize: 12, fill: '#24232e' }}>
        rohan
      </text>
      {KEY_ROWS.map((row, ri) => {
        const y = 62 + ri * 36;
        const x0 = 240 - ((row.length - 1) * 36) / 2 + (ri === 1 ? 4 : ri === 2 ? 8 : 0);
        return row.map((k, i) => (
          <g key={k} className={`tw-key ${activeKey === k ? 'tw-key-down' : ''}`}>
            <g>
              <circle cx={x0 + i * 36} cy={y} r={14} />
              <text x={x0 + i * 36} y={y + 4} textAnchor="middle">
                {k}
              </text>
            </g>
          </g>
        ));
      })}
      <g className={`tw-key ${activeKey === ' ' ? 'tw-key-down' : ''}`}>
        <g>
          <rect x="150" y="160" width="180" height="16" rx="8" fill="var(--tw-key)" stroke="var(--tw-line)" strokeWidth="1.3" />
        </g>
      </g>
    </svg>
  );
}

type Phase = 'idle' | 'running' | 'done';

export default function TypingTest() {
  const [timeOpt, setTimeOpt] = useState<TimeOpt>(15);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [words, setWords] = useState<string[]>([]);
  const [wordIdx, setWordIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [chars, setChars] = useState({ ok: 0, bad: 0 });
  const [phase, setPhase] = useState<Phase>('idle');
  const [capsLock, setCapsLock] = useState(false);
  const [activeKey, setActiveKey] = useState('');
  const [typing, setTyping] = useState(false);
  const [returning, setReturning] = useState(false);
  const [bell, setBell] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const timeOptRef = useRef<TimeOpt>(15);
  const keyTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const lastLine = useRef(0);
  const wide = useWide();

  const { lines, lineOf } = useMemo(() => layoutLines(words), [words]);
  const line = lineOf[wordIdx] ?? 0;

  // how far along the line the next letter falls, counting the words already struck at the
  // length they were typed
  const col = useMemo(() => {
    let c = 0;
    for (const j of lines[line] ?? []) {
      if (j >= wordIdx) break;
      c += Math.max(words[j].length, (typedWords[j] ?? '').length) + 1;
    }
    return c + typed.length;
  }, [lines, line, wordIdx, words, typedWords, typed.length]);

  const killTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(
    (t: TimeOpt) => {
      killTimer();
      setWords(pick(200));
      setWordIdx(0);
      setTyped('');
      setTypedWords([]);
      setChars({ ok: 0, bad: 0 });
      setTimeLeft(t);
      setPhase('idle');
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [killTimer]
  );

  const restart = useCallback(() => reset(timeOptRef.current), [reset]);

  const switchTime = (t: TimeOpt) => {
    timeOptRef.current = t;
    setTimeOpt(t);
    reset(t);
  };

  useEffect(() => {
    // the words are picked in the browser, so the page the server sends and the one that
    // hydrates agree
    setWords(pick(200));
    inputRef.current?.focus();
    return killTimer;
  }, [killTimer]);

  // a fresh sheet is ready to type on straight away
  useEffect(() => {
    if (phase === 'idle') inputRef.current?.focus();
  }, [phase]);

  // at the end of a line the bell rings and the carriage runs back
  useEffect(() => {
    const prev = lastLine.current;
    lastLine.current = line;
    if (line <= prev) {
      setReturning(false);
      return;
    }
    setReturning(true);
    setBell((b) => b + 1);
    ding();
    const t = window.setTimeout(() => setReturning(false), 420);
    return () => window.clearTimeout(t);
  }, [line]);

  // with the sheet out of the machine, tab still starts again
  useEffect(() => {
    if (phase !== 'done') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      restart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, restart]);

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (phase === 'done') return;
      const val = e.target.value;

      if (phase === 'idle' && val.length > 0) {
        setPhase('running');
        startTimer();
      }

      if (val.endsWith(' ')) {
        const word = val.trimEnd();
        if (!word) {
          setTyped('');
          return;
        }
        const target = words[wordIdx] ?? '';
        let ok = 1; // the space
        let bad = 0;
        const len = Math.max(word.length, target.length);
        for (let i = 0; i < len; i++) {
          if (i < word.length && i < target.length && word[i] === target[i]) ok++;
          else bad++;
        }
        setTypedWords((r) => [...r, word]);
        setChars((s) => ({ ok: s.ok + ok, bad: s.bad + bad }));
        setWordIdx((i) => i + 1);
        setTyped('');
      } else {
        setTyped(val.slice(0, (words[wordIdx]?.length ?? 0) + EXTRA));
      }
    },
    [phase, words, wordIdx, startTimer]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      setCapsLock(e.getModifierState('CapsLock'));
      if (e.key === 'Tab') {
        e.preventDefault();
        restart();
        return;
      }
      const k = e.key === ' ' ? ' ' : e.key.length === 1 ? e.key.toLowerCase() : '';
      if (k || e.key === 'Backspace') clack(k === ' ' ? 'space' : 'key');
      if (k) {
        setActiveKey(k);
        if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
        keyTimerRef.current = window.setTimeout(() => setActiveKey(''), 130);
      }
      // the caret holds still while you type and blinks again when you stop
      setTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = window.setTimeout(() => setTyping(false), 600);
    },
    [restart]
  );

  const elapsed = timeOpt - timeLeft;
  const correctWords = typedWords.filter((w, i) => w === words[i]).length;
  const totalChars = chars.ok + chars.bad;
  const wpm = phase === 'done' && elapsed > 0 ? Math.round((correctWords / elapsed) * 60) : 0;
  const rawWpm = phase === 'done' && elapsed > 0 ? Math.round((wordIdx / elapsed) * 60) : 0;
  const accuracy = totalChars > 0 ? Math.round((chars.ok / totalChars) * 100) : 100;
  const liveWpm = phase === 'running' && elapsed > 1 ? Math.round((correctWords / elapsed) * 60) : 0;

  const modeOf = (i: number): Mode => (i < wordIdx ? 'done' : i === wordIdx ? 'current' : 'todo');
  const shift = wide ? -(MARGIN + col) : -(LINE / 2 + MARGIN);

  const verdict =
    wpm > ROHAN_WPM
      ? `${wpm - ROHAN_WPM} faster than rohan. well typed.`
      : wpm === ROHAN_WPM
        ? 'dead level with rohan.'
        : `${ROHAN_WPM - wpm} short of rohan's ${ROHAN_WPM}.`;

  return (
    <div className="tw max-w-2xl">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-lg font-medium dark:text-paper">Typing</h2>
        <span className="text-xs text-zinc-400 dark:text-neutral-400">my best: {ROHAN_WPM} wpm</span>
      </div>

      {phase !== 'done' ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-4">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => switchTime(t)}
                  className={`text-sm transition-colors ${
                    timeOpt === t
                      ? 'font-medium text-zinc-900 dark:text-paper'
                      : 'text-zinc-400 hover:text-zinc-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm tabular-nums">
              {liveWpm > 0 && <span className="text-zinc-400 dark:text-neutral-400">{liveWpm} wpm</span>}
              <span
                className={`font-medium ${
                  phase === 'running' && timeLeft <= 5 ? 'text-red-500' : 'text-zinc-900 dark:text-paper'
                }`}
              >
                {timeLeft}s
              </span>
              <button
                onClick={restart}
                className="text-zinc-400 transition-colors hover:text-zinc-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                aria-label="restart"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            className={`tw-stage tw-type ${typing ? 'tw-typing' : ''}`}
            onClick={() => inputRef.current?.focus()}
            aria-hidden
          >
            <div
              className={`tw-sheet ${returning ? 'tw-returning' : ''}`}
              style={{ transform: `translate(${shift}ch, ${-line * LINE_EM}em)` }}
            >
              {lines.map((ws, li) => (
                <div key={li}>
                  {ws.map((i, n) => (
                    <React.Fragment key={i}>
                      {n > 0 ? ' ' : null}
                      <Word index={i} target={words[i]} typed={typedWords[i] ?? (i === wordIdx ? typed : '')} mode={modeOf(i)} />
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
            {wide ? <span className="tw-point" /> : null}
            <div className="tw-roller" />
            {bell > 0 ? (
              <span key={bell} className="tw-ding tw-hand">
                ding!
              </span>
            ) : null}
            {phase === 'idle' ? (
              <p className="absolute left-0 right-0 top-3 text-center font-sans text-xs text-zinc-400 dark:text-neutral-400">
                start typing to begin
              </p>
            ) : null}
          </div>

          <Machine activeKey={activeKey} />

          <p className="mt-4 text-center text-xs text-zinc-400 dark:text-neutral-400">
            {capsLock ? <span className="text-amber-500">caps lock is on · </span> : null}
            tab: start over · space: next word
          </p>

          <input
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ position: 'fixed', top: '-200px', left: 0, opacity: 0, width: '1px', height: '1px' }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="typing input"
          />
        </>
      ) : (
        <div>
          <motion.div
            className="tw-result tw-type"
            initial={{ y: 90, opacity: 0, rotate: 0 }}
            animate={{ y: 0, opacity: 1, rotate: -0.6 }}
            transition={{ type: 'spring', stiffness: 110, damping: 17 }}
          >
            {lines.slice(0, line + 1).map((ws, li) => (
              <div key={li}>
                {ws
                  .filter((i) => i < wordIdx)
                  .map((i, n) => (
                    <React.Fragment key={i}>
                      {n > 0 ? ' ' : null}
                      <Word index={i} target={words[i]} typed={typedWords[i]} mode="done" />
                    </React.Fragment>
                  ))}
              </div>
            ))}
            <div className="tw-rule" />
            <p>
              {wpm} wpm · raw {rawWpm} · {accuracy}% accurate
            </p>
            <p>{verdict}</p>
            <div className="tw-stamp">
              {wpm >= ROHAN_WPM ? 'FASTER THAN ROHAN' : `${wpm} WPM`}
              <small>{timeOpt} second test</small>
            </div>
          </motion.div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800/60"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Roll in a fresh sheet
            </button>
            <p className="text-xs text-zinc-400 dark:text-neutral-400">or press tab</p>
          </div>
        </div>
      )}
    </div>
  );
}
