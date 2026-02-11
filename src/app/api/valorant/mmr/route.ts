// src/app/api/valorant/mmr/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.VALORANT_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Valorant API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      'https://api.henrikdev.xyz/valorant/v3/mmr/ap/pc/rohan/000',
      {
        headers: {
          'Authorization': apiKey,
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Valorant API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Valorant data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Valorant stats' },
      { status: 500 }
    );
  }
}
