/**
 * Pings search engines that the sitemap was updated.
 * Run after deploy: node scripts/ping-sitemap.js
 */
const SITEMAP = 'https://rohan.run/sitemap.xml';

const pingUrls = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
];

async function ping() {
  for (const url of pingUrls) {
    try {
      const res = await fetch(url);
      const host = new URL(url).hostname;
      console.log(`${host}: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.error(`Failed to ping ${url}:`, err.message);
    }
  }
}

ping();
