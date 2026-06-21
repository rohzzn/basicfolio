import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  try {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env optional if vars already exported
  }
}

loadEnv();

const url =
  process.env.views_KV_REST_API_URL ??
  process.env.KV_REST_API_URL;
const token =
  process.env.views_KV_REST_API_TOKEN ??
  process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error('Missing views_KV_REST_API_URL / views_KV_REST_API_TOKEN in .env');
  process.exit(1);
}

const slugs = [
  'apple-best-ai-feature',
  'discord-widgets',
  'linux-home-server',
  'what-this-site-loads',
  'software-i-admire',
  'forty-projects',
  'satoshi-font',
  'moving-to-cincinnati',
  'catan-coop',
  'first-spring',
  'uc-experience',
  'variables-exposure',
  'modern-tech-stacks',
  'security-article',
  'boring-performance',
  'discord-article',
  'esports-journey',
  'chatgpt-interface',
  'ixigo-experience',
  'beginners-guide-programming',
  'beginners-guide-design',
];

function randomReads() {
  return Math.floor(Math.random() * 11) + 40; // 40–50 inclusive
}

const redis = new Redis({ url, token });

for (const slug of slugs) {
  const count = randomReads();
  await redis.set(`writing:views:${slug}`, count);
  console.log(`${slug} → ${count} reads`);
}

console.log(`\nSeeded ${slugs.length} posts.`);
