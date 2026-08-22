import { randomUUID } from 'crypto';

/**
 * Generates a cryptographically secure, unpredictable resource ID with a prefix.
 * e.g. generateSecureId('inc') => 'inc-f47ac10b-58cc-4372-a567-0e02b2c3d479'
 */
export function generateSecureId(prefix?: string): string {
  const uuid = randomUUID();
  return prefix ? `${prefix}-${uuid}` : uuid;
}

/**
 * Generates an official incident tracking number with random entropy.
 * e.g. generateIncidentNumber('INC') => 'INC-20260822-4a8f9b'
 */
export function generateTrackingNumber(prefix: string = 'INC'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const entropy = randomUUID().slice(0, 6).toUpperCase();
  return `${prefix}-${dateStr}-${entropy}`;
}
