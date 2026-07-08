"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { rohanComponents } from "@/data/rohan-components";
import { componentPreviews, PreviewStage } from "./previews";

export default function ComponentsPage() {
  return (
    <div style={{ maxWidth: "75ch" }}>
      <header className="mb-8">
        <h2 className="text-lg font-medium dark:text-paper">Components</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-neutral-400">
          Interactive UI components for React.
        </p>
      </header>

      <div className="space-y-10">
        {rohanComponents.map((component) => {
          const Preview = componentPreviews[component.slug];
          if (!Preview) return null;

          return (
            <section key={component.slug}>
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <Link
                  href={`/hobbies/components/${component.slug}`}
                  className="group inline-flex items-center gap-1 text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600 dark:text-paper dark:hover:text-neutral-300"
                >
                  {component.name}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-neutral-500"
                    aria-hidden
                  />
                </Link>
                <span className="hidden truncate text-xs text-zinc-400 dark:text-neutral-500 sm:block">
                  {component.description}
                </span>
              </div>
              <PreviewStage>
                <Preview />
              </PreviewStage>
            </section>
          );
        })}
      </div>
    </div>
  );
}
