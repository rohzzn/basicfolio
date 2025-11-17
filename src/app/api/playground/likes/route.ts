import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface PhotoLikes {
  [photoId: string]: number;
}

const LIKES_KEY = 'playground-likes';

// Read likes from Vercel KV
const readLikes = async (): Promise<PhotoLikes> => {
  try {
    const likes = await kv.get<PhotoLikes>(LIKES_KEY);
    return likes || {};
  } catch (error) {
    console.error('Error reading likes from KV:', error);
    return {};
  }
};

// Write likes to Vercel KV
const writeLikes = async (likes: PhotoLikes): Promise<void> => {
  try {
    await kv.set(LIKES_KEY, likes);
  } catch (error) {
    console.error('Error writing likes to KV:', error);
  }
};

// GET - Fetch all likes
export async function GET() {
  try {
    const likes = await readLikes();
    const totalLikes = Object.values(likes).reduce((sum, count) => sum + count, 0);
    
    return NextResponse.json({
      likes,
      totalLikes,
      success: true
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes', success: false },
      { status: 500 }
    );
  }
}

// POST - Add a like to a photo
export async function POST(request: NextRequest) {
  try {
    const { photoId } = await request.json();
    
    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required', success: false },
        { status: 400 }
      );
    }

    const likes = await readLikes();
    likes[photoId] = (likes[photoId] || 0) + 1;
    await writeLikes(likes);

    const totalLikes = Object.values(likes).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      likes,
      totalLikes,
      photoLikes: likes[photoId],
      success: true
    });
  } catch (error) {
    console.error('Error adding like:', error);
    return NextResponse.json(
      { error: 'Failed to add like', success: false },
      { status: 500 }
    );
  }
}
