import AboutClient from './AboutClient';
import { fetchGitHubCalendar } from '@/lib/github-calendar';
import { fetchLanguageCalendar } from '@/lib/github-languages';
import { fetchLastCommit } from '@/lib/github-last-commit';

export default async function AboutPage() {
  const [calendarData, languageCalendar, initialCommit] = await Promise.all([
    fetchGitHubCalendar('rohzzn'),
    fetchLanguageCalendar(),
    fetchLastCommit(),
  ]);

  return (
    <AboutClient
      calendarData={calendarData}
      languageCalendar={languageCalendar}
      initialCommit={initialCommit}
    />
  );
}
