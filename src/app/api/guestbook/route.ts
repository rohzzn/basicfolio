import { NextResponse } from 'next/server';
import { containsOffensiveContent, checkRateLimit, cleanText } from '@/utils/moderation';
import { headers, cookies } from 'next/headers';
import {
  formatGuestbookBody,
  parseGuestbookBody,
  type ProcessedComment,
} from '@/lib/guestbook';
import {
  GUESTBOOK_DISCORD_USER_COOKIE,
  isGuestbookAdmin,
  parseDiscordUserCookie,
} from '@/lib/discord-guestbook';

interface GitHubComment {
  id: number;
  body: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

const REPO_OWNER = 'rohzzn';
const REPO_NAME = 'basicfolio';
const ISSUE_NUMBER = 2;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PER_PAGE = 100;

function toProcessedComment(comment: GitHubComment): ProcessedComment {
  const parsed = parseGuestbookBody(comment.body);
  return {
    id: comment.id,
    createdAt: comment.created_at,
    user: {
      login: comment.user.login,
      avatarUrl: comment.user.avatar_url,
    },
    displayName: parsed.displayName,
    messageBody: parsed.messageBody,
    ...(parsed.avatarUrl && { avatarUrl: parsed.avatarUrl }),
    ...(parsed.replyTo && { replyTo: parsed.replyTo }),
    ...(parsed.discord && isGuestbookAdmin(parsed.discord.id) && { isAdmin: true }),
  };
}

async function getSignedInDiscordUser() {
  const cookieStore = await cookies();
  return parseDiscordUserCookie(
    cookieStore.get(GUESTBOOK_DISCORD_USER_COOKIE)?.value
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments?per_page=${PER_PAGE}&page=${page}`,
      {
        headers: {
          ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
          'Content-Type': 'application/json',
        },
        next: { revalidate: 10 },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const linkHeader = response.headers.get('link');
    const hasNextPage = linkHeader && linkHeader.includes('rel="next"');
    const hasPrevPage = linkHeader && linkHeader.includes('rel="prev"');
    const totalCount = response.headers.get('X-Total-Count') || 'unknown';

    const comments = await response.json() as GitHubComment[];
    const processedComments = comments.map(toProcessedComment);
    processedComments.reverse();

    return NextResponse.json({
      comments: processedComments,
      pagination: {
        currentPage: page,
        hasNextPage,
        hasPrevPage,
        totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching guestbook comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guestbook comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'Guestbook posting is not configured. Add GITHUB_TOKEN to your environment.' },
        { status: 503 }
      );
    }

    const { name, message, useDiscord, replyTo } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const discordUser = await getSignedInDiscordUser();
    const isAdmin = isGuestbookAdmin(discordUser?.id);

    if (replyTo && !isAdmin) {
      return NextResponse.json(
        { error: 'Only the admin can reply to entries.' },
        { status: 403 }
      );
    }

    const signingWithDiscord = Boolean(useDiscord && discordUser);
    const displayName = signingWithDiscord
      ? (discordUser!.globalName || discordUser!.username)
      : name?.trim();

    if (!displayName) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!replyTo) {
      const headersList = await headers();
      const ip = headersList.get('x-forwarded-for') || 'unknown';

      if (!checkRateLimit(ip)) {
        return NextResponse.json(
          { error: 'Too many submissions. Please try again later.' },
          { status: 429 }
        );
      }
    }

    if (containsOffensiveContent(displayName) || containsOffensiveContent(message)) {
      return NextResponse.json(
        { error: 'Your message contains inappropriate content that violates our community guidelines.' },
        { status: 400 }
      );
    }

    const cleanName = cleanText(displayName);
    const cleanMessage = cleanText(message.trim());
    const commentBody = formatGuestbookBody(cleanName, cleanMessage, {
      ...(signingWithDiscord && {
        discord: { id: discordUser!.id, avatarHash: discordUser!.avatar },
      }),
      ...(replyTo && { replyTo: Number(replyTo) }),
    });

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments`,
      {
        method: 'POST',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: commentBody }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const commentData = await response.json();
    const parsed = parseGuestbookBody(commentBody);

    return NextResponse.json({
      success: true,
      comment: {
        id: commentData.id,
        createdAt: commentData.created_at,
        displayName: cleanName,
        messageBody: cleanMessage,
        user: {
          login: commentData.user.login,
          avatarUrl: commentData.user.avatar_url,
        },
        ...(parsed.avatarUrl && { avatarUrl: parsed.avatarUrl }),
        ...(parsed.replyTo && { replyTo: parsed.replyTo }),
        ...(isAdmin && { isAdmin: true }),
      },
    });
  } catch (error) {
    console.error('Error posting guestbook comment:', error);
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'Guestbook is not configured.' },
        { status: 503 }
      );
    }

    const discordUser = await getSignedInDiscordUser();
    if (!isGuestbookAdmin(discordUser?.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { commentId } = await request.json();
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guestbook comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
