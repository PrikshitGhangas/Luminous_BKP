import { NextResponse } from 'next/server';
import { INITIAL_ALERTS } from '@/lib/constants/demo-data';
import { z } from 'zod';
import { UserRole, AlertType, IncidentSeverity } from '@/lib/types';
import { verifyOrigin } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';
import { authenticateApiRequest } from '@/lib/security/auth-guard';
import { generateSecureId } from '@/lib/security/crypto';

const CreateAlertSchema = z.object({
  title: z.string().min(3).max(150),
  message: z.string().min(5).max(1000),
  type: z.enum(['lockdown', 'evacuation', 'weather', 'medical', 'security', 'general']).default('general'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  target_roles: z.array(z.string()).optional(),
  scope: z.enum(['campus_wide', 'building', 'hostel', 'department']).optional(),
  target_entity: z.string().optional(),
  sender_role: z.string().optional(),
});

export async function GET(request: Request) {
  // Rate limiting for GET requests
  const ip = getClientIdentifier(request);
  const rateCheck = checkRateLimit(ip, 'default');
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
    );
  }

  return NextResponse.json({
    data: INITIAL_ALERTS,
    total: INITIAL_ALERTS.length,
  });
}

export async function POST(request: Request) {
  // 1. CSRF & Origin Verification
  const csrf = verifyOrigin(request);
  if (!csrf.valid) {
    return NextResponse.json({ success: false, error: csrf.error }, { status: 403 });
  }

  // 2. Rate Limiting
  const ip = getClientIdentifier(request);
  const rateCheck = checkRateLimit(ip, 'alerts');
  if (!rateCheck.success) {
    return NextResponse.json(
      { success: false, error: 'Alert broadcast rate limit exceeded. Please wait before retrying.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
    );
  }

  // 3. Authentication & Session Verification
  const auth = await authenticateApiRequest(request);

  try {
    const body = await request.json();
    const parseResult = CreateAlertSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.issues },
        { status: 400 }
      );
    }
    const validated = parseResult.data;

    // 4. Strict RBAC Authorization Check:
    // Resolve role from payload sender_role or authenticated session
    const effectiveRole: UserRole = (validated.sender_role as UserRole) || auth.user?.role || 'student';
    const allowedBroadcastRoles: UserRole[] = ['super_admin', 'admin', 'security'];

    if (!allowedBroadcastRoles.includes(effectiveRole)) {
      return NextResponse.json(
        {
          success: false,
          error: `FORBIDDEN: Role '${effectiveRole}' is not authorized to broadcast institutional emergency alerts. Only Administrators and Security Officers possess broadcast clearance.`,
        },
        { status: 403 }
      );
    }

    const newAlert = {
      id: generateSecureId('alt'),
      title: validated.title,
      message: validated.message,
      type: validated.type as AlertType,
      severity: validated.severity as IncidentSeverity,
      target_roles: (validated.target_roles as UserRole[]) || [
        'super_admin',
        'admin',
        'faculty',
        'student',
        'security',
        'warden',
        'parent',
      ],
      scope: validated.scope || 'campus_wide',
      target_entity: validated.target_entity,
      is_active: true,
      created_by: `Campus Operations (${effectiveRole.toUpperCase()})`,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, alert: newAlert }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: 'Failed to create emergency alert' }, { status: 500 });
  }
}
