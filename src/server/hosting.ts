import 'server-only';

/**
 * Hosted mode = a database is configured. Self-hosters can run with DATABASE_URL
 * unset; progress then lives in the browser only and the surfaces that need
 * shared server state are hidden rather than broken.
 */
export function isHostedMode(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
