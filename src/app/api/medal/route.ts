import { NextResponse } from 'next/server';

interface MedalClip {
  contentId: string;
  contentTitle: string;
  contentViews: number;
  contentThumbnail: string;
  embedIframeUrl: string;
  createdTimestamp: number;
  categoryId: number;
  categoryName: string;
  directClipUrl: string;
  videoLengthSeconds: number;
}

// Game category mapping
const categoryNames: {[key: number]: string} = {
  10: 'Rocket League',
  62: 'Fortnite',
  76: 'Apex Legends',
  173: 'Valorant',
  730: 'CS2',
  578: 'Call of Duty',
  38: 'League of Legends',
  32: 'Minecraft',
  107: 'Overwatch',
  516: 'Fall Guys',
  432: 'Among Us',
  504: 'Genshin Impact',
  17: 'PUBG',
  // Add more as needed
};

export async function GET() {
  try {
    // Get the Medal.tv API key and user ID from environment variables
    const apiKey = process.env.MEDAL_API_KEY;
    const userId = process.env.MEDAL_USER_ID || '436315303'; // Your actual user ID
    
    console.log('Using Medal API Key:', apiKey ? 'Key exists (not showing for security)' : 'Missing');
    console.log('Using Medal User ID:', userId);
    
    if (!apiKey) {
      throw new Error('Medal API key not configured');
    }
    
    // Try multiple API endpoints and combine results to get more clips
    const [latestResponse, searchResponse, byUsernameResponse] = await Promise.all([
      fetch(
        `https://developers.medal.tv/v1/latest?userId=${userId}&limit=30`,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        }
      ),
      fetch(
        `https://developers.medal.tv/v1/search?text=by:rohzzn&limit=30`,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        }
      ),
      fetch(
        `https://developers.medal.tv/v1/search?text=rohzzn&limit=30`,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        }
      )
    ]);
    
    // Log response statuses for debugging
    console.log('Latest API status:', latestResponse.status);
    console.log('Search API status:', searchResponse.status);
    console.log('By Username API status:', byUsernameResponse.status);
    
    // Collect all content objects
    let allContentObjects: any[] = [];
    
    // Process latest response
    if (latestResponse.ok) {
      const latestData = await latestResponse.json();
      if (latestData.contentObjects && Array.isArray(latestData.contentObjects)) {
        allContentObjects = [...allContentObjects, ...latestData.contentObjects];
        console.log(`Added ${latestData.contentObjects.length} clips from latest endpoint`);
      }
    }
    
    // Process search response
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.contentObjects && Array.isArray(searchData.contentObjects)) {
        allContentObjects = [...allContentObjects, ...searchData.contentObjects];
        console.log(`Added ${searchData.contentObjects.length} clips from search endpoint`);
      }
    }
    
    // Process by username response
    if (byUsernameResponse.ok) {
      const usernameData = await byUsernameResponse.json();
      if (usernameData.contentObjects && Array.isArray(usernameData.contentObjects)) {
        allContentObjects = [...allContentObjects, ...usernameData.contentObjects];
        console.log(`Added ${usernameData.contentObjects.length} clips from username endpoint`);
      }
    }
    
    // If we have no content objects, try another approach or throw error
    if (allContentObjects.length === 0) {
      console.error('No clips found from any endpoint');
      throw new Error('No clips found from any Medal API endpoint');
    }
    
    console.log(`Total clips collected: ${allContentObjects.length}`);
    
    // Remove duplicates by contentId
    const uniqueClips = Array.from(
      new Map(allContentObjects.map(clip => [clip.contentId, clip])).values()
    );
    
    console.log(`After removing duplicates: ${uniqueClips.length} unique clips`);
    
    // Use the combined data
    const data = { contentObjects: uniqueClips };
    
    // Log the full API response for debugging
    console.log('Medal API response structure:', Object.keys(data));
    console.log('Medal API response data:', JSON.stringify(data).substring(0, 500) + '...');
    
    if (!data.contentObjects || !Array.isArray(data.contentObjects)) {
      console.error('Invalid response format from Medal API:', data);
      throw new Error('Invalid response format from Medal API');
    }
    
    console.log('Number of clips found:', data.contentObjects.length);
    
    // Log the first clip to understand its structure
    if (data.contentObjects.length > 0) {
      console.log('First clip structure:', Object.keys(data.contentObjects[0]));
    }
    
    // Map the response data to our interface
    const clips: MedalClip[] = data.contentObjects.map((clip: Record<string, unknown>) => {
      // Extract the embed URL from the iframe code
      let embedUrl = '';
      if (clip.embedIframeCode && typeof clip.embedIframeCode === 'string') {
        const match = clip.embedIframeCode.match(/src='([^']+)'/);
        if (match && match[1]) {
          embedUrl = match[1];
        }
      } else if (clip.embedIframeUrl && typeof clip.embedIframeUrl === 'string') {
        embedUrl = clip.embedIframeUrl;
      }
      
      // Extract the numeric content ID
      let contentIdMatch = null;
      if (typeof clip.contentId === 'string') {
        contentIdMatch = clip.contentId.match(/^cid([0-9]+)$/);
      }
      const numericId = contentIdMatch ? contentIdMatch[1] : 
                        (typeof clip.contentId === 'string' ? clip.contentId.replace('cid', '') : '');
      
      // Log the clip data for debugging
      console.log('Clip data:', {
        id: clip.contentId,
        title: clip.contentTitle,
        categoryId: clip.categoryId,
        categoryName: clip.categoryName
      });
      
      // Determine the proper game name
      let gameName = 'Unknown Game';
      if (typeof clip.categoryId === 'number' && categoryNames[clip.categoryId]) {
        gameName = categoryNames[clip.categoryId];
      } else if (typeof clip.categoryName === 'string') {
        gameName = clip.categoryName;
      }
      
      return {
        contentId: typeof clip.contentId === 'string' ? clip.contentId : '',
        contentTitle: typeof clip.contentTitle === 'string' ? clip.contentTitle : 'Untitled Clip',
        contentViews: typeof clip.contentViews === 'number' ? clip.contentViews : 0,
        contentThumbnail: typeof clip.contentThumbnail === 'string' ? clip.contentThumbnail : 
                         `https://cdn.medal.tv/content/${numericId}/thumbnail-large.webp`,
        embedIframeUrl: embedUrl,
        createdTimestamp: typeof clip.createdTimestamp === 'number' ? clip.createdTimestamp : Date.now(),
        categoryId: typeof clip.categoryId === 'number' ? clip.categoryId : 0,
        categoryName: gameName,
        directClipUrl: typeof clip.directClipUrl === 'string' ? clip.directClipUrl : '',
        videoLengthSeconds: typeof clip.videoLengthSeconds === 'number' ? clip.videoLengthSeconds : 0
      };
    });
    
    // Sort clips by createdTimestamp in descending order (newest first)
    const sortedClips = clips.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    
    return NextResponse.json({ clips: sortedClips });
  } catch (error) {
    console.error('Error fetching Medal clips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Medal clips' },
      { status: 500 }
    );
  }
}
