import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface PhotoLikes {
  [photoId: string]: number;
}

const LIKES_FILE = path.join(process.cwd(), 'data', 'playground-likes.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read likes from file
const readLikes = (): PhotoLikes => {
  ensureDataDir();
  try {
    if (fs.existsSync(LIKES_FILE)) {
      const data = fs.readFileSync(LIKES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading likes file:', error);
  }
  return {};
};

// Write likes to file
const writeLikes = (likes: PhotoLikes) => {
  ensureDataDir();
  try {
    fs.writeFileSync(LIKES_FILE, JSON.stringify(likes, null, 2));
  } catch (error) {
    console.error('Error writing likes file:', error);
  }
};

// GET - Fetch all likes
export async function GET() {
  try {
    const likes = readLikes();
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

    const likes = readLikes();
    likes[photoId] = (likes[photoId] || 0) + 1;
    writeLikes(likes);

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
