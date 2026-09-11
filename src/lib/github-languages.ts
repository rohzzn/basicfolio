/**
 * Per-day language for the contributions calendar.
 *
 * GitHub's GraphQL `contributionsCollection` gives commit counts grouped by day
 * *and* by repository, and every repository carries a primary language — which
 * is enough to say "this day was mostly TypeScript". Days that came from private
 * contributions GitHub will not attribute to a repo simply have no language and
 * fall back to the neutral scale, which is the point: hue is a hint, not a claim.
 */

export type LanguageMap = Record<string, string>;

export interface LanguageCalendar {
  /** ISO date (YYYY-MM-DD) → dominant language name for that day. */
  byDate: LanguageMap;
  /** Languages present, most commits first — the legend's source of truth. */
  languages: string[];
}

const EMPTY: LanguageCalendar = { byDate: {}, languages: [] };

/**
 * Hue per language, at a saturation low enough that the calendar still reads
 * as grey from a distance. Lightness comes from the activity level, so volume
 * and language stay on separate visual channels.
 */
const LANGUAGE_HUE: Record<string, number> = {
  typescript: 214,
  javascript: 45,
  python: 96,
  go: 190,
  html: 18,
  css: 268,
  scss: 268,
  rust: 6,
  java: 32,
  'c++': 322,
  c: 322,
  'c#': 288,
  shell: 138,
  ruby: 352,
  swift: 20,
  kotlin: 272,
  php: 250,
  dart: 178,
  lua: 226,
  vue: 158,
  svelte: 14,
  jupyter: 36,
  'jupyter notebook': 36,
};

/** Lightness per activity level, matched to the existing zinc/neutral ramps. */
const LIGHTNESS = {
  light: [90, 65, 46, 34, 26],
  dark: [15, 32, 45, 83, 94],
} as const;

const SATURATION = { light: 20, dark: 24 } as const;

export function languageHue(language: string | undefined): number | null {
  if (!language) return null;
  const hue = LANGUAGE_HUE[language.toLowerCase()];
  return hue ?? null;
}

/**
 * The fill for one calendar block. Returns null when the day has no language,
 * letting the calendar's own monochrome scale stand.
 */
export function languageColor(
  language: string | undefined,
  level: number,
  scheme: 'light' | 'dark'
): string | null {
  const hue = languageHue(language);
  if (hue === null || level <= 0) return null;

  const lightness = LIGHTNESS[scheme][Math.min(level, 4)];
  return `hsl(${hue} ${SATURATION[scheme]}% ${lightness}%)`;
}

/**
 * The swatch used in the legend. The two ramps run opposite ways, so each
 * scheme picks the step where hue is most legible: a dark tint on paper, a
 * mid tint on near-black. The calendar's own pale top end would read as
 * five identical off-whites here.
 */
export function languageSwatch(language: string, scheme: 'light' | 'dark'): string {
  const level = scheme === 'dark' ? 2 : 3;
  return languageColor(language, level, scheme) ?? (scheme === 'dark' ? '#525252' : '#a1a1aa');
}

interface ContributionsResponse {
  data?: {
    viewer?: {
      contributionsCollection?: {
        commitContributionsByRepository?: Array<{
          repository?: { primaryLanguage?: { name?: string } | null };
          contributions?: { nodes?: Array<{ occurredAt?: string; commitCount?: number }> };
        }>;
      };
    };
  };
  errors?: unknown;
}

const QUERY = `
query($from: DateTime!, $to: DateTime!) {
  viewer {
    contributionsCollection(from: $from, to: $to) {
      commitContributionsByRepository(maxRepositories: 100) {
        repository { primaryLanguage { name } }
        contributions(first: 100) { nodes { occurredAt commitCount } }
      }
    }
  }
}`;

export async function fetchLanguageCalendar(): Promise<LanguageCalendar> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return EMPTY;

  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 9);

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { from: from.toISOString(), to: to.toISOString() },
      }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return EMPTY;

    const payload = (await response.json()) as ContributionsResponse;
    if (payload.errors) return EMPTY;

    const repositories =
      payload.data?.viewer?.contributionsCollection?.commitContributionsByRepository ?? [];

    // date → language → commits, so a mixed day resolves to whatever dominated it.
    const perDay = new Map<string, Map<string, number>>();
    const totals = new Map<string, number>();

    for (const entry of repositories) {
      const language = entry.repository?.primaryLanguage?.name;
      if (!language || languageHue(language) === null) continue;

      for (const node of entry.contributions?.nodes ?? []) {
        const date = node.occurredAt?.slice(0, 10);
        if (!date) continue;
        const commits = node.commitCount ?? 0;
        if (commits <= 0) continue;

        const day = perDay.get(date) ?? new Map<string, number>();
        day.set(language, (day.get(language) ?? 0) + commits);
        perDay.set(date, day);

        totals.set(language, (totals.get(language) ?? 0) + commits);
      }
    }

    const byDate: LanguageMap = {};
    for (const [date, day] of perDay) {
      let best = '';
      let bestCount = -1;
      for (const [language, count] of day) {
        if (count > bestCount) {
          best = language;
          bestCount = count;
        }
      }
      if (best) byDate[date] = best;
    }

    const languages = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([language]) => language);

    return { byDate, languages };
  } catch {
    return EMPTY;
  }
}
