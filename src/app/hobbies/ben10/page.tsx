"use client";

import React, { useEffect, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";

const WASD_TO_ARROW: Record<string, string> = {
  w: "ArrowUp",
  a: "ArrowLeft",
  s: "ArrowDown",
  d: "ArrowRight",
};

const J_TO_SPACE = "j"; // J key -> Space (attack)
const K_TO_Z = "k"; // K key -> Z (transform)

declare global {
  interface Window {
    RufflePlayer?: {
      newest: () => { createPlayer: () => RufflePlayer; [key: string]: unknown };
    };
  }
}

interface RufflePlayer {
  load: (config: {
    url: string;
    allowScriptAccess?: boolean;
    backgroundColor?: string;
    letterbox?: string;
    unmuteOverlay?: string;
    wmode?: string;
    quality?: string;
    scale?: string;
  }) => Promise<void>;
  volume?: number;
}

type PressedKeys = {
  up: boolean;
  left: boolean;
  down: boolean;
  right: boolean;
  attack: boolean;
  transform: boolean;
};

const INITIAL_PRESSED: PressedKeys = {
  up: false,
  left: false,
  down: false,
  right: false,
  attack: false,
  transform: false,
};

function keyToDisplay(key: string): keyof PressedKeys | null {
  const k = key.toLowerCase();
  if (k === "w" || k === "arrowup") return "up";
  if (k === "a" || k === "arrowleft") return "left";
  if (k === "s" || k === "arrowdown") return "down";
  if (k === "d" || k === "arrowright") return "right";
  if (k === "j") return "attack";
  if (k === "k") return "transform";
  return null;
}

export default function Ben10Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ruffleContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<PressedKeys>(INITIAL_PRESSED);

  const loadRuffleScript = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.RufflePlayer) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@ruffle-rs/ruffle";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => setError("Failed to load Ruffle emulator");
      document.head.appendChild(script);
    });
  };

  const initGame = async () => {
    setStarted(true);
    setLoading(true);
    setError(null);
    try {
      await loadRuffleScript();
      const ruffle = window.RufflePlayer?.newest();
      if (!ruffle || !ruffleContainerRef.current) {
        setError("Ruffle not available");
        return;
      }
      const player = ruffle.createPlayer() as RufflePlayer;
      ruffleContainerRef.current.innerHTML = "";
      ruffleContainerRef.current.appendChild(player as unknown as Node);
      await player.load({
        url: "/games/ben10/main.swf",
        allowScriptAccess: true,
        backgroundColor: "#000000",
        letterbox: "off",
        unmuteOverlay: "hidden",
        wmode: "opaque",
        quality: "high",
        scale: "exactFit",
      });
      if (typeof player.volume === "number") player.volume = 0.5;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (!started) return;
    const target = () => ruffleContainerRef.current ?? document.body;

    const updatePressed = (key: string, pressed: boolean) => {
      const display = keyToDisplay(key);
      if (display) {
        setPressedKeys((prev) => ({ ...prev, [display]: pressed }));
      }
    };

    const mapKey = (e: KeyboardEvent, type: "keydown" | "keyup") => {
      const key = e.key.toLowerCase();
      const pressed = type === "keydown";
      updatePressed(e.key, pressed);

      const arrow = WASD_TO_ARROW[key];
      if (arrow) {
        e.preventDefault();
        target().dispatchEvent(
          new KeyboardEvent(type, {
            key: arrow,
            code: arrow,
            bubbles: true,
            cancelable: true,
          })
        );
        return;
      }
      if (key === J_TO_SPACE) {
        e.preventDefault();
        target().dispatchEvent(
          new KeyboardEvent(type, {
            key: " ",
            code: "Space",
            bubbles: true,
            cancelable: true,
          })
        );
      }
      if (key === K_TO_Z) {
        e.preventDefault();
        target().dispatchEvent(
          new KeyboardEvent(type, {
            key: "z",
            code: "KeyZ",
            bubbles: true,
            cancelable: true,
          })
        );
      }
    };

    const onKeyDown = (e: KeyboardEvent) => mapKey(e, "keydown");
    const onKeyUp = (e: KeyboardEvent) => mapKey(e, "keyup");
    const onBlur = () => setPressedKeys(INITIAL_PRESSED);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      setPressedKeys(INITIAL_PRESSED);
    };
  }, [started]);

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">
        Ben 10
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Childhood Flash game (archived)
      </p>

      <div className="w-full max-w-[800px]">
        <div
          ref={containerRef}
          className="relative w-full aspect-[4/3] bg-black rounded-t-lg overflow-hidden border border-b-0 border-zinc-200 dark:border-zinc-700 shadow-sm"
        >
        <div
          ref={ruffleContainerRef}
          className="absolute inset-0 w-full h-full [&>*]:!absolute [&>*]:!inset-0 [&>*]:!w-full [&>*]:!h-full"
        />
        {!started && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/95 dark:bg-zinc-950/95 backdrop-blur-sm">
            <button
              onClick={initGame}
              className="px-8 py-4 text-lg font-medium bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white rounded-lg transition-colors border border-zinc-300 dark:border-zinc-600"
            >
              Start Game
            </button>
          </div>
        )}
        {started && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 dark:bg-zinc-950/90">
            <p className="text-sm text-zinc-400">Loading game…</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/95 dark:bg-red-950/95 p-4">
            <p className="text-sm text-red-700 dark:text-red-300 text-center">
              {error}
            </p>
          </div>
        )}
        </div>

        <div className="flex items-center justify-between gap-4 bg-zinc-100 dark:bg-zinc-800 rounded-b-lg px-4 py-3 border border-t-0 border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  pressedKeys.up
                    ? "bg-blue-500 text-white shadow-inner"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                W
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Jump</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  pressedKeys.left
                    ? "bg-blue-500 text-white shadow-inner"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                A
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Left</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  pressedKeys.right
                    ? "bg-blue-500 text-white shadow-inner"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                D
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Right</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  pressedKeys.attack
                    ? "bg-blue-500 text-white shadow-inner"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                J
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Attack</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  pressedKeys.transform
                    ? "bg-blue-500 text-white shadow-inner"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                K
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Transform</span>
            </div>
          </div>
          <button
            onClick={toggleFullScreen}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-md transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}
