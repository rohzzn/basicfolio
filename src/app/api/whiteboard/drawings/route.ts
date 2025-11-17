import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  timestamp: number;
}

interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  size: number;
  timestamp: number;
}

interface WhiteboardData {
  strokes: DrawingStroke[];
  lastUpdated: number;
}

const WHITEBOARD_KEY = 'whiteboard-drawings';

// Read whiteboard data from Vercel KV
const readWhiteboardData = async (): Promise<WhiteboardData> => {
  try {
    const data = await kv.get<WhiteboardData>(WHITEBOARD_KEY);
    return data || { strokes: [], lastUpdated: Date.now() };
  } catch (error) {
    console.error('Error reading whiteboard data from KV:', error);
    return { strokes: [], lastUpdated: Date.now() };
  }
};

// Write whiteboard data to Vercel KV
const writeWhiteboardData = async (data: WhiteboardData): Promise<void> => {
  try {
    await kv.set(WHITEBOARD_KEY, data);
  } catch (error) {
    console.error('Error writing whiteboard data to KV:', error);
  }
};

// GET - Fetch all drawing strokes
export async function GET() {
  try {
    const data = await readWhiteboardData();
    
    return NextResponse.json({
      strokes: data.strokes,
      lastUpdated: data.lastUpdated,
      totalStrokes: data.strokes.length,
      success: true
    });
  } catch (error) {
    console.error('Error fetching drawings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drawings', success: false },
      { status: 500 }
    );
  }
}

// POST - Add a new drawing stroke
export async function POST(request: NextRequest) {
  try {
    const { stroke } = await request.json();
    
    if (!stroke || !stroke.id || !stroke.points || !Array.isArray(stroke.points)) {
      return NextResponse.json(
        { error: 'Invalid stroke data', success: false },
        { status: 400 }
      );
    }

    const data = await readWhiteboardData();
    
    // Add the new stroke
    data.strokes.push(stroke);
    data.lastUpdated = Date.now();
    
    // Keep only the last 1000 strokes to prevent KV from getting too large
    if (data.strokes.length > 1000) {
      data.strokes = data.strokes.slice(-1000);
    }
    
    await writeWhiteboardData(data);

    return NextResponse.json({
      success: true,
      totalStrokes: data.strokes.length,
      strokeId: stroke.id
    });
  } catch (error) {
    console.error('Error saving stroke:', error);
    return NextResponse.json(
      { error: 'Failed to save stroke', success: false },
      { status: 500 }
    );
  }
}

// DELETE - Clear all drawings
export async function DELETE() {
  try {
    const data: WhiteboardData = {
      strokes: [],
      lastUpdated: Date.now()
    };
    
    await writeWhiteboardData(data);

    return NextResponse.json({
      success: true,
      message: 'All drawings cleared'
    });
  } catch (error) {
    console.error('Error clearing drawings:', error);
    return NextResponse.json(
      { error: 'Failed to clear drawings', success: false },
      { status: 500 }
    );
  }
}
