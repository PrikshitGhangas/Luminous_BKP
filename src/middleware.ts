import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { UserRole } from './lib/types';
import { isRouteAllowed } from './lib/constants/roles';

const ALLOWED_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'faculty',
  'student',
  'parent',
  'security',
  'warden',
  'placement_officer',
  'other',
];

// Routes that don't require an authenticated Supabase session.
// Demo sandbox routes — exempt from real-auth guardianship (client-only personas).
const DEMO_PREFIXES = ['/demo', '/command-center', '/safety/command-center'];

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=(self)'
  );
  return response;
}

/** Demo-mode guard: allow navigation while a clearly-labeled demo persona is active. */
function isDemoSession(request: NextRequest): boolean {
  return request.cookies.get('luminous_demo')?.value === '1';
}

function isPublic(pathname: string): boolean {
  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password') {
    return true;
  }
  // OAuth callback must be reachable without an existing session to complete the code exchange.
  if (pathname === '/auth/callback') {
    return true;
  }
  if (DEMO_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Handle API routes (pass through; individual handlers enforce their own auth)
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Demo mode short-circuit: a clearly-labeled client-only demo persona is active.
  // Honor it BEFORE touching Supabase so demo navigation is instant and never
  // depends on a live Supabase project. Role-based route guards still apply.
  if (isDemoSession(request)) {
    if (isPublic(pathname)) {
      return applySecurityHeaders(NextResponse.next());
    }
    const rawRoleCookie = request.cookies.get('luminous_role')?.value;
    const roleCookie: UserRole =
      rawRoleCookie && ALLOWED_ROLES.includes(rawRoleCookie as UserRole)
        ? (rawRoleCookie as UserRole)
        : 'student';
    if (!isRouteAllowed(pathname, roleCookie)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return applySecurityHeaders(NextResponse.redirect(url));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // If Supabase isn't configured, fall back to the legacy cookie-based demo guard
  // so the app remains navigable during development.
  if (!supabaseUrl || !supabaseAnonKey) {
    const rawRoleCookie = request.cookies.get('luminous_role')?.value;
    const roleCookie: UserRole =
      rawRoleCookie && ALLOWED_ROLES.includes(rawRoleCookie as UserRole)
        ? (rawRoleCookie as UserRole)
        : 'student';

    if (!isPublic(pathname)) {
      const isAllowed = isRouteAllowed(pathname, roleCookie);
      if (!isAllowed) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        const response = NextResponse.redirect(url);
        return applySecurityHeaders(response);
      }
    }

    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Real Supabase SSR session refresh
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public / demo routes: allow but still refresh cookies.
  if (isPublic(pathname)) {
    return applySecurityHeaders(response);
  }

  // Protected route with no Supabase session -> redirect to login.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Resolve role from the profiles table (server-side; never trusted from client).
  let role: UserRole = 'other';
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (data && ALLOWED_ROLES.includes(data.role as UserRole)) {
      role = data.role as UserRole;
    }
  }

  // Deny unauthorized access at the edge.
  if (!isRouteAllowed(pathname, role)) {
    const url = request.nextUrl.clone();
    url.pathname = '/'; // role router will send them to their dashboard
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};