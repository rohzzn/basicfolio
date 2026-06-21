import { Redis } from '@upstash/redis';

function redisCredentials(): { url?: string; token?: string } {
  const url =
    process.env.views_KV_REST_API_URL ??
    process.env.VIEWS_KV_REST_API_URL ??
    process.env.KV_REST_API_URL ??
    process.env.KVI_KV_REST_API_URL;

  const token =
    process.env.views_KV_REST_API_TOKEN ??
    process.env.VIEWS_KV_REST_API_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    process.env.KVI_KV_REST_API_TOKEN;

  return { url, token };
}

export function getRedis(): Redis | null {
  const { url, token } = redisCredentials();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isRedisAvailable(): boolean {
  return getRedis() !== null;
}
