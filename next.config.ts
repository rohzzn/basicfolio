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
      'avatars.githubusercontent.com'
    ],
  },
  // ... other configurations
};

module.exports = nextConfig;
