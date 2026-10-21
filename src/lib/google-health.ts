// Today's step count from the Fitbit Air, through the Google Health API (the
// Fitbit Web API's replacement; the old one is switched off on 30 October 2026).
// Steps arrive when the Google Health app on the phone syncs, so the count
// trails the band by a few minutes.

const API = 'https://health.googleapis.com/v4/users/me/dataTypes';

// "Today" is my day, wherever the server runs
const TIME_ZONE = 'America/New_York';

let cachedToken: { token: string; expiresAt: number } | null = null;

export function isGoogleHealthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_HEALTH_CLIENT_ID &&
      process.env.GOOGLE_HEALTH_CLIENT_SECRET &&
      process.env.GOOGLE_HEALTH_REFRESH_TOKEN
  );
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_HEALTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_HEALTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('Google Health token refresh failed:', response.status, await response.text());
    return null;
  }

  const data = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

// Google counts days by the wearer's own clock, so the range is plain dates
function civilDate(date: Date) {
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE })
    .format(date)
    .split('-')
    .map(Number);
  return { year, month, day };
}

export async function getStepsToday(): Promise<number | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const today = civilDate(new Date());
  const tomorrow = new Date(Date.UTC(today.year, today.month - 1, today.day + 1));

  const response = await fetch(`${API}/steps/dataPoints:dailyRollUp`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      range: {
        start: { date: today },
        end: {
          date: { year: tomorrow.getUTCFullYear(), month: tomorrow.getUTCMonth() + 1, day: tomorrow.getUTCDate() },
        },
      },
      windowSizeDays: 1,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Google Health steps ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const day = data.rollupDataPoints?.[0];
  if (!day) return null;

  // A day with no steps yet leaves the sum out rather than sending 0
  const steps = Number(day.steps?.countSum ?? 0);
  return Number.isFinite(steps) ? steps : null;
}
