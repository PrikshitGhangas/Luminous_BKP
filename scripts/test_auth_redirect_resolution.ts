import { getSiteUrl, getAuthRedirectUrl } from '../src/lib/utils/url.ts';
import assert from 'assert';

console.log('--- TESTING AUTH REDIRECT URL RESOLUTION ---');

// Test 1: Default fallback
delete process.env.NEXT_PUBLIC_SITE_URL;
delete process.env.NEXT_PUBLIC_VERCEL_URL;
delete process.env.VERCEL_URL;

const defaultSite = getSiteUrl();
const defaultAuthCallback = getAuthRedirectUrl('/auth/callback');
const defaultReset = getAuthRedirectUrl('/reset-password');

console.log('Default fallback URL:', defaultSite);
assert.strictEqual(defaultSite, 'http://localhost:3000', 'Should default to localhost:3000');
assert.strictEqual(defaultAuthCallback, 'http://localhost:3000/auth/callback');
assert.strictEqual(defaultReset, 'http://localhost:3000/reset-password');
console.log('✅ Test 1 (Default local fallback) Passed');

// Test 2: Production environment variable NEXT_PUBLIC_SITE_URL
process.env.NEXT_PUBLIC_SITE_URL = 'https://luminous-orpin.vercel.app';
const prodSite = getSiteUrl();
const prodAuthCallback = getAuthRedirectUrl('/auth/callback');
const prodReset = getAuthRedirectUrl('/reset-password');

console.log('Production URL:', prodSite);
assert.strictEqual(prodSite, 'https://luminous-orpin.vercel.app', 'Should resolve canonical NEXT_PUBLIC_SITE_URL');
assert.strictEqual(prodAuthCallback, 'https://luminous-orpin.vercel.app/auth/callback');
assert.strictEqual(prodReset, 'https://luminous-orpin.vercel.app/reset-password');
console.log('✅ Test 2 (Canonical NEXT_PUBLIC_SITE_URL) Passed');

// Test 3: Trailing slash normalization
process.env.NEXT_PUBLIC_SITE_URL = 'https://luminous-orpin.vercel.app///';
const normalizedSite = getSiteUrl();
const normalizedCallback = getAuthRedirectUrl('auth/callback');
assert.strictEqual(normalizedSite, 'https://luminous-orpin.vercel.app');
assert.strictEqual(normalizedCallback, 'https://luminous-orpin.vercel.app/auth/callback');
console.log('✅ Test 3 (URL normalization & trailing slash handling) Passed');

// Test 4: Vercel preview host resolution via VERCEL_URL
delete process.env.NEXT_PUBLIC_SITE_URL;
process.env.VERCEL_URL = 'luminous-preview-abc123.vercel.app';
const previewSite = getSiteUrl();
const previewCallback = getAuthRedirectUrl('/auth/callback');
assert.strictEqual(previewSite, 'https://luminous-preview-abc123.vercel.app');
assert.strictEqual(previewCallback, 'https://luminous-preview-abc123.vercel.app/auth/callback');
console.log('✅ Test 4 (Vercel preview deployment host resolution) Passed');

console.log('\n=============================================');
console.log('🎉 ALL AUTH REDIRECT TESTS PASSED!');
console.log('=============================================');
