/**
 * The site assistant's identity, in one place.
 *
 * "Locus" is a position on a chromosome — and, in plain English, the place
 * where something is found. That is exactly the job: you ask, it tells you
 * where on the site the answer lives. Short, on-theme, and it does not sound
 * like a 2015 chatbot.
 *
 * Renaming is a one-line change here; nothing else hardcodes the name.
 */
export const ASSISTANT = {
  name: "Locus",
  /** Shown under the name in the panel header. */
  tagline: "Ask about the research",
  /** Used on the launcher and as the aria-label. */
  cta: "Ask Locus",
} as const;

/**
 * Chat model.
 *
 * Verified present on this account via `GET /v1/models` — model IDs are not
 * guessable, and a wrong string is a 404 at request time.
 *
 * `gpt-5.4-nano` ($0.20/$1.25 per 1M tokens) is the cheapest current-generation
 * option — roughly $0.63 per 1,000 messages against this site's ~1,800-token
 * grounded prompt. It replaces `gpt-4o-mini`, a 2024 model that still works but
 * is two generations behind for about the same money.
 *
 * The job here is narrow: read an inlined corpus and answer from it without
 * inventing anything. That suits a small model. If answers ever start feeling
 * thin, step up one tier — every option below is live on this account:
 *
 *   gpt-5.4-nano   $0.20 / $1.25   ~$0.63 per 1k messages  ← current
 *   gpt-5.4-mini   $0.75 / $4.50   ~$2.32
 *   gpt-5.6-luna   $1.00 / $6.00   ~$3.09
 *   gpt-5.6-terra  $2.50 / $15.00  ~$7.73
 *   gpt-5.6-sol    $5.00 / $30.00  ~$15
 */
export const CHAT_MODEL = "gpt-5.4-nano";

/** Conversation limits. Requests outside these are rejected at the API. */
export const CHAT_LIMITS = {
  /** Longest single user message, in characters. */
  maxMessageChars: 2_000,
  /** Most recent turns forwarded to the model; older ones are dropped. */
  maxHistoryMessages: 20,
  /** Cap on generated tokens, so one request cannot run away. */
  maxOutputTokens: 800,
  /** Requests allowed per IP per window. */
  rateLimit: 20,
  rateWindowMs: 60_000,
} as const;

export const SUGGESTED_PROMPTS = [
  "What is CSTWAS, in plain English?",
  "What has Brian been working on lately?",
  "Why did the DNA foundation model not help with FFPE?",
  "What would make a good collaboration with Brian?",
] as const;
