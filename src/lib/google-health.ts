// Heart rate from the Fitbit Air, through the Google Health API (the Fitbit
// Web API's replacement; the old one is switched off on 30 October 2026).
// Readings arrive when the Google Health app on the phone syncs, so the
// latest one is usually minutes old, not live.

const API = 'https://health.googleapis.com/v4/users/me/dataTypes';

export interface HeartReading {
  // Latest heart rate, null when nothing has synced in the last LATEST_WINDOW_HOURS
  bpm: number | null;
  at: string | null;
  // Most recent daily resting heart rate
  resting: number | null;
}

const LATEST_WINDOW_HOURS = 12;

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

// list returns newest first, so one point is the latest
async function listNewest(token: string, dataType: string, filter: string) {
  const url = new URL(`${API}/${dataType}/dataPoints`);
  url.searchParams.set('pageSize', '1');
  url.searchParams.set('filter', filter);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Google Health ${dataType} ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data.dataPoints?.[0] ?? null;
}

const toBpm = (value: unknown): number | null => {
  const bpm = Number(value);
  return Number.isFinite(bpm) && bpm > 0 ? bpm : null;
};

export async function getHeartReading(): Promise<HeartReading | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const since = new Date(Date.now() - LATEST_WINDOW_HOURS * 3_600_000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

  const [latest, resting] = await Promise.all([
    listNewest(token, 'heart-rate', `heart_rate.sample_time.physical_time >= "${since}"`),
    listNewest(token, 'daily-resting-heart-rate', `daily_resting_heart_rate.date >= "${weekAgo}"`),
  ]);

  return {
    bpm: toBpm(latest?.heartRate?.beatsPerMinute),
    at: latest?.heartRate?.sampleTime?.physicalTime ?? null,
    resting: toBpm(resting?.dailyRestingHeartRate?.beatsPerMinute),
  };
}
