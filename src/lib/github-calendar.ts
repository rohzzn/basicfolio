export type CalendarActivity = {
  date: string;
  count: number;
  level: number;
};

const JOGRUBER_API = 'https://github-contributions-api.jogruber.de/v4/';

export async function fetchGitHubCalendar(username: string): Promise<CalendarActivity[]> {
  try {
    const response = await fetch(`${JOGRUBER_API}${username}?y=last`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as { contributions?: CalendarActivity[] };
    return data.contributions ?? [];
  } catch {
    return [];
  }
}
