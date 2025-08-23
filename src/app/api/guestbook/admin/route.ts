import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Configuration for GitHub API
const REPO_OWNER = 'rohzzn';
const REPO_NAME = 'basicfolio';
const ISSUE_NUMBER = 2;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// GET handler for retrieving all comments (including flagged ones)
export async function GET() {
  try {
    // Check admin authorization
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || authorization !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch all comments from GitHub issue
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments?per_page=100`,
      {
        headers: {
          ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const comments = await response.json();
    
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching guestbook comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guestbook comments' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing inappropriate comments
export async function DELETE(request: Request) {
  try {
    // Check admin authorization
    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || authorization !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body to get comment ID
    const { commentId } = await request.json();
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }
    
    // Delete comment from GitHub issue
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
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
