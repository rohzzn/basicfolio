import AboutClient from './AboutClient';
import { fetchGitHubCalendar } from '@/lib/github-calendar';
import { fetchLanguageCalendar } from '@/lib/github-languages';

export default async function AboutPage() {
  const [calendarData, languageCalendar] = await Promise.all([
    fetchGitHubCalendar('rohzzn'),
    fetchLanguageCalendar(),
  ]);

  return <AboutClient calendarData={calendarData} languageCalendar={languageCalendar} />;
}
