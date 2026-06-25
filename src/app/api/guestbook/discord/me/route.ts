import { NextRequest, NextResponse } from 'next/server';
import {
  GUESTBOOK_DISCORD_USER_COOKIE,
  getDiscordConfig,
  isGuestbookAdmin,
  parseDiscordUserCookie,
  toDiscordSession,
} from '@/lib/discord-guestbook';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { configured } = getDiscordConfig();
  const discordUser = parseDiscordUserCookie(
    request.cookies.get(GUESTBOOK_DISCORD_USER_COOKIE)?.value
  );

  if (!configured) {
    return NextResponse.json({ configured: false, user: null });
  }

  if (!discordUser) {
    return NextResponse.json({
      configured: true,
      user: null,
      ...(process.env.NODE_ENV !== 'production' && {
        debug: {
          clientId: process.env.DISCORD_CLIENT_ID,
          hint: 'Add every localhost port you use to Discord OAuth2 → Redirects',
        },
      }),
    });
  }

  return NextResponse.json({
    configured: true,
    user: toDiscordSession(discordUser),
    isAdmin: isGuestbookAdmin(discordUser.id),
  });
}
