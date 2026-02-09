"use client";

import React, { useEffect, useState } from "react";

type LeetifyProfile = {
  name?: string;
  privacy_mode?: string;
  winrate?: number; // 0..1
  total_matches?: number;
  first_match_date?: string;
  steam64_id?: string;
  id?: string;
  ranks?: {
    leetify?: number; // -10..+10-ish
    premier?: number | null;
    faceit?: number | null;
    faceit_elo?: number | null;
    wingman?: number | null;
    renown?: number | null;
  };
  rating?: {
    aim?: number;
    positioning?: number;
    utility?: number;
    clutch?: number;
    opening?: number;
    ct_leetify?: number;
    t_leetify?: number;
  };
};

function formatMaybeNumber(n: unknown, digits = 0) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return digits === 0 ? `${Math.round(n)}` : n.toFixed(digits);
}

function getWingmanRankName(rank: number | null | undefined): string {
  if (typeof rank !== "number") return "—";
  const ranks = [
    "Unranked",
    "Silver I",
    "Silver II",
    "Silver III",
    "Silver IV",
    "Silver Elite",
    "Silver Elite Master",
    "Gold Nova I",
    "Gold Nova II",
    "Gold Nova III",
    "Gold Nova Master",
    "Master Guardian I",
    "Master Guardian II",
    "Master Guardian Elite",
    "Distinguished Master Guardian",
    "Legendary Eagle",
    "Legendary Eagle Master",
    "Supreme Master First Class",
    "The Global Elite",
  ];
  if (rank < 0 || rank >= ranks.length) return "—";
  return ranks[rank];
}

type ValorantData = {
  status: number;
  data: {
    current: {
      tier: {
        name: string;
      };
    };
    peak: {
      tier: {
        name: string;
      };
    };
    seasonal: Array<{
      games: number;
    }>;
  };
};

interface LeetifyProfileCardProps {
  totalSteamHours?: number;
}

export default function LeetifyProfileCard({ totalSteamHours = 0 }: LeetifyProfileCardProps) {
  const [data, setData] = useState<LeetifyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [valorantData, setValorantData] = useState<ValorantData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/leetify/profile", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as LeetifyProfile;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch Valorant data
  useEffect(() => {
    async function fetchValorant() {
      try {
        const response = await fetch('/api/valorant/mmr');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 200) {
            setValorantData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching Valorant data:', error);
      }
    }
    fetchValorant();
  }, []);


  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <div>
        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading stats…</p>
        ) : error ? (
          <div className="bg-yellow-50 dark:bg-zinc-800 p-3 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              Could not load stats ({error}). If your profile is private/hidden, the public API may not
              return data.
            </p>
          </div>
        ) : !data ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No CS2 data found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Wingman</p>
                <p className="text-sm font-medium dark:text-white">{getWingmanRankName(data?.ranks?.wingman)}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Premier</p>
                <p className="text-sm font-medium dark:text-white">{formatMaybeNumber(data?.ranks?.premier)}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">FACEIT Level</p>
                <p className="text-sm font-medium dark:text-white">{formatMaybeNumber(data?.ranks?.faceit)}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Current Rank</p>
                <p className="text-sm font-medium dark:text-white">{valorantData?.data?.current?.tier?.name || "—"}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Peak Rank</p>
                <p className="text-sm font-medium dark:text-white">{valorantData?.data?.peak?.tier?.name || "—"}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">CS2 Matches</p>
                <p className="text-sm font-medium dark:text-white">
                  {typeof data?.total_matches === "number" ? new Intl.NumberFormat().format(data.total_matches) : "—"}
                </p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Valorant Matches</p>
                <p className="text-sm font-medium dark:text-white">
                  {valorantData?.data?.seasonal
                    ? new Intl.NumberFormat().format(
                        valorantData.data.seasonal.reduce((total, season) => total + (season.games || 0), 0)
                      )
                    : "—"}
                </p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Hours</p>
                <p className="text-sm font-medium dark:text-white">
                  {totalSteamHours > 0 ? new Intl.NumberFormat().format(totalSteamHours) : "—"}
                </p>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

