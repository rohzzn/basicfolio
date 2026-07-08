"use client";

import React, { useCallback, useState } from "react";
import { Camera, Folder, Home, Mail, Music, Terminal } from "lucide-react";
import {
  CompareSlider,
  ConfettiButton,
  Dock,
  NumberTicker,
  ScrubInput,
  SlideToConfirm,
  SpotlightCard,
  StatusButton,
  TiltCard,
} from "@/components/rohan";
import { cn } from "@/lib/utils";

export function DockPreview() {
  const items = [
    { id: "home", label: "Home", icon: <Home /> },
    { id: "files", label: "Files", icon: <Folder /> },
    { id: "terminal", label: "Terminal", icon: <Terminal /> },
    { id: "music", label: "Music", icon: <Music /> },
    { id: "photos", label: "Photos", icon: <Camera /> },
    { id: "mail", label: "Mail", icon: <Mail /> },
  ];
  return <Dock items={items} />;
}

export function SpotlightPreview() {
  return (
    <SpotlightCard>
      <div className="p-6 text-center">
        <p className="text-sm font-semibold text-zinc-900 dark:text-paper">Spotlight</p>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 dark:text-neutral-500">
          Move your cursor across this card.
        </p>
      </div>
    </SpotlightCard>
  );
}

export function TiltPreview() {
  return (
    <TiltCard>
      <div className="flex flex-col items-center p-6 text-center">
        <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
          3D
        </span>
        <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-paper">Tilt me</p>
        <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-zinc-400 dark:text-neutral-500">
          Hover and move your cursor to see the perspective shift.
        </p>
      </div>
    </TiltCard>
  );
}

export function ConfettiPreview() {
  return <ConfettiButton>Celebrate</ConfettiButton>;
}

export function NumberTickerPreview() {
  const [value, setValue] = useState(12847);
  return (
    <div className="flex flex-col items-center gap-5">
      <NumberTicker
        value={value}
        prefix="$"
        className="text-4xl font-semibold text-zinc-900 dark:text-paper"
      />
      <button
        type="button"
        onClick={() => setValue(Math.floor(1000 + Math.random() * 99000))}
        className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-paper"
      >
        Shuffle
      </button>
    </div>
  );
}

export function SlideToConfirmPreview() {
  return <SlideToConfirm label="Slide to deploy" confirmedLabel="Deployed" resetAfter={2500} />;
}

export function ScrubPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ScrubInput label="W" defaultValue={320} min={0} max={1920} suffix="px" />
      <ScrubInput label="Opacity" defaultValue={80} min={0} max={100} suffix="%" />
    </div>
  );
}

export function StatusButtonPreview() {
  const action = useCallback(
    () =>
      new Promise((resolve, reject) => {
        // fail roughly one in four runs so both outcomes show up
        setTimeout(() => (Math.random() < 0.25 ? reject(new Error("demo")) : resolve(null)), 1400);
      }),
    []
  );
  return <StatusButton action={action}>Save changes</StatusButton>;
}

function MiniCard({ wireframe }: { wireframe: boolean }) {
  return (
    <div
      className={cn(
        "flex h-[210px] w-full items-center justify-center",
        wireframe ? "bg-zinc-50 dark:bg-neutral-900" : "bg-white dark:bg-neutral-900"
      )}
    >
      <div
        className={cn(
          "w-44 rounded-xl p-4",
          wireframe
            ? "border-2 border-dashed border-zinc-300 dark:border-neutral-700"
            : "border border-zinc-200 shadow-sm dark:border-neutral-700"
        )}
      >
        <div
          className={cn(
            "h-9 w-9 rounded-full",
            wireframe ? "border-2 border-dashed border-zinc-300 dark:border-neutral-700" : ""
          )}
          style={
            wireframe ? undefined : { background: "linear-gradient(135deg, #f59e0b, #ef4444)" }
          }
        />
        <div
          className={cn(
            "mt-3 h-2.5 w-24 rounded-full",
            wireframe ? "bg-zinc-200 dark:bg-neutral-800" : "bg-zinc-800 dark:bg-paper"
          )}
        />
        <div
          className={cn(
            "mt-2 h-2 w-32 rounded-full",
            wireframe ? "bg-zinc-200 dark:bg-neutral-800" : "bg-zinc-300 dark:bg-neutral-600"
          )}
        />
        <div
          className={cn(
            "mt-4 h-7 w-20 rounded-md",
            wireframe
              ? "border-2 border-dashed border-zinc-300 dark:border-neutral-700"
              : "bg-zinc-900 dark:bg-paper"
          )}
        />
      </div>
    </div>
  );
}

export function ComparePreview() {
  return (
    <CompareSlider
      before={<MiniCard wireframe />}
      after={<MiniCard wireframe={false} />}
      beforeLabel="Wireframe"
      afterLabel="Final"
    />
  );
}

export const componentPreviews: Record<string, React.ComponentType> = {
  dock: DockPreview,
  "spotlight-card": SpotlightPreview,
  "tilt-card": TiltPreview,
  "confetti-button": ConfettiPreview,
  "number-ticker": NumberTickerPreview,
  "slide-to-confirm": SlideToConfirmPreview,
  "scrub-input": ScrubPreview,
  "status-button": StatusButtonPreview,
  "compare-slider": ComparePreview,
};

export function PreviewStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "preview-stage flex min-h-[280px] items-center justify-center rounded-xl border border-zinc-200 px-6 py-12 transition-colors dark:border-neutral-800",
        className
      )}
    >
      <div className="relative z-[1] flex w-full items-center justify-center">{children}</div>
    </div>
  );
}
