export function recordClientEvent(name: 'landmark_open' | 'format_switched' | 'quiz_completed', properties: Record<string, unknown>): void {
  console.debug(`[event] ${name}`, properties);
}
