"use client";

import React, { useMemo, useState } from "react";
import { L } from "../demo-utils";

const AU_KM = 149_597_870.7;
const S = 0.04;
const MAX_AU = 200;
const WORLD_R = 500;

function radiusForAu(rAu: number) {
  const f = (r: number) => Math.log10(1 + r / S);
  const k = WORLD_R / f(MAX_AU);
  return k * f(rAu);
}

function project(r: readonly [number, number, number]) {
  const rAu = Math.hypot(r[0], r[1], r[2]) / AU_KM;
  const angle = Math.atan2(r[1], r[0]);
  const radius = radiusForAu(rAu);
  return {
    x: radius * Math.cos(angle),
    y: -radius * Math.sin(angle),
    rAu,
  };
}

const GROUPS = [
  { id: "interstellar", label: "Interstellar & Kuiper Belt", color: "#c084fc", count: 3 },
  { id: "outer", label: "At the Outer Planets", color: "#fb923c", count: 1 },
  { id: "cruise", label: "En Route", color: "#38bdf8", count: 3 },
  { id: "asteroid", label: "Asteroid Hunters", color: "#a3e635", count: 4 },
  { id: "mars", label: "The Mars Fleet", color: "#f87171", count: 7 },
  { id: "solar", label: "Solar Watchers", color: "#facc15", count: 4 },
  { id: "near-earth", label: "Deep-Space Neighbors (L1/L2)", color: "#5eead4", count: 3 },
] as const;

const PLANETS = [
  { id: "mercury", label: "Mercury", color: "#9ca3af", r: [-25025451, -61416295, -7314419] as const },
  { id: "venus", label: "Venus", color: "#e7c07b", r: [-72838289, -80062809, 3102735] as const },
  { id: "earth", label: "Earth", color: "#60a5fa", r: [54278713, -142052393, 7903] as const },
  { id: "mars", label: "Mars", color: "#ef4444", r: [159415268, 148618739, -794434] as const },
  { id: "jupiter", label: "Jupiter", color: "#d9a066", r: [-450481106, 648876005, 7383454] as const },
  { id: "saturn", label: "Saturn", color: "#e8d191", r: [1399695217, 199152721, -59184528] as const },
  { id: "uranus", label: "Uranus", color: "#7dd3fc", r: [1377726448, 2563766058, -8342369] as const },
  { id: "neptune", label: "Neptune", color: "#818cf8", r: [4465514719, 169050027, -106386995] as const },
  { id: "pluto", label: "Pluto", color: "#a78bfa", r: [2954740908, -4406177137, -383053921] as const },
] as const;

const CRAFT = [
  { id: "voyager-1", label: "Voyager 1", group: "interstellar", r: [-4797328641, -20375369129, 14742079960] as const },
  { id: "jwst", label: "JWST", group: "near-earth", r: [54223452, -143740099, -249192] as const },
  { id: "curiosity", label: "Curiosity", group: "mars", r: [159418167, 148618645, -796191] as const },
  { id: "parker-solar-probe", label: "Parker Solar Probe", group: "solar", r: [81836597, -68009504, -5656830] as const },
  { id: "juice", label: "JUICE", group: "outer", r: [146848601, -152888258, -458039] as const },
  { id: "lucy", label: "Lucy", group: "asteroid", r: [-559123805, -451289752, -37398054] as const },
  { id: "europa-clipper", label: "Europa Clipper", group: "cruise", r: [-5885664, -211838886, -2210997] as const },
] as const;

const GRID_RINGS_AU = [0.1, 0.5, 1, 2, 5.2, 10, 30, 50, 100, 170];

const SECTIONS = [
  { id: "map", label: "Fleet map", detail: "Log-scale solar map with live JPL Horizons positions." },
  { id: "photos", label: "Photos", detail: "Mars rover feeds, NASA Image API, and daily APOD wallpapers." },
  { id: "crew", label: "Who's in space", detail: "Crew roster, EVA history, and live ISS tracking." },
  { id: "launches", label: "Launches", detail: "Upcoming launches from The Space Devs API." },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function SpaceDemo() {
  const [activeGroup, setActiveGroup] = useState<string>("interstellar");
  const [section, setSection] = useState<SectionId>("map");

  const group = GROUPS.find((g) => g.id === activeGroup) ?? GROUPS[0];
  const sectionMeta = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  const visibleCraft = useMemo(
    () => CRAFT.filter((craft) => craft.group === activeGroup),
    [activeGroup]
  );

  const mapPoints = useMemo(() => {
    const rings = GRID_RINGS_AU.map((au) => ({
      au,
      r: radiusForAu(au),
    }));
    const planets = PLANETS.map((planet) => ({
      ...planet,
      ...project(planet.r),
    }));
    const craft = CRAFT.map((item) => ({
      ...item,
      ...project(item.r),
      active: item.group === activeGroup,
    }));
    return { rings, planets, craft };
  }, [activeGroup]);

  return (
    <div className="my-8 not-prose">
      <p className={L}>Still Flying</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
              section === item.id
                ? "bg-zinc-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "bg-zinc-100 text-zinc-500 hover:text-zinc-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === "map" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,240px)_1fr]">
          <div className="space-y-1.5">
            {GROUPS.map((item) => {
              const selected = activeGroup === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveGroup(item.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "border-zinc-300 bg-zinc-100 dark:border-neutral-700 dark:bg-neutral-800/80"
                      : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-xs font-medium text-zinc-800 dark:text-neutral-200">
                      {item.label}
                    </p>
                  </div>
                  <p className="mt-0.5 pl-4 text-[11px] text-zinc-400 dark:text-neutral-500">
                    {item.count} active craft
                  </p>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-[#05070f] dark:border-neutral-800">
            <svg
              viewBox={`${-WORLD_R} ${-WORLD_R} ${WORLD_R * 2} ${WORLD_R * 2}`}
              className="aspect-square w-full"
              role="img"
              aria-label="Log-scale solar system map"
            >
              <rect x={-WORLD_R} y={-WORLD_R} width={WORLD_R * 2} height={WORLD_R * 2} fill="#05070f" />

              {mapPoints.rings.map((ring) => (
                <circle
                  key={ring.au}
                  cx={0}
                  cy={0}
                  r={ring.r}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                />
              ))}

              <circle cx={0} cy={0} r={14} fill="#ffd75e" opacity={0.95} />

              {mapPoints.planets.map((planet) => (
                <g key={planet.id}>
                  <circle cx={planet.x} cy={planet.y} r={5} fill={planet.color} />
                </g>
              ))}

              {mapPoints.craft.map((craft) => (
                <g key={craft.id}>
                  <circle
                    cx={craft.x}
                    cy={craft.y}
                    r={craft.active ? 6 : 4}
                    fill={group.color}
                    opacity={craft.active ? 1 : 0.45}
                    stroke={craft.active ? "#fff" : "none"}
                    strokeWidth={craft.active ? 1.5 : 0}
                  />
                </g>
              ))}
            </svg>

            <div className="border-t border-white/10 px-4 py-3">
              <p className="text-xs font-medium text-zinc-200">{group.label}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                True orbital angles · log-scale distances · JPL Horizons snapshot
              </p>
              {visibleCraft.length > 0 ? (
                <p className="mt-2 text-[11px] text-zinc-400">
                  {visibleCraft.map((craft) => craft.label).join(" · ")}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-zinc-500">
                  Select another group to highlight its craft on the map.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-5 dark:border-neutral-800 dark:bg-neutral-900/40">
          <p className="text-sm font-medium text-zinc-900 dark:text-paper">{sectionMeta.label}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-neutral-400">
            {sectionMeta.detail}
          </p>
        </div>
      )}
    </div>
  );
}
