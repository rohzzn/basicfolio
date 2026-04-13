const fs = require('fs');
const path = require('path');

const EXPORT_DIR = path.join(process.cwd(), 'letterboxd');
const INPUT_FILE = path.join(EXPORT_DIR, 'ratings.csv');
const OUTPUT_FILE = path.join(EXPORT_DIR, 'tmdb-import-simkl_v1.csv');
const MOVIES_ONLY_OUTPUT_FILE = path.join(EXPORT_DIR, 'tmdb-import-simkl_v1-movies-only.csv');
const UNMATCHED_FILE = path.join(EXPORT_DIR, 'tmdb-import-unmatched.csv');
const CACHE_FILE = path.join(EXPORT_DIR, 'tmdb-import-id-cache.json');
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};
const OUTPUT_HEADERS = [
  'SIMKL_ID',
  'Title',
  'Type',
  'Year',
  'Watchlist',
  'LastEpWatched',
  'WatchedDate',
  'Rating',
  'Memo',
  'TVDB',
  'TMDB',
  'IMDB',
];

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = '';
  let isQuoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (isQuoted && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
      continue;
    }

    if (char === ',' && !isQuoted) {
      currentRow.push(currentValue);
      currentValue = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !isQuoted) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }

      currentRow.push(currentValue);
      currentValue = '';

      if (currentRow.some((value) => value.length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    if (currentRow.some((value) => value.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (!rows.length) {
    return [];
  }

  const [headers, ...dataRows] = rows;
  return dataRows.map((row) =>
    headers.reduce((record, header, index) => {
      record[header] = row[index] ?? '';
      return record;
    }, {})
  );
}

function toCsv(rows, headers) {
  const escape = (value) => {
    const stringValue = value == null ? '' : String(value);
    return /[",\r\n]/.test(stringValue)
      ? `"${stringValue.replace(/"/g, '""')}"`
      : stringValue;
  };

  return [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join(
    '\n'
  );
}

function parseRating(value) {
  if (!value) {
    return '';
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return '';
  }

  return String(Math.round(parsed * 2));
}

function loadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

async function fetchExternalIds(letterboxdUrl) {
  const response = await fetch(letterboxdUrl, {
    headers: REQUEST_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    return { imdbId: '', tmdbId: '', finalUrl: response.url, error: `HTTP ${response.status}` };
  }

  const html = await response.text();
  const movieTmdbMatch = html.match(/themoviedb\.org\/movie\/(\d+)/i);
  const tvTmdbMatch = html.match(/themoviedb\.org\/(?:tv|series)\/(\d+)/i);
  const imdbId =
    html.match(/imdb\.com\/title\/(tt\d+)/i)?.[1] ||
    html.match(/"imdbId":"(tt\d+)"/i)?.[1] ||
    '';
  const tmdbId = movieTmdbMatch?.[1] || tvTmdbMatch?.[1] || html.match(/"tmdbId":(\d+)/i)?.[1] || '';
  const type = movieTmdbMatch ? 'movie' : tvTmdbMatch ? 'tv' : 'movie';

  return {
    imdbId,
    tmdbId,
    type,
    finalUrl: response.url,
    error: imdbId || tmdbId ? '' : 'No IMDb/TMDb id found',
  };
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Missing input file: ${INPUT_FILE}`);
  }

  const cache = loadJson(CACHE_FILE, {});
  const ratings = parseCsv(fs.readFileSync(INPUT_FILE, 'utf8'));
  const pending = ratings.filter((row) => {
    const cached = cache[row['Letterboxd URI']];
    return !cached || (!cached.imdbId && !cached.tmdbId);
  });

  let nextIndex = 0;
  const workerCount = Math.min(8, pending.length || 1);

  const worker = async () => {
    while (nextIndex < pending.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      const row = pending[currentIndex];

      if (!row) {
        return;
      }

      try {
        cache[row['Letterboxd URI']] = await fetchExternalIds(row['Letterboxd URI']);
      } catch (error) {
        cache[row['Letterboxd URI']] = {
          imdbId: '',
          tmdbId: '',
          type: 'movie',
          finalUrl: row['Letterboxd URI'],
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  };

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  const matchedRows = [];
  const unmatchedRows = [];

  for (const row of ratings) {
    const cached = cache[row['Letterboxd URI']] || {
      imdbId: '',
      tmdbId: '',
      type: 'movie',
      finalUrl: row['Letterboxd URI'],
      error: 'Missing cache entry',
    };

    if (!cached.imdbId && !cached.tmdbId) {
      unmatchedRows.push({
        Title: row.Name || '',
        Year: row.Year || '',
        Rating: row.Rating || '',
        LetterboxdURI: row['Letterboxd URI'] || '',
        FinalURL: cached.finalUrl || '',
        Error: cached.error || 'No IMDb/TMDb id found',
      });
      continue;
    }

    matchedRows.push({
      SIMKL_ID: '',
      Title: row.Name || '',
      Type: cached.type || 'movie',
      Year: row.Year || '',
      Watchlist: '',
      LastEpWatched: '',
      WatchedDate: row.Date || '',
      Rating: parseRating(row.Rating || ''),
      Memo: '',
      TVDB: '',
      TMDB: cached.tmdbId || '',
      IMDB: cached.imdbId || '',
    });
  }

  fs.writeFileSync(OUTPUT_FILE, toCsv(matchedRows, OUTPUT_HEADERS), 'utf8');
  fs.writeFileSync(
    MOVIES_ONLY_OUTPUT_FILE,
    toCsv(
      matchedRows.filter((row) => row.Type === 'movie'),
      OUTPUT_HEADERS
    ),
    'utf8'
  );
  fs.writeFileSync(
    UNMATCHED_FILE,
    toCsv(unmatchedRows, ['Title', 'Year', 'Rating', 'LetterboxdURI', 'FinalURL', 'Error']),
    'utf8'
  );
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');

  console.log(`ratings=${ratings.length}`);
  console.log(`matched=${matchedRows.length}`);
  console.log(`unmatched=${unmatchedRows.length}`);
  console.log(`output=${OUTPUT_FILE}`);
  console.log(`moviesOnlyOutput=${MOVIES_ONLY_OUTPUT_FILE}`);
  console.log(`unmatchedOutput=${UNMATCHED_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
