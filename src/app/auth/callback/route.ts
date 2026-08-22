import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ROLE_DETAILS } from '@/lib/constants/roles';
import { UserRole } from '@/lib/types';

/**
 * OAuth / social-login callback.
 *
 * Supabase redirects the user back here after they authenticate with an
 * OAuth provider (e.g. Google, GitHub, Microsoft). The server-side Supabase
 * client performs the code exchange and establishes the session cookies,
 * then the user is redirected into their dashboard.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  let defaultPath = '/student';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('OAuth callback exchange failed:', error.message);
    } else if (data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      const role = profile?.role as UserRole;
      if (role && ROLE_DETAILS[role]?.defaultPath) {
        defaultPath = ROLE_DETAILS[role].defaultPath;
      }
    }
  }

  const next = requestUrl.searchParams.get('next');
  const target =
    next && next.startsWith('/') && !next.startsWith('//') && next !== '/'
      ? next
      : defaultPath;
  return NextResponse.redirect(new URL(target, requestUrl.origin));
}