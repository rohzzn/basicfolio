import { NextResponse } from 'next/server';

interface AllstarClip {
  _id: string;
  clipTitle: string;
  clipImageThumb: string;
  clipImageSource: string;
  clipLink: string;
  createdDate: string;
  shareId: string;
  views: number;
  clipLength: number;
}

interface AllstarGraphQLResponse {
  data?: {
    videos?: {
      data: AllstarClip[];
    };
  };
  errors?: { message: string }[];
}

function b2ToHttps(b2Url: string): string {
  if (!b2Url) return '';
  // Convert b2://bucket-name/path -> https://f005.backblazeb2.com/file/bucket-name/path
  const match = b2Url.match(/^b2:\/\/([^/]+)\/(.+)$/);
  if (match) return `https://f005.backblazeb2.com/file/${match[1]}/${match[2]}`;
  if (b2Url.startsWith('http')) return b2Url;
  return '';
}

const CLIPS_QUERY = `query ($page: Int!, $user: String!) {
  videos: clips(search: createdDate, page: $page, user: $user, mobile: false) {
    data {
      _id
      clipImageSource
      clipImageThumb
      clipLink
      clipTitle
      createdDate
      shareId
      views
      clipLength
    }
  }
}`;

export async function GET() {
  try {
    const userId = process.env.ALLSTAR_USER_ID;
    if (!userId) throw new Error('ALLSTAR_USER_ID not configured');

    const allClips: AllstarClip[] = [];
    let page = 1;
    const MAX_PAGES = 5;

    while (page <= MAX_PAGES) {
      const res = await fetch('https://a1.allstar.gg/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: CLIPS_QUERY, variables: { user: userId, page } }),
        cache: 'no-store',
      });

      if (!res.ok) break;

      const json: AllstarGraphQLResponse = await res.json();
      const pageClips = json.data?.videos?.data ?? [];

      if (pageClips.length === 0) break;

      allClips.push(...pageClips);

      // Allstar returns 10 per page; if fewer than 10, we've hit the last page
      if (pageClips.length < 10) break;
      page++;
    }

    const clips = allClips.map(clip => ({
      id: clip._id,
      title: clip.clipTitle || 'Untitled Clip',
      thumbnail: b2ToHttps(clip.clipImageThumb) || b2ToHttps(clip.clipImageSource),
      clipUrl: `https://allstar.gg/clip?clip=${clip._id}`,
      videoUrl: b2ToHttps(clip.clipLink),
      createdTimestamp: parseInt(clip.createdDate, 10),
      views: clip.views ?? 0,
      duration: clip.clipLength ?? 0,
      source: 'allstar' as const,
      categoryName: 'CS2',
    }));

    // Sort newest first
    clips.sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    return NextResponse.json({ clips });
  } catch (error) {
    console.error('Error fetching Allstar clips:', error);
    return NextResponse.json({ error: 'Failed to fetch Allstar clips' }, { status: 500 });
  }
}
