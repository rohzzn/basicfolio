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
    
    if (!apiKey) {
      throw new Error('Medal API key not configured');
    }
    
    // Try both the latest API endpoint and the search API to get the best results
    const [latestResponse, searchResponse] = await Promise.all([
      fetch(
        `https://developers.medal.tv/v1/latest?userId=${userId}&limit=12`,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        }
      ),
      fetch(
        `https://developers.medal.tv/v1/search?text=by:rohzzn&limit=12`,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        }
      )
    ]);
    
    // Use the response that succeeded
    const response = latestResponse.ok ? latestResponse : searchResponse;

    if (!response.ok) {
      throw new Error(`Medal API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log the full API response for debugging
    console.log('Medal API response structure:', Object.keys(data));
    
    if (!data.contentObjects || !Array.isArray(data.contentObjects)) {
      console.error('Invalid response format from Medal API:', data);
      throw new Error('Invalid response format from Medal API');
    }
    
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
        contentId: clip.contentId || '',
        contentTitle: clip.contentTitle || 'Untitled Clip',
        contentViews: clip.contentViews || 0,
        contentThumbnail: clip.contentThumbnail || 
                         `https://cdn.medal.tv/content/${numericId}/thumbnail-large.webp`,
        embedIframeUrl: embedUrl,
        createdTimestamp: clip.createdTimestamp || Date.now(),
        categoryId: clip.categoryId || 0,
        categoryName: gameName,
        directClipUrl: clip.directClipUrl || '',
        videoLengthSeconds: clip.videoLengthSeconds || 0
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
