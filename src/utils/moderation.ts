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
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Check for offensive words
  for (const word of OFFENSIVE_WORDS) {
    // Use word boundary to match whole words only
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
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
  let cleanedText = text;
  
  // Replace offensive words with asterisks
  for (const word of OFFENSIVE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
  }
  
  return cleanedText;
}

