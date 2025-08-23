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
  /https?:\/\/(?!github\.com|twitter\.com|linkedin\.com)[^\s]+/gi, // Links except to common platforms
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

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  // Get previous submissions or initialize empty array
  const submissions = ipSubmissions.get(ip) || [];
  
  // Filter out submissions older than the window
  const recentSubmissions = submissions.filter(time => now - time < SUBMISSION_WINDOW_MS);
  
  // Update the submissions list
  ipSubmissions.set(ip, [...recentSubmissions, now]);
  
  // Check if user has exceeded rate limit
  return recentSubmissions.length < MAX_SUBMISSIONS_PER_HOUR;
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
