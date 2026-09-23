import AboutClient from './AboutClient';
import { fetchGitHubCalendar } from '@/lib/github-calendar';

export default async function AboutPage() {
  const calendarData = await fetchGitHubCalendar('rohzzn');

  return <AboutClient calendarData={calendarData} />;
}
