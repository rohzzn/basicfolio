import { NextResponse } from 'next/server';

// MyAnimeList API credentials from environment variables or hardcoded fallback
const MAL_CLIENT_ID = process.env.MAL_CLIENT_ID || '09381abb5bcf8797360fdf79e9fef791';
const DEFAULT_USERNAME = process.env.MAL_DEFAULT_USERNAME || 'rohzzn';

interface AnimeItem {
  node: {
    id: number;
    title: string;
    main_picture?: {
      medium: string;
      large: string;
    };
    start_season?: {
      year: number;
      season: string;
    };
    genres?: {
      id: number;
      name: string;
    }[];
    mean?: number;
    status?: string;
  };
  list_status: {
    status: string;
    score: number;
    num_episodes_watched: number;
    is_rewatching: boolean;
    updated_at: string;
  };
}

interface ProcessedAnime {
  id: number;
  title: string;
  score: number | null;
  status: 'watched' | 'watching' | 'plan_to_watch' | 'dropped';
  genres: string[];
  year: number | null;
  image: string | null;
}

// Mapping MAL status to our app's status format
const mapStatus = (malStatus: string): 'watched' | 'watching' | 'plan_to_watch' | 'dropped' => {
  switch (malStatus) {
    case 'completed':
      return 'watched';
    case 'watching':
      return 'watching';
    case 'dropped':
      return 'dropped';
    default:
      return 'plan_to_watch';
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || DEFAULT_USERNAME;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    
    try {
      console.log(`Fetching anime list for user: ${username}`);
      
      // Using the official MAL API to get user's anime list
      // Make sure to request list_status in the fields parameter
      const fields = 'id,title,main_picture,start_season,genres,list_status';
      
      // First we need to get the anime list with basic info and pagination
      const fetchUserAnimeList = async (offset: number = 0): Promise<AnimeItem[]> => {
        const url = `https://api.myanimelist.net/v2/users/${username}/animelist?fields=${fields}&limit=100&offset=${offset}`;
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'X-MAL-CLIENT-ID': MAL_CLIENT_ID
          }
        });
        
        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch anime list: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response structure:', JSON.stringify(data).substring(0, 300) + '...');
        
        if (!data.data || !Array.isArray(data.data)) {
          console.error('Unexpected API response structure:', data);
          throw new Error('Unexpected API response structure');
        }
        
        const animeItems = data.data as AnimeItem[];
        
        // If there's a next page (pagination), fetch it recursively
        if (data.paging && data.paging.next) {
          const nextOffset = offset + 100;
          const nextPageItems = await fetchUserAnimeList(nextOffset);
          return [...animeItems, ...nextPageItems];
        }
        
        return animeItems;
      };
      
      // Fetch all anime with pagination
      const allAnimeItems = await fetchUserAnimeList();
      console.log(`Fetched ${allAnimeItems.length} anime for user ${username}`);
      
      if (allAnimeItems.length > 0) {
        console.log('Sample item:', JSON.stringify(allAnimeItems[0]));
      }
      
      // Process the data to match our app's format
      const processedAnimeList: ProcessedAnime[] = allAnimeItems.map(item => {
        try {
          // Debug log to check the structure
          if (!item.list_status) {
            console.log('Missing list_status:', JSON.stringify(item));
          }
          
          return {
            id: item.node.id,
            title: item.node.title,
            score: item.list_status.score > 0 ? item.list_status.score : null,
            status: mapStatus(item.list_status.status),
            genres: item.node.genres?.map(genre => genre.name) || [],
            year: item.node.start_season?.year || null,
            image: item.node.main_picture?.large || item.node.main_picture?.medium || null
          };
        } catch (err) {
          console.error('Error processing anime item:', err, item);
          // Return a fallback item
          return {
            id: item.node?.id || Math.floor(Math.random() * 100000),
            title: item.node?.title || 'Unknown Anime',
            score: null,
            status: 'plan_to_watch',
            genres: [],
            year: null,
            image: null
          };
        }
      });
      
      return NextResponse.json({
        username,
        animeList: processedAnimeList
      });
      
    } catch (apiError) {
      console.error("API Error:", apiError);
      
      // Return an error response
      return NextResponse.json(
        { error: apiError instanceof Error ? apiError.message : 'Failed to fetch anime list' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
} 