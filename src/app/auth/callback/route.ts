import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / social-login callback.
 *
 * Supabase redirects the user back here after they authenticate with an
 * OAuth provider (e.g. Google, GitHub, Microsoft). The server-side Supabase
 * client performs the code exchange and establishes the session cookies,
 * then the user is redirected into the application.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('OAuth callback exchange failed:', error.message);
    }
  }

  const next = requestUrl.searchParams.get('next') || '/';
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}