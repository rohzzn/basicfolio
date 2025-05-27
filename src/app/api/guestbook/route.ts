import { NextResponse } from 'next/server';

// Define types
interface GitHubComment {
  id: number;
  body: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

interface ProcessedComment {
  id: number;
  createdAt: string;
  user: {
    login: string;
    avatarUrl: string;
  };
  displayName: string;
  messageBody: string;
}

// Configuration for GitHub API
const REPO_OWNER = 'rohzzn';
const REPO_NAME = 'basicfolio';
const ISSUE_NUMBER = 2;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Should be set in your .env.local file
const PER_PAGE = 100; // Maximum allowed by GitHub API

export async function GET(request: Request) {
  try {
    // Parse the requested page from URL
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    
    // Fetch comments from GitHub issue with pagination
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments?per_page=${PER_PAGE}&page=${page}`,
      {
        headers: {
          ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Revalidate cache every 60 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    // Extract pagination information
    const linkHeader = response.headers.get('link');
    const hasNextPage = linkHeader && linkHeader.includes('rel="next"');
    const hasPrevPage = linkHeader && linkHeader.includes('rel="prev"');
    const totalCount = response.headers.get('X-Total-Count') || 'unknown';

    const comments = await response.json() as GitHubComment[];
    
    // Process comments to extract name and message
    const processedComments: ProcessedComment[] = comments.map((comment: GitHubComment) => {
      const nameMatch = comment.body.match(/^\*\*Name:\*\* (.+)\n\n/);
      const displayName = nameMatch ? nameMatch[1] : 'Anonymous';
      const messageBody = comment.body.replace(/^\*\*Name:\*\* .+\n\n/, '');
      
      return {
        id: comment.id,
        createdAt: comment.created_at,
        user: {
          login: comment.user.login,
          avatarUrl: comment.user.avatar_url,
        },
        displayName,
        messageBody,
      };
    });
    
    // Sort by most recent first (for consistency)
    processedComments.reverse();

    return NextResponse.json({
      comments: processedComments,
      pagination: {
        currentPage: page,
        hasNextPage,
        hasPrevPage,
        totalCount
      }
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
    // Check if GitHub token is set
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub token not configured on server' },
        { status: 500 }
      );
    }

    // Parse request body
    const { name, message } = await request.json();
    
    // Validate input
    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message are required' },
        { status: 400 }
      );
    }
    
    // Format the comment body for GitHub
    const commentBody = `**Name:** ${name.trim()}\n\n${message.trim()}`;
    
    // Post to GitHub issue
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
    
    return NextResponse.json({ 
      success: true, 
      comment: {
        id: commentData.id,
        createdAt: commentData.created_at,
      }
    });
  } catch (error) {
    console.error('Error posting guestbook comment:', error);
    return NextResponse.json(
      { error: 'Failed to post comment' },
      { status: 500 }
    );
  }
} 