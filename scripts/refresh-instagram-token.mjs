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

async function exchangeShortLivedToken(shortLivedToken, appSecret) {
  const url = new URL('https://graph.instagram.com/access_token');
  url.searchParams.set('grant_type', 'ig_exchange_token');
  url.searchParams.set('client_secret', appSecret);
  url.searchParams.set('access_token', shortLivedToken);

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Exchange failed (${res.status})`);
  }

  return data;
}

async function refreshLongLivedToken(accessToken) {
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', accessToken);

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Refresh failed (${res.status})`);
  }

  return data;
}

function printTokenResult(data) {
  const days = Math.round(data.expires_in / 86400);
  console.log('\nNew long-lived access token:\n');
  console.log(data.access_token);
  console.log(`\nExpires in ~${days} days (${data.expires_in} seconds).`);
  console.log('\nUpdate INSTAGRAM_ACCESS_TOKEN in .env and your deployment env (e.g. Vercel).');
}

function printReauthHelp() {
  console.log('\nYour token is expired and cannot be refreshed automatically.');
  console.log('Generate a new one from Meta for Developers:\n');
  console.log('1. Open https://developers.facebook.com/apps/');
  console.log('2. Select your Instagram app → Instagram → API setup with Instagram login');
  console.log('3. Generate a new user access token (or complete OAuth to get a short-lived token)');
  console.log('4. Exchange it with this script:\n');
  console.log('   INSTAGRAM_SHORT_LIVED_TOKEN=... INSTAGRAM_APP_SECRET=... node scripts/refresh-instagram-token.mjs --exchange\n');
  console.log('Or paste a fresh long-lived token directly into INSTAGRAM_ACCESS_TOKEN.');
}

loadEnv();

const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
const shortLivedToken = process.env.INSTAGRAM_SHORT_LIVED_TOKEN?.trim();
const appSecret = process.env.INSTAGRAM_APP_SECRET?.trim();
const mode = process.argv.includes('--exchange') ? 'exchange' : 'refresh';

try {
  if (mode === 'exchange') {
    if (!shortLivedToken || !appSecret) {
      console.error('Set INSTAGRAM_SHORT_LIVED_TOKEN and INSTAGRAM_APP_SECRET to exchange a token.');
      process.exit(1);
    }

    const data = await exchangeShortLivedToken(shortLivedToken, appSecret);
    printTokenResult(data);
    process.exit(0);
  }

  if (!accessToken) {
    console.error('Set INSTAGRAM_ACCESS_TOKEN, or use --exchange with a short-lived token.');
    process.exit(1);
  }

  const data = await refreshLongLivedToken(accessToken);
  printTokenResult(data);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  if (isExpiredMessage(error)) {
    printReauthHelp();
  }
  process.exit(1);
}

function isExpiredMessage(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /session has expired|access token.*expired|token.*expired/i.test(message);
}
