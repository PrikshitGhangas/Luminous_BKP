import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runCampusShieldCopilot, CopilotMessage } from '@/lib/services/copilot/gemini-engine';
import { UserRole } from '@/lib/types';
import { DEMO_USERS } from '@/lib/constants/demo-data';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1),
  userContext: z
    .object({
      id: z.string(),
      role: z.string(),
      full_name: z.string(),
      email: z.string(),
      department: z.string().optional(),
    })
    .optional(),
  overrideRole: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validated = RequestSchema.parse(json);

    // Resolve user context with fail-secure defaults
    let activeUser = validated.userContext;

    // Validate overrideRole against existing demo users safely
    if (validated.overrideRole && DEMO_USERS[validated.overrideRole]) {
      const demoUser = DEMO_USERS[validated.overrideRole];
      activeUser = {
        id: demoUser.id,
        role: demoUser.role,
        full_name: demoUser.full_name,
        email: demoUser.email,
        department: demoUser.department,
      };
    }

    // FAIL-SECURE DEFAULT: If no valid user provided, default strictly to lowest-privilege Student
    if (!activeUser) {
      const defaultUser = DEMO_USERS.student;
      activeUser = {
        id: defaultUser.id,
        role: defaultUser.role,
        full_name: defaultUser.full_name,
        email: defaultUser.email,
        department: defaultUser.department,
      };
    }

    // Ensure role is a validated UserRole
    const validRoles: UserRole[] = [
      'super_admin',
      'admin',
      'faculty',
      'student',
      'parent',
      'security',
      'warden',
      'placement_officer',
    ];
    const sanitizedRole: UserRole = validRoles.includes(activeUser.role as UserRole)
      ? (activeUser.role as UserRole)
      : 'student';

    const typedUser = {
      id: activeUser.id || 'usr-student-05',
      role: sanitizedRole,
      full_name: activeUser.full_name || 'Student User',
      email: activeUser.email || 'student@luminous.edu',
      department: activeUser.department,
    };

    const response = await runCampusShieldCopilot(
      validated.messages as CopilotMessage[],
      typedUser
    );

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/copilot:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'CampusShield AI Copilot failed to process request',
      },
      { status: 500 }
    );
  }
}
