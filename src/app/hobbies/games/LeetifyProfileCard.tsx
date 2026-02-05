"use client";

import React, { useEffect, useMemo, useState } from "react";

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

export default function LeetifyProfileCard() {
  const [data, setData] = useState<LeetifyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const winrateText = useMemo(() => {
    if (typeof data?.winrate !== "number") return "—";
    return `${(data.winrate * 100).toFixed(1)}%`;
  }, [data?.winrate]);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <div>
        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading Leetify stats…</p>
        ) : error ? (
          <div className="bg-yellow-50 dark:bg-zinc-800 p-3 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              Could not load Leetify stats ({error}). If your Leetify profile is private/hidden, the public API may not
              return data.
            </p>
          </div>
        ) : !data ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No Leetify data found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Premier</p>
              <p className="text-sm font-medium dark:text-white">{formatMaybeNumber(data?.ranks?.premier)}</p>
            </div>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">FACEIT Level</p>
              <p className="text-sm font-medium dark:text-white">{formatMaybeNumber(data?.ranks?.faceit)}</p>
            </div>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Winrate</p>
              <p className="text-sm font-medium dark:text-white">{winrateText}</p>
            </div>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Matches</p>
              <p className="text-sm font-medium dark:text-white">
                {typeof data?.total_matches === "number" ? new Intl.NumberFormat().format(data.total_matches) : "—"}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-4 grid grid-cols-3 gap-3">
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Aim</p>
                <p className="text-sm font-medium dark:text-white">{formatMaybeNumber(data?.rating?.aim)}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Positioning</p>
                <p className="text-sm font-medium dark:text-white">{formatMaybeNumber(data?.rating?.positioning)}</p>
              </div>
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Utility</p>
                <p className="text-sm font-medium dark:text-white">{formatMaybeNumber(data?.rating?.utility)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

