import { NextResponse } from 'next/server';

// YouTube channel ID
const CHANNEL_ID = 'UCIal5uyyIBPUFq5rLkhLqjg';
const API_KEY = process.env.YOUTUBE_API_KEY;

// Define interfaces for the YouTube API responses
interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
}

interface YouTubeResourceId {
  kind: string;
  videoId: string;
}

interface YouTubeSnippet {
  publishedAt: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  resourceId: YouTubeResourceId;
}

interface YouTubeContentDetails {
  videoId: string;
}

interface YouTubePlaylistItem {
  snippet: YouTubeSnippet;
  contentDetails: YouTubeContentDetails;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface YouTubeStatistics {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface YouTubeVideoItem {
  id: string;
  statistics: YouTubeStatistics;
}

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // First get the uploads playlist ID
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );

    if (!channelResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch channel data' },
        { status: channelResponse.status }
      );
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json(
        { error: 'YouTube channel not found' },
        { status: 404 }
      );
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      return NextResponse.json(
        { error: 'Could not find uploads playlist' },
        { status: 404 }
      );
    }

    // Get videos from the uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${API_KEY}`
    );

    if (!videosResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: videosResponse.status }
      );
    }

    const videosData = await videosResponse.json();

    if (!videosData.items || videosData.items.length === 0) {
      return NextResponse.json(
        { error: 'No videos found' },
        { status: 404 }
      );
    }

    // Format the initial video data
    const videosWithoutStats: YouTubeVideo[] = videosData.items.map((item: YouTubePlaylistItem) => {
      const snippet = item.snippet || {} as YouTubeSnippet;
      return {
        id: item.contentDetails?.videoId || snippet.resourceId?.videoId || '',
        title: snippet.title || 'Untitled',
        description: snippet.description || '',
        publishedAt: snippet.publishedAt || '',
        thumbnail: 
          (snippet.thumbnails?.high?.url) || 
          (snippet.thumbnails?.medium?.url) || 
          (snippet.thumbnails?.default?.url) || ''
      };
    });

    // Get video IDs to fetch statistics
    const videoIds = videosWithoutStats.map((video: YouTubeVideo) => video.id).join(',');
    
    // Fetch video statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,liveStreamingDetails&id=${videoIds}&key=${API_KEY}`
    );
    
    if (!statsResponse.ok) {
      // If stats fetch fails, return videos without stats
      console.error('Failed to fetch video statistics');
      return NextResponse.json(videosWithoutStats);
    }
    
    const statsData = await statsResponse.json();
    
    // Create a map of video ID to statistics and live stream status
    const statsMap = new Map<string, YouTubeStatistics>();
    const liveStreams: YouTubeVideo[] = [];
    const completedStreams: YouTubeVideo[] = [];

    if (statsData.items) {
      statsData.items.forEach((item: YouTubeVideoItem) => {
        statsMap.set(item.id, item.statistics);
        
        // Check if this is a live stream
        interface LiveStreamingDetails {
          actualStartTime?: string;
          scheduledStartTime?: string;
          actualEndTime?: string;
          concurrentViewers?: string;
        }
        
        const videoItem = item as {
          id: string;
          statistics: YouTubeStatistics;
          liveStreamingDetails?: LiveStreamingDetails;
        };
        
        if (videoItem.liveStreamingDetails) {
          // Find the corresponding video in our list
          const videoData = videosWithoutStats.find(v => v.id === item.id);
          if (videoData) {
            // Add stats to the video data
            const videoWithStats = {
              ...videoData,
              viewCount: item.statistics.viewCount || '0',
              likeCount: item.statistics.likeCount || '0',
              commentCount: item.statistics.commentCount || '0',
              isStream: true,
              actualStartTime: videoItem.liveStreamingDetails.actualStartTime,
              scheduledStartTime: videoItem.liveStreamingDetails.scheduledStartTime,
              concurrentViewers: videoItem.liveStreamingDetails.concurrentViewers
            };
            
            // Check if it's an active live stream or a completed one
            if (videoItem.liveStreamingDetails.actualEndTime) {
              completedStreams.push(videoWithStats);
            } else if (videoItem.liveStreamingDetails.actualStartTime) {
              liveStreams.push(videoWithStats);
            }
          }
        }
      });
    }
    
    // Merge statistics with video data for regular videos
    const videosWithStats = videosWithoutStats.map((video: YouTubeVideo) => {
      // Skip if already categorized as a stream
      if (liveStreams.some(v => v.id === video.id) || completedStreams.some(v => v.id === video.id)) {
        return null;
      }
      
      const stats = statsMap.get(video.id) || {};
      return {
        ...video,
        viewCount: stats.viewCount || '0',
        likeCount: stats.likeCount || '0',
        commentCount: stats.commentCount || '0',
        isStream: false
      };
    }).filter(Boolean);

    return NextResponse.json({
      videos: videosWithStats,
      liveStreams,
      completedStreams
    });
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube videos' },
      { status: 500 }
    );
  }
} 