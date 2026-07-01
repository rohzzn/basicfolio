'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CARD, L } from './demo-utils';

type BeamMode = 'full' | 'window' | 'region';
type BeamQuality = 'standard' | 'high' | 'maximum';
type Phase = 'record' | 'edit';

type ClickFx = { id: number; x: number; y: number };
type KeyFx = { id: number; x: number; y: number; label: string };

const MODES: { id: BeamMode; label: string }[] = [
  { id: 'full', label: 'Full screen' },
  { id: 'window', label: 'Window' },
  { id: 'region', label: 'Region' },
];

const QUALITY: { id: BeamQuality; label: string; hint: string }[] = [
  { id: 'standard', label: 'Standard', hint: 'Smaller file' },
  { id: 'high', label: 'High', hint: 'Balanced' },
  { id: 'maximum', label: 'Maximum', hint: 'Best quality' },
];

const KEY_LABELS = ['Click', '⌘ C', '⌘ V', 'Tab', 'Space', '⌘ S'];

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-600 dark:text-zinc-400">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 ${
          checked ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

const MODE_SHORT: Record<BeamMode, string> = {
  full: 'Screen',
  window: 'Window',
  region: 'Region',
};

function formatTime(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function FakeDesktop() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#1c1c1e_0%,#0f0f11_55%,#18181b_100%)]" />
      <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:18px_18px]" />
      <div className="absolute top-3 left-3 right-3 h-7 rounded-md bg-zinc-800/90 border border-zinc-700/70 flex items-center px-2 gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-400/90" />
        <span className="w-2 h-2 rounded-full bg-amber-400/90" />
        <span className="w-2 h-2 rounded-full bg-emerald-400/90" />
        <span className="ml-2 text-[9px] text-zinc-500 font-mono truncate">beam.rohan.run</span>
      </div>
      <div className="absolute top-12 left-3 right-3 bottom-3 rounded-lg bg-zinc-950/80 border border-zinc-800 overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-zinc-800/80">
          <p className="text-[11px] font-semibold text-zinc-100">Screen recording, beautifully simple.</p>
          <p className="text-[9px] text-zinc-500 mt-1 max-w-[85%] leading-relaxed">
            Record your screen, webcam, and mic — trim, export, transcribe locally.
          </p>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {['Capture', 'Webcam', 'Auto-zoom', 'Transcript'].map(item => (
            <div
              key={item}
              className="rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-2 text-[8px] text-zinc-400"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-3 right-3 h-7 rounded-md bg-zinc-900/90 border border-zinc-800 flex items-center justify-center">
          <span className="text-[8px] text-zinc-500">Download for Windows</span>
        </div>
      </div>
    </>
  );
}

export function BeamDemo() {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ active: boolean; ox: number; oy: number }>({ active: false, ox: 0, oy: 0 });
  const [phase, setPhase] = useState<Phase>('record');
  const [mode, setMode] = useState<BeamMode>('full');
  const [quality, setQuality] = useState<BeamQuality>('high');
  const [webcam, setWebcam] = useState(true);
  const [mic, setMic] = useState(true);
  const [systemAudio, setSystemAudio] = useState(true);
  const [keysOverlay, setKeysOverlay] = useState(true);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [savedDuration, setSavedDuration] = useState(0);
  const [webcamPos, setWebcamPos] = useState({ x: 78, y: 68 });
  const [webcamSize, setWebcamSize] = useState(48);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [clicks, setClicks] = useState<ClickFx[]>([]);
  const [keys, setKeys] = useState<KeyFx[]>([]);
  const [playhead, setPlayhead] = useState(35);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [exportFlash, setExportFlash] = useState<string | null>(null);
  const [waveSeed, setWaveSeed] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const tick = window.setInterval(() => setSeconds(s => s + 1), 1000);
    const wave = window.setInterval(() => setWaveSeed(n => n + 1), 120);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(wave);
    };
  }, [recording]);

  useEffect(() => {
    if (!zoom) return;
    const id = window.setTimeout(() => setZoom(null), 850);
    return () => window.clearTimeout(id);
  }, [zoom]);

  useEffect(() => {
    if (!exportFlash) return;
    const id = window.setTimeout(() => setExportFlash(null), 1600);
    return () => window.clearTimeout(id);
  }, [exportFlash]);

  const startRecording = () => {
    setPhase('record');
    setRecording(true);
    setSeconds(0);
    setClicks([]);
    setKeys([]);
    setZoom(null);
  };

  const stopRecording = () => {
    if (!recording) return;
    setRecording(false);
    if (seconds > 0) {
      setSavedDuration(seconds);
      setPhase('edit');
      setPlayhead(18);
    }
    setSeconds(0);
  };

  const onPreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'record' || !recording || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = Date.now();
    setClicks(prev => [...prev.slice(-5), { id, x, y }]);
    if (keysOverlay) {
      const label = KEY_LABELS[Math.floor(Math.random() * KEY_LABELS.length)];
      setKeys(prev => [...prev.slice(-2), { id: id + 1, x, y: y - 8, label }]);
      window.setTimeout(() => setKeys(prev => prev.filter(k => k.id !== id + 1)), 1200);
    }
    setZoom({ x, y });
    window.setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 700);
  };

  const onWebcamDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { active: true, ox: e.clientX, oy: e.clientY };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragRef.current.ox) / rect.width) * 100;
      const dy = ((e.clientY - dragRef.current.oy) / rect.height) * 100;
      dragRef.current.ox = e.clientX;
      dragRef.current.oy = e.clientY;
      setWebcamPos(p => ({
        x: Math.min(90, Math.max(6, p.x + dx)),
        y: Math.min(86, Math.max(10, p.y + dy)),
      }));
    };
    const onUp = () => {
      dragRef.current.active = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const onWebcamWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWebcamSize(s => Math.min(72, Math.max(36, s + (e.deltaY > 0 ? -4 : 4))));
  };

  const waveBars = useMemo(() => {
    void waveSeed;
    return Array.from({ length: 12 }, (_, i) => 20 + Math.abs(Math.sin(i * 1.7 + waveSeed * 0.35)) * 80);
  }, [waveSeed]);

  const captureFrame = (
    <>
      <div
        className="absolute inset-0 transition-[transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: zoom
            ? `scale(1.42) translate(${(50 - zoom.x) * 0.38}%, ${(50 - zoom.y) * 0.38}%)`
            : 'scale(1)',
        }}
      >
        <FakeDesktop />
        {mode === 'window' && (
          <div className="absolute top-12 left-3 right-3 bottom-3 rounded-lg ring-2 ring-sky-400/90 ring-offset-2 ring-offset-transparent pointer-events-none" />
        )}
        {mode === 'region' && (
          <div className="absolute left-[18%] top-[28%] w-[52%] h-[46%] rounded-md ring-2 ring-sky-400/90 bg-sky-400/5 pointer-events-none">
            <span className="absolute -top-5 left-0 text-[8px] font-mono text-sky-300/90">640 × 360</span>
          </div>
        )}
        {mode !== 'full' && (
          <div className="absolute inset-0 bg-black/45 pointer-events-none" />
        )}
      </div>

      {clicks.map(c => (
        <span
          key={c.id}
          className="absolute pointer-events-none"
          style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <span className="block w-3 h-3 rounded-full bg-white/90 beam-click-core" />
          <span className="absolute inset-0 -m-3 rounded-full border border-white/70 beam-click-ring" />
        </span>
      ))}

      {keys.map(k => (
        <span
          key={k.id}
          className="absolute -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/75 border border-white/15 text-[9px] font-mono text-white/90 beam-key-pop pointer-events-none"
          style={{ left: `${k.x}%`, top: `${k.y}%` }}
        >
          {k.label}
        </span>
      ))}

      {webcam && (
        <button
          type="button"
          onMouseDown={onWebcamDown}
          onWheel={onWebcamWheel}
          className="absolute rounded-full border-[2.5px] border-white shadow-[0_8px_24px_rgba(0,0,0,.45)] cursor-grab active:cursor-grabbing z-20 overflow-hidden bg-gradient-to-br from-zinc-400 to-zinc-700"
          style={{
            width: webcamSize,
            height: webcamSize,
            left: `${webcamPos.x}%`,
            top: `${webcamPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          aria-label="Drag webcam bubble. Scroll to resize."
        >
          <span className="absolute inset-[18%] rounded-full bg-zinc-200/90" />
        </button>
      )}

      {recording && (
        <>
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-red-500/30 rounded-[inherit]" />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500 text-[9px] font-semibold text-white shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            REC · {formatTime(seconds)}
          </div>
        </>
      )}

      <div
        className="absolute bottom-3 left-1/2 z-30 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-zinc-700/80 bg-zinc-950/90 px-2.5 py-1.5 shadow-xl backdrop-blur-md pointer-events-auto"
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
      >
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-red-600"
          >
            <span className="h-2 w-2 rounded-sm bg-white" />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
          >
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Record
          </button>
        )}
        <span className="h-3.5 w-px shrink-0 bg-zinc-600" aria-hidden />
        <span className="shrink-0 text-[9px] font-medium text-zinc-400">{MODE_SHORT[mode]}</span>
      </div>
    </>
  );

  return (
    <div className="my-8 not-prose">
      <p className={L}>Interactive Preview</p>
      <div className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Beam</span>
          </div>
          <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-900 p-0.5">
            {(['record', 'edit'] as Phase[]).map(tab => (
              <button
                key={tab}
                type="button"
                disabled={tab === 'edit' && savedDuration === 0}
                onClick={() => setPhase(tab)}
                className={`px-2.5 py-1 text-[10px] rounded-md capitalize transition-colors disabled:opacity-35 ${
                  phase === tab
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-800 p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/20">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Capture</p>
              <div className="space-y-1">
                {MODES.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-md transition-colors ${
                      mode === m.id
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Inputs</p>
              <div className="space-y-2">
                <Toggle label="Webcam bubble" checked={webcam} onChange={setWebcam} />
                <Toggle label="Microphone" checked={mic} onChange={setMic} />
                <Toggle label="System audio" checked={systemAudio} onChange={setSystemAudio} />
                <Toggle label="Keystroke overlay" checked={keysOverlay} onChange={setKeysOverlay} />
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Quality</p>
              <div className="space-y-1">
                {QUALITY.map(q => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuality(q.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors ${
                      quality === q.id
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="block text-[11px]">{q.label}</span>
                    <span className={`block text-[9px] ${quality === q.id ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>{q.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {recording && mic && (
              <div className="pt-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Mic level</p>
                <div className="flex items-end gap-0.5 h-8">
                  {waveBars.map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-sm bg-emerald-500/80 transition-[height] duration-100"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="p-4">
            {phase === 'record' ? (
              <div
                ref={previewRef}
                onClick={onPreviewClick}
                className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner select-none"
              >
                {captureFrame}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                  <FakeDesktop />
                  {webcam && (
                    <div
                      className="absolute rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-zinc-400 to-zinc-700"
                      style={{
                        width: webcamSize * 0.85,
                        height: webcamSize * 0.85,
                        left: `${webcamPos.x}%`,
                        top: `${webcamPos.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-zinc-400">Timeline · {formatTime(savedDuration)}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{formatTime(Math.floor((playhead / 100) * savedDuration))}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={playhead}
                    onChange={e => setPlayhead(Number(e.target.value))}
                    className="w-full accent-zinc-700 dark:accent-zinc-300"
                  />
                  <div className="mt-1 flex gap-1 h-1.5 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <div className="flex-[3] bg-zinc-400/70 dark:bg-zinc-500/70" />
                    <div className="w-px bg-zinc-300 dark:bg-zinc-600" />
                    <div className="flex-[2] bg-zinc-300/80 dark:bg-zinc-600/80" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    ['MP4', 'Exported MP4'],
                    ['GIF', 'Copied GIF'],
                    ['Transcript', 'Transcript ready'],
                  ].map(([label, done]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setExportFlash(done);
                        if (label === 'Transcript') setTranscriptOpen(true);
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Export {label}
                    </button>
                  ))}
                </div>

                {transcriptOpen && (
                  <div className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-3 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Offline transcript</p>
                    {[
                      '[00:02] Starting the walkthrough of Beam.',
                      '[00:08] Click anywhere and the recorder auto-zooms toward it.',
                      '[00:14] Everything stays on your machine — no upload step.',
                    ].map(line => (
                      <p key={line} className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">{line}</p>
                    ))}
                  </div>
                )}

                {exportFlash && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{exportFlash} · saved locally</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .beam-click-ring {
          animation: beam-ring 700ms ease-out forwards;
        }
        .beam-click-core {
          animation: beam-core 700ms ease-out forwards;
        }
        .beam-key-pop {
          animation: beam-key 1200ms ease-out forwards;
        }
        @keyframes beam-ring {
          0% { transform: scale(0.4); opacity: 0.9; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        @keyframes beam-core {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.6); opacity: 0; }
        }
        @keyframes beam-key {
          0% { opacity: 0; transform: translate(-50%, 4px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -6px); }
        }
      `}</style>
    </div>
  );
}
