import { NextResponse } from 'next/server';

export async function GET() {
  const STEAM_ID = '76561198239653194';
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Steam API Key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${STEAM_ID}&include_appinfo=1&include_played_free_games=1`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Steam games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
