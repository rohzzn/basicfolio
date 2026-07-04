import { NextResponse } from 'next/server';
import { fetchLastCommit } from '@/lib/github-last-commit';

export async function GET() {
  try {
    const commit = await fetchLastCommit();
    if (!commit) {
      return NextResponse.json({ error: 'Failed to fetch last commit' }, { status: 502 });
    }
    return NextResponse.json(commit);
  } catch (error) {
    console.error('GitHub last commit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch last commit' },
      { status: 500 }
    );
  }
}
