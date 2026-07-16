"use client";

import React, { useState } from "react";
import { L } from "../demo-utils";

const EDITOR_TOOLS = [
  { id: "text", label: "Text", desc: "Click existing lines to edit in place with detected fonts." },
  { id: "sign", label: "Sign", desc: "Draw, type, or upload signatures and reuse them." },
  { id: "image", label: "Image", desc: "Insert PNG, JPG, or SVG and resize on the page." },
  { id: "annotate", label: "Annotate", desc: "Pen, highlighter, shapes, notes, and links." },
  { id: "forms", label: "Forms", desc: "Fill AcroForm fields or add new text and checkboxes." },
  { id: "pages", label: "Pages", desc: "Reorder, rotate, duplicate, delete, or insert blanks." },
] as const;

const HUB_TOOLS = [
  { id: "merge", name: "Merge PDFs", desc: "Combine several files into one document." },
  { id: "split", name: "Split PDF", desc: "Extract page ranges or burst into single pages." },
  { id: "compress", name: "Compress", desc: "Shrink file size with a quality slider." },
  { id: "convert", name: "PDF ⇄ Images", desc: "Export pages as PNG/JPG or build a PDF from images." },
  { id: "watermark", name: "Watermark", desc: "Stamp diagonal text across every page." },
  { id: "numbers", name: "Page numbers", desc: "Add page numbers in any corner." },
  { id: "headers", name: "Header & footer", desc: "Repeat text at the top or bottom of pages." },
  { id: "protect", name: "Protect", desc: "Encrypt the file with a password." },
  { id: "metadata", name: "Metadata", desc: "Edit title, author, and keywords." },
] as const;

type Tab = "editor" | "tools";

export function QuireDemo() {
  const [tab, setTab] = useState<Tab>("editor");
  const [activeEditorTool, setActiveEditorTool] = useState<string>("text");
  const [activeHubTool, setActiveHubTool] = useState<string>("merge");

  const editorTool = EDITOR_TOOLS.find((tool) => tool.id === activeEditorTool) ?? EDITOR_TOOLS[0];
  const hubTool = HUB_TOOLS.find((tool) => tool.id === activeHubTool) ?? HUB_TOOLS[0];

  return (
    <div className="my-8 not-prose">
      <p className={L}>Quire</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(
          [
            { id: "editor", label: "Editor" },
            { id: "tools", label: "Tools hub" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              tab === item.id
                ? "bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "bg-zinc-100 text-zinc-500 hover:text-zinc-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "editor" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,220px)_1fr]">
          <div className="space-y-1.5">
            {EDITOR_TOOLS.map((tool) => {
              const selected = activeEditorTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveEditorTool(tool.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "border-zinc-300 bg-zinc-100 dark:border-neutral-700 dark:bg-neutral-800/80"
                      : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/50"
                  }`}
                >
                  <p className="text-xs font-medium text-zinc-800 dark:text-neutral-200">{tool.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400 dark:text-neutral-500">
                    {tool.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#5B5BD6] text-[11px] font-bold text-white">
                Q
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-paper">sample.pdf</span>
              <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                100% local
              </span>
            </div>

            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_120px]">
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {EDITOR_TOOLS.slice(0, 4).map((tool) => (
                    <span
                      key={tool.id}
                      className={`rounded-md px-2 py-1 text-[10px] font-medium ${
                        activeEditorTool === tool.id
                          ? "bg-[#5B5BD6] text-white"
                          : "bg-zinc-100 text-zinc-500 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {tool.label}
                    </span>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-2.5 w-3/5 rounded bg-zinc-300 dark:bg-neutral-700" />
                  <div className="h-2.5 w-full rounded bg-zinc-200 dark:bg-neutral-800" />
                  <div className="h-2.5 w-11/12 rounded bg-zinc-200 dark:bg-neutral-800" />
                  <div
                    className={`mt-4 rounded-lg border px-3 py-2 text-xs ${
                      activeEditorTool === "text"
                        ? "border-[#5B5BD6]/40 bg-[#5B5BD6]/5 text-zinc-700 dark:text-neutral-200"
                        : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                    }`}
                  >
                    {editorTool.desc}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[1, 2, 3].map((page) => (
                  <div
                    key={page}
                    className={`rounded-lg border p-2 ${
                      page === 1
                        ? "border-[#5B5BD6] bg-white dark:bg-neutral-950"
                        : "border-zinc-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                    }`}
                  >
                    <div className="aspect-[3/4] rounded bg-zinc-100 dark:bg-neutral-900" />
                    <p className="mt-1 text-center text-[10px] text-zinc-400 dark:text-neutral-500">
                      Page {page}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HUB_TOOLS.map((tool) => {
            const selected = activeHubTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveHubTool(tool.id)}
                className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                  selected
                    ? "border-[#5B5BD6]/40 bg-[#5B5BD6]/5 dark:bg-[#5B5BD6]/10"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
                }`}
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-paper">{tool.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-neutral-400">
                  {tool.desc}
                </p>
              </button>
            );
          })}
          <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-4 dark:border-neutral-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-paper">{hubTool.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-neutral-400">
              Everything runs in the browser. Files never leave your device.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
