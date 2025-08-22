# Medal.tv Profile Integration

This page provides links to your Medal.tv profile where visitors can view all your gaming clips.

## Setup Instructions

1. Create an account on Medal.tv if you don't already have one
2. By default, the app will use the username 'rohzzn' for the Medal.tv profile link
3. If you want to use a different username, add the following environment variable to your `.env.local` file:

```
MEDAL_USERNAME=your_medal_username
```

4. Restart your Next.js development server

## How It Works

Due to Medal.tv API limitations, this integration creates sample cards that link directly to your Medal.tv profile. When users click on these cards, they'll be taken to your Medal.tv profile where they can see all your clips.

This approach avoids API authentication issues while still providing a way for visitors to access your gaming clips.

## Customization

You can modify the sample clips in `/src/app/api/medal/route.ts` to:
- Change the titles and descriptions
- Add more sample cards
- Customize the thumbnail images

The card display component can be customized in `/src/components/MedalClip.tsx`.
