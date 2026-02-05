import { NextResponse } from 'next/server';

const DEFAULT_STEAM64_ID = process.env.LEETIFY_STEAM64_ID || '76561198239653194';

export async function GET(req: Request) {
  const apiKey = process.env.LEETIFY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Leetify API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const steam64Id = searchParams.get('steam64_id') || DEFAULT_STEAM64_ID;
  const leetifyId = searchParams.get('id');

  if (!leetifyId && !steam64Id) {
    return NextResponse.json(
      { error: 'Missing steam64_id or id query param' },
      { status: 400 }
    );
  }

  try {
    const upstreamUrl = new URL('https://api-public.cs-prod.leetify.com/v3/profile');
    if (leetifyId) upstreamUrl.searchParams.set('id', leetifyId);
    else upstreamUrl.searchParams.set('steam64_id', steam64Id);

    const response = await fetch(upstreamUrl, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Failed to fetch Leetify profile',
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(body);
  } catch (error) {
    console.error('Error fetching Leetify profile:', error);
    return NextResponse.json({ error: 'Failed to fetch Leetify profile' }, { status: 500 });
  }
}

