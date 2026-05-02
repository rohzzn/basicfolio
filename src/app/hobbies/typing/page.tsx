"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCcw } from 'lucide-react';

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
const LINE_H = 32; // px — must match leading-8

function pick(n: number): string[] {
  return Array.from({ length: n }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
}

type Phase = 'idle' | 'running' | 'done';

export default function TypingTest() {
  const [timeOpt, setTimeOpt]   = useState<TimeOpt>(15);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [words, setWords]       = useState<string[]>(() => pick(200));
  const [wordIdx, setWordIdx]   = useState(0);
  const [typed, setTyped]       = useState('');
  const [correct, setCorrect]   = useState<boolean[]>([]);   // per-word result
  const [chars, setChars]       = useState({ ok: 0, bad: 0 });
  const [phase, setPhase]       = useState<Phase>('idle');
  const [capsLock, setCapsLock] = useState(false);
  const [slideY, setSlideY]     = useState(0);

  const inputRef   = useRef<HTMLInputElement>(null);
  const timerRef   = useRef<number | null>(null);
  const wordRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const timeOptRef = useRef<TimeOpt>(15);

  useEffect(() => { timeOptRef.current = timeOpt; }, [timeOpt]);

  const killTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    killTimer();
    wordRefs.current = [];
    setWords(pick(200));
    setWordIdx(0);
    setTyped('');
    setCorrect([]);
    setChars({ ok: 0, bad: 0 });
    setTimeLeft(timeOptRef.current);
    setPhase('idle');
    setSlideY(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [killTimer]);

  useEffect(() => {
    inputRef.current?.focus();
    return killTimer;
  }, [killTimer]);

  // Slide words up as active word moves to a new row
  useEffect(() => {
    const el = wordRefs.current[wordIdx];
    if (!el) return;
    setSlideY(Math.max(0, el.offsetTop - LINE_H));
  }, [wordIdx]);

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (phase === 'done') return;
    const val = e.target.value;

    if (phase === 'idle' && val.length > 0) {
      setPhase('running');
      startTimer();
    }

    if (val.endsWith(' ')) {
      const word = val.trimEnd();
      if (!word) { setTyped(''); return; }
      const target = words[wordIdx];
      const isCorrect = word === target;
      let ok = 1, bad = 0; // 1 = the space
      const len = Math.max(word.length, target.length);
      for (let i = 0; i < len; i++) {
        if (i < word.length && i < target.length && word[i] === target[i]) ok++;
        else bad++;
      }
      setCorrect(r => [...r, isCorrect]);
      setChars(s => ({ ok: s.ok + ok, bad: s.bad + bad }));
      setWordIdx(i => i + 1);
      setTyped('');
    } else {
      setTyped(val);
    }
  }, [phase, words, wordIdx, startTimer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState('CapsLock'));
    if (e.key === 'Tab') { e.preventDefault(); restart(); }
  }, [restart]);

  const switchTime = (t: TimeOpt) => {
    timeOptRef.current = t;
    setTimeOpt(t);
    killTimer();
    wordRefs.current = [];
    setWords(pick(200));
    setWordIdx(0);
    setTyped('');
    setCorrect([]);
    setChars({ ok: 0, bad: 0 });
    setTimeLeft(t);
    setPhase('idle');
    setSlideY(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const elapsed      = timeOpt - timeLeft;
  const correctWords = correct.filter(Boolean).length;
  const totalChars   = chars.ok + chars.bad;
  const wpm      = phase === 'done' && elapsed > 0 ? Math.round((correctWords / elapsed) * 60) : 0;
  const rawWpm   = phase === 'done' && elapsed > 0 ? Math.round((wordIdx / elapsed) * 60) : 0;
  const accuracy = totalChars > 0 ? Math.round((chars.ok / totalChars) * 100) : 100;
  const liveWpm  = phase === 'running' && elapsed > 1
    ? Math.round((correct.filter(Boolean).length / elapsed) * 60) : 0;

  return (
    <div className="max-w-2xl">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-lg font-medium dark:text-white">Typing</h2>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          my best — {ROHAN_WPM} wpm
        </span>
      </div>

      {phase !== 'done' && (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              {TIME_OPTIONS.map(t => (
                <button key={t} onClick={() => switchTime(t)}
                  className={`text-sm transition-colors ${
                    timeOpt === t
                      ? 'text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm tabular-nums">
              {liveWpm > 0 && (
                <span className="text-zinc-400 dark:text-zinc-500">{liveWpm}</span>
              )}
              <span className={`font-medium ${
                phase === 'running' && timeLeft <= 5
                  ? 'text-red-500'
                  : 'text-zinc-900 dark:text-white'
              }`}>
                {timeLeft}s
              </span>
              <button
                onClick={restart}
                className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                aria-label="restart"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Word display — 3 rows, slides up as you progress */}
          <div
            className="relative overflow-hidden cursor-text select-none mb-3"
            style={{ height: `${LINE_H * 3}px` }}
            onClick={() => inputRef.current?.focus()}
          >
            <div
              className="font-mono text-sm leading-8 flex flex-wrap gap-x-2"
              style={{
                transform: `translateY(-${slideY}px)`,
                transition: 'transform 0.15s ease',
                willChange: 'transform',
              }}
            >
              {words.map((word, wi) => {
                const isCurrent = wi === wordIdx;
                const isDone    = wi < wordIdx;
                const isOk      = correct[wi];

                return (
                  <span
                    key={wi}
                    ref={el => { wordRefs.current[wi] = el; }}
                    className={
                      isDone
                        ? isOk
                          ? 'text-zinc-400 dark:text-zinc-500'
                          : 'text-red-400 dark:text-red-500'
                        : isCurrent
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-300 dark:text-zinc-600'
                    }
                  >
                    {isCurrent && phase !== 'idle'
                      ? (
                          <>
                            {word.split('').map((ch, ci) => {
                              const t = typed[ci];
                              const isCursor = ci === typed.length;
                              return (
                                <span
                                  key={ci}
                                  className={[
                                    isCursor ? 'border-l-2 border-zinc-800 dark:border-zinc-200' : '',
                                    t === undefined
                                      ? 'text-zinc-400 dark:text-zinc-500'
                                      : t === ch
                                        ? 'text-zinc-900 dark:text-zinc-100'
                                        : 'text-red-500 dark:text-red-400',
                                  ].filter(Boolean).join(' ')}
                                >
                                  {ch}
                                </span>
                              );
                            })}
                            {typed.length >= word.length && (
                              <span className="border-r-2 border-zinc-800 dark:border-zinc-200 inline-block w-0 h-[1em] align-baseline" />
                            )}
                          </>
                        )
                      : word
                    }
                  </span>
                );
              })}
            </div>

            {phase === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  start typing to begin
                </p>
              </div>
            )}
          </div>

          {capsLock && (
            <p className="text-xs text-amber-500 mb-2">caps lock is on</p>
          )}
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            tab — reset · space — next word
          </p>

          <input
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={phase === 'done'}
            style={{ position: 'fixed', top: '-200px', left: 0, opacity: 0, width: '1px', height: '1px' }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="typing input"
          />
        </>
      )}

      {/* Results */}
      {phase === 'done' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'wpm',  val: `${wpm}`,  color: '' },
              { label: 'raw',  val: `${rawWpm}`, color: '' },
              { label: 'acc',  val: `${accuracy}%`, color: '' },
              {
                label: 'vs me',
                val: `${wpm - ROHAN_WPM >= 0 ? '+' : ''}${wpm - ROHAN_WPM}`,
                color: wpm >= ROHAN_WPM ? 'text-green-500' : 'text-red-500',
              },
            ].map(({ label, val, color }) => (
              <div key={label} className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  {label}
                </p>
                <p className={`text-2xl font-medium tabular-nums ${color || 'text-zinc-900 dark:text-white'}`}>
                  {val}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-zinc-700 dark:text-zinc-300"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Try again
            </button>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">or press tab</p>
          </div>
        </div>
      )}
    </div>
  );
}
