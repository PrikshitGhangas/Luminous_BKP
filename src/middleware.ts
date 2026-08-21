import { NextResponse, type NextRequest } from 'next/server';
import { isRouteAllowed } from './lib/constants/roles';
import { UserRole } from './lib/types';

const ALLOWED_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'faculty',
  'student',
  'parent',
  'security',
  'warden',
  'placement_officer',
];

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, favicon, auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname === '/'
  ) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Handle API routes
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Get active role from cookie
  const rawRoleCookie = request.cookies.get('luminous_role')?.value;
  const roleCookie: UserRole =
    rawRoleCookie && ALLOWED_ROLES.includes(rawRoleCookie as UserRole)
      ? (rawRoleCookie as UserRole)
      : 'student';

  const isAllowed = isRouteAllowed(pathname, roleCookie);
  if (!isAllowed) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const response = NextResponse.redirect(url);
    return applySecurityHeaders(response);
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
