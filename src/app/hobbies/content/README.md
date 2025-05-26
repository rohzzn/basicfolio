# YouTube Content Page

This page displays videos from your YouTube channel (@rohzzn).

## Setup

To properly display your YouTube videos, you need to set up a YouTube Data API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "YouTube Data API v3" for your project
4. Create API credentials (API Key)
5. Add the API key to your environment variables:

```bash
# In your .env file
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Fallback

If the API key is not configured, the page will display an embedded YouTube channel widget instead of individual videos. 