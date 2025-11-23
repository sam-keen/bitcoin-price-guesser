// Game configuration constants
// These can be overridden via environment variables for testing

/**
 * Duration in seconds before a guess can be resolved.
 * Default: 60 seconds
 * For E2E tests: Set NEXT_PUBLIC_COUNTDOWN_SECONDS=3
 */
export const COUNTDOWN_SECONDS = parseInt(
  process.env.NEXT_PUBLIC_COUNTDOWN_SECONDS || '60',
  10
);
