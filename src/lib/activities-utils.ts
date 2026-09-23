import type { StatsPeriod } from '@/lib/activities-types';

// The start of a stats period: seven or thirty days back from the start of today, or no start for
// all time.
export function periodStart(period: StatsPeriod): Date | null {
  if (period === 'all') return null;
  const start = new Date();
  start.setDate(start.getDate() - (period === 'week' ? 7 : 30));
  start.setHours(0, 0, 0, 0);
  return start;
}
