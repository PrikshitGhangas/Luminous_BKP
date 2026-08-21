import { NextResponse } from 'next/server';
import { INITIAL_ALERTS } from '@/lib/constants/demo-data';
import { z } from 'zod';
import { UserRole, AlertType, IncidentSeverity } from '@/lib/types';

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

export async function GET() {
  return NextResponse.json({
    data: INITIAL_ALERTS,
    total: INITIAL_ALERTS.length,
  });
}

export async function POST(request: Request) {
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

    // RBAC Authorization Check: Only Admin and Security personnel may broadcast emergency alerts
    const senderRole = validated.sender_role as UserRole | undefined;
    const allowedBroadcastRoles: UserRole[] = ['super_admin', 'admin', 'security'];

    if (senderRole && !allowedBroadcastRoles.includes(senderRole)) {
      return NextResponse.json(
        {
          success: false,
          error: `FORBIDDEN: Role '${senderRole}' is not authorized to broadcast institutional emergency alerts. Only Administrators and Security Officers possess broadcast clearance.`,
        },
        { status: 403 }
      );
    }

    const newAlert = {
      id: `alt-${Date.now()}`,
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
      created_by: senderRole ? `Campus Operations (${senderRole.toUpperCase()})` : 'Campus Safety Dispatch',
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
