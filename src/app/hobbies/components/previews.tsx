"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  CalendarPlus,
  Camera,
  FileText,
  Folder,
  Home,
  ImagePlus,
  Link2,
  Mail,
  Music,
  PenLine,
  Terminal,
  Upload,
} from "lucide-react";
import {
  CompareSlider,
  ConfettiButton,
  Dock,
  HoldButton,
  MorphTabs,
  NumberTicker,
  NotificationStack,
  OrbitMenu,
  ReorderList,
  ScrubInput,
  SlideToConfirm,
  SpotlightCard,
  StatusButton,
  SwipeDeck,
  TiltCard,
  WaveformScrubber,
  type OrbitMenuItem,
} from "@/components/rohan";
import { cn } from "@/lib/utils";

type DockApp = "home" | "files" | "terminal" | "music" | "photos" | "mail";

const dockCopy: Record<DockApp, { label: string; note: string }> = {
  home: { label: "Home", note: "Overview selected" },
  files: { label: "Files", note: "12 documents" },
  terminal: { label: "Terminal", note: "Build complete" },
  music: { label: "Music", note: "Now playing" },
  photos: { label: "Photos", note: "48 recent" },
  mail: { label: "Mail", note: "Inbox zero" },
};

export function DockPreview() {
  const [active, setActive] = useState<DockApp>("home");
  const items = useMemo(
    () => [
      { id: "home", label: "Home", icon: <Home />, onClick: () => setActive("home") },
      { id: "files", label: "Files", icon: <Folder />, onClick: () => setActive("files") },
      { id: "terminal", label: "Terminal", icon: <Terminal />, onClick: () => setActive("terminal") },
      { id: "music", label: "Music", icon: <Music />, onClick: () => setActive("music") },
      { id: "photos", label: "Photos", icon: <Camera />, onClick: () => setActive("photos") },
      { id: "mail", label: "Mail", icon: <Mail />, onClick: () => setActive("mail") },
    ],
    []
  );

  return (
    <div className="flex w-full max-w-[480px] flex-col items-center">
      <div className="mb-7 min-h-10 text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
          >
            <p className="text-sm font-medium text-zinc-800 dark:text-neutral-200">
              {dockCopy[active].label}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-neutral-500">
              {dockCopy[active].note}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <Dock items={items} baseSize={36} maxSize={58} />
    </div>
  );
}

export function SpotlightPreview() {
  return (
    <SpotlightCard glowColor="217, 119, 6" radius={190} className="max-w-[300px]">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-neutral-500">
              System status
            </p>
            <p className="mt-2 text-xl font-medium tracking-tight text-zinc-900 dark:text-paper">
              All systems normal
            </p>
          </div>
          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" aria-label="Online" />
        </div>
        <div className="mt-5 space-y-2.5 border-t border-zinc-100 pt-4 dark:border-neutral-800">
          {[
            ["Website", "24 ms"],
            ["API", "38 ms"],
            ["Database", "12 ms"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-neutral-400">{label}</span>
              <span className="font-mono text-zinc-400 dark:text-neutral-500">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-400 dark:text-neutral-500">
          Move your pointer across the card.
        </p>
      </div>
    </SpotlightCard>
  );
}

export function TiltPreview() {
  return (
    <TiltCard maxTilt={7} className="max-w-[300px]">
      <div className="p-5">
        <div className="flex items-start justify-between [transform:translateZ(18px)]">
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            Member 0042
          </span>
          <span className="text-xs text-zinc-400 dark:text-neutral-500">2026</span>
        </div>
        <div className="mt-8 [transform:translateZ(34px)]">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-900 text-sm font-medium text-paper dark:bg-paper dark:text-neutral-900">
            RR
          </div>
          <p className="mt-4 text-base font-medium text-zinc-900 dark:text-paper">Rohan P</p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-neutral-500">
            Software engineer · designer
          </p>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-neutral-800 dark:text-neutral-500 [transform:translateZ(12px)]">
          <span>Cincinnati</span>
          <span>rohan.run</span>
        </div>
      </div>
    </TiltCard>
  );
}

export function ConfettiPreview() {
  const [complete, setComplete] = useState(false);

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm font-medium text-zinc-800 dark:text-neutral-200">
        {complete ? "Release complete" : "One task left"}
      </p>
      <p className="mt-1 text-xs text-zinc-400 dark:text-neutral-500" aria-live="polite">
        {complete ? "Version 1.0 is live." : "9 of 10 launch checks passed."}
      </p>
      <div className="mt-5">
        {complete ? (
          <button
            type="button"
            onClick={() => setComplete(false)}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
          >
            Reset
          </button>
        ) : (
          <ConfettiButton onClick={() => setComplete(true)}>Ship v1.0</ConfettiButton>
        )}
      </div>
    </div>
  );
}

const tickerValues = {
  Day: 12847,
  Week: 84210,
  Month: 324892,
};

export function NumberTickerPreview() {
  const [period, setPeriod] = useState<keyof typeof tickerValues>("Day");
  const value = tickerValues[period];

  return (
    <div className="w-full max-w-[320px]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-neutral-500">
          Revenue
        </p>
        <div className="flex gap-3" role="tablist" aria-label="Revenue period">
          {(Object.keys(tickerValues) as Array<keyof typeof tickerValues>).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={period === item}
              onClick={() => setPeriod(item)}
              className={cn(
                "text-xs transition-colors",
                period === item
                  ? "font-medium text-zinc-900 dark:text-paper"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-neutral-500 dark:hover:text-neutral-300"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <NumberTicker
        value={value}
        prefix="$"
        className="mt-6 text-4xl font-medium tracking-tight text-zinc-900 dark:text-paper"
      />
      <div className="mt-5 flex items-end gap-1" aria-hidden>
        {[26, 38, 34, 52, 46, 65, 58, 74, 68, 86, 78, 94].map((height, index) => (
          <motion.span
            key={`${period}-${index}`}
            initial={{ height: 4 }}
            animate={{ height }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: index * 0.015 }}
            className={cn(
              "w-full rounded-sm",
              index === 11 ? "bg-zinc-700 dark:bg-neutral-300" : "bg-zinc-200 dark:bg-neutral-700"
            )}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">↑ 8.4% from the previous period</p>
    </div>
  );
}

export function SlideToConfirmPreview() {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!confirmed) return;
    const timer = window.setTimeout(() => setConfirmed(false), 3000);
    return () => window.clearTimeout(timer);
  }, [confirmed]);

  return (
    <div className="w-full max-w-[340px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-800 dark:text-neutral-200">Deploy website</p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-neutral-500">main · 8f4ac2d</p>
        </div>
        <span className={cn("text-xs", confirmed ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-neutral-500")}>
          {confirmed ? "Live" : "Ready"}
        </span>
      </div>
      <SlideToConfirm
        label="Slide to deploy"
        confirmedLabel="Deployed"
        onConfirm={() => setConfirmed(true)}
        resetAfter={3000}
        className="!max-w-none"
      />
      <p className="mt-3 text-center text-xs text-zinc-400 dark:text-neutral-500">
        Drag, or use Enter and arrow keys.
      </p>
    </div>
  );
}

export function ScrubPreview() {
  const [width, setWidth] = useState(180);
  const [radius, setRadius] = useState(16);
  const [opacity, setOpacity] = useState(0.9);

  return (
    <div className="grid w-full max-w-[520px] items-center gap-6 sm:grid-cols-[160px_1fr]">
      <div className="space-y-2">
        <ScrubInput label="W" defaultValue={width} min={100} max={240} suffix="px" onChange={setWidth} className="!w-full" />
        <ScrubInput label="R" defaultValue={radius} min={0} max={40} suffix="px" onChange={setRadius} className="!w-full" />
        <ScrubInput label="O" defaultValue={opacity} min={0.2} max={1} step={0.05} sensitivity={1} onChange={setOpacity} className="!w-full" />
        <p className="pt-1 text-xs text-zinc-400 dark:text-neutral-500">Drag a label or type a value.</p>
      </div>

      <div className="flex min-h-[170px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <motion.div
          layout
          style={{ width, borderRadius: radius, opacity }}
          transition={{ type: "spring", stiffness: 360, damping: 30 }}
          className="flex h-20 max-w-full items-end bg-zinc-900 p-3 text-paper dark:bg-paper dark:text-neutral-900"
        >
          <span className="text-xs font-medium">Preview</span>
        </motion.div>
        <code className="mt-3 text-[10px] text-zinc-400 dark:text-neutral-500">
          {width}px · {radius}px · {opacity.toFixed(2)}
        </code>
      </div>
    </div>
  );
}

export function StatusButtonPreview() {
  const run = useRef(0);

  const action = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        const shouldFail = run.current % 2 === 1;
        run.current += 1;
        window.setTimeout(() => {
          if (shouldFail) reject(new Error("Demo failure"));
          else resolve();
        }, 1100);
      }),
    []
  );

  return (
    <div className="text-center">
      <StatusButton action={action}>Save changes</StatusButton>
      <p className="mt-4 text-xs text-zinc-400 dark:text-neutral-500">
        Runs alternate between success and error.
      </p>
    </div>
  );
}

function ProfileCard({ wireframe }: { wireframe: boolean }) {
  return (
    <div className={cn("flex h-[220px] w-full items-center justify-center", wireframe ? "bg-zinc-50 dark:bg-neutral-950" : "bg-white dark:bg-neutral-900")}>
      <div className={cn("w-48 rounded-xl p-4", wireframe ? "border-2 border-dashed border-zinc-300 dark:border-neutral-700" : "border border-zinc-200 shadow-sm dark:border-neutral-700")}>
        <div className="flex items-center gap-3">
          <div className={cn("grid h-10 w-10 place-items-center rounded-lg text-xs font-medium", wireframe ? "border-2 border-dashed border-zinc-300 text-transparent dark:border-neutral-700" : "bg-zinc-900 text-paper dark:bg-paper dark:text-neutral-900")}>
            RR
          </div>
          <div className="flex-1">
            <div className={cn("h-2.5 w-20 rounded-full", wireframe ? "bg-zinc-200 dark:bg-neutral-800" : "bg-zinc-800 dark:bg-paper")} />
            <div className="mt-2 h-2 w-24 rounded-full bg-zinc-200 dark:bg-neutral-700" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {["Projects", "Writing"].map((label) => (
            <div key={label} className={cn("rounded-lg p-2.5", wireframe ? "border-2 border-dashed border-zinc-300 dark:border-neutral-700" : "border border-zinc-100 bg-zinc-50 dark:border-neutral-800 dark:bg-neutral-800/50")}>
              <div className="h-2 w-10 rounded-full bg-zinc-200 dark:bg-neutral-700" />
              <div className={cn("mt-2 h-3 w-7 rounded-full", wireframe ? "bg-zinc-200 dark:bg-neutral-800" : "bg-amber-400")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ComparePreview() {
  return (
    <CompareSlider
      before={<ProfileCard wireframe />}
      after={<ProfileCard wireframe={false} />}
      beforeLabel="Wireframe"
      afterLabel="Final"
      className="max-w-[420px]"
    />
  );
}

export function OrbitPreview() {
  const [selected, setSelected] = useState("No action selected");
  const items: OrbitMenuItem[] = [
    { id: "note", label: "New note", description: "Start a blank note", shortcut: "N", icon: <PenLine /> },
    { id: "event", label: "Add event", description: "Block calendar time", shortcut: "E", icon: <CalendarPlus /> },
    { id: "upload", label: "Upload", description: "Choose a local file", shortcut: "U", icon: <Upload /> },
    { id: "photo", label: "Add photo", description: "Open your library", shortcut: "P", icon: <ImagePlus /> },
    { id: "file", label: "New file", description: "Create a document", shortcut: "F", icon: <FileText /> },
    { id: "link", label: "Save link", description: "Capture a URL", shortcut: "L", icon: <Link2 /> },
  ];

  return (
    <div className="relative w-full max-w-[420px] pb-8 text-center">
      <OrbitMenu
        items={items}
        menuLabel="Quick actions"
        triggerLabel="Open quick actions"
        radius={96}
        onSelect={(item) => setSelected(`${item.label} selected`)}
      />
      <p className="absolute inset-x-0 bottom-0 text-xs text-zinc-400 dark:text-neutral-500" aria-live="polite">
        {selected}
      </p>
    </div>
  );
}

export function WaveformPreview() {
  return (
    <div className="w-full max-w-[440px]">
      <WaveformScrubber
        label="Field recording · July 09"
        duration={142}
        defaultProgress={0.28}
      />
      <p className="mt-3 text-center text-xs text-zinc-400 dark:text-neutral-500">
        Play, drag the waveform, or use the arrow keys.
      </p>
    </div>
  );
}

export function HoldButtonPreview() {
  return (
    <div className="text-center">
      <HoldButton duration={1300} successLabel="Published" resetAfter={1800}>
        Hold to publish
      </HoldButton>
      <p className="mt-4 text-xs text-zinc-400 dark:text-neutral-500">
        Release early to cancel.
      </p>
    </div>
  );
}

export function MorphTabsPreview() {
  const items = [
    {
      id: "notes",
      label: "Notes",
      content: (
        <div>
          <p className="font-medium text-zinc-800 dark:text-neutral-200">Three ideas saved</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 dark:text-neutral-500">
            Small details make an interface feel considered.
          </p>
        </div>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      content: (
        <div>
          <p className="font-medium text-zinc-800 dark:text-neutral-200">Updated 12 minutes ago</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 dark:text-neutral-500">
            The latest revision is available everywhere.
          </p>
        </div>
      ),
    },
    {
      id: "details",
      label: "Details",
      content: (
        <div>
          <p className="font-medium text-zinc-800 dark:text-neutral-200">Built with React</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 dark:text-neutral-500">
            Keyboard navigation and reduced motion are included.
          </p>
        </div>
      ),
    },
  ];

  return <MorphTabs items={items} defaultValue="notes" className="w-full max-w-[420px]" />;
}

export function SwipeDeckPreview() {
  const items = [
    {
      id: "quiet-morning",
      ariaLabel: "Idea one of three, Quiet morning",
      content: (
        <div className="flex h-full flex-col">
          <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-neutral-500">Weekend idea · 01</p>
          <p className="mt-5 text-xl font-medium tracking-tight text-zinc-900 dark:text-paper">A quiet morning</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-neutral-400">
            Coffee, a long walk, and an hour with a book before the city wakes up.
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-neutral-800 dark:text-neutral-500">
            <span>2 hours</span><span>Low effort</span>
          </div>
        </div>
      ),
    },
    {
      id: "tiny-tool",
      ariaLabel: "Idea two of three, Ship a tiny tool",
      content: (
        <div className="flex h-full flex-col">
          <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-neutral-500">Weekend idea · 02</p>
          <p className="mt-5 text-xl font-medium tracking-tight text-zinc-900 dark:text-paper">Ship a tiny tool</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-neutral-400">
            Pick one annoying problem and solve only the useful part of it.
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-neutral-800 dark:text-neutral-500">
            <span>One afternoon</span><span>Medium effort</span>
          </div>
        </div>
      ),
    },
    {
      id: "new-route",
      ariaLabel: "Idea three of three, Take a new route",
      content: (
        <div className="flex h-full flex-col">
          <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-neutral-500">Weekend idea · 03</p>
          <p className="mt-5 text-xl font-medium tracking-tight text-zinc-900 dark:text-paper">Take a new route</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-neutral-400">
            Run somewhere unfamiliar and leave the pace target at home.
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400 dark:border-neutral-800 dark:text-neutral-500">
            <span>5 kilometers</span><span>Outside</span>
          </div>
        </div>
      ),
    },
  ];

  return <SwipeDeck items={items} approveLabel="Save" rejectLabel="Skip" className="max-w-[360px]" />;
}

export function NotificationStackPreview() {
  const notifications = [
    {
      id: "build",
      title: "Build finished",
      description: "Production is ready to review.",
      timestamp: "now",
      tone: "success" as const,
    },
    {
      id: "comment",
      title: "New comment",
      description: "Maya left feedback on the homepage.",
      timestamp: "2m",
      tone: "info" as const,
      action: { label: "Open comment", onClick: () => undefined },
    },
    {
      id: "backup",
      title: "Backup complete",
      description: "All project files were saved.",
      timestamp: "8m",
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="flex h-80 w-full items-start justify-center sm:h-72">
      <NotificationStack
        notifications={notifications}
        label="Recent activity"
        className="max-w-[400px]"
      />
    </div>
  );
}

export function ReorderListPreview() {
  const items = [
    { id: "outline", label: "Write the outline", content: "Write the outline" },
    { id: "prototype", label: "Build the prototype", content: "Build the prototype" },
    { id: "test", label: "Test the interaction", content: "Test the interaction" },
    { id: "ship", label: "Ship the update", content: "Ship the update" },
  ];

  return (
    <ReorderList
      defaultItems={items}
      label="Project steps"
      allowReset
      className="mx-auto max-w-[460px]"
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
  "orbit-menu": OrbitPreview,
  "waveform-scrubber": WaveformPreview,
  "hold-button": HoldButtonPreview,
  "morph-tabs": MorphTabsPreview,
  "swipe-deck": SwipeDeckPreview,
  "notification-stack": NotificationStackPreview,
  "reorder-list": ReorderListPreview,
};

export function PreviewStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "preview-stage flex min-h-[280px] items-center justify-center rounded-xl border border-zinc-200 px-6 py-12 transition-colors dark:border-neutral-800",
          className
        )}
      >
        <div className="relative z-[1] flex w-full items-center justify-center">{children}</div>
      </div>
    </MotionConfig>
  );
}
