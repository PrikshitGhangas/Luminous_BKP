/**
 * Canonical Site URL resolution helper for environment-aware authentication redirects.
 *
 * Supports:
 * - Local Development: http://localhost:3000
 * - Production / Vercel: https://luminous-orpin.vercel.app (or custom domain)
 *
 * Resolution precedence:
 * 1. NEXT_PUBLIC_SITE_URL (explicit canonical domain configured in environment)
 * 2. window.location.origin (client-side runtime origin)
 * 3. NEXT_PUBLIC_VERCEL_URL / VERCEL_URL (Vercel deployment host)
 * 4. Fallback: http://localhost:3000
 */

export function getSiteUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '') ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000';

  // Normalize: remove whitespace, ensure valid protocol, strip trailing slashes
  url = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * Returns a full redirect URL for authentication flows.
 *
 * @param path - Relative path such as '/auth/callback' or '/reset-password'
 */
export function getAuthRedirectUrl(path: string = '/auth/callback'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${cleanPath}`;
}
