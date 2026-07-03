import { getRedis } from '@/lib/redis';

const REDIS_KEY = 'instagram:access_token';
const REFRESH_BUFFER_MS = 7 * 24 * 60 * 60 * 1000;

type CachedToken = {
  token: string;
  expiresAt: number;
};

async function refreshInstagramToken(
  token: string
): Promise<{ access_token: string; expires_in: number } | null> {
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`,
    { cache: 'no-store' }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data?.access_token || typeof data.expires_in !== 'number') return null;

  return { access_token: data.access_token, expires_in: data.expires_in };
}

async function readCachedToken(): Promise<CachedToken | null> {
  const redis = getRedis();
  if (!redis) return null;

  const cached = await redis.get<CachedToken>(REDIS_KEY);
  if (!cached?.token || typeof cached.expiresAt !== 'number') return null;

  return cached;
}

async function writeCachedToken(token: string, expiresIn: number): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const entry: CachedToken = {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  await redis.set(REDIS_KEY, entry, { ex: Math.max(expiresIn - 3600, 60) });
}

export function isInstagramTokenExpiredError(message: string): boolean {
  return /session has expired|access token.*expired|token.*expired/i.test(message);
}

export async function getInstagramAccessToken(): Promise<string | null> {
  const envToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!envToken) return null;

  const cached = await readCachedToken();
  if (cached && Date.now() < cached.expiresAt - REFRESH_BUFFER_MS) {
    return cached.token;
  }

  const candidates = [envToken, cached?.token].filter(
    (token, index, list): token is string => Boolean(token) && list.indexOf(token) === index
  );

  for (const token of candidates) {
    const refreshed = await refreshInstagramToken(token);
    if (!refreshed) continue;

    await writeCachedToken(refreshed.access_token, refreshed.expires_in);
    return refreshed.access_token;
  }

  return cached?.token ?? envToken;
}
