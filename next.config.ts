// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.myanimelist.net"], // Add other domains if needed
  },
};

module.exports = {
  images: {
    domains: [
      'cdn.dribbble.com', // Dribbble image domain
      // Add any other domains if needed
    ],
  },
  // ... other configurations
};

module.exports = nextConfig;
