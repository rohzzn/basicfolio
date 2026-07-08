"use client";

import React from "react";
import Link from "next/link";
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

      <div className="space-y-6">
        {rohanComponents.map((component) => {
          const Preview = componentPreviews[component.slug];
          if (!Preview) return null;

          return (
            <Link
              key={component.slug}
              href={`/hobbies/components/${component.slug}`}
              className="group block"
            >
              <PreviewStage className="group-hover:border-zinc-300 dark:group-hover:border-neutral-700">
                <Preview />
              </PreviewStage>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
