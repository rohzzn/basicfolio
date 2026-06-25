export interface ProcessedComment {
  id: number;
  createdAt: string;
  user: {
    login: string;
    avatarUrl: string;
  };
  displayName: string;
  messageBody: string;
  avatarUrl?: string;
  replyTo?: number;
  isAdmin?: boolean;
}

export interface DiscordGuestbookMeta {
  id: string;
  avatarHash: string | null;
}

const DISCORD_CDN_SIZES = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096] as const;

function discordCdnSize(minPixels: number): number {
  return DISCORD_CDN_SIZES.find((s) => s >= minPixels) ?? 4096;
}

export function discordAvatarUrl(id: string, avatarHash: string | null, minSize = 128): string {
  const size = discordCdnSize(minSize);
  if (avatarHash) {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.${ext}?size=${size}`;
  }
  const index = Number(BigInt(id) >> BigInt(22)) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png?size=${size}`;
}

/** Pick a CDN size matched to on-screen pixels so Discord doesn't serve an over/down-scaled image. */
export function resolveDiscordAvatarSrc(
  url: string,
  displayPx: number,
  pixelRatio = 2
): string {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('discordapp.com')) return url;

    const size = discordCdnSize(Math.ceil(displayPx * pixelRatio));
    parsed.searchParams.set('size', String(size));

    const filename = parsed.pathname.split('/').pop() ?? '';
    const hash = filename.replace(/\.(png|gif|webp|jpe?g)$/i, '');
    if (hash.startsWith('a_')) {
      parsed.pathname = parsed.pathname.replace(/\.(png|webp|jpe?g)$/i, '.gif');
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

export function formatGuestbookBody(
  displayName: string,
  messageBody: string,
  options?: { discord?: DiscordGuestbookMeta; replyTo?: number }
): string {
  let header = `**Name:** ${displayName}\n`;
  if (options?.discord) {
    header += `**Discord:** ${options.discord.id}|${options.discord.avatarHash ?? ''}\n`;
  }
  if (options?.replyTo) {
    header += `**Reply to:** ${options.replyTo}\n`;
  }
  header += `\n${messageBody}`;
  return header;
}

export function parseGuestbookBody(body: string): {
  displayName: string;
  messageBody: string;
  discord?: DiscordGuestbookMeta;
  avatarUrl?: string;
  replyTo?: number;
} {
  const nameMatch = body.match(/^\*\*Name:\*\* (.+?)(?:\n|$)/);
  const displayName = nameMatch ? nameMatch[1] : 'Anonymous';

  let rest = body.replace(/^\*\*Name:\*\* .+?\n/, '');
  let discord: DiscordGuestbookMeta | undefined;
  let avatarUrl: string | undefined;
  let replyTo: number | undefined;

  const discordMatch = rest.match(/^\*\*Discord:\*\* ([^\n]+)\n/);
  if (discordMatch) {
    const [id, avatarHash = ''] = discordMatch[1].split('|');
    discord = { id, avatarHash: avatarHash || null };
    avatarUrl = discordAvatarUrl(id, discord.avatarHash);
    rest = rest.replace(/^\*\*Discord:\*\* [^\n]+\n/, '');
  }

  const replyMatch = rest.match(/^\*\*Reply to:\*\* (\d+)\n\n?/);
  if (replyMatch) {
    replyTo = parseInt(replyMatch[1], 10);
    rest = rest.replace(/^\*\*Reply to:\*\* \d+\n\n?/, '');
  } else if (rest.startsWith('\n')) {
    rest = rest.slice(1);
  }

  return { displayName, messageBody: rest, discord, avatarUrl, replyTo };
}
