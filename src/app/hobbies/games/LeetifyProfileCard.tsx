"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

type LeetifyRecentMatch = Record<string, unknown>;
type MatchDetails = Record<string, unknown>;

function formatMaybeNumber(n: unknown, digits = 0) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return digits === 0 ? `${Math.round(n)}` : n.toFixed(digits);
}

function formatSigned(n: number, digits = 2) {
  const fixed = n.toFixed(digits);
  return n > 0 ? `+${fixed}` : fixed;
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

function asNumber(v: unknown): number | null {
  return typeof v === "number" && !Number.isNaN(v) ? v : null;
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

function asArray(v: unknown): unknown[] | null {
  return Array.isArray(v) ? v : null;
}

function pickMatchId(m: LeetifyRecentMatch): string | null {
  return (
    asString(m.game_id) ??
    asString(m.gameId) ??
    asString(m.id) ??
    asString(m.match_id) ??
    asString(m.matchId) ??
    null
  );
}

function pickMapName(m: LeetifyRecentMatch): string {
  return asString(m.map_name) ?? asString(m.mapName) ?? "Unknown map";
}

function getMyPlayerStats(details: MatchDetails, steam64Id: string | undefined) {
  if (!steam64Id) return null;
  const players = asArray(details.stats ?? details.player_stats ?? details.playerStats);
  if (!players) return null;
  const me = players.find((p) => {
    if (!p || typeof p !== "object") return false;
    const obj = p as Record<string, unknown>;
    return asString(obj.steam64_id) === steam64Id || asString(obj.steam64Id) === steam64Id;
  });
  if (!me || typeof me !== "object") return null;
  return me as Record<string, unknown>;
}

function getScoreline(details: MatchDetails, myTeamNumber: number | null) {
  const teams = asArray(details.team_scores ?? details.teamScores);
  if (!teams || myTeamNumber === null) return null;
  const scores = teams
    .map((t) => (t && typeof t === "object" ? (t as Record<string, unknown>) : null))
    .filter(Boolean) as Record<string, unknown>[];
  const mine = scores.find((t) => asNumber(t.team_number ?? t.teamNumber) === myTeamNumber);
  const opp = scores.find((t) => asNumber(t.team_number ?? t.teamNumber) !== myTeamNumber);
  const myScore = mine ? asNumber(mine.score) : null;
  const oppScore = opp ? asNumber(opp.score) : null;
  if (myScore === null || oppScore === null) return null;
  return { myScore, oppScore };
}

export default function LeetifyProfileCard() {
  const [data, setData] = useState<LeetifyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<LeetifyRecentMatch[] | null>(null);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const [detailsById, setDetailsById] = useState<Record<string, MatchDetails | null>>({});

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

  const mostPlayedMap = useMemo(() => {
    if (!matches || matches.length === 0) return "—";
    const mapCounts: Record<string, number> = {};
    matches.forEach((m) => {
      const mapName = pickMapName(m);
      mapCounts[mapName] = (mapCounts[mapName] || 0) + 1;
    });
    const sorted = Object.entries(mapCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return "—";
    return sorted[0][0].replace(/^de_/, "").replace(/^cs_/, "").replace(/_/g, " ");
  }, [matches]);

  // Load matches when user opens the section
  useEffect(() => {
    if (!matchesOpen) return;
    if (matches !== null) return; // Already loaded
    void loadRecentMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchesOpen]);

  // Auto-fetch match details for enriched cards
  useEffect(() => {
    if (!matchesOpen) return;
    if (!matches || matches.length === 0) return;

    const ids = matches
      .map((m) => pickMatchId(m))
      .filter((x): x is string => Boolean(x))
      .slice(0, 6);

    const missing = ids.filter((id) => !(id in detailsById));
    if (missing.length === 0) return;

    let cancelled = false;
    async function run() {
      const results = await Promise.allSettled(
        missing.map(async (id) => {
          const res = await fetch(`/api/leetify/match-details?game_id=${encodeURIComponent(id)}`, {
            cache: "no-store",
          });
          if (!res.ok) return { id, details: null as MatchDetails | null };
          const json = (await res.json()) as unknown;
          return { id, details: (json && typeof json === "object" ? (json as MatchDetails) : null) as MatchDetails | null };
        })
      );

      if (cancelled) return;
      setDetailsById((prev) => {
        const next = { ...prev };
        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          next[r.value.id] = r.value.details;
        }
        return next;
      });
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [matchesOpen, matches, detailsById]);

  async function loadRecentMatches() {
    const steam64Id = data?.steam64_id;
    if (!steam64Id) return;
    if (matchesLoading) return;
    if (matches !== null) return; // already loaded

    setMatchesLoading(true);
    setMatchesError(false);
    try {
      const res = await fetch(`/api/leetify/matches?steam64_id=${encodeURIComponent(steam64Id)}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        // Don't surface raw HTTP codes in the UI
        if (res.status === 404) {
          setMatches([]);
          return;
        }
        throw new Error("Failed to load");
      }

      const json = (await res.json()) as unknown;
      setMatches(Array.isArray(json) ? (json as LeetifyRecentMatch[]) : []);
    } catch {
      setMatchesError(true);
    } finally {
      setMatchesLoading(false);
    }
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <div>
        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading CS2 stats…</p>
        ) : error ? (
          <div className="bg-yellow-50 dark:bg-zinc-800 p-3 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              Could not load CS2 stats ({error}). If your profile is private/hidden, the public API may not
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
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Matches</p>
                <p className="text-sm font-medium dark:text-white">
                  {typeof data?.total_matches === "number" ? new Intl.NumberFormat().format(data.total_matches) : "—"}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Aim</p>
                  <p className="text-sm font-medium dark:text-white">{formatMaybeNumber(data?.rating?.aim)}</p>
                </div>
                <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Most Played</p>
                  <p className="text-sm font-medium dark:text-white capitalize">{mostPlayedMap}</p>
                </div>
                <button
                  onClick={() => setMatchesOpen(!matchesOpen)}
                  className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/20 p-3 hover:bg-white/80 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer text-left"
                >
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Recent Matches</p>
                  <p className="text-sm font-medium dark:text-white">
                    {matchesOpen ? "Hide ↑" : "View →"}
                  </p>
                </button>
              </div>
            </div>

            {matchesOpen && (
              <>
                {/* Subtle divider */}
                <div className="mt-6 mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-600 to-transparent" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-600 to-transparent" />
                </div>

                {matchesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse animation-delay-200" />
                  <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse animation-delay-400" />
                </div>
              </div>
            ) : matchesError ? (
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-4">Could not load match history.</p>
            ) : !matches || matches.length === 0 ? null : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {matches.slice(0, 6).map((m, idx) => {
                      const map = pickMapName(m);
                      const matchId = pickMatchId(m);

                      const details = matchId ? detailsById[matchId] : null;
                      const myStats = details ? getMyPlayerStats(details, data?.steam64_id) : null;
                      const myTeam = myStats ? asNumber(myStats.initial_team_number ?? myStats.initialTeamNumber) : null;
                      const scoreline = details ? getScoreline(details, myTeam) : null;

                      const kills = myStats ? asNumber(myStats.total_kills ?? myStats.totalKills) : null;
                      const deaths = myStats ? asNumber(myStats.total_deaths ?? myStats.totalDeaths) : null;
                      const dpr = myStats ? asNumber(myStats.dpr) : null;
                      const rating = myStats
                        ? asNumber(myStats.leetify_rating ?? myStats.leetifyRating ?? myStats.rating)
                        : null;
                      const reaction = myStats ? asNumber(myStats.reaction_time ?? myStats.reactionTime) : null;

                      const outcome =
                        scoreline && scoreline.myScore !== scoreline.oppScore
                          ? scoreline.myScore > scoreline.oppScore
                            ? "WIN"
                            : "LOSS"
                          : scoreline
                            ? "DRAW"
                            : null;

                      const outcomeClasses =
                        outcome === "WIN"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                          : outcome === "LOSS"
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25"
                            : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20";

                      const showDetailsStatus = matchId && !(matchId in detailsById);

                      return (
                        <article
                          key={(matchId ? `m-${matchId}` : `i-${idx}`) as string}
                          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/10 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{map}</p>
                              {matchId ? (
                                <Link
                                  href={`https://leetify.com/app/match-details/${encodeURIComponent(matchId)}/overview`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline underline-offset-2"
                                >
                                  View details →
                                </Link>
                              ) : null}
                            </div>

                            <div className="text-right">
                              {outcome ? (
                                <span
                                  className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full border ${outcomeClasses}`}
                                >
                                  {outcome}
                                </span>
                              ) : null}
                              {scoreline ? (
                                <p className="mt-1 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                                  {scoreline.myScore} : {scoreline.oppScore}
                                </p>
                              ) : (
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400"> </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/10 p-2">
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">K/D</p>
                              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                {kills !== null && deaths !== null ? `${kills}/${deaths}` : "—"}
                              </p>
                            </div>
                            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/10 p-2">
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">DPR</p>
                              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                {dpr === null ? "—" : dpr.toFixed(0)}
                              </p>
                            </div>
                            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/10 p-2">
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Rating</p>
                              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                {rating === null ? "—" : formatSigned(rating, 3)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-2">
                            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/10 p-2">
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Reaction</p>
                              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                {reaction === null ? "—" : `${(reaction * 1000).toFixed(0)}ms`}
                              </p>
                            </div>
                          </div>

                          {showDetailsStatus ? (
                            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">Loading match stats…</p>
                          ) : details === null && matchId ? (
                            <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                              Match stats not available.
                            </p>
                          ) : null}
                        </article>
                      );
                    })}
              </div>
            )}
              </>
            )}

          </>
        )}
      </div>
    </div>
  );
}

