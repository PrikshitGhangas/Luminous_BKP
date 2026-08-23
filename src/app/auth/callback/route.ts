import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ROLE_DETAILS } from '@/lib/constants/roles';
import { UserRole } from '@/lib/types';
import type { EmailOtpType } from '@supabase/supabase-js';

/**
 * Authentication callback for Email Confirmation, OAuth, Magic Link, and Password Recovery.
 *
 * Supabase redirects here with an authorization code or token hash.
 * The server-side client performs the exchange/verification, establishes
 * session cookies, resolves the user's role, and routes to their destination.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('[Auth Callback] Error from Supabase:', error, error_description);
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', error_description || error);
    return NextResponse.redirect(loginUrl);
  }

  // Password recovery flow redirect
  if (type === 'recovery') {
    const resetUrl = new URL('/reset-password', requestUrl.origin);
    if (code) resetUrl.searchParams.set('code', code);
    if (token_hash) resetUrl.searchParams.set('token_hash', token_hash);
    return NextResponse.redirect(resetUrl);
  }

  let userRole: UserRole = 'student';
  let defaultPath = '/student';
  let authenticatedUser = null;

  const supabase = await createClient();

  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('[Auth Callback] Exchange code failed:', exchangeError.message);
    } else {
      authenticatedUser = data?.user;
    }
  } else if (token_hash && type) {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (verifyError) {
      console.error('[Auth Callback] Verify OTP failed:', verifyError.message);
    } else {
      authenticatedUser = data?.user;
    }
  }

  if (authenticatedUser) {
    // 1. Check profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authenticatedUser.id)
      .maybeSingle();

    if (profile?.role && profile.role in ROLE_DETAILS) {
      userRole = profile.role as UserRole;
    } else if (
      authenticatedUser.user_metadata?.role &&
      authenticatedUser.user_metadata.role in ROLE_DETAILS
    ) {
      userRole = authenticatedUser.user_metadata.role as UserRole;
    }

    defaultPath = ROLE_DETAILS[userRole]?.defaultPath || '/student';
  }

  // Sanitize next parameter against open-redirect vulnerabilities
  const safeNext =
    next &&
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.includes('\\') &&
    next !== '/'
      ? next
      : defaultPath;

  const response = NextResponse.redirect(new URL(safeNext, requestUrl.origin));

  if (authenticatedUser) {
    response.cookies.set('luminous_role', userRole, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
      httpOnly: false,
    });
    response.cookies.set('luminous_demo', '', {
      path: '/',
      maxAge: 0,
    });
  }

  return response;
}