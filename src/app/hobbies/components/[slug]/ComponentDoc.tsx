"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
} from "lucide-react";
import type { RohanComponent } from "@/data/rohan-components";
import { getComponentCode } from "@/data/rohan-components";
import { componentPreviews, PreviewStage } from "../previews";

/* ---------------------------------- shared ---------------------------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-medium uppercase leading-none tracking-wider text-zinc-400 dark:text-neutral-400">
      {children}
    </h3>
  );
}

function CopyIconButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore — clipboard unavailable
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-lg border border-zinc-200 bg-zinc-50 dark:border-neutral-800 dark:bg-neutral-900">
      <CopyIconButton text={code} />
      <pre className="overflow-x-auto p-4 pr-12 text-xs leading-relaxed text-zinc-700 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300 dark:text-neutral-300 dark:scrollbar-thumb-neutral-700">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

function TabRow<T extends string>({
  tabs,
  active,
  onChange,
  layoutId,
  label,
}: {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
  layoutId: string;
  label: string;
}) {
  return (
    <div className="flex gap-1" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={`relative rounded-md px-2.5 py-1 text-xs transition-colors ${
            active === tab
              ? "font-medium text-zinc-900 dark:text-paper"
              : "text-zinc-400 hover:text-zinc-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          }`}
        >
          {active === tab && (
            <motion.span
              layoutId={layoutId}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="absolute inset-0 rounded-md bg-zinc-100 dark:bg-neutral-800"
            />
          )}
          <span className="relative">{tab}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- installation ------------------------------- */

const packageManagers = ["npm", "pnpm", "yarn", "bun"] as const;
type PackageManager = (typeof packageManagers)[number];

function installCommand(pm: PackageManager, url: string): string {
  switch (pm) {
    case "npm":
      return `npx shadcn@latest add ${url}`;
    case "pnpm":
      return `pnpm dlx shadcn@latest add ${url}`;
    case "yarn":
      return `yarn dlx shadcn@latest add ${url}`;
    case "bun":
      return `bunx --bun shadcn@latest add ${url}`;
  }
}

/* ----------------------------------- page ----------------------------------- */

export default function ComponentDoc({ component }: { component: RohanComponent }) {
  const [view, setView] = useState<"Preview" | "Code">("Preview");
  const [pm, setPm] = useState<PackageManager>("npm");

  const Preview = componentPreviews[component.slug];
  const demoCode = getComponentCode(component);

  return (
    <article className="pb-12" style={{ maxWidth: "75ch" }}>
      <header>
        <h1 className="text-lg font-medium dark:text-paper">{component.name}</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-neutral-400">{component.description}</p>
        <p className="mt-4 text-sm leading-[1.75] text-zinc-700 dark:text-neutral-300">
          {component.intro}
        </p>
      </header>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Preview</SectionLabel>
          <TabRow
            tabs={["Preview", "Code"] as const}
            active={view}
            onChange={setView}
            layoutId={`view-tab-${component.slug}`}
            label="Preview or code"
          />
        </div>

        {view === "Preview" ? (
          <PreviewStage>{Preview ? <Preview /> : null}</PreviewStage>
        ) : (
          <CodeBlock code={demoCode} />
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <SectionLabel>Installation</SectionLabel>
          <TabRow
            tabs={packageManagers}
            active={pm}
            onChange={setPm}
            layoutId={`pm-tab-${component.slug}`}
            label="Package manager"
          />
        </div>
        <p className="mb-2 text-xs text-zinc-500 dark:text-neutral-400">
          Install the component using the CLI.
        </p>
        <CodeBlock code={installCommand(pm, component.registryUrl)} />
      </section>

      <section className="mt-10">
        <SectionLabel>Usage</SectionLabel>
        <p className="mb-2 text-xs text-zinc-500 dark:text-neutral-400">Import the component:</p>
        <CodeBlock code={component.usageImport} />
        <p className="mb-2 mt-4 text-xs text-zinc-500 dark:text-neutral-400">Use it in your code:</p>
        <CodeBlock code={component.usageCode} />
      </section>

      <section className="mt-10">
        <SectionLabel>Props</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-neutral-800">
                {["Property", "Type", "Default", "Description"].map((heading) => (
                  <th
                    key={heading}
                    className="py-2 pr-4 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-neutral-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {component.props.map((prop) => (
                <tr
                  key={prop.name}
                  className="border-b border-zinc-100 last:border-0 dark:border-neutral-800/60"
                >
                  <td className="py-2.5 pr-4 align-top font-mono text-xs font-medium text-zinc-800 dark:text-neutral-200">
                    {prop.name}
                  </td>
                  <td className="py-2.5 pr-4 align-top font-mono text-xs text-amber-700/80 dark:text-amber-400/80">
                    {prop.type}
                  </td>
                  <td className="py-2.5 pr-4 align-top font-mono text-xs text-zinc-500 dark:text-neutral-400">
                    {prop.default}
                  </td>
                  <td className="py-2.5 align-top text-xs leading-relaxed text-zinc-500 dark:text-neutral-400">
                    {prop.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Link
        href="/hobbies/components"
        className="mt-10 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Components
      </Link>
    </article>
  );
}
