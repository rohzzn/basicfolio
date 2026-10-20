// One-time sign-in for the sidebar heart rate (src/lib/google-health.ts).
//
//   node scripts/google-health-auth.mjs [path/to/client_secret.json]
//
// Takes the OAuth client from .env (GOOGLE_HEALTH_CLIENT_ID / _SECRET), or
// from the client_secret_*.json Google Cloud lets you download (the newest
// one in ~/Downloads if no path is given), opens Google's consent page, and
// writes GOOGLE_HEALTH_REFRESH_TOKEN into .env. Secrets are never printed.
// Then it reads the latest heart rate once to prove the whole chain works.

import { createHash, randomBytes } from 'crypto';
import { exec } from 'child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import { homedir } from 'os';
import { join, resolve } from 'path';

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPE = 'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly';
const ENV_PATH = resolve(process.cwd(), '.env');

function loadEnv() {
  try {
    for (const line of readFileSync(ENV_PATH, 'utf8').split('\n')) {
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

// Replace the line if the key is there, append it otherwise
function saveEnv(key, value) {
  const text = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : '';
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  const next = pattern.test(text)
    ? text.replace(pattern, line)
    : `${text}${text.endsWith('\n') || text === '' ? '' : '\n'}${line}\n`;
  writeFileSync(ENV_PATH, next);
  process.env[key] = value;
}

function findClientJson(argPath) {
  if (argPath) return resolve(argPath);
  const downloads = join(homedir(), 'Downloads');
  if (!existsSync(downloads)) return null;
  const candidates = readdirSync(downloads)
    .filter((name) => /^client_secret_.*\.json$/.test(name))
    .map((name) => join(downloads, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return candidates[0] ?? null;
}

function loadClient(argPath) {
  if (process.env.GOOGLE_HEALTH_CLIENT_ID && process.env.GOOGLE_HEALTH_CLIENT_SECRET) {
    return { id: process.env.GOOGLE_HEALTH_CLIENT_ID, secret: process.env.GOOGLE_HEALTH_CLIENT_SECRET };
  }

  const file = findClientJson(argPath);
  if (!file || !existsSync(file)) {
    throw new Error(
      'No OAuth client found. Download the client JSON from Google Cloud (Credentials > your client > Download JSON) into Downloads, or pass its path.'
    );
  }

  const json = JSON.parse(readFileSync(file, 'utf8'));
  const client = json.web ?? json.installed;
  if (!client?.client_id || !client?.client_secret) {
    throw new Error(`${file} does not look like an OAuth client JSON.`);
  }
  if (json.web && !(client.redirect_uris ?? []).includes(REDIRECT_URI)) {
    console.warn(`! The client's redirect URIs do not include ${REDIRECT_URI}. Add it in Google Cloud, or the consent page will refuse.`);
  }

  saveEnv('GOOGLE_HEALTH_CLIENT_ID', client.client_id);
  saveEnv('GOOGLE_HEALTH_CLIENT_SECRET', client.client_secret);
  console.log(`Saved GOOGLE_HEALTH_CLIENT_ID and GOOGLE_HEALTH_CLIENT_SECRET to .env (from ${file}).`);
  return { id: client.client_id, secret: client.client_secret };
}

function openBrowser(url) {
  const command =
    process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(command, () => {});
}

async function exchangeCode(client, code, verifier) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      client_id: client.id,
      client_secret: client.secret,
      redirect_uri: REDIRECT_URI,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Token exchange failed (${response.status}): ${data.error_description ?? data.error ?? 'unknown'}`);
  }
  return data;
}

// The filter field spelling differs between Google's pages (snake_case in the
// data type guide, camelCase in one list example), so try both and report.
async function probe(accessToken) {
  const since = new Date(Date.now() - 12 * 3_600_000).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  const tries = [
    ['heart-rate', `heart_rate.sample_time.physical_time >= "${since}"`],
    ['heart-rate', `heartRate.sampleTime.physicalTime >= "${since}"`],
    ['daily-resting-heart-rate', `daily_resting_heart_rate.date >= "${weekAgo}"`],
    ['daily-resting-heart-rate', `dailyRestingHeartRate.date >= "${weekAgo}"`],
  ];

  for (const [dataType, filter] of tries) {
    const url = new URL(`https://health.googleapis.com/v4/users/me/dataTypes/${dataType}/dataPoints`);
    url.searchParams.set('pageSize', '1');
    url.searchParams.set('filter', filter);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const body = await response.json().catch(() => ({}));
    const point = body.dataPoints?.[0];
    const value = point?.heartRate ?? point?.dailyRestingHeartRate;
    console.log(
      `  ${response.status} ${dataType} [${filter.split(' ')[0]}]`,
      response.ok
        ? value
          ? `-> ${value.beatsPerMinute} bpm ${value.sampleTime?.physicalTime ?? JSON.stringify(value.date ?? '')}`
          : '-> no data in range'
        : `-> ${body.error?.message ?? 'error'}`
    );
  }
}

async function main() {
  loadEnv();
  const client = loadClient(process.argv[2]);

  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const state = randomBytes(16).toString('hex');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', client.id);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPE);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', REDIRECT_URI);
    if (url.pathname !== '/callback') {
      res.writeHead(404).end();
      return;
    }

    const finish = (status, message) => {
      res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<p style="font:16px system-ui;padding:40px">${message}</p>`);
      server.close();
    };

    try {
      if (url.searchParams.get('error')) throw new Error(`Google said: ${url.searchParams.get('error')}`);
      if (url.searchParams.get('state') !== state) throw new Error('State mismatch, start again.');

      const tokens = await exchangeCode(client, url.searchParams.get('code'), verifier);
      if (!tokens.refresh_token) {
        throw new Error('Google returned no refresh token. Remove the app at myaccount.google.com/permissions and run this again.');
      }

      saveEnv('GOOGLE_HEALTH_REFRESH_TOKEN', tokens.refresh_token);
      console.log('Saved GOOGLE_HEALTH_REFRESH_TOKEN to .env.');
      finish(200, 'Connected. You can close this tab.');

      console.log('Reading heart rate once to check:');
      await probe(tokens.access_token);
      console.log('\nNext: add GOOGLE_HEALTH_CLIENT_ID, GOOGLE_HEALTH_CLIENT_SECRET and GOOGLE_HEALTH_REFRESH_TOKEN to Vercel (Production).');
    } catch (error) {
      console.error(error.message);
      finish(500, `Something went wrong: ${error.message}`);
      process.exitCode = 1;
    }
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Waiting for Google on ${REDIRECT_URI}`);
    console.log('If no browser opened, visit:\n' + authUrl.toString());
    openBrowser(authUrl.toString());
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
