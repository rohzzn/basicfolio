// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "cdn.myanimelist.net",
      "cdn.dribbble.com",
      "books.googleusercontent.com",
      "lh3.googleusercontent.com",
      "books.google.com", // Add this domain
      "avatars.steamstatic.com",
      'media.steampowered.com',
      'steamuserimages-a.akamaihd.net',
      'avatars.githubusercontent.com',
      'dgtzuqphqg23d.cloudfront.net',
      'i.scdn.co', // Add Spotify image domain
      'cdn.discordapp.com', // Discord CDN for application assets
      'media.discordapp.net', // Discord media CDN
      'img.icons8.com', // For potential fallback icons
      'i.ytimg.com', // YouTube image server
      'yt3.ggpht.com', // YouTube profile images
      'youtube.com', // YouTube thumbnails
      'i.imgur.com', // Potential fallback images for YouTube
    ],
  },
  // ... other configurations
};

module.exports = nextConfig;
