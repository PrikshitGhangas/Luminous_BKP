/**
 * CSRF / Origin & Referer Verification Utility for Mutation API endpoints.
 */

export interface CsrfCheckResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates the Origin and Referer headers against the host to prevent cross-site request forgery.
 */
export function verifyOrigin(request: Request): CsrfCheckResult {
  const method = request.method.toUpperCase();

  // Safe HTTP methods don't require CSRF origin validation
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  // If both origin and referer are absent (e.g. server-to-server or test requests without headers), allow if not browser-based
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return {
      valid: false,
      error: 'CSRF violation: Cross-site request rejected.',
    };
  }

  if (origin) {
    try {
      const originUrl = new URL(origin);
      // Allow localhost / 127.0.0.1 in development
      if (
        originUrl.hostname === 'localhost' ||
        originUrl.hostname === '127.0.0.1' ||
        (host && originUrl.host === host)
      ) {
        return { valid: true };
      }

      // Check configured environment domain
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (siteUrl) {
        const expectedUrl = new URL(siteUrl);
        if (originUrl.host === expectedUrl.host) {
          return { valid: true };
        }
      }

      return {
        valid: false,
        error: `CSRF violation: Request origin '${origin}' does not match host '${host}'.`,
      };
    } catch {
      return { valid: false, error: 'CSRF violation: Malformed Origin header.' };
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (
        refererUrl.hostname === 'localhost' ||
        refererUrl.hostname === '127.0.0.1' ||
        (host && refererUrl.host === host)
      ) {
        return { valid: true };
      }
    } catch {
      return { valid: false, error: 'CSRF violation: Malformed Referer header.' };
    }
  }

  return { valid: true };
}
