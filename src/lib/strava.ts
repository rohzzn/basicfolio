import type { StravaActivity } from '@/lib/activities-types';

function stravaCredentials() {
  const clientId =
    process.env.STRAVA_CLIENT_ID ?? process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret =
    process.env.STRAVA_CLIENT_SECRET ?? process.env.NEXT_PUBLIC_STRAVA_CLIENT_SECRET;
  const refreshToken =
    process.env.STRAVA_REFRESH_TOKEN ?? process.env.NEXT_PUBLIC_STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  return { clientId, clientSecret, refreshToken };
}

export async function getStravaAccessToken(): Promise<string | null> {
  const creds = stravaCredentials();
  if (!creds) return null;

  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: creds.refreshToken,
      grant_type: 'refresh_token',
    }),
    cache: 'no-store',
  });

  const data = await response.json();
  return data.access_token ?? null;
}

export async function fetchAllStravaActivities(): Promise<StravaActivity[]> {
  const accessToken = await getStravaAccessToken();
  if (!accessToken) {
    throw new Error('Strava API credentials not configured');
  }

  const all: StravaActivity[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Strava HTTP ${response.status}`);
    }

    const batch: StravaActivity[] = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    all.push(...batch);
    if (batch.length < 200) break;
    page += 1;
  }

  return all.sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );
}

/** @deprecated Use getStravaActivityDetailCached from strava-enrich instead. */
export async function fetchStravaActivityDetail(
  activityId: number
): Promise<Pick<import('@/lib/activities-types').StravaActivity, 'photos' | 'total_photo_count' | 'map'>> {
  const { getStravaActivityDetailCached } = await import('@/lib/strava-enrich');
  const detail = await getStravaActivityDetailCached(activityId);
  if (!detail) throw new Error(`Strava detail unavailable for ${activityId}`);
  return {
    photos: detail.urls.length
      ? {
          primary: { urls: { '600': detail.urls[0], '100': detail.urls[0] } },
          count: detail.urls.length,
        }
      : undefined,
    total_photo_count: detail.urls.length,
    map: detail.map,
  };
}
