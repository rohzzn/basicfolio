// Moderation utilities for filtering inappropriate content

// Common offensive words to filter
const OFFENSIVE_WORDS = [
  'racist',
  'racism',
  'nazi',
  'n-word',
  'nigger',
  'nigga',
  'faggot',
  'retard',
  'whore',
  'slut',
  // Add more words as needed
];

// Common leetspeak / lookalike substitutions, used only to widen matches
// against the small OFFENSIVE_WORDS list above (not applied to general text,
// so it can't cause collateral false positives elsewhere).
const LEET_VARIANTS: Record<string, string> = {
  a: 'a4@',
  e: 'e3',
  g: 'g9',
  i: 'i1l!',
  l: 'l1i!',
  o: 'o0',
  s: 's5$',
  t: 't7+',
};

function leetLetterClass(ch: string): string {
  const variants = LEET_VARIANTS[ch];
  // `+` also absorbs elongation, e.g. "sluuut" or "niggggger".
  return variants ? `[${variants}]+` : `${ch}+`;
}

/**
 * Build a regex matching a blocked word even when broken up by punctuation
 * or whitespace ("s.l.u.t", "s l u t") or leetspeak-substituted ("s1ut",
 * "wh0re"). Still anchored on both sides to a non-alphanumeric boundary, so
 * it only fires on the literal letter sequence in order — it can't match
 * across an unrelated word (e.g. "insult" or "assault" never trip "slut").
 */
function buildOffensiveWordPattern(word: string): string {
  const letters = word.toLowerCase().replace(/[^a-z0-9]/g, '').split('');
  const body = letters.map(leetLetterClass).join('[\\W_]*');
  return `(?<![a-z0-9])${body}(?![a-z0-9])`;
}

const OFFENSIVE_TEST_PATTERNS = OFFENSIVE_WORDS.map(
  (word) => new RegExp(buildOffensiveWordPattern(word), 'i')
);
const OFFENSIVE_REPLACE_PATTERNS = OFFENSIVE_WORDS.map(
  (word) => new RegExp(buildOffensiveWordPattern(word), 'gi')
);

// Strip invisible/zero-width characters sometimes used to split up a
// blocked word ("s<ZWSP>lut") before matching.
function stripInvisible(text: string): string {
  return text.replace(/[\u200B-\u200F\u2060\uFEFF]/g, '');
}

// Regex patterns for common spam patterns
const SPAM_PATTERNS = [
  /\b(viagra|cialis|pharmacy|prescription|meds|pills)\b/i,
  /\b(casino|gambling|betting|lottery|jackpot)\b/i,
  /\b(free\s+money|earn\s+money|make\s+money|cash\s+app)\b/i,
  // Links except to common platforms. No `g` flag: `.test()` on a global
  // regex mutates lastIndex across calls, which made this pattern miss
  // matches nondeterministically since it's reused across requests.
  // The domain boundary (`/|?|#|$`) stops lookalikes like
  // github.com.evil.com from slipping through as "excluded".
  /https?:\/\/(?!(?:www\.)?(?:github\.com|twitter\.com|linkedin\.com)(?:[/?#]|$))[^\s]+/i,
];

/**
 * Check if text contains offensive content
 */
export function containsOffensiveContent(text: string): boolean {
  const normalized = stripInvisible(text);

  // Check for offensive words (spacing/leetspeak/elongation resistant)
  for (const pattern of OFFENSIVE_TEST_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Rate limiting - track IP addresses and their submission times
 */
const ipSubmissions: Map<string, number[]> = new Map();
const MAX_SUBMISSIONS_PER_HOUR = 5;
const SUBMISSION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Periodically drop IPs with no submissions left in the window, so a
// long-running server doesn't accumulate one entry per visitor forever.
function pruneStaleIps(now: number): void {
  for (const [key, times] of ipSubmissions) {
    if (times[times.length - 1] === undefined || now - times[times.length - 1] >= SUBMISSION_WINDOW_MS) {
      ipSubmissions.delete(key);
    }
  }
}

export function checkRateLimit(rawIp: string): boolean {
  // x-forwarded-for can be a "client, proxy1, proxy2" chain; key on the client.
  const ip = rawIp.split(',')[0].trim() || 'unknown';
  const now = Date.now();

  if (Math.random() < 0.01) pruneStaleIps(now);

  // Get previous submissions or initialize empty array
  const submissions = ipSubmissions.get(ip) || [];

  // Filter out submissions older than the window
  const recentSubmissions = submissions.filter(time => now - time < SUBMISSION_WINDOW_MS);

  const allowed = recentSubmissions.length < MAX_SUBMISSIONS_PER_HOUR;

  // Cap stored history at the limit so a burst of rejected retries can't
  // grow this IP's array without bound within the window.
  ipSubmissions.set(ip, [...recentSubmissions, now].slice(-MAX_SUBMISSIONS_PER_HOUR));

  // Check if user has exceeded rate limit
  return allowed;
}

/**
 * Clean text by replacing offensive words with asterisks
 */
export function cleanText(text: string): string {
  let cleanedText = stripInvisible(text);

  // Replace offensive words with asterisks (same evasion-resistant match
  // as containsOffensiveContent, so cleaning and detection stay in sync)
  for (const pattern of OFFENSIVE_REPLACE_PATTERNS) {
    cleanedText = cleanedText.replace(pattern, (match) => '*'.repeat(match.length));
  }

  return cleanedText;
}

