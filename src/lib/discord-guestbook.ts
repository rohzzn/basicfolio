import { NextRequest } from 'next/server';
import { discordAvatarUrl } from '@/lib/guestbook';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
export const GUESTBOOK_ADMIN_DISCORD_ID = process.env.GUESTBOOK_ADMIN_DISCORD_ID || '';

export const GUESTBOOK_DISCORD_USER_COOKIE = 'guestbook_discord_user';
export const GUESTBOOK_DISCORD_STATE_COOKIE = 'guestbook_discord_oauth_state';
export const GUESTBOOK_DISCORD_RETURN_COOKIE = 'guestbook_discord_return_to';
export const GUESTBOOK_DISCORD_REDIRECT_COOKIE = 'guestbook_discord_redirect_uri';

export interface DiscordGuestbookUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
}

export interface DiscordGuestbookSession {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export const getBaseUrl = (request: NextRequest): string => {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (forwardedProto && host) {
    return `${forwardedProto}://${host.split(',')[0].trim()}`;
  }

  return new URL(request.url).origin;
};

const DEFAULT_ALLOWED_DISCORD_HOSTS = [
  'localhost:3000',
  '127.0.0.1:3000',
  'rohan.run',
  'www.rohan.run',
  'rohanpothuru.com',
  'www.rohanpothuru.com',
];

export function getAllowedDiscordHosts(): string[] {
  const fromEnv = process.env.DISCORD_ALLOWED_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_ALLOWED_DISCORD_HOSTS;
}

export function getRequestHost(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  return host.split(',')[0].trim().toLowerCase();
}

export function isAllowedDiscordHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return getAllowedDiscordHosts().some(
    (allowed) => normalized === allowed.toLowerCase() || normalized.split(':')[0] === allowed.toLowerCase()
  );
}

export const getDiscordCallbackUrl = (request: NextRequest): string => {
  if (process.env.NODE_ENV !== 'production') {
    const configured = process.env.DISCORD_REDIRECT_URI?.trim();
    return configured || 'http://localhost:3000/api/guestbook/discord/callback';
  }
  return `${getBaseUrl(request)}/api/guestbook/discord/callback`;
};

export const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24,
});

export const getShortLivedCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 10,
});

export function getDiscordConfig() {
  return {
    clientId: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    configured: Boolean(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET),
  };
}

export function buildDiscordAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
    state,
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDiscordCode(
  code: string,
  redirectUri: string
): Promise<string> {
  const body = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Discord token exchange failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordGuestbookUser> {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Discord user fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  };

  return {
    id: data.id,
    username: data.username,
    globalName: data.global_name,
    avatar: data.avatar,
  };
}

export function serializeDiscordUser(user: DiscordGuestbookUser): string {
  return JSON.stringify(user);
}

export function parseDiscordUserCookie(value: string | undefined): DiscordGuestbookUser | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as DiscordGuestbookUser;
    if (!parsed.id || !parsed.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function toDiscordSession(user: DiscordGuestbookUser): DiscordGuestbookSession {
  const displayName = user.globalName || user.username;
  return {
    id: user.id,
    username: user.username,
    displayName,
    avatarUrl: discordAvatarUrl(user.id, user.avatar),
  };
}

export function isGuestbookAdmin(discordId: string | null | undefined): boolean {
  if (!discordId || !GUESTBOOK_ADMIN_DISCORD_ID) return false;
  return discordId === GUESTBOOK_ADMIN_DISCORD_ID;
}
