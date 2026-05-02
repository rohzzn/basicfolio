/** Cal.com API base; username for this site’s scheduling. */
export const CAL_API_BASE = 'https://api.cal.com/v2';

export function calUsername(): string {
  return process.env.CAL_USERNAME?.trim() || 'rohzzn';
}

export function requireCalApiKey(): string | null {
  const key = process.env.CAL_API_KEY?.trim();
  return key || null;
}
