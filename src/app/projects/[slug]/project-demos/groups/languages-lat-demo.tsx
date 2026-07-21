"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { L } from "../demo-utils";

const GOLD = "#c9a35c";
const INK = "#e8e0d0";
const INK_DIM = "#b3a88f";
const BG = "#0b0e15";

const STATUS_COLORS: Record<string, string> = {
  living: "#8fbf7f",
  endangered: "#d9a441",
  extinct: "#8d8577",
  classical: "#c9a35c",
  liturgical: "#b08cd9",
  revived: "#6cc5b9",
  constructed: "#d98cb3",
  undeciphered: "#d97b5f",
  reconstructed: "#7fa8d9",
  unknowable: "#9d94b8",
};

const STATUS_LABELS: Record<string, string> = {
  living: "Still spoken",
  endangered: "Endangered",
  extinct: "Extinct",
  classical: "Classical",
  liturgical: "Liturgical",
  revived: "Revived",
  constructed: "Constructed",
  undeciphered: "Undeciphered",
  reconstructed: "Reconstructed",
  unknowable: "Beyond evidence",
};

const EVIDENCE_LABELS: Record<string, string> = {
  observed: "Origin documented",
  written: "First written evidence",
  inscription: "Earliest inscription",
  oral: "Oral, written later",
  reconstructed: "Reconstructed ancestor",
  spoken: "Spoken origin (estimated)",
};

const ERAS = [
  {
    id: "recent",
    title: "The Recent Past",
    range: "1800 CE — Today",
    year: "Today",
    desc: "Creoles, sign languages, revivals, and inventions — alongside ancient tongues written down for the first time.",
  },
  {
    id: "earlymod",
    title: "The Early Modern World",
    range: "1400 – 1800 CE",
    year: "1650",
    desc: "Print, empire, and contact. Languages finally step into the written record.",
  },
  {
    id: "medieval",
    title: "The Medieval World",
    range: "500 – 1400 CE",
    year: "c. 1000",
    desc: "Everyday speech begins to be carved, copied, and sung across Eurasia and Africa.",
  },
  {
    id: "classical",
    title: "Classical Antiquity",
    range: "c. 800 BCE – 500 CE",
    year: "c. 100 BCE",
    desc: "Alphabets spread like fire. Empires write, and dozens of languages speak at once.",
  },
  {
    id: "ironage",
    title: "The Iron Age",
    range: "c. 1200 – 800 BCE",
    year: "c. 900 BCE",
    desc: "After the Bronze Age collapse, the alphabet begins its conquest of the world.",
  },
  {
    id: "bronze",
    title: "The Bronze Age",
    range: "c. 3300 – 1200 BCE",
    year: "c. 2500 BCE",
    desc: "Clay tablets and carved stone carry language across four thousand years to reach us.",
  },
  {
    id: "deeptime",
    title: "Deep Time",
    range: "Before Writing",
    year: "—",
    desc: "Only ancestors reconstructed word by word — and beyond them, the unknowable dawn of speech.",
  },
] as const;

type EraId = (typeof ERAS)[number]["id"];

const LANGUAGES: {
  eraId: EraId;
  name: string;
  displayYear: string;
  region: string;
  family: string;
  status: keyof typeof STATUS_COLORS;
  evidence: keyof typeof EVIDENCE_LABELS;
  blurb: string;
}[] = [
  {
    eraId: "recent",
    name: "Sentinelese",
    displayYear: "Today",
    region: "South Asia",
    family: "Unclassified",
    status: "living",
    evidence: "spoken",
    blurb:
      "No outsider has ever documented a single confirmed word. A living language, spoken right now, about which linguistics knows essentially nothing.",
  },
  {
    eraId: "recent",
    name: "Nicaraguan Sign Language",
    displayYear: "c. 1980s",
    region: "The Americas",
    family: "Sign language",
    status: "living",
    evidence: "observed",
    blurb:
      "Scientists watched a full language be born when deaf children were first brought together — proof that the mind generates grammar on its own.",
  },
  {
    eraId: "earlymod",
    name: "Esperanto",
    displayYear: "1887",
    region: "Worldwide",
    family: "Constructed",
    status: "constructed",
    evidence: "observed",
    blurb: "L. L. Zamenhof published a language designed for peace — still spoken by learners and native speakers today.",
  },
  {
    eraId: "medieval",
    name: "Old English",
    displayYear: "c. 800",
    region: "Northern Europe",
    family: "Indo-European · Germanic",
    status: "extinct",
    evidence: "written",
    blurb: "Beowulf's tongue — not Shakespeare's. The earliest English we can read looks almost like another language entirely.",
  },
  {
    eraId: "classical",
    name: "Latin",
    displayYear: "c. 200 BCE",
    region: "Southern Europe",
    family: "Indo-European · Italic",
    status: "classical",
    evidence: "written",
    blurb: "Rome's voice — no longer anyone's mother tongue, but still read in law, science, and the Church after two millennia.",
  },
  {
    eraId: "ironage",
    name: "Phoenician",
    displayYear: "c. 1050 BCE",
    region: "West Asia",
    family: "Afro-Asiatic · Semitic",
    status: "extinct",
    evidence: "inscription",
    blurb: "The alphabet's inventors. Twenty-two letters that would become Greek, Latin, Arabic, and nearly every script on Earth.",
  },
  {
    eraId: "bronze",
    name: "Sumerian",
    displayYear: "c. 3200 BCE",
    region: "West Asia",
    family: "Language isolate",
    status: "extinct",
    evidence: "inscription",
    blurb:
      "Likely the first language ever written — pressed into clay on the Mesopotamian plain long before Homer or the pyramids.",
  },
  {
    eraId: "deeptime",
    name: "Proto-Indo-European",
    displayYear: "reconstructed",
    region: "Eurasian steppe (disputed)",
    family: "Indo-European (ancestor)",
    status: "reconstructed",
    evidence: "reconstructed",
    blurb:
      "No texts exist. Rebuilt from Sanskrit, Greek, Latin, and dozens of descendants — the ghost ancestor behind half the world's languages.",
  },
];

export function LanguagesLatDemo() {
  const [eraId, setEraId] = useState<EraId>("recent");
  const [selected, setSelected] = useState(LANGUAGES[0].name);

  const eraIndex = ERAS.findIndex((e) => e.id === eraId);
  const era = ERAS[eraIndex] ?? ERAS[0];

  const eraLangs = useMemo(() => LANGUAGES.filter((l) => l.eraId === eraId), [eraId]);
  const lang = eraLangs.find((l) => l.name === selected) ?? eraLangs[0];

  useEffect(() => {
    if (eraLangs.length && !eraLangs.some((l) => l.name === selected)) {
      setSelected(eraLangs[0].name);
    }
  }, [eraId, eraLangs, selected]);

  const depth = eraIndex / (ERAS.length - 1);

  return (
    <div className="my-8 not-prose">
      <p className={L}>languages.lat</p>

      <div
        className="relative overflow-hidden rounded-2xl border shadow-xl"
        style={{ borderColor: "rgba(201, 163, 92, 0.22)", backgroundColor: BG }}
      >
        {/* atmospheric layers */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 70% at 50% -10%, #141a28 0%, transparent 55%),
              linear-gradient(180deg, #0b0e15 0%, #0d0f14 60%, #0f0d0a 100%)
            `,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: depth,
            background:
              "radial-gradient(ellipse 120% 80% at 50% 110%, #241405 0%, transparent 60%), linear-gradient(180deg, #0e0a06 0%, #140d05 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "inset 0 0 120px rgba(0,0,0,0.55)",
          }}
        />

        <div className="relative px-4 py-5 sm:px-6">
          {/* header */}
          <div className="mb-5 text-center">

            <p className="font-serif text-2xl tracking-wide sm:text-3xl" style={{ color: INK }}>
              languages<em style={{ color: GOLD, fontStyle: "normal" }}>.lat</em>
            </p>
          </div>

          {/* era pills */}
          <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ERAS.map((e) => {
              const active = e.id === eraId;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEraId(e.id)}
                  className="shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition-all duration-200"
                  style={{
                    borderColor: active ? "rgba(201, 163, 92, 0.55)" : "rgba(201, 163, 92, 0.12)",
                    backgroundColor: active ? "rgba(201, 163, 92, 0.14)" : "rgba(255,255,255,0.03)",
                    color: active ? GOLD : INK_DIM,
                  }}
                >
                  {e.title.replace("The ", "")}
                </button>
              );
            })}
          </div>

          {/* year display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={era.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="mb-5 text-center"
            >
              <div
                className="font-serif text-4xl font-light tabular-nums sm:text-5xl"
                style={{ color: INK }}
              >
                {lang?.displayYear ?? era.year}
              </div>
              <div className="mt-1 text-sm" style={{ color: GOLD }}>
                {era.title}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: INK_DIM }}>
                {era.range}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* language chips */}
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {eraLangs.map((l) => {
              const active = l.name === lang?.name;
              return (
                <button
                  key={l.name}
                  type="button"
                  onClick={() => setSelected(l.name)}
                  className="rounded-md border px-3 py-1.5 text-[11px] transition-all duration-200"
                  style={{
                    borderColor: active ? "rgba(201, 163, 92, 0.45)" : "rgba(255,255,255,0.08)",
                    backgroundColor: active ? "rgba(201, 163, 92, 0.1)" : "rgba(255,255,255,0.02)",
                    color: active ? INK : INK_DIM,
                  }}
                >
                  {l.name}
                </button>
              );
            })}
          </div>

          {/* detail card */}
          <AnimatePresence mode="wait">
            {lang && (
              <motion.div
                key={lang.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border p-4 sm:p-5"
                style={{
                  borderColor: "rgba(201, 163, 92, 0.22)",
                  backgroundColor: "rgba(20, 18, 14, 0.82)",
                }}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-serif text-xl" style={{ color: INK }}>
                    {lang.name}
                  </h3>
                  <span
                    className="rounded-full border px-2.5 py-0.5 text-[10px] font-medium"
                    style={{
                      color: STATUS_COLORS[lang.status],
                      borderColor: `${STATUS_COLORS[lang.status]}44`,
                      backgroundColor: `${STATUS_COLORS[lang.status]}14`,
                    }}
                  >
                    {STATUS_LABELS[lang.status]}
                  </span>
                </div>

                <div className="mb-4 grid gap-2 sm:grid-cols-3">
                  {[
                    { label: "Region", value: lang.region },
                    { label: "Family", value: lang.family },
                    { label: "Evidence", value: EVIDENCE_LABELS[lang.evidence] },
                  ].map((item) => (
                    <div key={item.label}>
                      <p
                        className="text-[10px] uppercase tracking-wider"
                        style={{ color: INK_DIM }}
                      >
                        {item.label}
                      </p>
                      <p className="text-[11px] leading-snug" style={{ color: INK }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-sm leading-relaxed" style={{ color: INK_DIM }}>
                  {lang.blurb}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* time scrubber */}
          <div className="mt-5 px-1">
            <div className="mb-2 flex items-center justify-between text-[10px]" style={{ color: INK_DIM }}>
              <span>Today</span>
              <span>Deep Time</span>
            </div>
            <input
              type="range"
              min={0}
              max={ERAS.length - 1}
              step={1}
              value={eraIndex}
              onChange={(e) => setEraId(ERAS[Number(e.target.value)].id)}
              className="h-1 w-full cursor-pointer appearance-none rounded-full accent-[#c9a35c]"
              style={{
                background: `linear-gradient(to right, ${GOLD} ${(eraIndex / (ERAS.length - 1)) * 100}%, rgba(255,255,255,0.08) ${(eraIndex / (ERAS.length - 1)) * 100}%)`,
              }}
              aria-label="Scroll backward through time"
            />
            <p className="mt-2 text-center text-[11px]" style={{ color: INK_DIM }}>
              {era.desc}
            </p>
          </div>
        </div>
      </div>


    </div>
  );
}
