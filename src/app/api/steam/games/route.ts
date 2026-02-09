import { NextResponse } from 'next/server';

export async function GET() {
  const STEAM_ID = '76561198239653194';
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Steam API Key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${apiKey}&steamid=${STEAM_ID}&count=3`,
      { 
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );

    // Also fetch owned games for the full library
    const ownedResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${STEAM_ID}&include_appinfo=1&include_played_free_games=1`,
      { 
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );

    if (!response.ok || !ownedResponse.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const recentData = await response.json();
    const ownedData = await ownedResponse.json();
    
    // Combine: add recently played games to the owned games list with playtime_2weeks
    const recentGames = recentData.response?.games || [];
    const ownedGames = ownedData.response?.games || [];
    
    // Merge recent playtime into owned games
    const mergedGames = ownedGames.map((game: { appid: number; playtime_2weeks?: number }) => {
      const recentGame = recentGames.find((r: { appid: number }) => r.appid === game.appid);
      if (recentGame) {
        return { ...game, playtime_2weeks: recentGame.playtime_2weeks || 0 };
      }
      return game;
    });
    
    console.log('Recently played games:', recentGames.slice(0, 3));
    
    return NextResponse.json({
      response: {
        ...ownedData.response,
        games: mergedGames
      }
    });
  } catch (error) {
    console.error('Error fetching Steam games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
