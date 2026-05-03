"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Category = "education" | "work" | "gray" | "tech" | "content" | "achievement";

interface TimelineEvent {
  id: string;
  dateLabel: string;
  description: string[];
  category: Category;
  start: Date;
  end: Date;
  /** Info panel heading; timeline bars still use `description[0]`. */
  detailTitle?: string;
  /** Info panel lines under the heading (e.g. school, dates). */
  detailLead?: string[];
  /** Info panel body paragraphs. */
  detailBody?: string[];
  /** Path under `public` (e.g. `/images/uc_logo.png`). */
  detailImage?: string;
}

function endOfMonth(y: number, m: number) {
  return new Date(y, m, 0, 12, 0, 0);
}

function startOfMonth(y: number, m: number) {
  return new Date(y, m - 1, 1, 12, 0, 0);
}

/** Inclusive calendar day (local noon). */
function dayAt(y: number, m: number, d: number) {
  return new Date(y, m - 1, d, 12, 0, 0);
}

const events: TimelineEvent[] = [
  {
    id: "cchmc-ra",
    dateLabel: "CCHMC · Research Assistant",
    description: ["Research Assistant", "Cincinnati Children's Hospital"],
    category: "work",
    start: startOfMonth(2025, 1),
    end: endOfMonth(2025, 8),
    detailTitle: "Graduate Research Assistant",
    detailLead: ["Cincinnati Children's Hospital", "January 2025 to August 2025"],
    detailBody: [
      "I worked on graph based RAG in Neo4j and LangGraph style agent workflows so internal research could pull richer, multi hop context with sensible guardrails. Less manual stitching, more repeatable pipelines.",
      "I also shipped small internal interfaces in React, Next.js, and Streamlit (chat, citations, auth), and used Docker with CI and CD so environments were quicker to stand up and deployments stayed reproducible.",
    ],
    detailImage: "/images/cchmc.png",
  },
  {
    id: "cchmc-sde-cpt",
    dateLabel: "CCHMC · Software Developer (CPT)",
    description: ["Software Developer (CPT)", "Cincinnati Children's Hospital"],
    category: "work",
    start: startOfMonth(2025, 9),
    end: endOfMonth(2026, 2),
    detailTitle: "Software Developer (Curricular Practical Training)",
    detailLead: ["Cincinnati Children's Hospital", "September 2025 to February 2026"],
    detailBody: [
      "I helped build an AI search platform in Django, React, and Next.js that mixed graph RAG in Neo4j with hybrid retrieval: vectors, graph hops, and APIs, so answers could be sharper and better grounded.",
      "I contributed to Neo4j schema design for clearer cross domain links, and to end to end search UX with authentication, citation backed responses, and a polished interface so the tool could be adopted responsibly.",
    ],
    detailImage: "/images/cchmc.png",
  },
  {
    id: "uc-meng-cs",
    dateLabel: "University of Cincinnati · M.Eng. Computer Science",
    description: ["M.Eng. Computer Science", "University of Cincinnati"],
    category: "education",
    start: startOfMonth(2024, 8),
    end: dayAt(2026, 4, 30),
    detailTitle: "Master of Engineering in Computer Science",
    detailLead: ["University of Cincinnati", "August 2024 to April 2026"],
    detailBody: [
      "GPA: 4.0/4.0",
      "Relevant Coursework: Advanced Algorithms I, Advanced Algorithms II, Distributed Operating Systems, Software Testing and QA, Introduction to Cloud Computing, Large Scale Software Engineering, Network Security, Innovation Design Thinking",
      "Capstone: Curricular Practical Training internship at Cincinnati Children's Hospital Medical Center",
    ],
    detailImage: "/images/uc_logo.png",
  },
  {
    id: "abhibus-2023-2024",
    dateLabel: "AbhiBus (Ixigo) · Software Engineer Intern",
    description: ["Software Engineer Intern", "AbhiBus (Ixigo)"],
    category: "work",
    start: startOfMonth(2023, 6),
    end: endOfMonth(2024, 6),
    detailTitle: "Software Engineer Intern",
    detailLead: ["AbhiBus (Ixigo)", "June 2023 to June 2024"],
    detailBody: [
      "I improved booking flow reliability across React transport apps by implementing centralized session management. I also resolved 50 or more SOAP integration issues, reducing backend API errors by 95% and improving production stability.",
      "I automated travel package reporting workflows, which reduced manual reporting effort and cut refresh time by more than 60%. I expanded backend support for booking workflows by developing and documenting 5 or more Node.js REST APIs.",
    ],
    detailImage: "/images/abhibus.png",
  },
  {
    id: "freelance-graphic-2017-2021",
    dateLabel: "Freelance Graphic Designer · Home",
    description: ["Freelance Graphic Designer", "Home"],
    category: "gray",
    start: startOfMonth(2017, 7),
    end: endOfMonth(2021, 11),
  },
  {
    id: "fiverr-dev-designer-2021-2023",
    dateLabel: "Fiverr · Developer & Designer",
    description: ["Developer & Designer", "Fiverr"],
    category: "gray",
    start: startOfMonth(2021, 12),
    end: endOfMonth(2023, 5),
    detailTitle: "Developer and Designer",
    detailLead: ["Fiverr", "December 2021 to May 2023"],
    detailBody: [
      "On Fiverr I worked remotely with clients from brief to delivery: logos and brand kits, social and marketing graphics, and small landing pages and promo sites when the scope called for code as well as design.",
      "Most projects were fixed scope with tight turnaround, so I got comfortable clarifying requirements up front, shipping revision rounds without drama, and handing off organized source files and assets people could actually reuse.",
    ],
    detailImage: "/images/fiver.png",
  },
  {
    id: "backstage-pass-game-dev",
    dateLabel: "Backstage Pass · Aug 2019 – Aug 2020",
    description: ["Bachelors in Computer Science and Game Development", "Backstage Pass (Drop out)"],
    category: "education",
    start: startOfMonth(2019, 8),
    end: endOfMonth(2020, 8),
  },
  {
    id: "btech-2020-2024",
    dateLabel: "Malla Reddy Engineering College · B.Tech Computer Science",
    description: ["Bachelors in Computer Science", "Malla Reddy Engineering College"],
    category: "education",
    start: startOfMonth(2020, 11),
    end: endOfMonth(2024, 6),
    detailTitle: "Bachelor of Technology, Computer Science",
    detailLead: ["Malla Reddy Engineering College", "August 2020 to June 2024"],
    detailBody: [
      "GPA: 8.0/10",
      "Relevant coursework included Data Structures and Algorithms, Operating Systems, Database Management Systems, Object Oriented Programming, Computer Networks, Analysis and Design of Algorithms, Software Engineering, Compiler Design, and Internet of Things.",
    ],
    detailImage: "/images/mrec.png",
  },
  {
    id: "newton-school-partner",
    dateLabel: "Newton School · Partner",
    description: ["Partner", "Newton School"],
    category: "tech",
    start: startOfMonth(2022, 6),
    end: endOfMonth(2023, 4),
    detailTitle: "Partner",
    detailLead: ["Newton School", "June 2022 to June 2023"],
    detailBody: [
      "During my tenure as CodeChef Chapter President, I had the privilege of fostering a valuable partnership with Newton School, a prominent organization dedicated to providing highly immersive learning to millions of students and working professionals. Through this collaboration, Newton School provided essential support and resources for our club's competitions, enhancing the overall experience for our members and contributing to the success of our events.",
    ],
    detailImage: "/images/newton.png",
  },
  {
    id: "slate-the-school",
    dateLabel: "Slate the School · Jan 2014 – May 2017",
    description: ["High School", "Slate the School"],
    category: "education",
    start: startOfMonth(2014, 1),
    end: endOfMonth(2017, 5),
  },
  {
    id: "trividya-2017-2019",
    dateLabel: "Trividya · Jun 2017 – Jun 2019",
    description: ["Intermediate MPC", "Trividya"],
    category: "education",
    start: startOfMonth(2017, 6),
    end: endOfMonth(2019, 6),
  },
];

/** Shorter events drawn on top of a parent education bar (same column, higher z-index). */
interface CalendarOverlay extends TimelineEvent {
  parentId: string;
}

const calendarOverlays: CalendarOverlay[] = [
  {
    id: "uc-bearcat-package",
    parentId: "uc-meng-cs",
    dateLabel: "Bearcats Package Center + Mail · Student worker",
    description: ["Student worker", "Bearcats Package Center"],
    category: "work",
    start: startOfMonth(2024, 8),
    end: endOfMonth(2024, 12),
    detailTitle: "Student worker, Bearcats Package Center + Mail",
    detailLead: ["University of Cincinnati", "August 2024 to December 2024"],
    detailBody: [
      "The Bearcats Package Center + Mail is UC's centralized mail and package hub in Tangeman University Center (TUC). Many on campus residents ship deliveries there (USPS, UPS, FedEx, Amazon). The operation centers on a secure, self service smart locker system. Students get an email when something is ready, then scan a barcode to open the right locker. Oversized or special handling items are routed to the service desk instead.",
      "As a student worker I supported day to day operations during a stretch that included heavy move in volume: helping classmates at the desk, answering questions about pickup and holds, and keeping the locker workflow understandable when lines and notifications were both piling up.",
    ],
    detailImage: "/images/bearcatspackagecenter.png",
  },
  {
    id: "codechef-president",
    parentId: "btech-2020-2024",
    dateLabel: "CodeChef Chapter · President",
    description: ["President", "CodeChef Chapter"],
    category: "achievement",
    start: startOfMonth(2021, 9),
    end: endOfMonth(2023, 9),
    detailTitle: "President, CodeChef Chapter",
    detailLead: ["Malla Reddy Engineering College", "September 2021 to September 2023"],
    detailBody: [
      "I managed a team of fifteen students, organized events, and coordinated rewards so the chapter could keep programs running smoothly.",
      "I orchestrated 20 or more coding contests and skill building workshops for more than seven hundred undergraduate students. I built a custom Discord bot that improved server moderation for a community of more than four hundred users.",
      "I developed and deployed the club website mrec.club using jQuery and Bootstrap to streamline events, and built hack.mrec.club to share contest information and take entries.",
    ],
    detailImage: "/images/codechef.png",
  },
];

function findTimelineEntry(id: string | null): TimelineEvent | CalendarOverlay | null {
  if (!id) return null;
  return events.find((e) => e.id === id) ?? calendarOverlays.find((o) => o.id === id) ?? null;
}

function entryHasDetailPanel(
  ev: Pick<TimelineEvent, "detailImage" | "detailTitle" | "detailLead" | "detailBody">,
): boolean {
  return Boolean(
    ev.detailImage ||
      ev.detailTitle ||
      (ev.detailLead && ev.detailLead.length > 0) ||
      (ev.detailBody && ev.detailBody.length > 0),
  );
}

function dayStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0).getTime();
}

function dayEndExclusive(d: Date) {
  return dayStart(d) + 86400000;
}

/** Push exclusive timeline end `hi` to include `n` more calendar months after the month of `latestEnd`. */
function extendHiByMonthsAfter(latestEnd: Date, hi: number, n: number): number {
  const y = latestEnd.getFullYear();
  const m0 = latestEnd.getMonth();
  const lastDay = new Date(y, m0 + n + 1, 0, 12, 0, 0);
  return Math.max(hi, dayEndExclusive(lastDay));
}

/** Left portion of the track reserved for education (far left); other categories pack in the remainder. */
const EDUCATION_ZONE_PCT = 36;

function assignLanes(list: TimelineEvent[]) {
  type Row = TimelineEvent & { startMs: number; endMs: number; lane: number };
  const rows: Row[] = list.map((ev) => ({
    ...ev,
    startMs: dayStart(ev.start),
    endMs: dayEndExclusive(ev.end),
    lane: 0,
  }));
  rows.sort((a, b) => a.startMs - b.startMs || b.endMs - a.endMs - (a.endMs - a.startMs));

  const laneLastEnd: number[] = [];
  for (const ev of rows) {
    let lane = laneLastEnd.findIndex((lastEnd) => ev.startMs >= lastEnd);
    if (lane === -1) {
      lane = laneLastEnd.length;
      laneLastEnd.push(ev.endMs);
    } else {
      laneLastEnd[lane] = Math.max(laneLastEnd[lane], ev.endMs);
    }
    ev.lane = lane;
  }

  return { rows, numLanes: Math.max(1, laneLastEnd.length) };
}

function blockTheme(c: Category): { bar: string; box: string; title: string } {
  switch (c) {
    case "education":
      return {
        bar: "border-l-[5px] border-l-red-600 dark:border-l-red-400",
        box: "border border-red-300/90 bg-red-50/85 dark:border-red-800/70 dark:bg-red-950/54",
        title: "text-red-950 dark:text-red-50",
      };
    case "work":
      return {
        bar: "border-l-[5px] border-l-emerald-600 dark:border-l-emerald-400",
        box: "border border-emerald-300/90 bg-emerald-50/85 dark:border-emerald-800/70 dark:bg-emerald-950/54",
        title: "text-emerald-950 dark:text-emerald-50",
      };
    case "gray":
      return {
        bar: "border-l-[5px] border-l-zinc-500 dark:border-l-zinc-400",
        box: "border border-zinc-300/90 bg-zinc-100/90 dark:border-zinc-600/90 dark:bg-zinc-800/80",
        title: "text-zinc-900 dark:text-zinc-100",
      };
    case "tech":
      return {
        bar: "border-l-[5px] border-l-yellow-500 dark:border-l-yellow-400",
        box: "border border-yellow-300/90 bg-yellow-50/85 dark:border-yellow-700/70 dark:bg-yellow-950/45",
        title: "text-yellow-950 dark:text-yellow-50",
      };
    case "content":
      return {
        bar: "border-l-[5px] border-l-red-600 dark:border-l-red-400",
        box: "border border-red-300/90 bg-red-50/85 dark:border-red-800/70 dark:bg-red-950/54",
        title: "text-red-950 dark:text-red-50",
      };
    case "achievement":
      return {
        bar: "border-l-[5px] border-l-indigo-600 dark:border-l-indigo-400",
        box: "border border-indigo-300/90 bg-indigo-50/85 dark:border-indigo-800/70 dark:bg-indigo-950/54",
        title: "text-indigo-950 dark:text-indigo-50",
      };
    default:
      return {
        bar: "border-l-[5px] border-l-zinc-600",
        box: "border border-zinc-300 bg-zinc-100/85 dark:border-zinc-600 dark:bg-zinc-800/76",
        title: "text-zinc-900 dark:text-zinc-50",
      };
  }
}

/** Calendar years in [YEAR_ONLY_ERA_START_Y, YEAR_ONLY_ERA_END_Y]: Jan ticks only (full months from next year). */
const YEAR_ONLY_ERA_START_Y = 2014;
const YEAR_ONLY_ERA_END_Y = 2020;

function isYearOnlyCalendarYear(y: number) {
  return y >= YEAR_ONLY_ERA_START_Y && y <= YEAR_ONLY_ERA_END_Y;
}

/** Soft gradient overlay on the schedule track (can extend past year-only grid). */
const FADE_BAND_START_Y = 2014;
const FADE_BAND_END_Y = 2021;

/** No floating month/year label on the right axis for these calendar years. */
const AXIS_HOVER_DISABLED_START_Y = 2014;
const AXIS_HOVER_DISABLED_END_Y = 2021;

function isAxisHoverLabelDisabled(y: number) {
  return y >= AXIS_HOVER_DISABLED_START_Y && y <= AXIS_HOVER_DISABLED_END_Y;
}

/** Events overlapping this span render slightly faded from 2014 onward (hover / selected = full opacity). */
const EVENT_FADE_FROM_MS = dayStart(startOfMonth(2014, 1));
const EVENT_FADE_UNTIL_MS = dayStart(startOfMonth(2022, 1));

function eventOverlapsFadeEra(startMs: number, endMs: number): boolean {
  return endMs > EVENT_FADE_FROM_MS && startMs < EVENT_FADE_UNTIL_MS;
}

/** Calendar years 2014–2019 use less vertical space than strict proportion (ratio of fair linear height). */
const COMPRESS_ERA_START_Y = 2014;
const COMPRESS_ERA_END_Y = 2019;
/** 1 = linear; lower = tighter 2014–2019 band. */
const COMPRESS_BAND_VS_LINEAR = 0.56;

function buildCompressedVerticalScale(minMs: number, maxMs: number) {
  const range = Math.max(maxMs - minMs, 86400000);
  const linearFromBottom = (t: number) => ((t - minMs) / range) * TRACK_HEIGHT_PX;
  const tC0 = dayStart(startOfMonth(COMPRESS_ERA_START_Y, 1));
  const tC1 = dayStart(startOfMonth(COMPRESS_ERA_END_Y + 1, 1));

  const tLo = Math.max(minMs, tC0);
  const tHi = Math.min(maxMs, tC1);
  const dtB = Math.max(0, tHi - tLo);
  const dtA = Math.max(0, tLo - minMs);
  const dtC = Math.max(0, maxMs - tHi);

  if (dtB <= 0) {
    return {
      distFromBottom: linearFromBottom,
      timeFromClampedPointer: (p: number) => {
        const clamped = Math.max(0, Math.min(TRACK_HEIGHT_PX, p));
        return minMs + (clamped / TRACK_HEIGHT_PX) * range;
      },
    };
  }

  const rangeMs = dtA + dtB + dtC;
  const hBLinear = (dtB / rangeMs) * TRACK_HEIGHT_PX;
  const hB = hBLinear * COMPRESS_BAND_VS_LINEAR;
  const rem = Math.max(0, TRACK_HEIGHT_PX - hB);
  const sumAC = dtA + dtC;
  const hA = sumAC > 0 ? rem * (dtA / sumAC) : 0;
  const hC = sumAC > 0 ? rem * (dtC / sumAC) : rem;

  return {
    distFromBottom(t: number): number {
      if (t <= minMs) return 0;
      if (t >= maxMs) return TRACK_HEIGHT_PX;
      if (t < tLo) {
        if (dtA <= 0) return 0;
        return ((t - minMs) / dtA) * hA;
      }
      if (t < tHi) {
        return hA + ((t - tLo) / dtB) * hB;
      }
      if (dtC <= 0) return hA + hB;
      return hA + hB + ((t - tHi) / dtC) * hC;
    },
    timeFromClampedPointer(p: number): number {
      const clamped = Math.max(0, Math.min(TRACK_HEIGHT_PX, p));
      if (clamped <= hA) {
        if (dtA <= 0) return Math.min(tLo, maxMs - 1);
        return minMs + (clamped / hA) * dtA;
      }
      if (clamped <= hA + hB) {
        return tLo + ((clamped - hA) / hB) * dtB;
      }
      if (dtC <= 0) return maxMs - 1;
      return tHi + ((clamped - hA - hB) / hC) * dtC;
    },
  };
}

const TRACK_HEIGHT_PX = 1680;
const MIN_BLOCK_PX = 44;
/** Total horizontal pixels to trim vs parent inner (split evenly on each side). */
const OVERLAY_WIDTH_SHRINK_PX = 13;
/** Single right column: year always; months on hover (same vertical scale as bars). */
const YEAR_AXIS_W = 44;

const MONTH_ABBREV = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Every calendar month that overlaps the timeline range, for vertical slices. */
function eachMonthSlice(minMs: number, maxMs: number) {
  const d = new Date(minMs);
  const slices: { y: number; m: number; t0: number; t1: number; label: string }[] = [];
  let tMonth = startOfMonth(d.getFullYear(), d.getMonth() + 1).getTime();
  while (tMonth < maxMs) {
    const md = new Date(tMonth);
    const y = md.getFullYear();
    const m = md.getMonth() + 1;
    const tStart = dayStart(startOfMonth(y, m));
    const tEndEx = dayEndExclusive(endOfMonth(y, m));
    const t0 = Math.max(minMs, tStart);
    const t1 = Math.min(maxMs, tEndEx);
    if (t1 > t0) {
      slices.push({ y, m, t0, t1, label: MONTH_ABBREV[m - 1] });
    }
    tMonth = m === 12 ? startOfMonth(y + 1, 1).getTime() : startOfMonth(y, m + 1).getTime();
  }
  return slices;
}

export default function TimelinePage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Calendar month under the pointer (same vertical scale as bars). */
  const [hoveredYM, setHoveredYM] = useState<{ y: number; m: number } | null>(null);
  const timelineHoverRef = useRef<HTMLDivElement>(null);

  const { minMs, maxMs, years } = useMemo(() => {
    if (events.length === 0) {
      const y = new Date().getFullYear();
      const t0 = startOfMonth(y, 1).getTime();
      const t1 = endOfMonth(y, 12).getTime() + 86400000;
      return { minMs: t0, maxMs: t1, years: [y] };
    }
    let lo = Infinity;
    let hi = -Infinity;
    let latestEnd = new Date(0);
    for (const ev of events) {
      lo = Math.min(lo, dayStart(ev.start));
      const endEx = dayEndExclusive(ev.end);
      hi = Math.max(hi, endEx);
      if (ev.end.getTime() > latestEnd.getTime()) latestEnd = new Date(ev.end);
    }
    hi = extendHiByMonthsAfter(latestEnd, hi, 5);
    const y0 = new Date(lo).getFullYear();
    const y1 = new Date(hi - 1).getFullYear();
    const ys: number[] = [];
    for (let y = y0; y <= y1; y++) ys.push(y);
    return { minMs: lo, maxMs: hi, years: ys };
  }, []);

  const verticalScale = useMemo(() => buildCompressedVerticalScale(minMs, maxMs), [minMs, maxMs]);
  const { distFromBottom, timeFromClampedPointer } = verticalScale;

  const monthSlices = useMemo(() => eachMonthSlice(minMs, maxMs), [minMs, maxMs]);

  const yearOnlyFadeBand = useMemo(() => {
    const tBandStart = dayStart(startOfMonth(FADE_BAND_START_Y, 1));
    const tBandEndEx = dayStart(startOfMonth(FADE_BAND_END_Y + 1, 1));
    const clip0 = Math.max(minMs, tBandStart);
    const clip1 = Math.min(maxMs, tBandEndEx);
    if (clip1 <= clip0) return null;
    const b0 = verticalScale.distFromBottom(clip0);
    const b1 = verticalScale.distFromBottom(clip1);
    return { bottom: Math.min(b0, b1), height: Math.max(Math.abs(b1 - b0), 1) };
  }, [minMs, maxMs, verticalScale]);

  const updateHoveredMonthFromClientY = useCallback(
    (clientY: number) => {
      const el = timelineHoverRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (clientY < rect.top || clientY > rect.bottom) {
        setHoveredYM(null);
        return;
      }
      const fromBottom = rect.bottom - clientY;
      const clamped = Math.max(0, Math.min(TRACK_HEIGHT_PX, fromBottom));
      const t = timeFromClampedPointer(clamped);
      const tc = Math.min(maxMs - 1, Math.max(minMs, t));
      const d = new Date(tc);
      const y = d.getFullYear();
      if (isAxisHoverLabelDisabled(y)) {
        setHoveredYM(null);
        return;
      }
      setHoveredYM({ y, m: d.getMonth() + 1 });
    },
    [minMs, maxMs, timeFromClampedPointer],
  );

  const { educationEvents, otherEvents, eduZonePct } = useMemo(() => {
    const educationEvents = events.filter((e) => e.category === "education");
    const otherEvents = events.filter((e) => e.category !== "education");
    const hasEdu = educationEvents.length > 0;
    const hasOther = otherEvents.length > 0;
    let eduZone = 0;
    if (hasEdu && !hasOther) eduZone = 100;
    else if (hasEdu && hasOther) eduZone = EDUCATION_ZONE_PCT;
    return { educationEvents, otherEvents, eduZonePct: eduZone };
  }, []);

  const { rows: eduRows, numLanes: eduLanes } = useMemo(() => assignLanes(educationEvents), [educationEvents]);
  const { rows: otherRows, numLanes: otherLanes } = useMemo(() => assignLanes(otherEvents), [otherEvents]);

  type LaneRow = TimelineEvent & { startMs: number; endMs: number; lane: number };

  const rowGeometry = (ev: LaneRow) => {
    const b0 = distFromBottom(ev.startMs);
    const b1 = distFromBottom(ev.endMs);
    const rawH = Math.abs(b1 - b0);
    const h = Math.max(rawH, MIN_BLOCK_PX);
    const bottom = Math.min(b0, b1);
    const isEdu = ev.category === "education";
    const z = eduZonePct;
    const otherZone = 100 - z;
    const lanePct = isEdu ? z / eduLanes : otherZone / otherLanes;
    const leftPct = isEdu ? ev.lane * lanePct : z + ev.lane * lanePct;
    return { bottom, h, leftPct, lanePct };
  };

  const allRows: LaneRow[] = [...eduRows, ...otherRows];

  const activeEntry = activeId ? findTimelineEntry(activeId) : null;
  const active = activeEntry && entryHasDetailPanel(activeEntry) ? activeEntry : null;

  useEffect(() => {
    if (!activeId) return;
    const e = findTimelineEntry(activeId);
    if (!e || !entryHasDetailPanel(e)) setActiveId(null);
  }, [activeId]);

  return (
    <div className="w-full min-w-0 max-w-full pb-8 sm:pb-10">
      <div className="max-w-3xl">
        <h2 className="text-base font-medium tracking-tight text-zinc-900 dark:text-white sm:text-lg">Timeline</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          A long narrow autobiography.
        </p>
      </div>

      <div className="mt-6 flex min-w-0 flex-col gap-6 sm:mt-8 sm:gap-8 md:flex-row md:items-start md:gap-10 lg:gap-12">
        <div className="w-full min-w-0 max-w-3xl shrink-0">
          <div className="overflow-x-auto overflow-y-visible overscroll-x-contain rounded-lg border border-zinc-200 bg-zinc-50/50 shadow-sm [-webkit-overflow-scrolling:touch] dark:border-zinc-800 dark:bg-zinc-950/40 sm:rounded-xl">
            <div
              ref={timelineHoverRef}
              className="flex w-full min-w-0 touch-pan-x sm:min-w-[min(100%,420px)]"
              onMouseMove={(e) => updateHoveredMonthFromClientY(e.clientY)}
              onMouseLeave={() => setHoveredYM(null)}
            >
          {/* Schedule track */}
          <div
            className="relative flex-1 border-r border-zinc-200 bg-[length:100%_28px] bg-[linear-gradient(to_bottom,transparent_27px,rgba(0,0,0,0.05)_28px)] dark:border-zinc-800 dark:bg-zinc-950/70 dark:bg-[linear-gradient(to_bottom,transparent_27px,rgba(255,255,255,0.04)_28px)]"
            style={{ height: TRACK_HEIGHT_PX }}
          >
            {monthSlices.map(({ y, m }) => {
              const monthStart = dayStart(startOfMonth(y, m));
              if (monthStart < minMs || monthStart >= maxMs) return null;
              if (isYearOnlyCalendarYear(y) && m !== 1) return null;
              const bottom = distFromBottom(monthStart);
              const isJan = m === 1;
              return (
                <div
                  key={`grid-m-${y}-${m}`}
                  className={`pointer-events-none absolute right-0 left-0 border-t ${
                    isJan
                      ? "border-zinc-300/90 dark:border-zinc-600/90"
                      : "border-zinc-200/45 dark:border-zinc-700/45"
                  }`}
                  style={{ bottom }}
                />
              );
            })}

            {yearOnlyFadeBand ? (
              <div
                className="pointer-events-none absolute left-0 right-0 bg-gradient-to-t from-zinc-100/35 via-zinc-100/60 to-zinc-100/88 dark:from-zinc-950/30 dark:via-zinc-950/58 dark:to-zinc-950/88"
                style={{ bottom: yearOnlyFadeBand.bottom, height: yearOnlyFadeBand.height }}
              />
            ) : null}

            {allRows.map((ev) => {
              const { bottom, h, leftPct, lanePct } = rowGeometry(ev);
              const th = blockTheme(ev.category);
              const baseZ = ev.category === "education" ? "z-[1]" : "z-[2]";
              const hasDetail = entryHasDetailPanel(ev);
              const evSelected = hasDetail && activeId === ev.id;
              const faded = eventOverlapsFadeEra(ev.startMs, ev.endMs) && !evSelected;
              return (
                <button
                  key={ev.id}
                  type="button"
                  disabled={!hasDetail}
                  onClick={
                    hasDetail
                      ? () => setActiveId((id) => (id === ev.id ? null : ev.id))
                      : undefined
                  }
                  className={`absolute flex flex-col items-stretch justify-start overflow-hidden rounded-md px-2 pt-2 pb-1.5 text-left shadow-sm transition-[box-shadow,transform,opacity] sm:px-2.5 ${th.bar} ${th.box} ${
                    hasDetail ? "cursor-pointer hover:z-20 hover:shadow-md" : "cursor-default"
                  } disabled:opacity-100 ${
                    evSelected ? "z-10 opacity-100 ring-2 ring-zinc-400/80 dark:ring-zinc-500" : baseZ
                  } ${faded ? "opacity-[0.82] hover:opacity-100" : ""}`}
                  style={{
                    bottom,
                    height: h,
                    left: `calc(${leftPct}% + 3px)`,
                    width: `calc(${lanePct}% - 6px)`,
                    minHeight: MIN_BLOCK_PX,
                    ...(ev.id === "slate-the-school"
                      ? {
                          WebkitMaskImage: "linear-gradient(to top, transparent, black min(32%, 3.25rem))",
                          maskImage: "linear-gradient(to top, transparent, black min(32%, 3.25rem))",
                        }
                      : {}),
                  }}
                >
                  <div className={`flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden ${th.title}`}>
                    {ev.description.map((line, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? "text-[13px] font-semibold leading-snug tracking-tight sm:text-[15px]"
                            : "text-xs font-medium leading-snug sm:text-sm"
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </button>
              );
            })}

            {calendarOverlays.map((ov) => {
              const parent = allRows.find((r) => r.id === ov.parentId);
              if (!parent) return null;
              const pg = rowGeometry(parent);
              const startMs = dayStart(ov.start);
              const endMs = dayEndExclusive(ov.end);
              const b0 = distFromBottom(startMs);
              const b1 = distFromBottom(endMs);
              const rawH = Math.abs(b1 - b0);
              const oh = Math.max(rawH, MIN_BLOCK_PX);
              const ob = Math.min(b0, b1);
              const th = blockTheme(ov.category);
              const hasDetailOv = entryHasDetailPanel(ov);
              const isOvActive = hasDetailOv && activeId === ov.id;
              const ovFaded = eventOverlapsFadeEra(startMs, endMs) && !isOvActive;

              return (
                <button
                  key={ov.id}
                  type="button"
                  disabled={!hasDetailOv}
                  onClick={
                    hasDetailOv
                      ? () => setActiveId((id) => (id === ov.id ? null : ov.id))
                      : undefined
                  }
                  className={`absolute flex flex-col items-stretch justify-start overflow-hidden rounded-md px-1.5 pt-1.5 pb-1 text-left shadow-none ring-0 transition-[transform,opacity] sm:px-2 ${th.bar} ${th.box} ${
                    hasDetailOv ? "cursor-pointer hover:z-[38]" : "cursor-default"
                  } disabled:opacity-100 ${
                    isOvActive ? "z-[40] opacity-100" : "z-[26]"
                  } ${ovFaded ? "opacity-[0.82] hover:opacity-100" : ""}`}
                  style={{
                    bottom: ob,
                    height: oh,
                    left: `calc(${pg.leftPct}% + ${3 + OVERLAY_WIDTH_SHRINK_PX / 2}px)`,
                    width: `calc(${pg.lanePct}% - ${6 + OVERLAY_WIDTH_SHRINK_PX}px)`,
                    minHeight: MIN_BLOCK_PX,
                  }}
                >
                  <div className={`flex min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden ${th.title}`}>
                    {ov.description.map((line, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? "text-[12px] font-semibold leading-snug tracking-tight sm:text-[14px]"
                            : "text-[11px] font-medium leading-snug sm:text-[13px]"
                        }
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </button>
              );
            })}

            {(() => {
              const now = new Date();
              const t0 = dayStart(startOfMonth(now.getFullYear(), now.getMonth() + 1));
              if (t0 < minMs || t0 >= maxMs) return null;
              const b = distFromBottom(t0);
              return (
                <div
                  key="current-month-marker"
                  className="pointer-events-none absolute z-[32] flex items-center"
                  style={{ bottom: b, left: "10px", right: "14px" }}
                >
                  <div className="h-px flex-1 rounded-full bg-red-600 dark:bg-red-400" />
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-600 dark:bg-red-400" />
                </div>
              );
            })()}
          </div>

          {/* Year + single hovered month (under pointer), same vertical scale */}
          <div
            className="relative shrink-0 overflow-visible border-l border-zinc-200 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/50"
            style={{ width: YEAR_AXIS_W, height: TRACK_HEIGHT_PX }}
          >
            <AnimatePresence mode="sync">
              {hoveredYM &&
                (() => {
                  const { y, m } = hoveredYM;
                  const yearOnly = isYearOnlyCalendarYear(y);
                  let t0: number;
                  let t1: number;
                  let label: string;
                  let motionKey: string;
                  let spanClass: string;
                  if (yearOnly) {
                    t0 = Math.max(minMs, dayStart(startOfMonth(y, 1)));
                    t1 = Math.min(maxMs, dayStart(startOfMonth(y + 1, 1)));
                    if (t1 <= t0) return null;
                    label = String(y);
                    motionKey = `axis-y-${y}`;
                    spanClass =
                      "select-none text-xs font-bold tabular-nums leading-none text-zinc-700 dark:text-zinc-200";
                  } else {
                    const slice = monthSlices.find((s) => s.y === y && s.m === m);
                    const tStart = dayStart(startOfMonth(y, m));
                    const tEndEx = dayEndExclusive(endOfMonth(y, m));
                    t0 = slice?.t0 ?? Math.max(minMs, tStart);
                    t1 = slice?.t1 ?? Math.min(maxMs, tEndEx);
                    if (t1 <= t0) return null;
                    label = slice?.label ?? MONTH_ABBREV[m - 1];
                    motionKey = `axis-m-${y}-${m}`;
                    spanClass =
                      "select-none text-[11px] font-semibold leading-none tracking-tight text-zinc-600 dark:text-zinc-300";
                  }
                  const b0 = distFromBottom(t0);
                  const b1 = distFromBottom(t1);
                  const lo = Math.min(b0, b1);
                  const hi = Math.max(b0, b1);
                  const h = Math.max(hi - lo, yearOnly ? 28 : 14);
                  let bottom = lo;
                  if (bottom + h > TRACK_HEIGHT_PX) {
                    bottom = Math.max(0, TRACK_HEIGHT_PX - h);
                  }
                  return (
                    <motion.div
                      key={motionKey}
                      layout={false}
                      initial={{ opacity: 0, scale: 0.88, y: 3 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: { duration: 0.13, ease: [0.22, 1, 0.36, 1] },
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.88,
                        y: -2,
                        transition: { duration: 0.1, ease: [0.4, 0, 1, 1] },
                      }}
                      className="pointer-events-none absolute right-0 left-0 z-30 flex items-center justify-center drop-shadow-sm"
                      style={{ bottom, height: h }}
                    >
                      <span className={spanClass}>{label}</span>
                    </motion.div>
                  );
                })()}
            </AnimatePresence>
            {years.map((y) => {
              const janStart = dayStart(startOfMonth(y, 1));
              if (janStart >= maxMs) return null;
              const bottom = distFromBottom(janStart);
              return (
                <div
                  key={`y-${y}`}
                  className="pointer-events-none absolute right-0 z-10 flex h-4 items-end justify-end pr-0.5"
                  style={{ bottom }}
                >
                  <span className="text-[10px] font-bold tabular-nums text-zinc-600 dark:text-zinc-300">{y}</span>
                </div>
              );
            })}
          </div>
            </div>
          </div>
        </div>

        {active ? (
          <div className="w-full min-w-0 max-w-full sm:max-w-[min(100%,38rem)] sm:shrink-0 lg:max-w-[40rem]">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:rounded-xl sm:p-6">
              <div
                className={
                  active.detailImage
                    ? "mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                    : "mb-3"
                }
              >
                <div
                  className={
                    active.detailImage
                      ? "w-full min-w-0 flex-1 sm:max-w-none"
                      : ""
                  }
                >
                  <p className="break-words text-sm font-semibold leading-snug text-zinc-900 dark:text-white sm:text-base sm:leading-normal">
                    {active.detailTitle ?? active.description[0] ?? active.dateLabel}
                  </p>
                  {active.detailLead?.length ? (
                    active.detailLead.map((line, i) => (
                      <p key={i} className="mt-1 break-words text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:mt-1 sm:text-[13px]">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="mt-1 break-words text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-[13px]">{active.dateLabel}</p>
                  )}
                </div>
                {active.detailImage ? (
                  <div className="shrink-0 self-end sm:self-start">
                    <div className="relative h-12 w-[6.25rem] sm:h-14 sm:w-[7.25rem] md:h-[4.25rem] md:w-[8.25rem]">
                      <Image
                        src={active.detailImage}
                        alt={active.detailTitle ?? active.description[0] ?? ""}
                        fill
                        className="object-contain object-right object-top"
                        sizes="(max-width: 640px) 100px, (max-width: 768px) 116px, 132px"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              {active.detailBody?.length ? (
                <div className="space-y-2.5 text-[13px] leading-relaxed break-words text-zinc-600 dark:text-zinc-300 sm:space-y-3 sm:text-sm">
                  {active.detailBody.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <ul className="list-disc space-y-1.5 break-words pl-5 text-[13px] leading-relaxed text-zinc-600 marker:text-zinc-400 dark:text-zinc-300 dark:marker:text-zinc-500 sm:space-y-2 sm:text-sm sm:leading-normal">
                  {active.description.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
