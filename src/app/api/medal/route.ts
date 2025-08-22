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
    
    // Use the latest API endpoint with your user ID
    const response = await fetch(
      `https://developers.medal.tv/v1/latest?userId=${userId}&limit=12`,
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Medal API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.contentObjects || !Array.isArray(data.contentObjects)) {
      throw new Error('Invalid response format from Medal API');
    }
    
    // Map the response data to our interface
    const clips: MedalClip[] = data.contentObjects.map((clip: any) => {
      // Extract the embed URL from the iframe code
      let embedUrl = '';
      if (clip.embedIframeCode) {
        const match = clip.embedIframeCode.match(/src='([^']+)'/);
        if (match && match[1]) {
          embedUrl = match[1];
        }
      } else if (clip.embedIframeUrl) {
        embedUrl = clip.embedIframeUrl;
      }
      
      // Extract the numeric content ID
      const contentIdMatch = clip.contentId?.match(/^cid([0-9]+)$/);
      const numericId = contentIdMatch ? contentIdMatch[1] : 
                        (clip.contentId ? clip.contentId.replace('cid', '') : '');
      
      return {
        contentId: clip.contentId || '',
        contentTitle: clip.contentTitle || 'Untitled Clip',
        contentViews: clip.contentViews || 0,
        contentThumbnail: clip.contentThumbnail || 
                         `https://cdn.medal.tv/content/${numericId}/thumbnail-large.webp`,
        embedIframeUrl: embedUrl,
        createdTimestamp: clip.createdTimestamp || Date.now(),
        categoryId: clip.categoryId || 0,
        categoryName: categoryNames[clip.categoryId] || 'Game',
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
