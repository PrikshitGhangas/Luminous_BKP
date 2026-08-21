import { NextResponse } from 'next/server';
import { INITIAL_INCIDENTS, CAMPUS_LOCATIONS } from '@/lib/constants/demo-data';
import { Incident, IncidentSeverity, IncidentCategory, IncidentTimelineEvent, AuditLogEntry, SystemNotification, EmergencyAlert } from '@/lib/types';
import { z } from 'zod';

const SafeUrlPattern = /^(\/[a-zA-Z0-9_./-]+|https:\/\/[a-zA-Z0-9_./-]+)$/;

const CreateIncidentSchema = z.object({
  reporter_id: z.string().default('usr-student-05'),
  reporter_name: z.string().default('Aanya Patel'),
  title: z.string().min(3).max(200),
  description: z.string().min(5).max(4000),
  category: z.string().max(50),
  severity: z.enum(['low', 'medium', 'high', 'critical', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  location_name: z.string().max(100),
  is_anonymous: z.boolean().optional(),
  is_emergency: z.boolean().optional(),
  evidence_urls: z
    .array(
      z.string().refine((url) => SafeUrlPattern.test(url), {
        message: 'Invalid evidence URL: only relative paths or secure https URLs allowed',
      })
    )
    .optional(),
  ai_analysis: z
    .object({
      category: z.string().optional(),
      severity: z.string().optional(),
      confidence: z.number().optional(),
      summary: z.string().optional(),
      location: z.string().optional(),
      recommended_actions: z.array(z.string()).optional(),
      departments: z.array(z.string()).optional(),
      emergency_required: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity');
  const location = searchParams.get('location');

  let filtered = [...INITIAL_INCIDENTS];

  if (severity && severity !== 'all') {
    filtered = filtered.filter((i) => i.severity === severity.toLowerCase());
  }

  if (location && location !== 'all') {
    filtered = filtered.filter((i) => i.location_name.toLowerCase().includes(location.toLowerCase()));
  }

  // Enforce Whistleblower Anonymity on output feed
  const sanitized = filtered.map((i) => ({
    ...i,
    reporter_name: i.is_anonymous ? '[ANONYMOUS REPORTER - PROTECTED]' : i.reporter_name,
    reporter_id: i.is_anonymous ? 'usr-anon' : i.reporter_id,
  }));

  return NextResponse.json({
    data: sanitized,
    total: sanitized.length,
  });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = CreateIncidentSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }
    const validated = parseResult.data;

    const normalizedSeverity = (validated.severity.toLowerCase()) as IncidentSeverity;
    const normalizedCategory = (validated.category.toLowerCase()) as IncidentCategory;
    const now = new Date().toISOString();
    const incId = `inc-${Date.now()}`;
    const incNumber = `INC-20260821-${Math.floor(1000 + Math.random() * 9000)}`;

    // Match campus location
    const matchedLoc = CAMPUS_LOCATIONS.find((l) =>
      validated.location_name.toLowerCase().includes(l.name.toLowerCase()) ||
      l.name.toLowerCase().includes(validated.location_name.toLowerCase())
    );

    // Initial timeline
    const timeline: IncidentTimelineEvent[] = [
      {
        id: `tl-${Date.now()}-1`,
        incident_id: incId,
        timestamp: now,
        title: 'Incident Submitted',
        description: validated.is_anonymous
          ? 'Submitted anonymously with whistleblower protection enabled'
          : `Reported by ${validated.reporter_name}`,
        actor_name: validated.is_anonymous ? 'Anonymous Student' : validated.reporter_name,
        actor_role: 'Student',
        type: 'reported',
      },
    ];

    if (validated.ai_analysis) {
      timeline.push({
        id: `tl-${Date.now()}-2`,
        incident_id: incId,
        timestamp: new Date(Date.now() + 1000).toISOString(),
        title: 'Gemini 3.7 Flash Autonomous Triage',
        description: `Classified as ${validated.ai_analysis.severity || normalizedSeverity.toUpperCase()} (${Math.round((validated.ai_analysis.confidence || 0.95) * 100)}% confidence). ${validated.ai_analysis.summary || ''}`,
        actor_name: 'Gemini 3.7 Flash AI',
        actor_role: 'AI Engine',
        type: 'ai_triage',
      });
    }

    const assignedDept = validated.ai_analysis?.departments?.[0] || 'Campus Security';
    const assignedOfficer = 'Capt. Vikram Sharma';

    const newIncident: Incident = {
      id: incId,
      incident_number: incNumber,
      reporter_id: validated.is_anonymous ? 'usr-anon' : validated.reporter_id,
      reporter_name: validated.is_anonymous ? 'Anonymous Student' : validated.reporter_name,
      title: validated.title,
      description: validated.description,
      category: normalizedCategory,
      severity: normalizedSeverity,
      ai_severity: validated.ai_analysis?.severity?.toLowerCase() as IncidentSeverity || normalizedSeverity,
      ai_confidence: validated.ai_analysis?.confidence || 0.95,
      ai_summary: validated.ai_analysis?.summary,
      ai_recommended_actions: validated.ai_analysis?.recommended_actions || [
        'Security dispatch initiated to specified location',
        'Notify duty officer for initial perimeter sweep',
      ],
      ai_departments: validated.ai_analysis?.departments || ['Security', 'Maintenance'],
      location_id: matchedLoc?.id || 'loc-eng',
      location_name: validated.location_name,
      status: normalizedSeverity === 'critical' ? 'responding' : 'reported',
      priority_score: normalizedSeverity === 'critical' ? 9 : normalizedSeverity === 'high' ? 7 : 4,
      assigned_department: assignedDept,
      assigned_to: 'usr-security-03',
      assigned_officer_name: assignedOfficer,
      is_anonymous: validated.is_anonymous,
      requires_immediate_response: normalizedSeverity === 'critical' || !!validated.is_emergency,
      evidence_urls: validated.evidence_urls || [],
      timeline,
      created_at: now,
    };

    // System Notification for Security & Admin
    const notification: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `New Incident: ${newIncident.incident_number}`,
      message: `${normalizedSeverity.toUpperCase()} — ${newIncident.title} (${newIncident.location_name})`,
      type: normalizedSeverity === 'critical' ? 'emergency' : 'incident',
      read: false,
      created_at: now,
      link: '/safety/command-center',
    };

    // Audit Log Entry
    const auditLog: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      action: normalizedSeverity === 'critical' ? 'CRITICAL_INCIDENT_DISPATCHED' : 'INCIDENT_CREATED',
      actor: validated.is_anonymous ? 'Anonymous Student' : validated.reporter_name,
      actorRole: 'Student',
      ip: '10.0.12.89',
      timestamp: now,
      timeAgo: 'Just now',
      entity: incNumber,
      details: `${normalizedSeverity.toUpperCase()} in ${newIncident.location_name}: ${newIncident.title}`,
    };

    // Optional Emergency Alert if Critical
    let emergencyAlert: EmergencyAlert | null = null;
    if (normalizedSeverity === 'critical' || validated.ai_analysis?.emergency_required) {
      emergencyAlert = {
        id: `alt-${Date.now()}`,
        title: `EMERGENCY ALERT: ${newIncident.title}`,
        message: `Hazard at ${newIncident.location_name}. Avoid immediate area. Security and emergency responders deployed.`,
        type: 'evacuation',
        severity: 'critical',
        target_roles: ['super_admin', 'admin', 'faculty', 'student', 'security', 'warden'],
        is_active: true,
        created_by: 'Campus Safety AI Dispatch',
        created_at: now,
      };
    }

    return NextResponse.json(
      {
        success: true,
        incident: newIncident,
        notification,
        auditLog,
        emergencyAlert,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Failed to create incident:', error);
    if (error instanceof z.ZodError || (error && typeof error === 'object' && ('issues' in error || (error as { name?: string }).name === 'ZodError'))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: (error as { issues?: unknown }).issues,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create incident',
      },
      { status: 500 }
    );
  }
}
