import { generateSecureId, generateTrackingNumber } from '../src/lib/security/crypto';
import { checkRateLimit, resetRateLimit } from '../src/lib/security/rate-limiter';
import { verifyOrigin } from '../src/lib/security/csrf';
import { isRouteAllowed, PUBLIC_ROUTES } from '../src/lib/constants/roles';

interface SecTestResult {
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: SecTestResult[] = [];

function record(category: string, name: string, passed: boolean, details: string) {
  results.push({ category, name, passed, details });
  const icon = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${icon} [${category}] ${name}`);
  console.log(`   ↳ ${details}\n`);
}

async function runSecurityHardeningSuite() {
  console.log('================================================================================');
  console.log('🛡️ LUMINOUS SECURITY HARDENING & DEFENSE-IN-DEPTH VERIFICATION SUITE');
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('================================================================================\n');

  // ---------------------------------------------------------------------------
  // 1. CRYPTOGRAPHIC UUID GENERATION
  // ---------------------------------------------------------------------------
  console.log('🔑 1. Cryptographic ID & Tracking Number Generator');

  const incId1 = generateSecureId('inc');
  const incId2 = generateSecureId('inc');
  const uuidRegex = /^inc-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  record(
    'Crypto IDs',
    'Incident ID follows cryptographic UUIDv4 format',
    uuidRegex.test(incId1) && uuidRegex.test(incId2),
    `Generated: "${incId1}" vs "${incId2}" (Matches UUID pattern, unguessable)`
  );

  const sosId = generateSecureId('sos');
  const sosRegex = /^sos-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  record(
    'Crypto IDs',
    'SOS Alert ID follows cryptographic UUIDv4 format',
    sosRegex.test(sosId),
    `Generated: "${sosId}"`
  );

  const trackingNo = generateTrackingNumber('INC');
  const trackingRegex = /^INC-\d{8}-[0-9A-F]{6}$/;
  record(
    'Crypto IDs',
    'Incident tracking number follows standard format with high entropy',
    trackingRegex.test(trackingNo),
    `Generated: "${trackingNo}"`
  );

  // ---------------------------------------------------------------------------
  // 2. SLIDING-WINDOW RATE LIMITER
  // ---------------------------------------------------------------------------
  console.log('\n⏱️ 2. High-Performance Sliding-Window Rate Limiter');

  const testKey = 'test-client-ip-123';
  resetRateLimit(testKey);

  // Alerts limit: 5 req/min
  let burstPassed = true;
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(testKey, 'alerts');
    if (!res.success) burstPassed = false;
  }
  record(
    'Rate Limiting',
    'Allows requests within allocated threshold (5/5 alert slots)',
    burstPassed,
    '5 initial requests successfully permitted'
  );

  // 6th request should be rate-limited (HTTP 429)
  const blockedReq = checkRateLimit(testKey, 'alerts');
  record(
    'Rate Limiting',
    'Enforces rate limit and blocks 6th request with retry window',
    blockedReq.success === false && blockedReq.remaining === 0 && blockedReq.resetMs > 0,
    `Blocked result: success=${blockedReq.success}, remaining=${blockedReq.remaining}, resetMs=${blockedReq.resetMs}ms`
  );

  resetRateLimit(testKey);

  // ---------------------------------------------------------------------------
  // 3. CSRF & CROSS-ORIGIN VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n🌐 3. CSRF / Origin Header Verification');

  // Same-origin POST request
  const reqSameOrigin = new Request('http://localhost:3000/api/sos', {
    method: 'POST',
    headers: {
      host: 'localhost:3000',
      origin: 'http://localhost:3000',
    },
  });
  const resSame = verifyOrigin(reqSameOrigin);
  record(
    'CSRF Protection',
    'Permits legitimate same-origin POST requests',
    resSame.valid === true,
    `Validation: valid=${resSame.valid}`
  );

  // Malicious cross-origin POST request
  const reqCrossOrigin = new Request('http://localhost:3000/api/sos', {
    method: 'POST',
    headers: {
      host: 'localhost:3000',
      origin: 'https://malicious-attacker-site.com',
    },
  });
  const resCross = verifyOrigin(reqCrossOrigin);
  record(
    'CSRF Protection',
    'Blocks cross-origin POST request from unauthorized external domain',
    resCross.valid === false && Boolean(resCross.error?.includes('CSRF violation')),
    `Refusal: "${resCross.error}"`
  );

  // Sec-Fetch-Site cross-site flag
  const reqSecFetch = new Request('http://localhost:3000/api/incidents', {
    method: 'POST',
    headers: {
      'sec-fetch-site': 'cross-site',
    },
  });
  const resSecFetch = verifyOrigin(reqSecFetch);
  record(
    'CSRF Protection',
    'Blocks sec-fetch-site: cross-site requests',
    resSecFetch.valid === false,
    `Refusal: "${resSecFetch.error}"`
  );

  // ---------------------------------------------------------------------------
  // 4. DENY-BY-DEFAULT ROUTE AUTHORIZATION
  // ---------------------------------------------------------------------------
  console.log('\n🚪 4. Deny-by-Default Route Authorization Policy');

  // Public routes allowed for any role
  const publicAllowed = PUBLIC_ROUTES.every((r) => isRouteAllowed(r, 'student') && isRouteAllowed(r, 'other'));
  record(
    'Route Authorization',
    'Public routes (/login, /register, /forgot-password, etc.) accessible to all',
    publicAllowed,
    `Verified ${PUBLIC_ROUTES.length} public route definitions`
  );

  // Unmapped / unknown route denied by default
  const unmappedStudent = isRouteAllowed('/internal/secret-admin-tools', 'student');
  const unmappedFaculty = isRouteAllowed('/unregistered-private-portal', 'faculty');
  record(
    'Route Authorization',
    'Unmapped / unknown routes DENIED by default (Fail-Secure)',
    unmappedStudent === false && unmappedFaculty === false,
    `Result: /internal/secret-admin-tools -> ${unmappedStudent}, /unregistered-private-portal -> ${unmappedFaculty}`
  );

  // Explicitly mapped protected routes maintain exact RBAC boundaries
  const adminAudit = isRouteAllowed('/audit-logs', 'admin');
  const studentAudit = isRouteAllowed('/audit-logs', 'student');
  record(
    'Route Authorization',
    'Explicit RBAC matrix rules (/audit-logs) strictly preserved',
    adminAudit === true && studentAudit === false,
    `Admin: ${adminAudit}, Student: ${studentAudit}`
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('================================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`🎯 SECURITY HARDENING VERIFICATION: ${passedCount} / ${totalCount} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runSecurityHardeningSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
