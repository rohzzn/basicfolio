import AboutClient from './AboutClient';
import { fetchGitHubCalendar } from '@/lib/github-calendar';
import { fetchLanguageCalendar } from '@/lib/github-languages';
import { fetchNow } from '@/lib/now';

export default async function AboutPage() {
  const [calendarData, languageCalendar, now] = await Promise.all([
    fetchGitHubCalendar('rohzzn'),
    fetchLanguageCalendar(),
    fetchNow(),
  ]);

  return (
    <AboutClient
      calendarData={calendarData}
      languageCalendar={languageCalendar}
      now={now}
    />
  );
}
