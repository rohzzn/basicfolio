import AboutClient from './AboutClient';
import { fetchGitHubCalendar } from '@/lib/github-calendar';
import { fetchLastCommit } from '@/lib/github-last-commit';

export default async function AboutPage() {
  const [calendarData, initialCommit] = await Promise.all([
    fetchGitHubCalendar('rohzzn'),
    fetchLastCommit(),
  ]);

  return <AboutClient calendarData={calendarData} initialCommit={initialCommit} />;
}
