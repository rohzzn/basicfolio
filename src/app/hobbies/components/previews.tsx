"use client";

import React from "react";
import { Camera, Folder, Home, Mail, Music, Terminal } from "lucide-react";
import { Dock, SpotlightCard, TiltCard } from "@/components/rohan";
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

export const componentPreviews: Record<string, React.ComponentType> = {
  dock: DockPreview,
  "spotlight-card": SpotlightPreview,
  "tilt-card": TiltPreview,
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
