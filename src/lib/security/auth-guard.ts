import { UserRole } from '../types';
import { DEMO_USERS } from '../constants/demo-data';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
  isDemo?: boolean;
}

export interface AuthCheckResult {
  success: boolean;
  user?: AuthenticatedUser;
  status?: number;
  error?: string;
}

const VALID_ROLES: UserRole[] = [
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

/**
 * Standard server-side authentication & authorization gateway for API Route Handlers.
 */
export async function authenticateApiRequest(
  request: Request,
  allowedRoles?: UserRole[]
): Promise<AuthCheckResult> {
  const cookieHeader = request.headers.get('cookie') || '';
  const authHeader = request.headers.get('authorization') || '';

  // Parse cookies helper
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((part) => {
    const [k, v] = part.trim().split('=');
    if (k && v) {
      cookies[k] = decodeURIComponent(v);
    }
  });

  let authenticatedUser: AuthenticatedUser | null = null;

  // 1. Check Bearer Token (Simulated / Supabase JWT)
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    // Check if token matches a demo user or standard pattern
    const matchedDemo = Object.values(DEMO_USERS).find((u) => u.id === token || u.email === token);
    if (matchedDemo) {
      authenticatedUser = {
        id: matchedDemo.id,
        email: matchedDemo.email,
        full_name: matchedDemo.full_name,
        role: matchedDemo.role,
        department: matchedDemo.department,
        isDemo: true,
      };
    }
  }

  // 2. Check Demo Cookie Session or Role Cookie
  if (!authenticatedUser) {
    const isDemo = cookies['luminous_demo'] === '1';
    const roleCookie = cookies['luminous_role'] as UserRole | undefined;

    if (roleCookie && VALID_ROLES.includes(roleCookie)) {
      const demoTemplate = DEMO_USERS[roleCookie] || DEMO_USERS.student;
      authenticatedUser = {
        id: demoTemplate.id,
        email: demoTemplate.email,
        full_name: demoTemplate.full_name,
        role: roleCookie,
        department: demoTemplate.department,
        isDemo: true,
      };
    } else if (isDemo) {
      const defaultDemo = DEMO_USERS.student;
      authenticatedUser = {
        id: defaultDemo.id,
        email: defaultDemo.email,
        full_name: defaultDemo.full_name,
        role: defaultDemo.role,
        department: defaultDemo.department,
        isDemo: true,
      };
    }
  }

  // 3. Fallback for unconfigured dev environment or default student persona
  if (!authenticatedUser) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // In development / testing sandbox without live DB credentials:
    // Allow default student identity
    if (!supabaseUrl || !supabaseAnonKey || process.env.NODE_ENV !== 'production') {
      const defaultUser = DEMO_USERS.student;
      authenticatedUser = {
        id: defaultUser.id,
        email: defaultUser.email,
        full_name: defaultUser.full_name,
        role: defaultUser.role,
        department: defaultUser.department,
        isDemo: true,
      };
    }
  }

  if (!authenticatedUser) {
    return {
      success: false,
      status: 401,
      error: 'UNAUTHORIZED: Authentication session is missing or expired. Please sign in.',
    };
  }

  // Enforce RBAC if allowedRoles filter is provided
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(authenticatedUser.role)) {
      return {
        success: false,
        status: 403,
        error: `FORBIDDEN: Role '${authenticatedUser.role}' is not authorized for this operation. Clearance required: ${allowedRoles.join(', ')}.`,
      };
    }
  }

  return {
    success: true,
    user: authenticatedUser,
  };
}
